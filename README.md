# Radhakrishnan's Anthology

A static website presenting the Tamil devotional songs of **Dr. R. Radhakrishnan** — pharmaceutical researcher, poet, and author of 800+ songs spanning three decades.

Live site: [vinod-rajasekaran.github.io/radhakrishnan](https://vinod-rajasekaran.github.io/radhakrishnan/)

---

## Pages

| Page | Description |
|---|---|
| Home (`index.html`) | 5-slide hero carousel, random verse teaser, browse CTA |
| Lyrics (`lyrics.html`) | Searchable grid with Theme / Deity / Volume filters and a theme carousel |
| Audio (`audio.html`) | Songs set to music and recorded — two collections |
| Books (`books.html`) | The three-volume anthology |
| About (`about.html`) | Dr. Radhakrishnan's biography and musical journey |
| Acknowledgments (`acknowledgments.html`) | With dedication to family and collaborators |
| Glossary | Tamil and Sanskrit terms used across the songs |
| Contact | Get in touch |

---

## Architecture

**No backend. No build step. Static files only.**

```
radhakrishnan/
├── index.html, lyrics.html, audio.html …   # Pages
├── assets/
│   ├── css/
│   │   └── site.css                        # Single centralised stylesheet (design tokens in :root)
│   ├── js/
│   │   ├── site.js                         # Shared: nav, footer, modal, DEITY_META
│   │   ├── home.js                         # Hero slider, verse teaser
│   │   ├── lyrics.js                       # Filter bar, theme carousel, song grid, modal wiring
│   │   └── audio.js                        # Audio page
│   ├── images/
│   │   ├── intro-collage.jpg               # Home slide 0 — temple + book blend
│   │   ├── koil-concerts.jpg               # Home slide 1 — Mylapore
│   │   ├── puranas-dance.png               # Home slide 2 — Sthalapuranas, dance and the classical tradition
│   │   ├── asha-concert-concord.png        # Home slide 3 — Concert at Concord
│   │   ├── book-collage.jpg                # Home slide 4 / books page
│   │   ├── *.jpg                           # Full-size deity source images
│   │   └── thumbs/
│   │       └── *.jpg                       # 240×320 top-crop portraits for modal banners
│   └── audio/
│       └── *.mp3                           # Recorded songs
├── data/
│   ├── songs.json                          # Auto-generated index (never edit directly)
│   └── lyrics/
│       └── 001.json … NNN.json            # One file per song — source of truth
└── scripts/
    └── build-index.js                      # Rebuilds songs.json from lyrics files
```

---

## Song data

Each file in `data/lyrics/` is the canonical record for one song:

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
  "collection": "cd",
  "audio": "assets/audio/example.mp3",
  "sections": [
    { "label": "Pallavi",    "ta": "...", "translit": "...", "en": "..." },
    { "label": "Anupallavi", "ta": "...", "translit": "...", "en": "..." },
    { "label": "Charanam",   "ta": "...", "translit": "...", "en": "..." }
  ],
  "notes": "Author's contextual note..."
}
```

`data/songs.json` is **auto-generated** — never edit it directly. A git pre-commit hook regenerates it whenever any `data/lyrics/*.json` file is staged.

To rebuild manually:

```bash
node scripts/build-index.js
```

### Deity vs theme

The `deity` field holds either a true deity name (`Ganesha`, `Muruga`, …) or one of the **non-deity category** values:

| Value | Treated as |
|---|---|
| `Navarasa` | Theme category |
| `Miscellaneous` | Theme category |
| `Nature` | Theme category |

Songs with a non-deity category value are filtered correctly under their theme on the Lyrics page and do not show a deity thumbnail in the modal.

The `themes` array carries secondary classification tags (`Devotion`, `Healing`, `Family`, …).

---

## Adding audio

Three fields control audio on a song:

| Field | Values | Effect |
|---|---|---|
| `audio` | `"assets/audio/file.mp3"` or `null` | Path to the MP3; `null` shows "not yet available" |
| `collection` | `"cd"` or `"live"` | **Required** for the song to appear on the Audio page. `"cd"` = Thenum Thinaiyum CD; `"live"` = concert/session recordings |
| `singer` | string or omit | Stored in metadata only — never displayed in the UI |

When `audio` is set, the modal shows a Plyr player with play/pause, a seek bar, and current/total time. When `null`, it shows a placeholder message.

Songs without a `collection` value never appear on the Audio page, regardless of the `audio` field.

---

## Deity thumbnails

Portraits live in `assets/images/thumbs/` at exactly **240 × 320 px** (portrait, top-biased crop). They appear in the modal deity banner as a 220 × 160 px display panel on the right edge, with `object-fit: cover; object-position: top center` so the face is always visible.

To regenerate or resize thumbnails, edit and run `scripts/make_thumbs.py` (requires Pillow).

---

## Home page slides

| # | Label | Background |
|---|---|---|
| 0 | Introduction | `intro-collage.jpg` — temple + book blend |
| 1 | Mylapore | `koil-concerts.jpg` |
| 2 | Sthalapuranas, dance and the classical tradition | `puranas-dance.png` |
| 3 | Concert at Concord | `asha-concert-concord.png` |
| 4 | The book | `book-collage.jpg` |

Replace any slide background by swapping the image file — no code change needed.

---

## Local development

Requires a local HTTP server (the Fetch API won't work over `file://`):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

---

## Asset versioning

Every `<link>`, `<script>`, and `<img>` carries a `?v=YYYYMMDD[letter]` cache-busting query string. Bump it before committing any static file change:

```bash
sed -i '' 's|?v=OLD|?v=NEW|g' *.html assets/js/*.js assets/css/*.css
```

Current version token: see `CLAUDE.md`.

---

## Credits

Songs by **Dr. R. Radhakrishnan**. Site built by Girija Radhakrishnan, with contributions from the family. See [Acknowledgments](acknowledgments.html) for the full list.
