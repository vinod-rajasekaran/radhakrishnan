# Radhakrishnan's Anthology

A static website presenting the Tamil devotional songs of **Dr. R. Radhakrishnan** — pharmaceutical researcher, poet, and author of 800+ songs spanning three decades.

Live site: [vinod-rajasekaran.github.io/radhakrishnan](https://vinod-rajasekaran.github.io/radhakrishnan/)

---

## What's here

| Page | Description |
|---|---|
| Home | Introduction and hero slides |
| Lyrics | Searchable grid of all songs with deity/theme/volume/singer filters |
| Audio | Songs recorded by Asha Ramesh and Bavatharini |
| Books | The three-volume anthology |
| About | Dr. Radhakrishnan's biography and musical journey |
| Acknowledgements | With dedication to family and collaborators |
| Glossary | Tamil and Sanskrit terms used across the songs |
| Contact | Get in touch |

---

## Architecture

**No backend. No build step. Static files only.**

```
radhakrishnan/
├── index.html, lyrics.html, audio.html …   # Pages
├── assets/
│   ├── css/site.css                         # Single stylesheet
│   ├── js/site.js                           # Shared nav/footer
│   ├── js/lyrics.js, audio.js …            # Page-specific JS
│   └── images/
├── data/
│   ├── songs.json                           # Auto-generated index (do not edit)
│   └── lyrics/
│       ├── 001.json … 088.json             # One file per song (source of truth)
└── scripts/
    └── build-index.js                       # Rebuilds songs.json from lyric files
```

### Song data

Each file in `data/lyrics/` is the single source of truth for a song:

```json
{
  "id": "015",
  "tamil": "கல்யாண கோல காருண்ய கணபதே",
  "en": "kalyANa kOla kAruNya gaNapathE",
  "deity": "Ganesha",
  "themes": ["Devotion"],
  "excerpt": "...",
  "volume": 1,
  "singer": "Asha Ramesh",
  "audio": null,
  "sections": [
    { "label": "Pallavi", "ta": "...", "translit": "...", "en": "..." },
    { "label": "Anupallavi", "ta": "...", "translit": "...", "en": "..." },
    { "label": "Charanam", "ta": "...", "translit": "...", "en": "..." }
  ],
  "notes": "Author's contextual note..."
}
```

`data/songs.json` is **auto-generated** — never edit it directly. A git pre-commit hook regenerates it whenever any `data/lyrics/*.json` file is staged.

To rebuild manually:
```bash
node scripts/build-index.js
```

### Adding audio

Set the `audio` field in the lyric file to a path under `assets/`:

```json
"audio": "assets/audio/vel-muruga.mp3"
```

The modal will automatically switch from "not yet available" to a live play/pause control.

---

## Local development

Requires a local HTTP server (fetch API won't work over `file://`):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

---

## Asset versioning

Every `<link>`, `<script>`, and `<img>` carries a `?v=YYYYMMDD[letter]` cache-busting query string. Bump it before committing any static file change:

```bash
sed -i '' 's|?v=OLD|?v=NEW|g' *.html
```

Current version: see `CLAUDE.md`.

---

## Credits

Songs by **Dr. R. Radhakrishnan**. Site built by Girija Radhakrishnan, with contributions from the family. See [Acknowledgements](acknowledgements.html) for the full list.