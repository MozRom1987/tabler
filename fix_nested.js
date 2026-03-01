const fs = require('fs');

const repairSrc = [
    'src/_includes/content_lodowek.njk',
    'src/_includes/content_piekarnikow.njk',
    'src/_includes/content_zmywarek.njk'
];

repairSrc.forEach(f => {
    if (fs.existsSync(f)) {
        let t = fs.readFileSync(f, 'utf8');
        t = t.replace(/\{\{\s*city_locative\s*\|\s*default\(["']\{\{\s*city_name\s*\|\s*default\(['"]Przemyśl['"]\)\s*\}\}u["']\)\s*\}\}/g, "{{ city_locative | default('Przemyślu') }}");
        t = t.replace(/\{\{\s*city_name\s*\|\s*default\(['"]Przemyśl['"]\)\s*\}\}u/g, "{{ city_locative | default('Przemyślu') }}");
        fs.writeFileSync(f, t, 'utf8');
    }
});
console.log('Fixed nested tags');
