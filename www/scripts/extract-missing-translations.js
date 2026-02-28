#!/usr/bin/env node

/**
 * Extract missing Bulgarian translations from en.json
 * Usage: node scripts/extract-missing-translations.js [section]
 *
 * Examples:
 *   node scripts/extract-missing-translations.js           # Show all missing
 *   node scripts/extract-missing-translations.js auth      # Show only auth section
 *   node scripts/extract-missing-translations.js --export  # Export to JSON file
 */

const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../messages/en.json');
const bgPath = path.join(__dirname, '../messages/bg.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const bg = JSON.parse(fs.readFileSync(bgPath, 'utf8'));

function getAllKeys(obj, prefix = '') {
    let result = {};
    for (let key in obj) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(result, getAllKeys(obj[key], path));
        } else {
            result[path] = obj[key];
        }
    }
    return result;
}

const enKeys = getAllKeys(en);
const bgKeys = getAllKeys(bg);

const missing = {};
for (let key in enKeys) {
    if (!bgKeys[key]) {
        missing[key] = enKeys[key];
    }
}

// Group by section
const sections = {};
Object.keys(missing).forEach(k => {
    const section = k.split('.')[0];
    if (!sections[section]) sections[section] = {};
    sections[section][k] = missing[k];
});

const args = process.argv.slice(2);
const sectionFilter = args.find(arg => !arg.startsWith('--'));
const exportMode = args.includes('--export');

if (exportMode) {
    const outputPath = path.join(__dirname, '../missing-translations.json');
    fs.writeFileSync(outputPath, JSON.stringify(missing, null, 2));
    console.log(`✅ Exported ${Object.keys(missing).length} missing translations to ${outputPath}`);
    process.exit(0);
}

console.log('\n📊 Missing Bulgarian Translations Summary\n');
console.log('Section'.padEnd(20), 'Missing Count');
console.log('─'.repeat(40));

const sortedSections = Object.entries(sections)
    .sort((a, b) => Object.keys(b[1]).length - Object.keys(a[1]).length);

for (const [section, keys] of sortedSections) {
    const count = Object.keys(keys).length;
    console.log(section.padEnd(20), count.toString().padStart(5));
}

console.log('─'.repeat(40));
console.log('TOTAL'.padEnd(20), Object.keys(missing).length.toString().padStart(5));

if (sectionFilter) {
    console.log(`\n📝 Missing translations in "${sectionFilter}" section:\n`);
    const sectionKeys = sections[sectionFilter] || {};
    Object.entries(sectionKeys).forEach(([key, value]) => {
        console.log(`  ${key}`);
        console.log(`    EN: ${value}`);
        console.log('');
    });
}

console.log('\n💡 Usage:');
console.log('  node scripts/extract-missing-translations.js [section]  # View specific section');
console.log('  node scripts/extract-missing-translations.js --export   # Export to JSON\n');
