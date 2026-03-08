const fs = require('fs');
let p = './src/index.njk';
let c = fs.readFileSync(p, 'utf8');
fs.writeFileSync(p, c.replace(/src=['"]images\//g, 'src="/agd/images/'), 'utf8');
console.log('updated index');
