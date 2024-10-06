import { foldername } from "./utils.js";

var block_def = await fetch('./' + foldername + '/block_gen_definition.json').then(response => response.text());
const blockGenerationDefinition = JSON.parse(block_def);


export default blockGenerationDefinition;
// export { foldername };