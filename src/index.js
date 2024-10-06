import './blocks.js';
import blockDefinitions from './block_definitions.js';
import blockGenerationDefinition from './block_generation_definition.js';
import { foldername } from "./utils.js";

const storageKey = 'jsonGeneratorWorkspace' + foldername;

let blockListToRunExtension = {};
var listOfDropDowns = {};

// Function to save listOfDropDowns to a cookie
function saveListOfDropDownsToCookie() {
    const jsonString = JSON.stringify(listOfDropDowns);
    document.cookie = `listOfDropDowns=${encodeURIComponent(jsonString)}; path=/; max-age=31536000`; // 1 year
}

// Function to load listOfDropDowns from a cookie
function loadListOfDropDownsFromCookie() {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === 'listOfDropDowns') {
            listOfDropDowns = JSON.parse(decodeURIComponent(value));
            // console.log('loaded dropdowns');
            // console.log(listOfDropDowns);
            break;
        }
    }
}

export const updateExtensionList = (block, type, extensionName) => {
    // console.log("updating extension list " + extensionName);
    if (blockListToRunExtension[type] === undefined) {
        blockListToRunExtension[type] = {};
    }
    if (blockListToRunExtension[type][extensionName] === undefined) {
        blockListToRunExtension[type][extensionName] = [block];
    }
    else {
        blockListToRunExtension[type][extensionName].push(block);
    }
};


export const runExtension = () => {
    for (const type in blockListToRunExtension) {
        for (const extensionName in blockListToRunExtension[type]) {
            for (const block of blockListToRunExtension[type][extensionName]) {
                extensionFunctionWithTypes(block, type, extensionName);
            }
        }
    }
    blockListToRunExtension = {};
};

export const save = (workspace) => {
    const data = Blockly.serialization.workspaces.save(workspace);
    window.localStorage?.setItem(storageKey, JSON.stringify(data));
};

export const deleteSave = () => {
    window.localStorage?.removeItem(storageKey);
    location.reload();
};

export const load = (workspace) => {
    const data = window.localStorage?.getItem(storageKey);
    if (!data) return;

    Blockly.Events.disable();
    Blockly.serialization.workspaces.load(JSON.parse(data), workspace, false);
    Blockly.Events.enable();
};

export const generateCode = (workspace) => {
    return Blockly.JavaScript.workspaceToCode(workspace);
};

export const runCode = (code) => {
    // Be careful with eval in production code
    // eval(code);
};

export const saveCodeToFile = (code, filename = 'generated_code.js') => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const resizeBlocklyWorkspace = (workspace) => {
    Blockly.svgResize(workspace);
};


export const handleDropdownLists = (listnames) => {
    return listnames.flatMap(listname =>
        listOfDropDowns[listname].map(dropdown => [dropdown, dropdown])
    );
};


export const extensionFunctionWithTypes = (block, type, extensionName) => {
    const typeconfig = blockGenerationDefinition[0]["types"][type];

    if (typeconfig["listHandler"] && extensionName in typeconfig["listHandler"]) {

        if (typeconfig && typeconfig["listHandler"][extensionName]) {
            if ("updateDropdown" === typeconfig["listHandler"][extensionName]) {
                for (const labelName in typeconfig["updateDropdown"]) {
                    const dropdownHandler = block.getField(labelName);
                    const currentValue = dropdownHandler.getValue();
                    // console.log(currentValue);
                    // console.log(dropdownHandler.menuGenerator_)
                    dropdownHandler.menuGenerator_ = [];
                    dropdownHandler.menuGenerator_.push(["Label2", "Label2"]);
                    typeconfig["updateDropdown"][labelName].forEach((dropDownalistName) => {
                        if (listOfDropDowns[dropDownalistName] !== undefined) {
                            listOfDropDowns[dropDownalistName].forEach((dropdown) => {
                                dropdownHandler.menuGenerator_.push([dropdown, dropdown]);
                            });
                        }
                    });
                }
            }
        }
    }
};


export const registerExtensionHandlers = () => {
    for (const blockDefinition of blockDefinitions) {
        if ("extensions" in blockDefinition) {
            const extensionNames = blockDefinition.extensions;
            const typeName = blockDefinition.type;
            extensionNames.forEach((extensionName) => {
                Blockly.Extensions.register(extensionName, function () {
                    extensionFunctionWithTypes(this, typeName, extensionName);
                });
            });
        }
    }
}



export const generatorFunction = (block, type, typeconfig) => {
    const PATTERN_VARIABLE = /(?:^|[^%])%(\d+)/g;
    let code = "";
    const matches = typeconfig.string.match(PATTERN_VARIABLE);
    let outString = typeconfig.string;
    matches.forEach((match) => {
        const match1 = match.replace(/[\s%]/g, '');
        const indexNumber = parseInt(match1);
        if (isNaN(indexNumber)) return "error generating code";
        const fieldName = typeconfig.fields[indexNumber - 1];
        if (match[0] === ' ') {
            match = match.replace(' ', '');
        }
        outString = outString.replace(match, block.getFieldValue(fieldName));
        checkAndUpdateListNames(typeconfig, block, fieldName);
    });

    if (typeconfig["listHandler"]) {
        Object.keys(typeconfig["listHandler"]).forEach((listName) => {
            updateExtensionList(block, type, listName);
        });
    }

    code = outString;
    return code;
};

export const generatorFunctionWithTypes = (pseudoFunction, type) => {
    const typeconfig = blockGenerationDefinition[0]["types"][type];
    return (block) => {
        return pseudoFunction(block, type, typeconfig);
    }
};

export const initializeDropDowns = () => {
    for (let key in listOfDropDowns) {
        if (listOfDropDowns.hasOwnProperty(key)) {
            delete listOfDropDowns[key];
        }
    }

    blockGenerationDefinition.forEach((definition) => {
        const defaultListings = definition.default_listings;
        Object.keys(defaultListings).forEach((dropdown) => {
            listOfDropDowns[dropdown] = defaultListings[dropdown];
        });
    });
};

export const generateBlockGenerators = () => {
    console.log(blockGenerationDefinition);
    blockGenerationDefinition.forEach((definition) => {
        const types = definition.types;
        console.log(types);
        Object.keys(types).forEach((type) => {
            Blockly.JavaScript.forBlock[type] = generatorFunctionWithTypes(generatorFunction, type);
        });
    });
};



export const generateAndUpdateCode = (workspace) => {
    // initializeDropDowns();
    // console.log('generating code');
    initializeDropDowns();
    var code = generateCode(workspace);
    saveListOfDropDownsToCookie()
    loadListOfDropDownsFromCookie();
    runExtension();
    document.getElementById('codeOutput').textContent = code;
};

export const clearListOfDropDowns = () => {
    console.log('clearing dropdowns');
    // console.log(listOfDropDowns);
    // Clear the object without reassigning
    for (let key in listOfDropDowns) {
        if (listOfDropDowns.hasOwnProperty(key)) {
            delete listOfDropDowns[key];
        }
    }
    console.log('cleared dropdowns');
    // console.log(listOfDropDowns);
    initializeDropDowns();

};

export const initializeWorkspace = (workspace) => {
    generateCode(workspace);
    workspace.addChangeListener((e) => {
        if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING || workspace.isDragging() || e.type == Blockly.Events.BlockField || e.type == Blockly.Events.BlockFieldIntermediateChange || e.type == Blockly.Events.BlockChange || e.type == Blockly.Events.UiBase) {
            return;
        }
        save(workspace);
        // console.log('generating code');
        generateAndUpdateCode(workspace);
        // listOfDropDowns = {};
        // clearListOfDropDowns();
        // console.log('done generating code');
    });

    load(workspace);
    generateAndUpdateCode(workspace);
    resizeBlocklyWorkspace(workspace);
};

export const setupDividerDragging = (divider, container, blocklyDiv, codeContainer, workspace) => {
    let isDragging = false;

    const onMouseMove = (e) => {
        if (!isDragging) return;
        const containerRect = container.getBoundingClientRect();
        const offsetX = e.clientX - containerRect.left;
        const percentage = (offsetX / containerRect.width) * 100;
        if (percentage < 40 || percentage > 80) return;
        blocklyDiv.style.width = `${percentage}%`;
        codeContainer.style.width = `${100 - percentage}%`;
        divider.style.left = `${percentage}%`;
        Blockly.svgResize(workspace);
    };

    const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    divider.addEventListener('mousedown', () => {
        isDragging = true;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
};


function checkAndUpdateListNames(typeconfig, block, fieldName) {
    if (typeconfig["updateList"]) {
        Object.keys(typeconfig["updateList"][fieldName]).forEach((listName) => {
            const dropdownName = typeconfig["updateList"][fieldName][listName];
            const dropdownValue = block.getFieldValue(fieldName);
            if (!listOfDropDowns[dropdownName].includes(dropdownValue)) {
                listOfDropDowns[dropdownName].push(dropdownValue);
            }
        });
    }
    // console.log(listOfDropDowns);
}


var workspace;

async function initializeBlocklyWorkspace() {
    loadListOfDropDownsFromCookie();

    

    const toolbox = await fetch("./" + foldername + "/toolbox.json").then(response => response.json());


    workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolbox,
    });
    registerExtensionHandlers();


    // initializeDropDowns();
    // console.log(listOfDropDowns);
    generateBlockGenerators();
    initializeWorkspace(workspace);

    document.getElementById('saveButton').addEventListener('click', () => {
        const code = generateCode(workspace);
        saveCodeToFile(code);
    });

    document.getElementById('deleteWorkspace').addEventListener('click', deleteSave);

    window.addEventListener('resize', () => resizeBlocklyWorkspace(workspace));

    const divider = document.getElementById('divider');
    const container = document.getElementById('container');
    const blocklyDiv = document.getElementById('blocklyDiv');
    const codeContainer = document.getElementById('codeContainer');
    setupDividerDragging(divider, container, blocklyDiv, codeContainer, workspace);
}

// initializeDropDowns();
initializeBlocklyWorkspace();