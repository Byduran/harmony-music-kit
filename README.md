# Harmony Music Kit

Circle of fifths, chord library, progressions with a practice player, modes lab and harmony explorer — one web app that also ships as an Android app.

- **Single source of truth:** `web/index.html`. Android's Gradle config reads assets from `../web`; `app/src/main/assets/index.html` is kept identical for compatibility.
- **Web (Netlify):** deploy the contents of `web/` (index.html and the `sounds/` folder) at the site root.
- **Android:** open the repository root in Android Studio and build the APK.
- **Tests:** `node tests/music-theory.test.js`

Current version: 0.9.32 (versionCode 35). See `RELEASE_NOTES.md`.

## Languages

English and Turkish. English strings are the keys; Turkish lives in `I18N_TR` in `web/index.html`. Missing entries fall back to English. To add text, wrap it in `T('English text')` (or `data-i18n` in static HTML) and add the Turkish line.

## Sound credits

- Piano: Salamander Grand Piano by Alexander Holm, CC BY 3.0 — https://creativecommons.org/licenses/by/3.0/
- Guitar: FluidR3_GM acoustic nylon guitar, pre-rendered by gleitz/midi-js-soundfonts, CC BY 3.0
- Samples in `web/sounds/` were trimmed, converted to mono and normalized.

## Website

The public website is generated from this repo: `node site/build.js` writes `dist/` with the site at `/` and the app at `/app/` (copied from `web/`). The site reads the app's music code (chord spelling, shapes, inversions) from `web/index.html`, so both always agree.

Cloudflare Pages settings: build command `node site/build.js`, output directory `dist`, environment variable `SITE_URL` = the site's address (used in canonical links and the sitemap; defaults to https://harmony-music-kit.pages.dev).
