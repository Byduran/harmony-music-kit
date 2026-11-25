// Interactive lessons (HMK-25). Each step: title, text, and what the picture shows.
//  circle: {on:['M0','m0'] (M = major ring index, m = minor ring index, circle order C G D A E B F♯ D♭ A♭ E♭ B♭ F), wedge: index or null, name, acc:[rows], sig}
//  kb:     {notes:[midi], labels:{midi:'text'}}  — keyboard C4–B5
//  row:    [{t, sub, midis}] chord tiles, tap to hear
//  play:   {label, midis, mode:'arp'|'chord'} or {label, seq:[{midis, row:index, kb:{...}}]}
//  quiz:   {on:'circle'|'row', answer, ok, hint, then:{circle, kb, play}}
// Text is English; the Turkish site (HMK-28) adds a translated copy.
const C=[60,62,64,65,67,69,71,72],G=[67,69,71,72,74,76,78,79],D=[62,64,66,67,69,71,73,74],F=[65,67,69,70,72,74,76,77],AM=[69,71,72,74,76,77,79,81];
const lab=(ms,names)=>Object.fromEntries(ms.map((m,i)=>[m,names[i]]));
module.exports=[
{slug:'circle-of-fifths',n:1,minutes:6,title:'The circle of fifths',
 description:'Learn the circle of fifths step by step: why keys sit in this order, how sharps and flats add up, relative minors, and why neighbouring keys share chords. Interactive, with sound.',
 next:{label:'Explore the circle',url:'keys/'},
 steps:[
 {t:'Start with C major',x:'C major uses only the white keys of the piano: no sharps, no flats. That makes it the top of the circle — the place everything is measured from.',
  circle:{on:['M0'],name:'C major',acc:[],sig:'No sharps or flats'},kb:{notes:C,labels:lab(C,['C','D','E','F','G','A','B','C'])},play:{label:'Hear C major',midis:C,mode:'arp'}},
 {t:'Go up a fifth',x:'Count five notes up from C: C, D, E, F, G. G is the fifth of C — so G is the next key, one step clockwise.',
  circle:{on:['M0','M1'],name:'C → G',acc:[],sig:'one step clockwise'},kb:{notes:[60,62,64,65,67],labels:lab([60,62,64,65,67],['1','2','3','4','5'])},play:{label:'Hear C then G',midis:[60,67],mode:'arp'}},
 {t:'The first sharp appears',x:'Play the G major scale and listen to its 7th note. To sound right it needs F♯ instead of F. Each step clockwise adds exactly one sharp.',
  circle:{on:['M1'],name:'G major',acc:['F♯'],sig:'1 sharp'},kb:{notes:G,labels:lab(G,['G','A','B','C','D','E','F♯','G']),alt:[78]},play:{label:'Hear G major',midis:G,mode:'arp'}},
 {t:'Your turn',x:'Go one more step clockwise from G. Which key has two sharps? Tap it on the circle.',
  circle:{on:['M1'],name:'?',acc:[],sig:'tap a key'},kb:{notes:[],labels:{}},
  quiz:{on:'circle',answer:'M2',ok:'Yes! D major has two sharps: F♯ and C♯. Each step clockwise added one.',hint:'Not quite — start at G and go one step clockwise.',
   then:{circle:{on:['M2'],name:'D major',acc:['F♯ C♯'],sig:'2 sharps'},kb:{notes:D,labels:lab(D,['D','E','F♯','G','A','B','C♯','D']),alt:[66,73]},play:{midis:D,mode:'arp'}}}},
 {t:'The order of sharps',x:'Sharps are always added in the same order: F♯ C♯ G♯ D♯ A♯ E♯ B♯. A common way to remember it: Father Charles Goes Down And Ends Battle.',
  circle:{on:['M0','M1','M2','M3','M4','M5','M6'],name:'Sharps',acc:['F♯ C♯ G♯','D♯ A♯ E♯ B♯'],sig:'always this order'},kb:{notes:[],labels:{}},chips:['F♯','C♯','G♯','D♯','A♯','E♯','B♯']},
 {t:'Counter-clockwise: flats',x:'Go the other way from C and you move down a fifth to F. F major needs B♭ — each step counter-clockwise adds one flat, in the reverse order: B♭ E♭ A♭ D♭ G♭ C♭ F♭.',
  circle:{on:['M11'],name:'F major',acc:['B♭'],sig:'1 flat'},kb:{notes:F,labels:lab(F,['F','G','A','B♭','C','D','E','F']),alt:[70]},play:{label:'Hear F major',midis:F,mode:'arp'}},
 {t:'The inner ring: relative minors',x:'Each major key has a minor partner with the same notes. A minor uses the same white keys as C major — that is why they share a place and a colour on the circle.',
  circle:{on:['M0','m0'],name:'C / Am',acc:[],sig:'same notes'},kb:{notes:AM,labels:lab(AM,['A','B','C','D','E','F','G','A'])},play:{label:'Hear A minor',midis:AM,mode:'arp'}},
 {t:'Why it is useful',x:'Neighbours on the circle share most of their chords. The wedge holds the six main chords of C major side by side: F, C, G outside and Dm, Am, Em inside. Songs often move between them.',
  circle:{on:['M11','M0','M1','m11','m0','m1'],wedge:0,name:'C major',acc:[],sig:'six chords together'},kb:{notes:[],labels:{}},
  row:[{t:'C',sub:'I',midis:[60,64,67]},{t:'Dm',sub:'ii',midis:[62,65,69]},{t:'Em',sub:'iii',midis:[64,67,71]},{t:'F',sub:'IV',midis:[65,69,72]},{t:'G',sub:'V',midis:[67,71,74]},{t:'Am',sub:'vi',midis:[69,72,76]}]}
 ]},
{slug:'diatonic-chords',n:2,minutes:7,title:'Diatonic chords',
 description:'Build the seven chords of a major key from its scale: stacking thirds, major vs minor vs diminished, roman numerals and seventh chords. Interactive, with sound.',
 next:{label:'See the chords of C major',url:'keys/c-major/#kc'},
 steps:[
 {t:'A key is seven notes',x:'C major is the seven white keys from C to B. Every chord in the key is built only from these notes — that is what "diatonic" means.',
  kb:{notes:C,labels:lab(C,['1','2','3','4','5','6','7','8'])},play:{label:'Hear the scale',midis:C,mode:'arp'}},
 {t:'Stack every other note',x:'Start on C, skip D, take E, skip F, take G. These three notes — C, E, G — are the C major chord. Stacking every other note is called stacking thirds.',
  kb:{notes:[60,64,67],labels:{60:'C',64:'E',67:'G'},dim:[62,65]},play:{label:'Hear C – E – G',midis:[60,64,67],mode:'arp'}},
 {t:'Do it from D',x:'Start on D and do the same: D, F, A. That is D minor. Same recipe, different starting note — and a different sound.',
  kb:{notes:[62,65,69],labels:{62:'D',65:'F',69:'A'}},play:{label:'Hear D – F – A',midis:[62,65,69],mode:'arp'},
  row:[{t:'C',sub:'I',midis:[60,64,67]},{t:'Dm',sub:'ii',midis:[62,65,69]}]},
 {t:'Major or minor?',x:'The difference is the first gap. C to E is 4 half steps — a major third, bright. D to F is 3 half steps — a minor third, darker. Listen to both.',
  kb:{notes:[60,64,62,65],labels:{60:'C',64:'E',62:'D',65:'F'}},play:{label:'Hear C–E, then D–F',seq:[{midis:[60,64]},{midis:[62,65]}]}},
 {t:'All seven chords',x:'Build a chord on every note of the scale and you get the seven chords of C major. Tap each one to hear it.',
  kb:{notes:[],labels:{}},row:[{t:'C',sub:'I',midis:[60,64,67]},{t:'Dm',sub:'ii',midis:[62,65,69]},{t:'Em',sub:'iii',midis:[64,67,71]},{t:'F',sub:'IV',midis:[65,69,72]},{t:'G',sub:'V',midis:[67,71,74]},{t:'Am',sub:'vi',midis:[69,72,76]},{t:'B°',sub:'vii°',midis:[71,74,77]}]},
 {t:'Your turn: the odd one',x:'Six chords are major or minor. One has two small gaps (B–D–F) and sounds tense — it is diminished. Which one? Tap it.',
  kb:{notes:[],labels:{}},row:[{t:'C',sub:'I',midis:[60,64,67]},{t:'Dm',sub:'ii',midis:[62,65,69]},{t:'Em',sub:'iii',midis:[64,67,71]},{t:'F',sub:'IV',midis:[65,69,72]},{t:'G',sub:'V',midis:[67,71,74]},{t:'Am',sub:'vi',midis:[69,72,76]},{t:'B°',sub:'?',midis:[71,74,77]}],
  quiz:{on:'row',answer:6,ok:'Right — B° (vii°) is diminished: B–D–F, two minor thirds.',hint:'Listen for the most tense chord, built on the 7th note.',then:{kb:{notes:[71,74,77],labels:{71:'B',74:'D',77:'F'}}}}},
 {t:'Roman numerals',x:'Musicians name the chords by their scale degree: capitals for major (I, IV, V), lower case for minor (ii, iii, vi), and ° for diminished (vii°). The pattern is the same in every major key — so I–IV–V is always major.',
  circle:{on:['M11','M0','M1','m11','m0','m1'],wedge:0,name:'C major',acc:[],sig:'I IV V · ii iii vi'},kb:{notes:[],labels:{}}},
 {t:'Add a seventh',x:'Stack one more third and every chord gets a seventh: Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bm7♭5. These are the chords of jazz and much of pop.',
  kb:{notes:[],labels:{}},row:[{t:'Cmaj7',sub:'Imaj7',midis:[60,64,67,71]},{t:'Dm7',sub:'ii7',midis:[62,65,69,72]},{t:'Em7',sub:'iii7',midis:[64,67,71,74]},{t:'Fmaj7',sub:'IVmaj7',midis:[65,69,72,76]},{t:'G7',sub:'V7',midis:[67,71,74,77]},{t:'Am7',sub:'vi7',midis:[69,72,76,79]},{t:'Bm7♭5',sub:'viiø7',midis:[71,74,77,81]}]}
 ]},
{slug:'ii-v-i',n:3,minutes:8,title:'The ii–V–I',
 description:'The most common progression in jazz: hear the pull of ii–V–I, see why the V7 chord wants to resolve, follow the smooth voice leading and play it in any key. Interactive, with sound.',
 next:{label:'Play ii–V–I in C major',url:'keys/c-major/#kp'},
 steps:[
 {t:'Three chords, one move',x:'Dm7 → G7 → Cmaj7. Listen: the music leaves home, builds tension and lands. This is the ii–V–I, the backbone of jazz standards.',
  kb:{notes:[62,65,69,72],labels:{}},row:[{t:'Dm7',sub:'ii',midis:[62,65,69,72]},{t:'G7',sub:'V',midis:[62,65,67,71]},{t:'Cmaj7',sub:'I',midis:[60,64,67,71]}],
  play:{label:'Hear ii–V–I',seq:[{midis:[62,65,69,72],row:0},{midis:[62,65,67,71],row:1},{midis:[60,64,67,71],row:2}]}},
 {t:'Where the chords come from',x:'In C major, D is the 2nd note, G the 5th and C the 1st. Build a seventh chord on each and you get ii7, V7 and Imaj7.',
  kb:{notes:C.slice(0,7),labels:{60:'I',62:'ii',67:'V'}}},
 {t:'The tension in V7',x:'G7 contains B and F. These two notes clash — the interval is called a tritone. They want to move a half step: B up to C, F down to E.',
  kb:{notes:[67,71,74,77],labels:{71:'B',77:'F'},alt:[71,77]},play:{label:'Hear G7 → C',seq:[{midis:[67,71,74,77]},{midis:[60,64,67,72]}]}},
 {t:'Smooth voice leading',x:'From Dm7 to G7 two notes stay (D and F) and two move down a step (A→G, C→B). From G7 to Cmaj7 the same happens again. The hand barely moves.',
  kb:{notes:[62,65,69,72],labels:{62:'D',65:'F',69:'A',72:'C'}},
  play:{label:'Watch the notes move',seq:[{midis:[62,65,69,72],row:0,kb:{notes:[62,65,69,72],labels:{62:'D',65:'F',69:'A',72:'C'}}},{midis:[62,65,67,71],row:1,kb:{notes:[62,65,67,71],labels:{62:'D',65:'F',67:'G',71:'B'}}},{midis:[60,64,67,71],row:2,kb:{notes:[60,64,67,71],labels:{60:'C',64:'E',67:'G',71:'B'}}}]},
  row:[{t:'Dm7',sub:'ii',midis:[62,65,69,72]},{t:'G7',sub:'V',midis:[62,65,67,71]},{t:'Cmaj7',sub:'I',midis:[60,64,67,71]}]},
 {t:'Your turn',x:'Which two notes stay the same when Dm7 moves to G7?',kb:{notes:[62,65,69,72],labels:{62:'D',65:'F',69:'A',72:'C'}},
  row:[{t:'A and C',sub:'',midis:[69,72]},{t:'D and F',sub:'',midis:[62,65]},{t:'B and F',sub:'',midis:[71,77]}],
  quiz:{on:'row',answer:1,ok:'Exactly — D and F are in both chords, so they simply stay.',hint:'Look at the notes Dm7 and G7 have in common.'}},
 {t:'Around the circle',x:'D, G and C sit next to each other on the circle of fifths. A ii–V–I is simply three steps counter-clockwise: each chord a fifth below the last.',
  circle:{on:['M2','M1','M0'],name:'D → G → C',acc:[],sig:'counter-clockwise'},kb:{notes:[],labels:{}}},
 {t:'Your turn: another key',x:'Am7 → D7 → ? is a ii–V–I too. Count back on the circle from D. Which key does it land on? Tap it.',
  circle:{on:['M3','M2'],name:'A → D → ?',acc:[],sig:'tap the I chord'},kb:{notes:[],labels:{}},
  quiz:{on:'circle',answer:'M1',ok:'Yes — G. Am7 → D7 → Gmaj7 is the ii–V–I of G major.',hint:'Go one step counter-clockwise from D.',
   then:{circle:{on:['M3','M2','M1'],name:'G major',acc:['F♯'],sig:'ii–V–I lands on G'},play:{seq:[{midis:[69,72,76,79]},{midis:[66,69,72,74]},{midis:[67,71,74,78]}]}}}},
 {t:'Practise it',x:'Play ii–V–I in every key with the progression player on the key pages: start slow, loop it, then raise the tempo. Try C major, then F and B♭.',
  kb:{notes:[],labels:{}},row:[{t:'Dm7',sub:'ii',midis:[62,65,69,72]},{t:'G7',sub:'V',midis:[62,65,67,71]},{t:'Cmaj7',sub:'I',midis:[60,64,67,71]}]}
 ]}
];
