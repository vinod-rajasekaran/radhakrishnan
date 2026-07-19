CLAUDE.md — Project Guidelines

this is a personal anthology site of poems of the author's. 

Page Structure & Shared Components

Pages should always use centralized css, js. No inline styling ever

There are 800+ songs and hence create structures that will work for a large corpus that does not involve long downloads. 

No backends ever - snappy fast local files only

Define once and use everywhere headers and footers for all pages.


CSS — Reuse First

Before adding any CSS class, search for an existing class that covers the need. Never use inline style attributes — always create or reuse a CSS class. If a pattern appears on more than one element, promote it to a class and check with the user first. The design token variables in :root must be used for all colours — no raw hex or rgba values outside the token definitions themselves.

Cache Busting — Asset Versioning

Every <link>, <script>, and <img> in every HTML file must carry a ?v=YYYYMMDD[letter] query string (e.g. ?v=20260718a). This forces browsers to re-fetch assets after a deploy instead of serving stale cached files.

Current version: 20260718y

When to bump: any time a static file changes — CSS, JS, JSON under data/, or images.

How to bump (replace OLD with the previous token, NEW with today's token):
  sed -i '' 's|?v=OLD|?v=NEW|g' *.html

Letter suffix: start at 'a' each day; increment to 'b', 'c', … for subsequent changes on the same day.

Rule: always bump BEFORE committing. Never skip — a stale version string means users keep running old JS/CSS after a deploy.

End-to-End Verification

For any significant change, verify with Playwright before reporting complete:

Always verify when: nav/footer/base template changes, new pages added, JS flow changes, CSS layout changes.

Do not mark a frontend or full-stack change complete without a screenshot.
