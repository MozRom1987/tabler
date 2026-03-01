# AGD.fix24 - Documentation for Developers/Agents

This documentation is intended for any AI agent or developer continuing the maintenance or expansion of the **AGD.fix24** project.

## 🚀 Tech Stack
- **Static Site Generator:** [Eleventy (11ty)](https://www.11ty.dev/)
- **Templating Engine:** Nunjucks (`.njk`)
- **Styling:** Vanilla CSS (Custom theme)
- **Deployment:** Static files (`_site` folder)

## 📂 Project Structure
- `/src`: Source files. **Edit ONLY these.**
    - `/_includes`: Partial components (Header, Footer, FAQ, Service content blocks).
    - `/_layouts`: Main templates (`base.njk`, `home.njk`).
    - `/css`, `/js`, `/images`, `/fonts`: Static assets.
    - `/[city_name]`: Folders for specific cities (e.g., `jaroslaw`, `radymno`).
- `.eleventy.js`: Configuration for paths and passthroughs.
- `_site/`: Generated output (auto-generated, do not edit manually).

## 🏙️ Architecture for Multi-City Support
The site uses a "Golden Master" approach for service pages to ensure SEO consistency.

### 1. Variables in Frontmatter
Every page (especially city pages) should have these variables in the frontmatter:
```yaml
city_name: "Jarosław"      # Nominative form
city_locative: "Jarosławiu" # Locative form (for Polish grammar: "w Jarosławiu")
city_path: "/jaroslaw/"    # Root-relative path with trailing slash
```
*Note: For the main root (Przemyśl), `city_path` is `/`.*

### 2. Service Pages
City-specific service pages (e.g., `src/jaroslaw/naprawa_pralek.njk`) are thin wrappers:
```njk
---
layout: base.njk
city_name: "Jarosław"
city_locative: "Jarosławiu"
city_path: "/jaroslaw/"
---
{% include "content_pralek.njk" %}
```
This ensures that if you change the description of how a washing machine is fixed, it updates across ALL cities simultaneously.

## 🔍 SEO Strategy

### Village Indexing (FAQ Method)
To capture long-tail traffic for small villages without creating thousands of duplicate pages (which risks Google penalties), villages are listed inside the **FAQ** section:
- File: `src/_includes/faq.njk`
- Logic: Uses an `{% if city_name == '...' %}` block to join an array of village names into a comma-separated paragraph.
- Behavior: Invisible to the user until they click the "Dojeżdżacie do okolicznych wsi?" question, but fully indexable by Google.

### Footer Layout
The footer is structured into 4 logical columns:
1. **Contacts/Address** (`.footer-col1-left`)
2. **Our Services** (`.footer-col1-middle`) - Links to current city service pages.
3. **Serviced Cities** (`.footer-col1-right`) - Cross-linking between city hubs.
4. **Social/Motto** (`.col col2`) - Right-aligned upper block.

## 🛠️ Common Tasks

### How to add a new City (e.g., 'Przeworsk')
1. Create folder `src/przeworsk`.
2. Create `src/przeworsk/index.njk` (copy from Jarosław, update frontmatter).
3. Create service pages like `naprawa_pralek.njk` inside the folder.
4. Update `src/_includes/footer.njk`: Add a link to `<li><a href="/przeworsk/">Przeworsk</a></li>` in the "Obsługiwane miasta" column.
5. Update `src/_includes/faq.njk`: Add the list of villages for `city_name == 'Przeworsk'`.

### CSS Management
The main CSS file is `src/css/style.css`.
**WARNING:** It is a large file (~72KB). When editing via automated scripts, ensure you use precise string replacement or regex to avoid truncating the file.
- Layout widths for the footer are located around line 3370+ (`.footer-top-inner`) and 3510+ (`.footer-col1-bottom`).

## ⚙️ Build Commands
- `npm run build` or `npx @11ty/eleventy` to generate the site.
- `npx @11ty/eleventy --serve` for local development.

---
*Documentation generated on 2026-03-01 by Antigravity AI.*
