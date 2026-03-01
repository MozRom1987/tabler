const fs = require('fs');

// 1. Update footer HTML
let footer = fs.readFileSync('src/_includes/footer.njk', 'utf8');

// The original has:
// <div class="footer-col1-left">
//    <div class="public-email">...
// </div>
// <div class="footer-col1-right">
//    <div class="footer-services-nav-title">Nasze usługi:</div>
//    <ul class="footer-services-nav">...

// Let's add the cities nav to footer-col1-right and adjust layout.
// Or we can create footer-col1-middle.

let newFooterHtml = `
                        <div class="footer-col1-bottom">
                            <div class="footer-col1-left">
                                <div class="public-email">
                                    <a href="mailto:agd.fix24@gmail.com">agd.fix24@gmail.com</a>
                                </div>
                                <div class="push20"></div>
                                <div class="footer-address">
                                    Mobilny serwis AGD <br>{{ city_name | default("Przemyśl") }} i okolice<br>
                                </div>
                                <div class="footer-schedule">
                                    Codziennie 08:00-20:00
                                </div>
                            </div>
                            <div class="footer-col1-middle">
                                <div class="footer-services-nav-title">Obsługiwane miasta:</div>
                                <ul class="footer-services-nav footer-cities-nav">
                                    <li><a href="/">Przemyśl</a></li>
                                    <li><a href="/radymno/">Radymno</a></li>
                                    <li><a href="/jaroslaw/">Jarosław</a></li>
                                </ul>
                            </div>
                            <div class="footer-col1-right">
                                <div class="footer-services-nav-title">Nasze usługi:</div>
                                <ul class="footer-services-nav">
                                    <li><a href="{{ city_path | default('/') }}naprawa_pralek.html">Naprawa pralek i pralko-suszarek</a></li>
                                    <li><a href="{{ city_path | default('/') }}naprawa_lodowek.html">Naprawa lodówek i zamrażarek</a></li>
                                    <li><a href="{{ city_path | default('/') }}naprawa_zmywarek.html">Naprawa zmywarek</a></li>
                                    <li><a href="{{ city_path | default('/') }}naprawa_piekarnikow.html">Naprawa piekarników</a></li>
                                </ul>
                            </div>
                        </div>
`;

footer = footer.replace(/<div class="footer-col1-bottom">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div class="col col2">/, newFooterHtml + '                    </div>\n                    <div class="col col2">');

fs.writeFileSync('src/_includes/footer.njk', footer, 'utf8');


// 2. Update CSS
let css = fs.readFileSync('src/css/style.css', 'utf8');

let newCss = css.replace(/\.footer-col1-left \{\s*width: 55%;\s*\}/, '.footer-col1-left {\n    width: 35%;\n}');
newCss = newCss.replace(/\.footer-col1-right \{\s*width: 40%;\s*padding-left: 20px;\s*\}/, '.footer-col1-middle {\n    width: 25%;\n}\n\n.footer-col1-right {\n    width: 40%;\n    padding-left: 20px;\n}');
newCss = newCss.replace(/\.footer-col1-left,\s*\.footer-col1-right \{\s*width: 100%;\s*padding-left: 0;\s*\}/, '.footer-col1-left,\n.footer-col1-middle,\n.footer-col1-right {\n    width: 100%;\n    padding-left: 0;\n}');
newCss = newCss.replace(/\.footer-col1-right \{\s*margin-top: 25px;\s*\}/, '.footer-col1-middle,\n.footer-col1-right {\n    margin-top: 25px;\n}');

fs.writeFileSync('src/css/style.css', newCss, 'utf8');

console.log('Footer updated successfully!');
