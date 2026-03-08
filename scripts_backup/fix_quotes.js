const fs = require('fs');

const repairSrc = [
    'src/naprawa_lodowek.njk',
    'src/naprawa_piekarnikow.njk',
    'src/naprawa_zmywarek.njk',
    'src/jaroslaw/naprawa_lodowek.njk',
    'src/jaroslaw/naprawa_piekarnikow.njk',
    'src/jaroslaw/naprawa_zmywarek.njk',
    'src/radymno/naprawa_lodowek.njk',
    'src/radymno/naprawa_piekarnikow.njk',
    'src/radymno/naprawa_zmywarek.njk'
];

repairSrc.forEach(f => {
    if (fs.existsSync(f)) {
        let t = fs.readFileSync(f, 'utf8');
        t = t.replace(/default\("([^"]+)"\)/g, "default('$1')");
        fs.writeFileSync(f, t, 'utf8');
    }
});
console.log('Fixed quotes in templates');
