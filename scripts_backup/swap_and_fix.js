const fs = require('fs');

// 1. Swap HTML blocks
let html = fs.readFileSync('src/_includes/footer.njk', 'utf8');

const citiesBlock = `                            <div class="footer-col1-middle">
                                <div class="footer-services-nav-title">Obsługiwane miasta:</div>
                                <ul class="footer-services-nav footer-cities-nav">
                                    <li><a href="/">Przemyśl</a></li>
                                    <li><a href="/radymno/">Radymno</a></li>
                                    <li><a href="/jaroslaw/">Jarosław</a></li>
                                </ul>
                            </div>`;

const servicesBlock = `                            <div class="footer-col1-right">
                                <div class="footer-services-nav-title">Nasze usługi:</div>
                                <ul class="footer-services-nav">
                                    <li><a href="{{ city_path | default('/') }}naprawa_pralek.html">Naprawa pralek i pralko-suszarek</a></li>
                                    <li><a href="{{ city_path | default('/') }}naprawa_lodowek.html">Naprawa lodówek i zamrażarek</a></li>
                                    <li><a href="{{ city_path | default('/') }}naprawa_zmywarek.html">Naprawa zmywarek</a></li>
                                    <li><a href="{{ city_path | default('/') }}naprawa_piekarnikow.html">Naprawa piekarników</a></li>
                                </ul>
                            </div>`;

const servicesBlockMiddle = servicesBlock.replace('footer-col1-right', 'footer-col1-middle');
const citiesBlockRight = citiesBlock.replace('footer-col1-middle', 'footer-col1-right');

html = html.replace(citiesBlock, '%%CITIES_PLACEHOLDER%%');
html = html.replace(servicesBlock, '%%SERVICES_PLACEHOLDER%%');

html = html.replace('%%CITIES_PLACEHOLDER%%', servicesBlockMiddle);
html = html.replace('%%SERVICES_PLACEHOLDER%%', citiesBlockRight);

fs.writeFileSync('src/_includes/footer.njk', html, 'utf8');


// 2. Adjust CSS widths to prevent overlap
let css = fs.readFileSync('src/css/style.css', 'utf8');

// col1 to 75%
css = css.replace(
    `.footer-top-inner .col1 {
    width: 60%;
    padding-right: 25px;
}`,
    `.footer-top-inner .col1 {
    width: 75%;
    padding-right: 25px;
}`);
// Or maybe it was 65%?
css = css.replace(
    `.footer-top-inner .col1 {
    width: 65%;
    padding-right: 25px;
}`,
    `.footer-top-inner .col1 {
    width: 75%;
    padding-right: 25px;
}`);

// col2 to 25%
css = css.replace(
    `.footer-top-inner .col2 {
    width: 40%;
    padding-left: 25px;`,
    `.footer-top-inner .col2 {
    width: 25%;
    padding-left: 25px;`);

// inner columns
css = css.replace(
    `.footer-col1-left {
    width: 35%;
}`,
    `.footer-col1-left {
    width: 30%;
}`);

css = css.replace(
    `.footer-col1-middle {
    width: 25%;
}`,
    `.footer-col1-middle {
    width: 40%;
}`);

// footer-col1-right was 40%, let's make it 30%
css = css.replace(
    `.footer-col1-right {
    width: 40%;
    padding-left: 20px;
}`,
    `.footer-col1-right {
    width: 30%;
    padding-left: 20px;
}`);

fs.writeFileSync('src/css/style.css', css, 'utf8');
console.log('Swapped Nunjucks blocks and adjusted CSS widths for 75/25 layout.');
