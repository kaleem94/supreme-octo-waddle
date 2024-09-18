// block_definitions.js
const blockDefinitions = [
    // Custom Action Block
    {
        "type": "custom_action",
        "message0": "Custom Action %1",
        "args0": [
            {
                "type": "field_input",
                "name": "ACTION",
                "text": "default"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160,
        "tooltip": "Custom action block",
        "helpUrl": ""
    },
    // ARM Assembly Blocks
    {
        "type": "mov",
        "message0": "MOV %1, %2",
        "args0": [
            {
                "type": "field_input",
                "name": "DEST",
                "text": "R0"
            },
            {
                "type": "field_input",
                "name": "SRC",
                "text": "R1"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Move value from SRC to DEST",
        "helpUrl": ""
    },
    {
        "type": "add",
        "message0": "ADD %1, %2, %3",
        "args0": [
            {
                "type": "field_input",
                "name": "DEST",
                "text": "R0"
            },
            {
                "type": "field_input",
                "name": "SRC1",
                "text": "R1"
            },
            {
                "type": "field_input",
                "name": "SRC2",
                "text": "R2"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Add SRC1 and SRC2, store result in DEST",
        "helpUrl": ""
    },
    {
        "type": "sub",
        "message0": "SUB %1, %2, %3",
        "args0": [
            {
                "type": "field_input",
                "name": "DEST",
                "text": "R0"
            },
            {
                "type": "field_input",
                "name": "SRC1",
                "text": "R1"
            },
            {
                "type": "field_input",
                "name": "SRC2",
                "text": "R2"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Subtract SRC2 from SRC1, store result in DEST",
        "helpUrl": ""
    },
    {
        "type": "mul",
        "message0": "MUL %1, %2, %3",
        "args0": [
            {
                "type": "field_input",
                "name": "DEST",
                "text": "R0"
            },
            {
                "type": "field_input",
                "name": "SRC1",
                "text": "R1"
            },
            {
                "type": "field_input",
                "name": "SRC2",
                "text": "R2"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Multiply SRC1 and SRC2, store result in DEST",
        "helpUrl": ""
    },
    {
        "type": "div",
        "message0": "DIV %1, %2, %3",
        "args0": [
            {
                "type": "field_input",
                "name": "DEST",
                "text": "R0"
            },
            {
                "type": "field_input",
                "name": "SRC1",
                "text": "R1"
            },
            {
                "type": "field_input",
                "name": "SRC2",
                "text": "R2"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Divide SRC1 by SRC2, store result in DEST",
        "helpUrl": ""
    },
    {
        "type": "cmp",
        "message0": "CMP %1, %2",
        "args0": [
            {
                "type": "field_input",
                "name": "SRC1",
                "text": "R0"
            },
            {
                "type": "field_input",
                "name": "SRC2",
                "text": "R1"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Compare SRC1 and SRC2",
        "helpUrl": ""
    },
    {
        "type": "branch",
        "message0": "B %1",
        "args0": [
            {
                "type": "field_input",
                "name": "LABEL",
                "text": "label"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Branch to LABEL",
        "helpUrl": ""
    },
    {
        "type": "branch_with_link",
        "message0": "BL %1",
        "args0": [
            {
                "type": "field_input",
                "name": "LABEL",
                "text": "label"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Branch with Link to LABEL",
        "helpUrl": ""
    }
];

export default blockDefinitions;