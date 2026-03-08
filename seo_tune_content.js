const fs = require('fs');
const path = require('path');

const dir = './src/_includes';

const filesToUpdate = [
    'content_lodowek.njk',
    'content_piekarnikow.njk',
    'content_pralek.njk',
    'content_zmywarek.njk'
];

for (const file of filesToUpdate) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add city_locative to the first heading about "Typowe usterki"
    content = content.replace(/(<h2><span>Typowe usterki .*?<\/span>, które naprawiamy)(:<\/h2>)/g, `$1 w {{ city_locative | default("Przemyślu") }}$2`);

    // Add city_locative to the "Szybka i fachowa naprawa" or "Profesjonalna naprawa" heading
    // Szybka i fachowa <span>naprawa pralek</span> - AGD.fix24 -> Szybka i fachowa <span>naprawa pralek w {{ city_locative | default("Przemyślu") }}</span> - AGD.fix24
    content = content.replace(/(<h2 class="content-block-title">.*?<span>naprawa .*?)(<\/span>)(.*?<\/h2>)/g, `$1 w {{ city_locative | default("Przemyślu") }}$2$3`);

    // Add city_name to the "Błyskawiczny serwis" heading
    // <h2><span>Błyskawiczny serwis pralek,</span> bez ukrytych kosztów.</h2> -> <h2><span>Błyskawiczny serwis pralek {{ city_name | default("Przemyśl") }},</span> bez ukrytych kosztów.</h2>
    content = content.replace(/(<h2><span>.*?serwis .*?)(,<\/span>.*)(<\/h2>)/g, `$1 {{ city_name | default("Przemyśl") }}$2$3`);
    content = content.replace(/(<h2><span>.*?naprawa .*?)(,<\/span>.*)(<\/h2>)/g, `$1 {{ city_name | default("Przemyśl") }}$2$3`);

    fs.writeFileSync(filePath, content);
    console.log(`SEO tuned: ${file}`);
}
