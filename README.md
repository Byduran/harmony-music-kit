# Harmony Music Kit

Circle of fifths, chord library, progressions with a practice player, modes lab and harmony explorer — one web app that also ships as an Android app.

- **Single source of truth:** `web/index.html`. Android's Gradle config reads assets from `../web`; `app/src/main/assets/index.html` is kept identical for compatibility.
- **Web (Netlify):** deploy `web/index.html` at the site root.
- **Android:** open the repository root in Android Studio and build the APK.
- **Tests:** `node tests/music-theory.test.js`

Current version: 0.9.27 (versionCode 30). See `RELEASE_NOTES.md`.
