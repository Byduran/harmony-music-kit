# Website update (app unchanged, still v0.9.34)

- New Progressions page (/progressions/, /tr/yuruyusler/): all 24 keys on one page, the seven chords of each key, preset progressions and "Your own" (tap chords to build up to 8), with loop, tempo, click and piano/guitar; the key can change while it plays
- New Modes page (/modes/, /tr/modlar/): 12 roots x 7 modes, scale with its colour note, compare two modes by ear, relative family
- New Harmony Explorer page (/harmony/, /tr/armoni/): secondary dominant, tritone substitution, backdoor dominant and modal interchange in all 24 keys, playable, with "How it works"
- Menu: Chords · Keys · Progressions · Modes · Harmony · Learn; the site no longer links to the web app; the bottom box is now "Coming soon on Google Play"
- Fix: apostrophes in embedded page data (Turkish texts) are escaped
- Home: chord search and popular chords moved to the top of the page, next to the circle; the separate "Look up any chord" section is gone

# Harmony Music Kit v0.9.34

- Website in Turkish under /tr/: home, chord builder and 420 chord pages (/tr/akorlar/), circle explorer and 24 key pages (/tr/tonlar/, with solfège names like "B majör (Si majör)"), and the three lessons (/tr/dersler/, sharps order "Fa Do Sol Re La Mi Si")
- EN | TR switch in the header (globe icon) and English · Türkçe in the footer; each page links to its translation (hreflang); English pages show a small "Türkçe sürüm" hint to visitors whose browser prefers Turkish (no automatic redirect)
- App: /app/?lang=tr opens the app in Turkish; links from Turkish pages use it

# Harmony Music Kit v0.9.33

- Website: a page for every chord (420) with guitar shapes in every position, piano inversions, sound, where the chord is used and related chords; a page for every key (24) with its scale, chords, common progressions and neighbouring keys; chord and key lists; chord search
- Website links now open the right page; only the "Practise with the app" section goes to the app
- App: deep links from the website, e.g. /app/?page=chords&chord=C%E2%99%AFm7&inst=guitar or /app/?key=B&mode=major
- Tests: chord-name parsing for all 420 chords; the site build checks every internal link

# Harmony Music Kit v0.9.32

- Chords page, Guitar: new "Chord shape" view with chord diagrams (finger numbers, barre, root in copper, open/muted strings); the 12-fret fretboard stays as the second tab
- Every chord has 2–5 positions: open and CAGED barre shapes for common chords, a search for rarer ones (max. 4 frets, root in the bass); switch with the arrows or by swiping
- Chords page, Piano: one-hand inversions (root position, 1st/2nd/3rd inversion) with the bass note marked and right-hand finger numbers; chords with more than four notes show root position and 1st inversion
- Play Chord / Play Arpeggio play the shape or inversion on screen
- Tests check all 420 chords: shape notes match the chord, root in the bass, required tones present, playable with four fingers

# Harmony Music Kit v0.9.31

- Circle of Fifths redesigned: majors outside, their relative minors inside; tap either ring to pick a key (the Major/Minor toggle is gone)
- A shaded wedge shows the selected key's seven chords and turns with the key; "Show degrees (I–VII)" adds roman-numeral badges for those who want them
- Sharps/flats: a count under every major, the selected key's notes in the centre, altered notes outlined in the scale
- Soft colour wheel: a key and its relative minor share a colour; copper marks only the selected key
- The circle scales to the screen (inner keys 42px on a typical phone)
- The app remembers the last page, key and chord-library chord
- Android: status and navigation bars follow the light/dark theme

# Harmony Music Kit v0.9.30

- The app opens in English by default; the EN/TR button in the header switches to Turkish and the choice is remembered
- The app name in the header no longer gets cut off on phones (checked with Roboto at 360–411px)

# Harmony Music Kit v0.9.29

- Turkish language support with a TR/EN switch in the header (default changed to English in 0.9.30)
- Music terms use the forms Turkish musicians use: Majör/Minör, Beşliler Çemberi, Akor, Arpej, Dizi, Ton, Akor yürüyüşü, İkincil dominant, Triton ikamesi, Modal ödünç alma, Eksik/Artık akor; chord symbols, note letters and mode names stay as they are
- All explanations (progressions, modes, harmony "Why?") are translated; the page language is declared, so browsers no longer auto-translate "Major" as "Ana"

# Harmony Music Kit v0.9.28

- Realistic sound: sampled piano everywhere by default; the Chords page Guitar tab plays sampled acoustic guitar (and shows the fretboard) while you are on that page
- Piano: Salamander Grand Piano samples (Alexander Holm, CC BY 3.0)
- Guitar: FluidR3_GM acoustic nylon guitar samples (CC BY 3.0); chords are strummed low to high
- Samples load from `web/sounds/` (~1.2 MB); the original oscillator plays only while they load
- Netlify deploy now needs the `sounds/` folder next to index.html

# Harmony Music Kit v0.9.27

Fixes on top of v0.9.26:

- Progressions: the Practice Player opens right under the tapped progression (tap again to stop and close), so Pause and Loop are on screen while it plays
- Practice Player follows the light/dark theme; label now says "2 beats / chord" to match the timing
- Guitar fretboard spells notes like the chord (G♯ in E major, not A♭); fret markers sit on 3, 5, 7, 9, 12
- Circle arpeggios and Harmony chord tones play ascending instead of wrapping inside one octave
- Modes Relative Family uses correct spellings; compare text is fully English; A/B status timing matches the scale
- Selected chord keeps its roman numeral; Piano/Guitar shows the active choice; Harmony tabs fill the bar
- Header reads "HARMONY MUSIC KIT"; Harmony tab title is "Harmony Lab"; page title matches the version

# Harmony Music Kit v0.9.26

- Restored approved sound engine
- Progression timing: 100 BPM default, 1.2s chord change at 100 BPM
- Preserved loop, guitar fretboard, diatonic chords and arpeggios
- Same web HTML in Android and Netlify packages
