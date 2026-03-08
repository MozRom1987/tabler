const fs = require('fs');

const repair = [
    'src/_includes/content_lodowek.njk',
    'src/_includes/content_piekarnikow.njk',
    'src/_includes/content_zmywarek.njk'
];

repair.forEach(f => {
    let t = fs.readFileSync(f, 'utf8');

    // remove everything after consultation include, and add closing div for main-content
    t = t.replace(/{% include "consultation.njk" %}[\s\S]*/, '{% include "consultation.njk" %}\n\n    </div>');

    fs.writeFileSync(f, t, 'utf8');
});

console.log('Cleaned up html tags');
