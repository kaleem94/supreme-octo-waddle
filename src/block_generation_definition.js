
const blockGenerationDefinition = [
    {
        "types": {
            "mov": {
                "export": true,
                "string": "MOV %1, %2",
                "fields": ["DEST", "SRC"],
            }
        },
        "default_listings" : {

        }
    }
];

export default blockGenerationDefinition;