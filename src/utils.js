const urlParams = new URLSearchParams(window.location.search);
const langname = urlParams.get('lang') || 'arm';

const foldername = 'conf/' + langname;
export { foldername };
export { langname };