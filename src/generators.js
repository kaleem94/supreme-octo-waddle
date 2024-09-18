import blockGenerationDefinition from './block_generation_definition.js';
// const blockGenerationDefinition = require('./block_generation_definition.js');


Blockly.JavaScript.forBlock['custom_action'] = function (block) {
    const action = block.getFieldValue('ACTION');
    const code = `console.log("${action}");\n`;
    return code;
}

function generateBlockGenerators() {
    // blockGenerationDefinition.forEach((definition) => {
    //     const types = definition.types;
    //     Object.keys(types).forEach((type) => {
    //         const generator = types[type].generator;
    //         if (generator) {
    //             Blockly.JavaScript[type] = generator;
    //         }
    //     });
    // });
    console.log(blockGenerationDefinition);
    console.log("generating block generators");
}