#!/usr/bin/env node
// Regenerates data/songs.json from data/lyrics/*.json
// Run: node scripts/build-index.js
// Triggered automatically by the pre-commit hook when a lyric file changes.

const fs   = require('fs');
const path = require('path');

const LYRICS_DIR  = path.join(__dirname, '../data/lyrics');
const OUTPUT_FILE = path.join(__dirname, '../data/songs.json');

const METADATA_KEYS = ['id','tamil','en','deity','themes','excerpt','volume','singer'];

const files = fs.readdirSync(LYRICS_DIR)
  .filter(f => f.endsWith('.json'))
  .sort();

const songs = files.map(f => {
  const song = JSON.parse(fs.readFileSync(path.join(LYRICS_DIR, f), 'utf8'));
  const entry = {};
  METADATA_KEYS.forEach(k => { if (song[k] !== undefined) entry[k] = song[k]; });
  return entry;
});

// Derive meta lists from the song data itself
const set = k => [...new Set(songs.flatMap(s => Array.isArray(s[k]) ? s[k] : s[k] ? [s[k]] : []))].sort();

const index = {
  meta: {
    deities: set('deity'),
    themes:  set('themes'),
    volumes: [...new Set(songs.map(s => s.volume))].sort((a, b) => a - b),
    singers: set('singer'),
  },
  songs,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2) + '\n');
console.log(`songs.json rebuilt — ${songs.length} songs`);
