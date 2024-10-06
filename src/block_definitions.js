import { foldername } from "./utils.js";

var block_def = await fetch('./' + foldername + '/block_definition.json').then(response => response.text());
const blockDefinitions = JSON.parse(block_def);

export default blockDefinitions;