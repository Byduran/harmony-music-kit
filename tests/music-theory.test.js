const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/../web/index.html','utf8');
const src=html.split('<script>')[1].split('</script>')[0];
const fake=()=>({innerHTML:'',textContent:'',value:'C',dataset:{},style:{},classList:{toggle(){},add(){},remove(){}},querySelector:()=>fake(),querySelectorAll:()=>[],onclick:null,setAttribute(){}});
const map=new Map();const doc={documentElement:{dataset:{}},querySelector:(q)=>{if(!map.has(q))map.set(q,fake());return map.get(q)},querySelectorAll:()=>[]};
map.set("#libraryType",{...fake(),value:"0"});
const ctx={document:doc,window:{matchMedia:()=>({matches:false,addEventListener(){}})},localStorage:{getItem(){return null},setItem(){}},setTimeout:()=>{},console};vm.createContext(ctx);vm.runInContext(src.replace("initHarmonyKeys();renderHarmony();renderModesStandalone();buildCircle();selectKey(0);",""),ctx);
let count=0;const roots=vm.runInContext('LIBROOTS',ctx),types=vm.runInContext('LIBTYPES',ctx);
for(const root of roots)for(const t of types){let notes=vm.runInContext(`chordPitch(${JSON.stringify(root)},${JSON.stringify(t[2].split(' '))})`,ctx);assert.equal(notes.length,t[2].split(' ').length);for(let i=0;i<notes.length;i++){assert.equal(vm.runInContext(`pc(${JSON.stringify(notes[i].name)})`,ctx),notes[i].pc,`${root}${t[1]} ${notes[i].name}`)}let v=vm.runInContext(`chordVoice(chordPitch(${JSON.stringify(root)},${JSON.stringify(t[2].split(' '))}))`,ctx);assert.equal(v[0]%12,vm.runInContext(`pc(${JSON.stringify(root)})`,ctx));assert(v.slice(1).every(n=>n>v[0]));count++}
assert.equal(vm.runInContext("chordPitch('E',['1','3','5','♭7','9','11']).map(n=>n.name).join(' ')",ctx),'E G♯ B D F♯ A');
assert.equal(vm.runInContext("chordPitch('F',['1','♭3','5','6']).map(n=>n.name).join(' ')",ctx),'F A♭ C D');
assert.equal(vm.runInContext("chordPitch('A',['1','♭3','5','♭7']).map(n=>n.name).join(' ')",ctx),'A C E G');
assert.equal(vm.runInContext("chordPitch('A',['1','♭3','♭5','𝄫7']).map(n=>n.name).join(' ')",ctx),'A C E♭ G♭');
assert.equal(vm.runInContext("chordPitch('F♯',['1','3','5','7']).map(n=>n.name).join(' ')",ctx),'F♯ A♯ C♯ E♯');
let modecount=0;for(const root of vm.runInContext('MODEKEYS',ctx))for(const mode of vm.runInContext('MODELABORDER',ctx)){const seq=vm.runInContext(`mlNotes(${JSON.stringify(root)},${JSON.stringify(mode)})`,ctx);assert.equal(seq.length,7);modecount++}
console.log('PASS chord formulas + spellings + bass:',count,'mode combinations:',modecount);
let circleCount=0;for(const mode of ['major','minor'])for(let k=0;k<12;k++)for(let d=0;d<7;d++){
 vm.runInContext(`mode=${JSON.stringify(mode)};ki=${k}`,ctx);
 const chord=vm.runInContext(`circleTones(${d})`,ctx);
 const raw=vm.runInContext(`notes(${d})`,ctx);
 assert.equal(chord.length,4);
 assert.deepEqual(Array.from(chord,x=>x.name),Array.from(raw),`${mode} key ${k} degree ${d}`);
 circleCount++;
}
let harmonyCount=0;
for(const k of vm.runInContext('HKEYS',ctx))for(const topic of ['secondary','tritone','backdoor','modal']){
 const result=vm.runInContext(`harmonyExample(${JSON.stringify(topic)},${JSON.stringify(k.root)},${k.mode==='minor'})`,ctx);
 for(const c of [...result.normal,...(result.alt||[])]){
  const tones=vm.runInContext(`parseChord(${JSON.stringify(c)})`,ctx);
  assert.equal(tones.length,4,`${k.root} ${k.mode} ${topic}: ${c}`);
  for(const n of tones)assert.equal(vm.runInContext(`pc(${JSON.stringify(n.name)})`,ctx),n.pc);
  harmonyCount++;
 }
 assert(result.why.length>20);
}
console.log('PASS circle chord consistency:',circleCount,'dynamic harmony chords:',harmonyCount);
// v0.9.27 review fixes
for(const r of vm.runInContext('MODEKEYS',ctx)){
 assert.deepEqual(Array.from(vm.runInContext(`relativeFamily(${JSON.stringify(r)})`,ctx),x=>x.root),Array.from(vm.runInContext(`mlNotes(${JSON.stringify(r)},'ionian')`,ctx)),`relative family ${r}`);
}
for(const mode of ['major','minor'])for(let k=0;k<12;k++)for(let d=0;d<7;d++){
 vm.runInContext(`mode=${JSON.stringify(mode)};ki=${k};degree=${d}`,ctx);
 const up=Array.from(vm.runInContext("arpSequence('up')",ctx),x=>x.midi);
 for(let i=1;i<up.length;i++)assert(up[i]>up[i-1],`arpeggio ascends ${mode} ${k} ${d}`);
 assert.deepEqual(Array.from(vm.runInContext("arpSequence('ud')",ctx),x=>x.midi),[...up,...up.slice(0,-1).reverse()]);
}
assert(!/derece/.test(vm.runInContext("compareExplanation('dorian','aeolian')",ctx)));
assert.equal(vm.runInContext("noteNameFor(['E','G♯','B'],8)",ctx),'G♯');
assert.equal(vm.runInContext("noteNameFor(['F','A♭','C'],8)",ctx),'A♭');
console.log('PASS review fixes: relative spelling, ascending arpeggios, compare text, fretboard spelling');
// v0.9.28 sound engine
const grid=[];for(let m=33;m<=96;m+=3)grid.push(m);
for(let m=36;m<=96;m++){const k=vm.runInContext(`nearestKey(${JSON.stringify(grid)},${m})`,ctx);assert(Math.abs(k-m)<=1,`nearest sample within a semitone for ${m}`)}
assert.equal(vm.runInContext('soundMode',ctx),'piano');
console.log('PASS sound engine: sample grid covers every note within one semitone; Piano is the default');
// v0.9.29 Turkish
vm.runInContext("lang='tr'",ctx);
assert.equal(vm.runInContext("T('Major')",ctx),'Majör');
assert.equal(vm.runInContext("T('{roman} degree',{roman:'V'})",ctx),'V. derece');
assert(/derece/.test(vm.runInContext("compareExplanation('dorian','aeolian')",ctx)));
const TR=vm.runInContext('I18N_TR',ctx);
for(const k of vm.runInContext('HKEYS',ctx))for(const topic of ['secondary','tritone','backdoor','modal']){
 const tr=vm.runInContext(`harmonyExample(${JSON.stringify(topic)},${JSON.stringify(k.root)},${k.mode==='minor'}).why`,ctx);
 vm.runInContext("lang='en'",ctx);const en=vm.runInContext(`harmonyExample(${JSON.stringify(topic)},${JSON.stringify(k.root)},${k.mode==='minor'}).why`,ctx);vm.runInContext("lang='tr'",ctx);
 assert.notEqual(tr,en,`Turkish why text for ${k.root} ${k.mode} ${topic}`);assert(!/\{\w+\}/.test(tr),'no unfilled placeholders');
}
for(const m of ['major','minor']){vm.runInContext(`progMode=${JSON.stringify(m)}`,ctx);for(const x of vm.runInContext('progressions()',ctx))assert(TR[x[2]],`progression text: ${x[2]}`)}
for(const k of vm.runInContext('MODELABORDER',ctx))assert(TR[vm.runInContext(`MODESLAB.${k}.d`,ctx)],`mode text ${k}`);
for(const k of Object.keys(vm.runInContext('HARMONY',ctx))){const h=vm.runInContext(`HARMONY.${k}`,ctx);assert(TR[h.title]&&TR[h.sub],`harmony text ${k}`)}
vm.runInContext("lang='en'",ctx);
assert.equal(vm.runInContext("T('Major')",ctx),'Major');
console.log('PASS Turkish: dictionary covers progressions, modes, harmony explanations; English unchanged');
