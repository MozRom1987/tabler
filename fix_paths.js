const fs = require('fs');
const path = require('path');

function replacePaths(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace css, images, js
    content = content.replace(/href="css\//g, 'href="/css/');
    content = content.replace(/src="images\//g, 'src="/images/');
    content = content.replace(/url\(images\//g, 'url(/images/');
    content = content.replace(/src="js\//g, 'src="/js/');

    // Replace links
    content = content.replace(/href="naprawa_/g, 'href="/naprawa_');
    content = content.replace(/href="index\.html"/g, 'href="/"');
    content = content.replace(/href="favicon\.ico"/g, 'href="/favicon.ico"');

    // Also for consultation and policy
    content = content.replace(/data-src="policy\.html/g, 'data-src="/policy.html');

    fs.writeFileSync(filePath, content, 'utf8');
}

const dir = 'src/_includes';
fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.njk')) {
        replacePaths(path.join(dir, file));
    }
});

// Also check layouts
const layoutDir = 'src/_layouts';
if (fs.existsSync(layoutDir)) {
    fs.readdirSync(layoutDir).forEach(file => {
        if (file.endsWith('.njk')) {
            replacePaths(path.join(layoutDir, file));
        }
    });
}
console.log('Paths updated to absolute');
