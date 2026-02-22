#!/usr/bin/env node
// Validate that all language versions of products have required fields filled in.
// Uses French (fr) as the reference language.
//
// Usage: node scripts/validate-translations.js
// Exit code 0 = all translations complete
// Exit code 1 = missing translations found

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'products');
const REFERENCE_LANG = 'fr';
const LANGUAGES = ['en', 'de', 'ro'];
const REQUIRED_FIELDS = ['title', 'description'];
const OPTIONAL_IF_SET_FIELDS = ['intro']; // required in other langs only if set in FR

function parseFrontMatter(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  // Simple YAML parser for flat fields + versions array
  const yaml = match[1];
  const data = {};

  // Extract simple key-value fields
  for (const field of [...REQUIRED_FIELDS, ...OPTIONAL_IF_SET_FIELDS]) {
    const regex = new RegExp(`^${field}:\\s*(.+)$`, 'm');
    const m = yaml.match(regex);
    if (m) {
      let val = m[1].trim();
      // Remove YAML quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // Skip YAML block scalars markers
      if (val === '|-' || val === '|' || val === '>-' || val === '>') {
        // Has content (multi-line), treat as non-empty
        data[field] = '[multiline]';
      } else if (val === 'null' || val === '') {
        data[field] = '';
      } else {
        data[field] = val;
      }
    } else {
      data[field] = '';
    }
  }

  // Extract version names and details
  data.versions = [];
  const versionsMatch = yaml.match(/^versions:\s*\n([\s\S]*?)(?=^[a-z]|\Z)/m);
  if (versionsMatch) {
    const versionBlock = versionsMatch[1];
    const nameMatches = [...versionBlock.matchAll(/^\s+-?\s*name:\s*(.+)$/gm)];
    const detailMatches = [...versionBlock.matchAll(/^\s+details:\s*(.+)$/gm)];

    for (let i = 0; i < nameMatches.length; i++) {
      const name = nameMatches[i][1].trim().replace(/^["']|["']$/g, '');
      let details = detailMatches[i] ? detailMatches[i][1].trim() : '';
      if (details === '|-' || details === '|' || details === '>-' || details === '>') {
        details = '[multiline]';
      }
      data.versions.push({ name, details });
    }
  }

  return data;
}

function getProductSlugs() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith(`.${REFERENCE_LANG}.md`));
  return files.map(f => f.replace(`.${REFERENCE_LANG}.md`, ''));
}

function validate() {
  const slugs = getProductSlugs();
  const errors = [];

  for (const slug of slugs) {
    const refFile = path.join(CONTENT_DIR, `${slug}.${REFERENCE_LANG}.md`);
    const refData = parseFrontMatter(refFile);

    if (!refData) {
      errors.push(`[${slug}] Cannot parse reference file (${REFERENCE_LANG})`);
      continue;
    }

    for (const lang of LANGUAGES) {
      const langFile = path.join(CONTENT_DIR, `${slug}.${lang}.md`);
      const langData = parseFrontMatter(langFile);

      if (!langData) {
        errors.push(`[${slug}] Missing ${lang.toUpperCase()} translation file`);
        continue;
      }

      // Check required fields
      for (const field of REQUIRED_FIELDS) {
        if (!langData[field]) {
          errors.push(`[${slug}] ${lang.toUpperCase()}: missing "${field}"`);
        }
      }

      // Check optional-if-set fields
      for (const field of OPTIONAL_IF_SET_FIELDS) {
        if (refData[field] && !langData[field]) {
          errors.push(`[${slug}] ${lang.toUpperCase()}: missing "${field}" (set in FR)`);
        }
      }

      // Check version names and details
      if (refData.versions.length > 0) {
        if (langData.versions.length < refData.versions.length) {
          errors.push(`[${slug}] ${lang.toUpperCase()}: has ${langData.versions.length} versions, FR has ${refData.versions.length}`);
        }

        for (let i = 0; i < Math.min(refData.versions.length, langData.versions.length); i++) {
          if (!langData.versions[i].name) {
            errors.push(`[${slug}] ${lang.toUpperCase()}: version ${i + 1} missing "name"`);
          }
          if (refData.versions[i].details && !langData.versions[i].details) {
            errors.push(`[${slug}] ${lang.toUpperCase()}: version ${i + 1} missing "details"`);
          }
        }
      }
    }
  }

  return errors;
}

// Run
console.log('Validating translations (reference: FR)...');
console.log('Scanning:', CONTENT_DIR);
console.log('');

const errors = validate();

if (errors.length === 0) {
  console.log('All translations complete!');
  process.exit(0);
} else {
  console.log(`Found ${errors.length} translation issue(s):\n`);
  errors.forEach(e => console.log('  ERROR:', e));
  console.log('');
  console.log('Please fill in the missing translations before publishing.');
  process.exit(1);
}
