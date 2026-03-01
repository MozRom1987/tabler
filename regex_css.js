const fs = require('fs');

let css = fs.readFileSync('src/css/style.css', 'utf8');

css = css.replace(/\.footer-col1-left\s*\{\s*width:\s*55%;\s*\}/, '.footer-col1-left {\n    width: 35%;\n}');
css = css.replace(/\.footer-col1-right\s*\{\s*width:\s*40%;\s*padding-left:\s*20px;\s*\}/, '.footer-col1-middle {\n    width: 25%;\n}\n\n.footer-col1-right {\n    width: 40%;\n    padding-left: 20px;\n}');
css = css.replace(/\.footer-col1-left,\s*\.footer-col1-right\s*\{\s*width:\s*100%;\s*padding-left:\s*0;\s*\}/, '.footer-col1-left,\n    .footer-col1-middle,\n    .footer-col1-right {\n        width: 100%;\n        padding-left: 0;\n    }');
css = css.replace(/\.footer-col1-right\s*\{\s*margin-top:\s*25px;\s*\}/, '.footer-col1-middle,\n    .footer-col1-right {\n        margin-top: 25px;\n    }');

fs.writeFileSync('src/css/style.css', css, 'utf8');
console.log('RegEx CSS replaces done.');
