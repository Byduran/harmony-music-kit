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
