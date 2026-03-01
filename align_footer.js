const fs = require('fs');

let footer = fs.readFileSync('src/_includes/footer.njk', 'utf8');

// The current structure:
// <div class="col col1">
//    <div class="footer-phone-wrapper">...</div>
//    <div class="footer-col1-bottom">
//        <div class="footer-col1-left">...address...</div>
//        <div class="footer-col1-right">...services...</div>
//    </div>
// </div>
// <div class="col col2">
//    <div class="footer-cities-col">...cities...</div>
//    <div class="footer-social ">...social...</div>
// </div>

const startCol2 = footer.indexOf('<div class="col col2">');
const endCol2 = footer.indexOf('</div>\n                </div>\n\n            </div>');

let socialBlock = footer.slice(startCol2, endCol2);
// Extract cities and social
const citiesMatch = socialBlock.match(/<div class="footer-cities-col"[^>]*>[\s\S]*?<\/div>\s*<div class="footer-social/);
const realCities = citiesMatch[0].replace(/\s*<div class="footer-social/g, '');
const realSocial = socialBlock.split(realCities)[1].replace(/<\/div>\s*$/, ''); // removing trailing div of col2

// Now build the new footer bottom inside col1-bottom
let newCol1Bottom = `
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
                            <div class="footer-cities-col">
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
                            <div class="footer-social-wrapper">
                                ${realSocial.trim()}
                            </div>
                        </div>
`;

// Replace the old HTML
let oldHtmlStart = footer.indexOf('<div class="footer-col1-bottom">');
let newFooter = footer.substring(0, oldHtmlStart) + newCol1Bottom + '                    </div>\n                </div>\n            </div>\n        </div>';

newFooter += footer.substring(footer.indexOf('<div class="footer-bottom">'));
fs.writeFileSync('src/_includes/footer.njk', newFooter, 'utf8');

// ==== Update CSS ====
let css = fs.readFileSync('src/css/style.css', 'utf8');

css = css.replace(/\.footer-top-inner \.col1 \{\s*width: 60%;\s*padding-right: 25px;\s*\}/, '.footer-top-inner .col1 {\n    width: 100%;\n    padding-right: 0px;\n}');
css = css.replace(/\.footer-top-inner \.col2 \{[\s\S]*?\}\s*\.footer-social-title/m, '.footer-social-title');

css = css.replace(/\.footer-col1-left \{\s*width: 55%;\s*\}/, '.footer-col1-left {\n    width: 25%;\n}');
css = css.replace(/\.footer-col1-right \{\s*width: 40%;\s*padding-left: 20px;\s*\}/, '.footer-col1-right {\n    width: 30%;\n}');

// Add sizes for the new columns
css += `
.footer-cities-col { width: 20%; padding-right: 15px; }
.footer-social-wrapper { width: 25%; text-align: right; }
.footer-social-wrapper .social-nav { justify-content: flex-end; }
@media(max-width: 991px) {
    .footer-col1-left, .footer-cities-col, .footer-col1-right, .footer-social-wrapper {
        width: 100% !important;
        margin-bottom: 30px;
        text-align: left !important;
    }
    .footer-social-wrapper .social-nav { justify-content: flex-start; }
}
`;

fs.writeFileSync('src/css/style.css', css, 'utf8');
console.log('Restructured footer to a single grid row.');
