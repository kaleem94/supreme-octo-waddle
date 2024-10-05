import './blocks.js';
import blockGenerationDefinition from './block_generation_definition.js';

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


export const handleDropdownLists = (listnames) => {
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


export const dropdownGenericUpdater = (block, type, typeconfig, extensionName) => {
    const updateHandler = typeconfig.updateDropdown;
    if (updateHandler) {
        Object.keys(updateHandler).forEach((dropdownName) => {
            const dropdownField = block.getField(updateHandler[dropdownName]);
            if (dropdownField) {
                const options = handleDropdownLists([dropdownName]);
                // const options = handleDropdownLists([dropdownName], updateHandler[dropdownName]);
                dropdownField.menuGenerator_ = options;
                // dropdownField.setValue(options[0][1]);
            }
        });
    }
};

export const extensionFunctionWithTypes = (pseudoFunction, type, extensionName) => {
    const typeconfig = blockGenerationDefinition[0]["types"][type];
    return (block) => {
        return pseudoFunction(block, type, typeconfig, extensionName);
    }
};


export const registerExtensionHandlers = () => {
    blockGenerationDefinition.forEach((definition) => {
        const types = definition.types;
        if ("extensions" in blockDefinitions[0].type) {
            const extensionname = blockDefinitions[0].type.extensions;
            Object.keys(types).forEach((type) => {
                const typeconfig = types[type];
                if (typeconfig["updateDropdown"]) {
                    // Blockly.Extensions.register(`dropdown_generic_updater_${type}`, dropdownGenericUpdater);
                }
            });
        }
    });
}

// export const extensionFunctionWithTypes = (pseudoFunction, type) => {
//     const typeconfig = blockGenerationDefinition[0]["types"][type];
//     return (block) => {
//         return pseudoFunction(block, type, typeconfig);
//     }
// };


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
    // listOfDropDowns = {};
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
    // listOfDropDowns = null;
    // listOfDropDowns = {};
    initializeDropDowns();
    var code = generateCode(workspace);
    document.getElementById('codeOutput').textContent = code;
};

export const clearListOfDropDowns = () => {
    // listOfDropDowns = {};
    console.log('clearing dropdowns');
    console.log(listOfDropDowns);
    // Clear the object without reassigning
    for (let key in listOfDropDowns) {
        if (listOfDropDowns.hasOwnProperty(key)) {
            delete listOfDropDowns[key];
        }
    }
    console.log('cleared dropdowns');
    console.log(listOfDropDowns);
    initializeDropDowns();

};

export const initializeWorkspace = (workspace) => {
    workspace.addChangeListener((e) => {
        if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING || workspace.isDragging() || e.type == Blockly.Events.BlockFieldIntermediateChange) {
            return;
        }
        save(workspace);
        console.log('generating code');
        // listOfDropDowns = {};
        // for (let key in listOfDropDowns) {
        //     if (listOfDropDowns.hasOwnProperty(key)) {
        //         delete listOfDropDowns[key];
        //     }
        // }
        // initializeDropDowns();
        generateAndUpdateCode(workspace);
        listOfDropDowns = {};
        clearListOfDropDowns();
        // initializeDropDowns();
        // updateAllDropdownOptions(workspace);
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

// Register the dynamic menu extension for branch_to_label_dropdown
Blockly.Extensions.register('dynamic_menu_extension_branch_to_label', function () {
    const dropdownField = this.getField('LABEL_DROPDOWN');
    // dropdownField.menuGenerator_ = Blockly.Blocks['branch_to_label_dropdown'].options || [["Label1", "Label1"]];
    console.log(dropdownField);
    // dropdownField.menuGenerator_ =  dropdownField.menuGenerator_ || [["Label1", "Label1"]];
    // dropdownField.menuGenerator_ = [];
    dropdownField.menuGenerator_.push(["Label2", "Label2"]);
    console.log("dynamic menu extension");
});

// // // Apply the extension to the block
// Blockly.Blocks['branch_to_label_dropdown'].extensions = [
//     'dynamic_menu_extension_branch_to_label'
// ];

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
    console.log(listOfDropDowns);
}

function dummyDropDownHandler() {
    const dropDownBlock = Blockly.Blocks['branch_to_label_dropdown'];
    console.log(dropDownBlock);
    const optionsNew = getDynamicOptions();
    const options = dropdownBlock.options;
    console.log(options);
    // options.forEach(option => {
    //     dropDownBlock.appendOption(option.text, option.value);
    // });
}

function initializeBlocklyWorkspace() {
    const workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox')
    });


    initializeDropDowns();
    console.log(listOfDropDowns);
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