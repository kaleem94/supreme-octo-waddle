// import * as Blockly from 'https://unpkg.com/blockly/blockly.min.js';


import './blocks.js';

// import './generators.js';
import blockGenerationDefinition from './block_generation_definition.js';
import blockDefinitions from './block_definitions.js';
// import './styles.css';

// Use a unique storage key for this codelab
const storageKey = 'jsonGeneratorWorkspace';

export const save = function (workspace) {
    const data = Blockly.serialization.workspaces.save(workspace);
    window.localStorage?.setItem(storageKey, JSON.stringify(data));
};

export const deleteSave = function () {
    window.localStorage?.removeItem(storageKey);
    location.reload();
};

export const load = function (workspace) {
    const data = window.localStorage?.getItem(storageKey);
    if (!data) return;

    // Don't emit events during loading.
    Blockly.Events.disable();
    Blockly.serialization.workspaces.load(JSON.parse(data), workspace, false);
    Blockly.Events.enable();
};

var workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox')
});


Blockly.JavaScript.forBlock['custom_action'] = function (block) {
    const action = block.getFieldValue('ACTION');
    const code = `console.log("${action}");\n`;
    return code;
}

// Function to generate and display the code
function generateCode() {
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    document.getElementById('codeOutput').textContent = code;
}

const PATTERN_VARIABLE = /(?:^|[^%])%(\d+)/g;


const generatorFunction = (block, type, typeconfig) => {
    var code = "";
    const matches = typeconfig.string.match(PATTERN_VARIABLE);
    var outString = typeconfig.string;
    matches.forEach((match) => {
        var match1 = match.replace(/[\s%]/g, '');
        const indexNumber = parseInt(match1);
        if(isNaN(indexNumber)) return "error generaiting code";
        match = match.replace(/\s/g, '');
        const fieldName = typeconfig.fields[indexNumber - 1];
        outString = outString.replace(match, block.getFieldValue(fieldName));
    });
    code = outString;
    return code;
};

const generatorFunctionWithTypes = (pseudoFunction, type) => {
    const typeconfig = blockGenerationDefinition[0]["types"][type];
    return (block) => {
        return pseudoFunction(block, type, typeconfig);
    }
};

function generateBlockGenerators() {
    blockGenerationDefinition.forEach((definition) => {
        const types = definition.types;
        Object.keys(types).forEach((type) => {
            console.log("type is " + type);
            Blockly.JavaScript.forBlock[type] = generatorFunctionWithTypes(generatorFunction, type);
        });
    });
    // console.log(blockGenerationDefinition);
    console.log("generating block generators");
}

// initialize the block generator with the block generation definition
generateBlockGenerators();


workspace.addChangeListener((e) => {
    if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING ||
        workspace.isDragging()) {
      return;
    }
    save(workspace);
    generateCode();
    // console.log(ws);
  });
// Add a change listener to automatically generate code
// workspace.addChangeListener(generateCode);
workspace.addChangeListener((e) => {
    if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING ||
        workspace.isDragging()) {
      return;
    }
    generateCode();
  });

// Function to run the generated code
function runCode() {
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    // console.log(code); // Output the generated code
    // // Execute the generated code (be careful with eval)
    // eval(code);
}

// Function to save the generated code to a file
function saveCode() {
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    var blob = new Blob([code], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'generated_code.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Add event listeners to the buttons
document.getElementById('saveButton').addEventListener('click', saveCode);
document.getElementById('deleteWorkspace').addEventListener('click', deleteSave);

// Function to resize the Blockly workspace
function resizeBlocklyWorkspace() {
    Blockly.svgResize(workspace);
}


load(workspace);
generateCode();

// Add event listener to resize the Blockly workspace when the window is resized
window.addEventListener('resize', resizeBlocklyWorkspace);

// Initial resize to fit the window size
resizeBlocklyWorkspace();

// Divider dragging functionality
const divider = document.getElementById('divider');
let isDragging = false;

divider.addEventListener('mousedown', (e) => {
    isDragging = true;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

const MAX_WIDTH_PERCENTAGE = 80;
const MIN_WIDTH_PERCENTAGE = 40;
function onMouseMove(e) {
    
    if (!isDragging) return;
    const container = document.getElementById('container');
    const containerRect = container.getBoundingClientRect();
    const offsetX = e.clientX - containerRect.left;
    const percentage = (offsetX / containerRect.width) * 100;
    if (percentage < MIN_WIDTH_PERCENTAGE || percentage > MAX_WIDTH_PERCENTAGE) return;
    document.getElementById('blocklyDiv').style.width = `${percentage}%`;
    document.getElementById('codeContainer').style.width = `${100 - percentage}%`;
    divider.style.left = `${percentage}%`;
    Blockly.svgResize(workspace);
}

function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}