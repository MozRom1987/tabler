const fs = require('fs');

// ==== 1. Update footer HTML ====
let footer = fs.readFileSync('src/_includes/footer.njk', 'utf8');

// Remove footer-col1-middle from its current place
const col1MiddleRegex = /\s*<div class="footer-col1-middle">[\s\S]*?<\/div>(\s*<div class="footer-col1-right">)/;
footer = footer.replace(col1MiddleRegex, '$1');

// Inject it into col2
const col2StartRegex = /(<div class="col col2">\s*)(<div class="footer-social ">)/;
const citiesBlock = `<div class="footer-cities-col" style="text-align:left;">
                            <div class="footer-services-nav-title">Obsługiwane miasta:</div>
                            <ul class="footer-services-nav footer-cities-nav">
                                <li><a href="/">Przemyśl</a></li>
                                <li><a href="/radymno/">Radymno</a></li>
                                <li><a href="/jaroslaw/">Jarosław</a></li>
                            </ul>
                        </div>
                        `;

footer = footer.replace(col2StartRegex, '$1' + citiesBlock + '$2');

fs.writeFileSync('src/_includes/footer.njk', footer, 'utf8');


// ==== 2. Update CSS ====
let css = fs.readFileSync('src/css/style.css', 'utf8');

// Revert .footer-col1-left to 55% instead of 35%
css = css.replace(/\.footer-col1-left \{\s*width: 35%;\s*\}/, '.footer-col1-left {\n    width: 55%;\n}');

// Revert .footer-col1-right to standard (remove middle references)
css = css.replace(/\.footer-col1-middle \{\s*width: 25%;\s*\}\s*\.footer-col1-right \{\s*width: 40%;\s*padding-left: 20px;\s*\}/, '.footer-col1-right {\n    width: 40%;\n    padding-left: 20px;\n}');
css = css.replace(/\.footer-col1-left,\s*\.footer-col1-middle,\s*\.footer-col1-right \{\s*width: 100%;\s*padding-left: 0;\s*\}/, '.footer-col1-left,\n.footer-col1-right {\n    width: 100%;\n    padding-left: 0;\n}');
css = css.replace(/\.footer-col1-middle,\s*\.footer-col1-right \{\s*margin-top: 25px;\s*\}/, '.footer-col1-right {\n    margin-top: 25px;\n}');

// Ensure space-between is applied to col2
css = css.replace(/\.footer-top-inner \.col2 \{\s*width: 40%;\s*padding-left: 25px;\s*display: flex;\s*justify-content: flex-end;/g, '.footer-top-inner .col2 {\n    width: 40%;\n    padding-left: 25px;\n    display: flex;\n    justify-content: space-between;');

fs.writeFileSync('src/css/style.css', css, 'utf8');

console.log('Moved cities column from left to col2 successfully.');
