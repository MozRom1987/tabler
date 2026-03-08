const fs = require('fs');
const path = require('path');

// All issues found during final audit:
const fixes = [
    // Footer: WhatsApp url became capitalized incorrectly by earlier script
    ['api.WhatsApp.com', 'api.whatsapp.com'],
    ['WhatsApp-btn', 'whatsapp-btn'],
    // Canonical URL has double slash: https://fix24.pro/agd//przemysl/
    // (page.url already starts with /agd/... so "https://fix24.pro/agd/" + page.url is wrong)
    // Fix: canonical should just be https://fix24.pro{{ page.url }}
    ['href="https://fix24.pro/agd/{{ page.url }}"', 'href="https://fix24.pro{{ page.url }}"'],
    // FAQ heading — remove extra space before colon
    ['Odpowiadamy na najczęściej zadawane pytania:', 'Odpowiadamy na <span>najczęściej zadawane pytania</span>:'],
    // Odpowiadamy na <span> already present, so safe to run
    // Footer "Odpowiadamy odrazu" -> "Odpowiadamy od razu" (two words)
    ['Odpowiadamy odrazu', 'Odpowiadamy od razu'],
    // "Dlaczego AGD.fix24?" replaced wrong phrase, restore original Polish phrase
    ['Dlaczego AGD.fix24?', 'Czemu wybrać AGD.fix24?'],
    // policy link: /policy.html should be /agd/policy.html
    ['data-src="/policy.html', 'data-src="/agd/policy.html'],
];

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath, callback);
        } else if (file.endsWith('.njk') || file.endsWith('.html')) {
            callback(fullPath);
        }
    });
}

let totalFixed = 0;
walkDir('./src', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [wrong, correct] of fixes) {
        const escaped = wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        content = content.replace(new RegExp(escaped, 'g'), correct);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed:', filePath);
        totalFixed++;
    }
});

console.log(`\nDone! Fixed ${totalFixed} file(s).`);
