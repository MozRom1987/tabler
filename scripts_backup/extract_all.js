const fs = require('fs');
const path = require('path');

const services = [
    { source: 'naprawa_lodowek.html', name: 'lodowek', stem: 'naprawa_lodowek' },
    { source: 'naprawa_piekarnikow.html', name: 'piekarnikow', stem: 'naprawa_piekarnikow' },
    { source: 'naprawa_zmywarek.html', name: 'zmywarek', stem: 'naprawa_zmywarek' }
];

services.forEach(service => {
    console.log(`Processing ${service.source}...`);
    let html = fs.readFileSync(service.source, 'utf8');

    // Extract main content
    let mainContent = html.split(/<div class="main-content">/)[1];
    mainContent = mainContent.split(/<footer/)[0];

    // Clean up consultation section and replace with include
    const consultRegex = /<div class="get-consultation-section section pt0 pb0">[\s\S]*?<\/form>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/;
    mainContent = mainContent.replace(consultRegex, '{% include "consultation.njk" %}\n            </div>\n            <div class="push20"></div>\n        </div>');

    // Also some files might have slightly different number of closing divs, let's just make sure it's correct
    // Actually the best way is to find the startIndex of get-consultation-section and cut it out manually.
    const startConsult = mainContent.indexOf('<div class="get-consultation-section');
    if (startConsult !== -1) {
        mainContent = mainContent.substring(0, startConsult) + '{% include "consultation.njk" %}\n    </div>';
    }

    // Replace static text
    mainContent = mainContent.replace(/w Przemyślu i okolicach/gi, 'w {{ city_locative | default("Przemyślu") }} i okolicach');
    mainContent = mainContent.replace(/w Przemyślu/g, 'w {{ city_locative | default("Przemyślu") }}');
    mainContent = mainContent.replace(/Przemyśl/g, '{{ city_name | default("Przemyśl") }}');
    mainContent = mainContent.replace(/Przemyślu/g, '{{ city_locative | default("Przemyślu") }}');

    // Replace relative paths
    mainContent = mainContent.replace(/href="css\//g, 'href="/css/');
    mainContent = mainContent.replace(/src="images\//g, 'src="/images/');
    mainContent = mainContent.replace(/url\(images\//g, 'url(/images/');

    // Save include file
    fs.writeFileSync(`src/_includes/content_${service.name}.njk`, mainContent, 'utf8');

    // Extract SEO from head
    let titleMatch = html.match(/<title>(.*?)<\/title>/);
    let title = titleMatch ? titleMatch[1] : `Naprawa ${service.name} {{ city_name | default("Przemyśl") }} | Serwis na miejscu`;
    title = title.replace(/Przemyśl/g, '{{ city_name | default("Przemyśl") }}');
    title = title.replace(/Przemyślu/g, '{{ city_locative | default("Przemyślu") }}');

    let descMatch = html.match(/<meta name="description"[\s\S]*?content="(.*?)"/);
    let desc = descMatch ? descMatch[1] : '';
    desc = desc.replace(/Przemyśl/g, '{{ city_name | default("Przemyśl") }}');
    desc = desc.replace(/Przemyślu/g, '{{ city_locative | default("Przemyślu") }}');

    // Create root template
    const rootTemplate = `---
layout: base.njk
title: "${title}"
seo_desc: "${desc}"
---
{% include "content_${service.name}.njk" %}
`;
    fs.writeFileSync(`src/${service.stem}.njk`, rootTemplate, 'utf8');

    // Create Radymno template
    let rTitle = title.replace(/\{\{ city_name \| default\("Przemyśl"\) \}\}/g, 'Radymno').replace(/\{\{ city_locative \| default\("Przemyślu"\) \}\}/g, 'Radymnie');
    let rDesc = desc.replace(/\{\{ city_name \| default\("Przemyśl"\) \}\}/g, 'Radymno').replace(/\{\{ city_locative \| default\("Przemyślu"\) \}\}/g, 'Radymnie');
    const radymnoTemplate = `---
layout: base.njk
title: "${rTitle}"
seo_desc: "${rDesc}"
city_name: "Radymno"
city_locative: "Radymnie"
city_path: "/radymno/"
---
{% include "content_${service.name}.njk" %}
`;
    fs.writeFileSync(`src/radymno/${service.stem}.njk`, radymnoTemplate, 'utf8');

    // Create Jaroslaw template
    let jTitle = title.replace(/\{\{ city_name \| default\("Przemyśl"\) \}\}/g, 'Jarosław').replace(/\{\{ city_locative \| default\("Przemyślu"\) \}\}/g, 'Jarosławiu');
    let jDesc = desc.replace(/\{\{ city_name \| default\("Przemyśl"\) \}\}/g, 'Jarosław').replace(/\{\{ city_locative \| default\("Przemyślu"\) \}\}/g, 'Jarosławiu');
    const jaroslawTemplate = `---
layout: base.njk
title: "${jTitle}"
seo_desc: "${jDesc}"
city_name: "Jarosław"
city_locative: "Jarosławiu"
city_path: "/jaroslaw/"
---
{% include "content_${service.name}.njk" %}
`;
    fs.writeFileSync(`src/jaroslaw/${service.stem}.njk`, jaroslawTemplate, 'utf8');
});

console.log('All services extracted and updated properly!');
