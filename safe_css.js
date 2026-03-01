const fs = require('fs');

let css = fs.readFileSync('src/css/style.css', 'utf8');

// The original CSS has:
// .footer-col1-left {
//    width: 55%;
// }
//
// .footer-col1-right {
//    width: 40%;
//    padding-left: 20px;
// }

css = css.replace(
    `.footer-col1-left {
    width: 55%;
}`,
    `.footer-col1-left {
    width: 40%;
}`);

css = css.replace(
    `.footer-col1-right {
    width: 40%;
    padding-left: 20px;
}`,
    `.footer-col1-middle {
    width: 35%;
}

.footer-col1-right {
    width: 25%;
    padding-left: 20px;
}`);

css = css.replace(
    `.footer-col1-left,
    .footer-col1-right {
        width: 100%;
        padding-left: 0;
    }`,
    `.footer-col1-left,
    .footer-col1-middle,
    .footer-col1-right {
        width: 100%;
        padding-left: 0;
    }`);

css = css.replace(
    `.footer-col1-right {
        margin-top: 25px;
    }`,
    `.footer-col1-middle,
    .footer-col1-right {
        margin-top: 25px;
    }`);

fs.writeFileSync('src/css/style.css', css, 'utf8');
console.log('Safe CSS replacement done');
