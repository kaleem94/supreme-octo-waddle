const urlParams = new URLSearchParams(window.location.search);
const foldername = urlParams.get('lang') || 'arm';

export { foldername };