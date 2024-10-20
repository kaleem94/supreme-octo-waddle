import { foldername } from "./utils.js";

console.log('./' + foldername + '/block_definition.json');
var block_def = await fetch('./' + foldername + '/block_definition.json').then(response => response.text());
const blockDefinitions = JSON.parse(block_def);

export default blockDefinitions;