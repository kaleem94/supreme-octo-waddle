import './blocks.js';
import blockGenerationDefinition from './block_generation_definition.js';
// import blockDefinitions from './block_definitions.js';

const storageKey = 'jsonGeneratorWorkspace';

var listOfDropDowns = {};

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



Blockly.Extensions.register('dynamic_menu_extension',
    function () {
        console.log("Testing json dd append");
        Blockly.getInput('LABEL_DROPDOWN')
        // workspace.getInput('LABEL_DROPDOWN')
            .appendField(new Blockly.FieldDropdown(
                () => {
                    const options = [];
                    options.push(["_start", "_start"]);
                    return options;
                }));
    }
);

export const handleDropdownLists = (listnames, labelname) => {
    // var dropdowns = [];
    // listnames.forEach((listname) => {
    //     listOfDropDowns[listname].forEach((dropdown) => {
    //         dropdowns.push([dropdown, dropdown]);
    //     });
    // });
    // return dropdowns;
    return listnames.flatMap(listname =>
        listOfDropDowns[listname].map(dropdown => [dropdown, dropdown])
    );
};

export const registerDropdownHandlers = () => {
    blockGenerationDefinition.forEach((definition) => {
        const types = definition.types;
        Object.keys(types).forEach((type) => {
            const typeconfig = types[type];
            if (typeconfig["listHandler"]) {
                Object.keys(typeconfig["listHandler"]).forEach((listName) => {
                });
            }
        });
    });
};

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
    blockGenerationDefinition.forEach((definition) => {
        const defaultListings = definition.default_listings;
        Object.keys(defaultListings).forEach((dropdown) => {
            listOfDropDowns[dropdown] = defaultListings[dropdown];
        });
    });
};

export const generateBlockGenerators = () => {
    blockGenerationDefinition.forEach((definition) => {
        const types = definition.types;
        // console.log(types);
        Object.keys(types).forEach((type) => {
            Blockly.JavaScript.forBlock[type] = generatorFunctionWithTypes(generatorFunction, type);
        });
    });
};



export const generateAndUpdateCode = (workspace) => {
    // console.log(workspace);
    var code = generateCode(workspace);
    document.getElementById('codeOutput').textContent = code;
};

export const initializeWorkspace = (workspace) => {
    workspace.addChangeListener((e) => {
        if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING || workspace.isDragging()) {
            return;
        }
        save(workspace);
        console.log('generating code');
        generateAndUpdateCode(workspace);
        console.log('done generating code');
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

// Example usage
initializeDropDowns();
// console.log(listOfDropDowns);
initializeBlocklyWorkspace();
function checkAndUpdateListNames(typeconfig, block, fieldName) {
    if (typeconfig["listNames"]) {
        Object.keys(typeconfig["listNames"]).forEach((listName) => {
            const dropdownName = typeconfig["listNames"][listName];
            const dropdownValue = block.getFieldValue(fieldName);
            if (!listOfDropDowns[dropdownName].includes(dropdownValue)) {
                listOfDropDowns[dropdownName].push(dropdownValue);
            }
        });
    }
}

function initializeBlocklyWorkspace() {
    const workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox')
    });
    // console.log(workspace);
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

