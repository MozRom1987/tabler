const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function replaceInFile(filePath, regex, replacement) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(regex, replacement);
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated ' + filePath);
    }
}

// 1. Templates
walkDir('./src', function (filePath) {
    if (filePath.endsWith('.njk')) {
        // Replace src="/...", href="/...", content="/..."
        replaceInFile(filePath, /(href|src|content)=['"]\/(images|css|js|favicon\.ico|index\.html)/g, "$1=\"/agd/$2");
        // Also fix background-image: url(/images...)
        replaceInFile(filePath, /url\(\/images\//g, "url(/agd/images/");

        // Fix hardcoded domain
        replaceInFile(filePath, /https:\/\/agd\.fix24\.pro/g, "https://fix24.pro/agd");
    }
});

// 2. CSS
walkDir('./src/css', function (filePath) {
    if (filePath.endsWith('.css')) {
        replaceInFile(filePath, /url\(['"]?\/images\//g, "url('/agd/images/");
    }
});

// 3. Eleventy config - NOT strictly needed if we hardcode URLs, but let's just make sure.
let configPath = './.eleventy.js';
let config = fs.readFileSync(configPath, 'utf8');
if (!config.includes('pathPrefix')) {
    config = config.replace('return {', 'return {\n        pathPrefix: "/agd/",');
    fs.writeFileSync(configPath, config, 'utf8');
    console.log('Updated .eleventy.js');
}

console.log("Migration complete.");
