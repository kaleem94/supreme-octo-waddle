
const blockGenerationDefinition = [
    {
        "types": {
            "mov": {
                "export": true,
                "string": "MOV %1, %2\n",
                "fields": ["DEST", "SRC"],
            },
            "add": {
                "export": true,
                "string": "ADD %1, %2, %3\n",
                "fields": ["DEST", "SRC1", "SRC2"],
            },
            "sub": {
                "export": true,
                "string": "SUB %1, %2, %3\n",
                "fields": ["DEST", "SRC1", "SRC2"],
            },
            "mul": {
                "export": true,
                "string": "MUL %1, %2, %3\n",
                "fields": ["DEST", "SRC1", "SRC2"],
            },
            "div": {
                "export": true,
                "string": "DIV %1, %2, %3\n",
                "fields": ["DEST", "SRC1", "SRC2"],
            },
            "cmp": {
                "export": true,
                "string": "CMP %1, %2\n",
                "fields": ["SRC1", "SRC2"],
            },
            "branch": {
                "export": true,
                "string": "b %1\n",
                "fields": ["LABEL"],
            },
            "branch_with_link": {
                "export": true,
                "string": "bl %1:\n",
                "fields": ["LABEL"],
            },
            "label_simple": {
                "export": true,
                "string": "%1:\n",
                "fields": ["LABEL"],
                // "listHandler": "handleLabelDropdown",
                "listNames": ["dropdownLabel", "dropdownLabel2"],
            },
            "branch_with_select": {
                "export": true,
                "string": "B %1:\n",
                "fields": ["LABEL_DROPDOWN"],
                "updateDropdown": { "LABEL_DROPDOWN": ["dropdownLabel"] },
                "listHandler": { "handleLabelDropdown": "LABEL_DROPDOWN", },
            },
        },
        "default_listings": {
            "dropdownLabel": ["label1", "label2", "label3"],
            "dropdownLabel2": ["label4", "label5", "label6"],
        },
    }
];

export default blockGenerationDefinition;