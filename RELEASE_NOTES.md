# Harmony Music Kit v0.9.28 (sound prototype)

- New Sound selector under the header: Classic (original, unchanged), Piano, Guitar, Synth guitar. The choice is remembered
- Piano: Salamander Grand Piano samples (Alexander Holm, CC BY 3.0)
- Guitar: FluidR3_GM acoustic nylon guitar samples (CC BY 3.0); chords are strummed low to high
- Synth guitar: Karplus-Strong plucked-string synthesis, no sample files
- Samples load on demand from `web/sounds/` (~1.2 MB); Classic plays until they are ready
- Levels balanced so switching modes does not jump in volume

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
