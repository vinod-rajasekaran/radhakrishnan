CLAUDE.md — Project Guidelines

this is a personal anthology site of poems of the author's. 

Page Structure & Shared Components

Pages should always use centralized css, js. No inline styling ever

There are 800+ songs and hence create structures that will work for a large corpus that does not involve long downloads. 

No backends ever - snappy fast local files only

Define once and use everywhere headers and footers for all pages.


Development Setup — Pre-commit Hook

This repo ships a tracked pre-commit hook (`.githooks/pre-commit`) that automatically rebuilds `data/songs.json` and bumps the cache-busting version (see below) whenever relevant files are staged. Git does not enable tracked hooks on its own — after cloning, run once:
  git config core.hooksPath .githooks

Without this one-time step, the hook is present in the repo but inactive, and rebuilds/bumps must be done manually as described below.


CSS — Reuse First

Before adding any CSS class, search for an existing class that covers the need. Never use inline style attributes — always create or reuse a CSS class. If a pattern appears on more than one element, promote it to a class and check with the user first. The design token variables in :root must be used for all colours — no raw hex or rgba values outside the token definitions themselves.

Cache Busting — Asset Versioning

Every <link>, <script>, and <img> in every HTML file must carry a ?v=YYYYMMDD[letter] query string (e.g. ?v=20260718a). This forces browsers to re-fetch assets after a deploy instead of serving stale cached files.

Current version: 20260819a

When to bump: any time a static file changes — CSS, JS, JSON under data/, or images.

Automatic: the pre-commit hook (see Development Setup above) runs `node scripts/bump-version.js` whenever a staged file matches `assets/{css,js,images}/**` or `data/**/*.json`, updating every `*.html` file, every `assets/js/*.js` fetch URL, and the "Current version" line below in one pass.

Manual fallback (if hooks aren't enabled, replace OLD with the previous token, NEW with today's token):
  sed -i '' 's|?v=OLD|?v=NEW|g' *.html assets/js/*.js

Letter suffix: start at 'a' each day; increment to 'b', 'c', … for subsequent changes on the same day.

Rule: always bump BEFORE committing. Never skip — a stale version string means users keep running old JS/CSS after a deploy.

Song Index — Rebuild Required

`data/songs.json` is auto-generated from `data/lyrics/*.json` by running:
  node scripts/build-index.js

Automatic: the pre-commit hook (see Development Setup above) runs this whenever a `data/lyrics/*.json` file is staged.

Run this command manually any time you want to preview the rebuild before staging. Never edit `data/songs.json` directly — it is overwritten on every rebuild.

Song Display — Three Surfaces Share Behaviour

Song content is displayed in three places that must stay in sync:
  1. Home page — "A song, at random" verse card (index.html + home.js)
  2. Lyrics page modal (lyrics.html + lyrics.js)
  3. Audio page modal (audio.html + audio.js)

All three render lyrics, titles, chips, and notes. Shared rendering logic lives in site.js (renderLyrics, renderNotes, wireNotesExpand, buildAudioBar).

Before touching any of these surfaces, ask:
  - Does this change need to land in all three places, or only one?
  - Is the affected logic already shared via site.js, or duplicated across files?
  - Does adding a new field (title, tag, section) require an HTML element in index.html as well as the modal template in site.js?

Always ask clarifying questions before implementing if the scope across these three surfaces is not explicit in the request.

End-to-End Verification

For any significant change, verify with Playwright before reporting complete:

Always verify when: nav/footer/base template changes, new pages added, JS flow changes, CSS layout changes.

Do not mark a frontend or full-stack change complete without a screenshot.
