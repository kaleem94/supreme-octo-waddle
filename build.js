const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, 'src');
const buildDir = path.join(__dirname, 'build');

// Create build directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

// Copy non-JavaScript files from src to build
function copyFiles(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    entries.forEach(entry => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath);
            }
            copyFiles(srcPath, destPath);
        } else if (!entry.name.endsWith('.js')) {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

copyFiles(srcDir, buildDir);

// Determine if the build folder should be cleaned
const shouldClean = process.argv.includes('--clean');

// Run Webpack to bundle and optimize JavaScript files
const webpackCommand = `npx webpack --config webpack.config.js${shouldClean ? ' --env clean=true' : ''}`;
execSync(webpackCommand, { stdio: 'inherit' });

console.log('Build completed successfully.');