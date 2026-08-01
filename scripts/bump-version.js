#!/usr/bin/env node
// Bumps the ?v=YYYYMMDD[letter] cache-busting token used on every <link>,
// <script>, and <img> tag, plus the matching data-fetch URLs in assets/js/*.js.
// Run: node scripts/bump-version.js
// Triggered automatically by the pre-commit hook when a CSS, JS, data/*.json,
// or image file changes.

const fs   = require('fs');
const path = require('path');

const ROOT           = path.join(__dirname, '..');
const CLAUDE_MD_PATH = path.join(ROOT, 'CLAUDE.md');

const claudeMd = fs.readFileSync(CLAUDE_MD_PATH, 'utf8');
const match = claudeMd.match(/Current version:\s*(\d{8})([a-z])/);
if (!match) {
  console.error('bump-version: could not find "Current version: YYYYMMDDx" in CLAUDE.md');
  process.exit(1);
}
const [, oldDate, oldLetter] = match;
const oldVersion = `${oldDate}${oldLetter}`;

const now   = new Date();
const today = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

const newVersion = oldDate === today
  ? `${today}${String.fromCharCode(oldLetter.charCodeAt(0) + 1)}`
  : `${today}a`;

const targets = [
  ...fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).map(f => path.join(ROOT, f)),
  ...fs.readdirSync(path.join(ROOT, 'assets', 'js')).filter(f => f.endsWith('.js')).map(f => path.join(ROOT, 'assets', 'js', f)),
];

const oldToken = `?v=${oldVersion}`;
const newToken = `?v=${newVersion}`;

let changedFiles = [];
for (const file of targets) {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes(oldToken)) continue;
  fs.writeFileSync(file, content.split(oldToken).join(newToken));
  changedFiles.push(path.relative(ROOT, file));
}

const updatedClaudeMd = claudeMd.replace(
  /Current version:\s*\d{8}[a-z]/,
  `Current version: ${newVersion}`
);
fs.writeFileSync(CLAUDE_MD_PATH, updatedClaudeMd);

console.log(`bump-version: ${oldVersion} -> ${newVersion} (${changedFiles.length} file(s) updated)`);
