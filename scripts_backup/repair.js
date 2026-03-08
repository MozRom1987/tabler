const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let indexContent = html.split(/<\/header>/)[1];
indexContent = indexContent.split(/<footer/)[0];
// Ensure Preloader is removed since it's in base layout
indexContent = indexContent.replace(/<div id="page-preloader"><span class="spinner"><\/span><\/div>/, '');

const indexNjk = `---
layout: base.njk
title: "Naprawa AGD Przemyśl | Mobilny Serwis z dojazdem | AGD.fix24"
---
${indexContent}
`;

fs.writeFileSync('src/index.njk', indexNjk, 'utf8');

// Now replace blocks
let njk = fs.readFileSync('src/index.njk', 'utf8');

// cenimy-czas
const cenimy = fs.readFileSync('src/_includes/cenimy-czas.njk', 'utf8');
njk = njk.replace(cenimy, '{% include "cenimy-czas.njk" %}');

// logotypes
const logotypes = fs.readFileSync('src/_includes/logotypes.njk', 'utf8');
njk = njk.replace(logotypes, '{% include "logotypes.njk" %}');

// about
const about = fs.readFileSync('src/_includes/about.njk', 'utf8');
njk = njk.replace(about, '{% include "about.njk" %}');

// faq
const faq = fs.readFileSync('src/_includes/faq.njk', 'utf8');
njk = njk.replace(faq, '{% include "faq.njk" %}');

// consultation
const consult = fs.readFileSync('src/_includes/consultation.njk', 'utf8');
njk = njk.replace(consult, '{% include "consultation.njk" %}');

fs.writeFileSync('src/index.njk', njk, 'utf8');
console.log('Restored correctly');
