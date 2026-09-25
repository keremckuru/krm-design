import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Read all ISO codes from frontend/lib/country-data.js
import { countryIso } from '../frontend/lib/country-data.js';

const locales = ['tr', 'es', 'de', 'fr', 'nb', 'it', 'pt'];
const displayNames = locales.map(l => new Intl.DisplayNames([l], { type: 'region' }));

const entries = {};

for (const [englishName, rawCode] of Object.entries(countryIso)) {
    // rawCode is 'gb-eng' for England, etc. Intl.DisplayNames expects standard 2 letter codes or fallback gracefully
    // Let's strip anything after '-' if it's there? Intl doesn't do subregions well usually.
    // 'gb-eng' -> 'GB'. Actually, we'll just try/catch
    let validCode = rawCode.split('-')[0].toUpperCase();

    // Some exceptions where English names are totally different:

    let translations = [];
    for (const dn of displayNames) {
        let name = englishName;
        try {
            name = dn.of(validCode);
            // Quick fixes
            if (rawCode === 'gb-eng' && dn === displayNames[0]) name = 'İngiltere';
            if (rawCode === 'gb-wls' && dn === displayNames[0]) name = 'Galler';
            if (rawCode === 'gb-sct' && dn === displayNames[0]) name = 'İskoçya';
        } catch (e) {
            // keep english name
        }
        translations.push(name);
    }
    entries[englishName] = translations;
}

const content = `export default ${JSON.stringify(entries, null, 4)};`;
const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../frontend/lib/translations-countries.js');
fs.writeFileSync(outPath, content, 'utf8');
console.log('Successfully generated country translations!');
