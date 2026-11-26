// Builds the public website into dist/: the site at /, the app at /app (copied from web/).
// Cloudflare Pages: build command `node site/build.js`, output directory `dist`.
// All music data (spelling, keys, guitar shapes, piano inversions, chord parsing) comes from the app via core.js.
const fs=require('fs'),path=require('path');
const {loadCore}=require('./core');
const STR=require('./strings');
const LESSONS_EN=require('./lessons'),LESSONS_TR=require('./lessons_tr');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'dist'),SITE=process.env.SITE_URL||'https://harmony-music-kit.pages.dev';
const core=loadCore(),run=c=>core.run(c),J=x=>JSON.stringify(x);
const crypto=require('crypto'),V=crypto.createHash('sha1').update(fs.readdirSync(path.join(__dirname,'assets')).sort().map(f=>fs.readFileSync(path.join(__dirname,'assets',f))).join('')).digest('hex').slice(0,8);
let LANG='en',S=STR.en,LESSONS=LESSONS_EN;
const t=(k,v)=>{let s=S[k]??STR.en[k]??k;for(const [a,b] of Object.entries(v||{}))s=s.split('{'+a+'}').join(b);return s};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function write(rel,content){const f=path.join(OUT,rel);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,content)}
function copyDir(src,dst){fs.mkdirSync(dst,{recursive:true});for(const e of fs.readdirSync(src,{withFileTypes:true})){const a=path.join(src,e.name),b=path.join(dst,e.name);e.isDirectory()?copyDir(a,b):fs.copyFileSync(a,b)}}

// ---------- music data from the app ----------
const ROOTS=Array.from(run('LIBROOTS')),TYPES=Array.from(run('LIBTYPES')).map(x=>Array.from(x)),pcOf=n=>run(`pc(${J(n)})`);
const pitches=(root,formula)=>Array.from(run(`chordPitch(${J(root)},${J(formula)})`)).map(p=>({...p}));
const ROOTSLUG_EN=n=>n[0].toLowerCase()+(n.includes('♯')?'-sharp':n.includes('♭')?'-flat':'');
const ROOTSLUG_TR=n=>n[0].toLowerCase()+(n.includes('♯')?'-diyez':n.includes('♭')?'-bemol':'');
const ROOTSLUG=n=>LANG==='tr'?ROOTSLUG_TR(n):ROOTSLUG_EN(n);
const ROOTLONG=n=>n[0]+(LANG==='tr'?(n.includes('♯')?' diyez':n.includes('♭')?' bemol':''):(n.includes('♯')?' sharp':n.includes('♭')?' flat':''));
const SOLF={C:'Do',D:'Re',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'},solf=n=>SOLF[n[0]]+(n.includes('♯')?' diyez':n.includes('♭')?' bemol':'');
const TYPESLUG={'':'major','5':'power-chord','sus2':'sus2','sus4':'sus4','add9':'add9','6':'6','6/9':'6-9','maj7':'major-7','maj9':'major-9','maj7♯11':'major-7-sharp-11','maj13':'major-13','m':'minor','m(add9)':'minor-add9','m6':'minor-6','m(♭6)':'minor-flat-6','m6/9':'minor-6-9','m7':'minor-7','m7♭5':'half-diminished','m9':'minor-9','m11':'minor-11','m13':'minor-13','m(maj7)':'minor-major-7','7':'7','7sus4':'7sus4','9':'9','9sus4':'9sus4','11':'11','13':'13','13sus4':'13sus4','7♭9':'7-flat-9','7♯9':'7-sharp-9','7♯11':'7-sharp-11','dim':'diminished','dim7':'diminished-7','aug':'augmented'};
const ALSO={'':['maj'],'m':['min','-'],'m7':['min7','-7'],'maj7':['M7','Δ7'],'m7♭5':['ø7','m7b5'],'dim':['°'],'dim7':['°7'],'aug':['+'],'m(maj7)':['m/M7','mΔ7'],'7':['dom7']};
const ENH={'C♯':'D♭','E♭':'D♯','F♯':'G♭','A♭':'G♯','B♭':'A♯'};
const TYPESLUG_TR={...TYPESLUG,'5':'guc-akoru','maj7♯11':'major-7-diyez-11','m(♭6)':'minor-bemol-6','m7♭5':'yarim-eksik','7♭9':'7-bemol-9','7♯9':'7-diyez-9','7♯11':'7-diyez-11','dim':'eksik','dim7':'eksik-7','aug':'artik'};
// Paths per language: English at the root, Turkish under /tr/ with Turkish folder names (no Turkish letters in URLs).
const PATHS={en:{home:'',chords:'chords/',keys:'keys/',learn:'learn/',progressions:'progressions/',modes:'modes/',harmony:'harmony/'},tr:{home:'tr/',chords:'tr/akorlar/',keys:'tr/tonlar/',learn:'tr/dersler/',progressions:'tr/yuruyusler/',modes:'tr/modlar/',harmony:'tr/armoni/'}};
let PT=PATHS.en;
const chordUrlFor=(lang,root,suf)=>PATHS[lang].chords+(lang==='tr'?ROOTSLUG_TR(root)+'-'+TYPESLUG_TR[suf]:ROOTSLUG_EN(root)+'-'+TYPESLUG[suf])+'/';
const keyUrlFor=(lang,tonic,mode)=>PATHS[lang].keys+(lang==='tr'?ROOTSLUG_TR(tonic):ROOTSLUG_EN(tonic))+'-'+mode+'/';
const up=n=>'../'.repeat(n+(LANG==='tr'?1:0))||'./';
const display=(root,suf)=>root+(suf==='dim'?'°':suf==='dim7'?'°7':suf);
const libRoot=pc=>ROOTS.find(r=>pcOf(r)===pc);
const CHORDS=[];
for(const root of ROOTS)TYPES.forEach((ty,ti)=>CHORDS.push({root,ti,label:ty[0],suf:ty[1],formula:ty[2].split(' '),sym:root+ty[1],urls:{en:chordUrlFor('en',root,ty[1]),tr:chordUrlFor('tr',root,ty[1])},url:''}));
const findChord=(pc,suf)=>{const r=libRoot(pc);return CHORDS.find(c=>c.root===r&&c.suf===suf)};

// Keys: the app's KEYDATA (circle order) with triads and seventh chords per degree.
const KEYDATA=JSON.parse(run('JSON.stringify(KEYDATA)'));
const Q={major:{tri:['','m','m','','','m','dim'],sev:['maj7','m7','m7','maj7','7','m7','m7♭5'],rom:['I','ii','iii','IV','V','vi','vii°'],romSev:['Imaj7','ii7','iii7','IVmaj7','V7','vi7','viiø7']},
 minor:{tri:['m','dim','','m','m','',''],sev:['m7','m7♭5','maj7','m7','m7','maj7','7'],rom:['i','ii°','III','iv','v','VI','VII'],romSev:['i7','iiø7','IIImaj7','iv7','v7','VImaj7','VII7']}};
const ROLE={major:['home','pre-dominant','colour','pre-dominant','dominant','relative minor','leading tone'],minor:['home','pre-dominant','relative major','pre-dominant','dominant','colour','subtonic']};
const SHARPS=['F♯','C♯','G♯','D♯','A♯','E♯','B♯'],FLATS=['B♭','E♭','A♭','D♭','G♭','C♭','F♭'];
const KEYS=[];
for(const mode of ['major','minor'])KEYDATA[mode].forEach((k,i)=>{const tonic=k[0],scale=k[2];
 const acc=[...SHARPS.filter(x=>scale.includes(x)),...FLATS.filter(x=>scale.includes(x))];
 const chords=scale.map((n,d)=>({tri:n+Q[mode].tri[d],sev:n+Q[mode].sev[d],triDisp:display(n,Q[mode].tri[d]),pc:pcOf(n),triSuf:Q[mode].tri[d],sevSuf:Q[mode].sev[d],rom:Q[mode].rom[d],romSev:Q[mode].romSev[d],role:ROLE[mode][d]}));
 KEYS.push({mode,i,tonic,scale,acc,chords,urls:{en:keyUrlFor('en',tonic,mode),tr:keyUrlFor('tr',tonic,mode)},url:'',name:''});
});
const keyBy=(mode,pc)=>KEYS.find(k=>k.mode===mode&&pcOf(k.tonic)===pc);
const parallelMajor=k=>keyBy('major',pcOf(k.tonic));
const hueOf=root=>{const k=keyBy('major',pcOf(root));return hueAt(k.i)};
// Colour wheel hue per circle position (OKLCH hue, palette C: dark glass with a coloured rim).
const hueAt=i=>(250+i*30)%360;
const sigText=k=>k.acc.length?t(k.acc[0].includes('♯')?'{n} sharps':'{n} flats',{n:k.acc.length}).replace(/^1 (sharp|flat)s/,'1 $1'):t('No sharps or flats');

// Where each chord appears: degree in major and natural minor keys (triads and seventh chords).
function appearances(c){const pc=pcOf(c.root),out=[];
 for(const k of KEYS)k.chords.forEach((d,j)=>{if(d.pc!==pc)return;if(d.triSuf===c.suf)out.push({k,j,rom:d.rom,sev:false});if(d.sevSuf===c.suf)out.push({k,j,rom:d.romSev,sev:true})});
 const order=[0,4,3,1,5,2,6];return out.sort((a,b)=>(a.k.mode===b.k.mode?0:a.k.mode==='major'?-1:1)||order.indexOf(a.j)-order.indexOf(b.j));}

// ---------- page shell ----------
function page({title,description,canonical,body,base='./',alt=null,scripts=[]}){const lang=LANG;
 const L10N=J(Object.fromEntries(['js everything','js builder page','js next','js skip','js play','js pause','No chord found','js tr hint','js tr go','js close','The chords of {key}','tap a chord','build note','build empty','Your own','Everything about {key} — scale, chords and neighbouring keys','Colour note: {deg}','Compare {a} with:','Now playing A · {name}','Now playing B · {name}','Comparison complete','family intro','Original','Substitute','Play'].map(k=>[k,t(k)])));
 const sw=alt?`<div class="langsw" role="group" aria-label="${t('Language')}"><svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>${['en','tr'].map(l=>`<a href="${base}${alt[l]}" hreflang="${l}" lang="${l}"${l===lang?' aria-current="true"':''}>${l.toUpperCase()}</a>`).join('<span aria-hidden="true">|</span>')}</div>`:'';
 return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${canonical}">
${alt?`<link rel="alternate" hreflang="en" href="${SITE}/${alt.en}">
<link rel="alternate" hreflang="tr" href="${SITE}/${alt.tr}">
<link rel="alternate" hreflang="x-default" href="${SITE}/${alt.en}">`:''}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#101827">
<link rel="icon" href="${base}assets/favicon.svg?v=${V}" type="image/svg+xml">
<link rel="stylesheet" href="${base}assets/site.css?v=${V}">
</head>
<body data-base="${base}" data-lang="${lang}" data-l10n='${esc(L10N)}'>
<a class="skip" href="#main">${t('Skip to content')}</a>
<div class="wrap">
<header class="top">
<a class="brand" href="${base}${PT.home}"><span class="logo" aria-hidden="true">♫</span>HARMONY <span>MUSIC KIT</span></a>
<nav aria-label="Main"><a href="${base}${PT.chords}">${t('Chords')}</a><a href="${base}${PT.keys}">${t('Keys')}</a><a href="${base}${PT.progressions}">${t('Progressions')}</a><a href="${base}${PT.modes}">${t('Modes')}</a><a href="${base}${PT.harmony}">${t('Harmony')}</a><a href="${base}${PT.learn}">${t('Learn')}</a>${sw}</nav>
</header>
<main id="main">
${body}
</main>
<section id="app" class="appbox playsoon" aria-labelledby="app-title">
<div class="phone" aria-hidden="true"><span class="ph-top"></span><span class="ph-ring"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="ph-row"><i></i><i></i><i></i></span><span class="ph-bar"></span></div>
<div class="soontext"><span class="eyebrow">${t('Android app')}</span><h2 id="app-title">${t('Harmony Music Kit in your pocket')}</h2><p>${t('android blurb')}</p></div>
<div class="soonbadge" role="img" aria-label="${esc(t('Coming soon on Google Play'))}"><svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M12 7.5v7m-3-3 3 3 3-3"/><path d="M10.5 18.5h3"/></svg><span><small>${t('Coming soon')}</small><b>${t('on Google Play')}</b></span></div>
</section>
<footer class="foot"><span>${t('Made by a guitarist, for musicians.')}</span><span class="row">${alt?`<a href="${base}${alt.en}" hreflang="en" lang="en">English</a><a href="${base}${alt.tr}" hreflang="tr" lang="tr">Türkçe</a>`:''}<a href="https://github.com/Byduran/harmony-music-kit">GitHub</a></span>
<small class="credits">${t('credits')}</small></footer>
</div>
${['site.js',...scripts].map(s=>`<script src="${base}assets/${s}?v=${V}" defer></script>`).join('\n')}
</body>
</html>
`}
const crumbs=(base,items)=>`<nav class="crumbs" aria-label="${t('Breadcrumb')}">${items.map(([l,u],i)=>i===items.length-1?`<span aria-current="page">${l}</span>`:`<a href="${base}${u}">${l}</a>`).join(' › ')}</nav>`;
const pill=(a,b,pc)=>`<span class="pill"${pc!=null?` data-pc="${pc}"`:''}><b>${a}</b><small>${b}</small></span>`;
const playBtn=(label,midis,opts={})=>`<button type="button" class="btn${opts.ghost?' ghost':''}" data-play='${J(midis)}' data-inst="${opts.inst||'piano'}"${opts.arp?' data-arp="1"':''}${opts.strum?' data-strum="1"':''}>${label}</button>`;
const chip=(base,c,label)=>`<a class="chip" href="${base}${c.url}">${label||display(c.root,c.suf)}</a>`;
const searchData=()=>esc(J(CHORDS.map(c=>[c.sym,c.url])));

// ---------- chord pages ----------
const GROUPS=[['Triads & power chords',['','m','dim','aug','sus2','sus4','5']],['Sixths & added notes',['6','m6','add9','m(add9)','6/9','m6/9','m(♭6)']],['Seventh chords',['maj7','7','m7','m7♭5','dim7','m(maj7)','7sus4']],['Extended chords',['maj9','9','m9','9sus4','11','m11','maj13','13','m13','13sus4']],['Altered dominants',['7♭9','7♯9','7♯11','maj7♯11']]];

const typeChip=su=>({'':t('Major'),'m':t('Minor'),'dim':t('Dim'),'aug':t('Aug'),'5':t('5 (power)'),'sus2':'sus2','sus4':'sus4'}[su]??su);

const CAT=c=>{const f=c.formula;if(c.suf==='5')return 'power';if(f.includes('𝄫7')||c.suf==='dim')return 'dim';if(c.suf==='aug')return 'aug';if(c.suf==='m7♭5')return 'half';if(f.includes('4')||f.includes('2')&&!f.includes('3')&&!f.includes('♭3'))return 'sus';if(f.includes('♭3'))return 'minor';if(f.includes('♭7'))return 'dominant';return 'major'};
function chordPage(c){
 const base=up(2),P=pitches(c.root,c.formula),names=P.map(p=>p.name),sym=display(c.root,c.suf),label=LANG==='tr'?(TR_DICT[c.label]||c.label):c.label,long=`${ROOTLONG(c.root)} ${label.toLocaleLowerCase(LANG)}`;
 const shapeSvgs=Array.from(run(`guitarShapes(${J(c.root)},LIBTYPES[${c.ti}]).map(s=>({svg:chordDiagram(s,${J(names)},[${P[0].pc}]),info:shapeTitle(s)+' · '+shapePlace(s),midis:shapeMidis(s)}))`));
 const invs=Array.from(run(`pianoInversions(chordPitch(${J(c.root)},${J(c.formula)})).map(iv=>({svg:pianoDiagram(iv),info:inversionName(iv.k)+' · '+(iv.k===0?${J(sym)}:${J(sym)}+'/'+iv.bass),midis:iv.midis,order:iv.names.join(' – '),fing:!!iv.fingers}))`));
 const app=appearances(c),primary=app[0];
 const also=[...(ENH[c.root]?[ENH[c.root]+c.suf]:[]),...(ALSO[c.suf]||[]).map(a=>c.root+a)];
 const rel=[];const add=(pc,suf)=>{const x=findChord(pc,suf);if(x&&x!==c&&!rel.includes(x))rel.push(x)};
 const pc=P[0].pc;['','m','7','maj7','m7','sus4','add9','9','m9','6','dim7','aug'].forEach(s=>add(pc,s));
 if(c.suf.startsWith('m')&&!c.suf.startsWith('maj'))add((pc+3)%12,c.suf==='m7'?'maj7':'');else if(['','maj7','6'].includes(c.suf))add((pc+9)%12,c.suf==='maj7'?'m7':'m');
 add((pc+7)%12,'7');
 let nav='';
 if(primary){const k=primary.k,j=primary.j,d=k.chords,prevD=d[(j+6)%7],nextD=d[(j+1)%7],pick=x=>primary.sev?findChord(x.pc,x.sevSuf):findChord(x.pc,x.triSuf),lab=x=>primary.sev?x.sev:x.triDisp,rm=(x,idx)=>primary.sev?x.romSev:x.rom;
  const pv=pick(prevD),nx=pick(nextD);
  nav=`<nav class="grid3 keynav" aria-label="${esc(t('Chords in {key}',{key:k.name}))}">
<a class="card navcard" href="${base}${pv.url}"><small>← ${t('Previous in {key}',{key:k.name})} (${rm(prevD)})</small><b>${lab(prevD)}</b></a>
<a class="card navcard mid" href="${base}${k.url}"><small>${t('All chords in')}</small><b>${k.name}</b></a>
<a class="card navcard end" href="${base}${nx.url}"><small>${t('Next in {key}',{key:k.name})} (${rm(nextD)}) →</small><b>${lab(nextD)}</b></a>
</nav>`}
 const where=app.slice(0,6).map(a=>{const k=a.k,d=k.chords;let ex='';
  if(a.sev&&k.mode==='major'&&a.j===1)ex=` — ii–V–I: ${d[1].sev} → ${d[4].sev} → ${d[0].sev}`;
  else if(a.sev&&k.mode==='major'&&a.j===4)ex=` — V–I: ${d[4].sev} → ${d[0].sev}`;
  else if(!a.sev&&k.mode==='major'&&a.j===0)ex=` — I–V–vi–IV: ${d[0].triDisp} – ${d[4].triDisp} – ${d[5].triDisp} – ${d[3].triDisp}`;
  return `<li><b>${a.rom}</b> ${t('in')} <a href="${base}${k.url}">${k.name}</a>${ex}</li>`}).join('');
 const desc=t('cat '+CAT(c));
 const body=`
${crumbs(base,[[t('Home'),PT.home],[t('Chords'),PT.chords],[c.root,`${PT.chords}#root-${ROOTSLUG(c.root)}`],[sym,'']])}
<nav class="switcher card" aria-label="${t('Change chord')}">
<div class="opts roots">${ROOTS.map(r=>{const x=CHORDS.find(y=>y.root===r&&y.suf===c.suf);return `<a class="opt hue" style="--h:${hueOf(r)}" href="${base}${x.url}"${r===c.root?' aria-current="page"':''}>${r}</a>`}).join('')}</div>
<details class="typesw"><summary>${t('Chord type')}: <b>${typeChip(c.suf)}</b> <span class="muted">· ${t('change')}</span></summary>
${GROUPS.map(([g,sufs])=>`<div class="group"><small>${t(g)}</small><div class="opts">${sufs.map(su=>{const x=CHORDS.find(y=>y.root===c.root&&y.suf===su);return `<a class="opt" href="${base}${x.url}"${su===c.suf?' aria-current="page"':''}>${typeChip(su)}</a>`}).join('')}</div></div>`).join('')}
</details></nav>
<div data-light-root>
<!--frag:head--><section class="chordhead" data-frag="head">
<div class="stack">
<h1>${t('{sym} chord',{sym})}</h1>
<p class="lead">${esc(long[0].toUpperCase()+long.slice(1))} · ${t('guitar shapes and piano voicings')}</p>
<div class="pills">${P.map(p=>pill(p.name,p.formula,p.pc)).join('')}</div>
</div>
<div class="row">${playBtn('▶ '+t('Play chord'),invs[0].midis)}${playBtn('♪ '+t('Play arpeggio'),invs[0].midis,{ghost:1,arp:1})}</div>
</section><!--/frag:head-->
<!--frag:inst--><div class="grid2" data-frag="inst">
<section class="card inst" aria-labelledby="gt" data-stepper>
<div class="insthead"><h2 id="gt">${t('On guitar')}</h2><button type="button" class="btn small ghost" data-play-current data-inst="guitar" data-strum="1">▶ ${t('Strum')}</button></div>
<div class="stage">${shapeSvgs.map((x,i)=>`<div class="step" data-midis='${J(Array.from(x.midis))}' data-info="${esc(x.info)}"${i?' hidden':''}>${x.svg}</div>`).join('')}</div>
${stepper(shapeSvgs.length,shapeSvgs[0].info,'position')}
<p class="note">${t('guitar legend',{root:c.root})}</p>
</section>
<section class="card inst" aria-labelledby="pt" data-stepper>
<div class="insthead"><h2 id="pt">${t('On piano')}</h2><button type="button" class="btn small ghost" data-play-current data-inst="piano">▶ ${t('Play')}</button></div>
<div class="stage">${invs.map((x,i)=>`<div class="step" data-midis='${J(Array.from(x.midis))}' data-info="${esc(x.info)}"${i?' hidden':''}>${x.svg}<p class="note center">${t('Bottom to top: {notes}',{notes:x.order})}</p></div>`).join('')}</div>
${stepper(invs.length,invs[0].info,'inversion')}
<p class="note">${invs[0].fing?t('piano legend'):t('piano legend nofing')}</p>
</section>
</div><!--/frag:inst-->
</div>
<div class="grid2">
<section class="card text" aria-labelledby="about"><h2 id="about">${t('How {sym} is built',{sym})}</h2>
<p>${t('built sentence',{sym,label:label.toLocaleLowerCase(LANG),notes:names.join(' – '),formula:c.formula.join(' – ')})} ${desc}</p>
${also.length?`<p>${t('Also written')} ${also.map(a=>`<b>${a}</b>`).join(', ')}.</p>`:''}
</section>
<section class="card text" aria-labelledby="where"><h2 id="where">${t('Where it shows up')}</h2>
${where?`<ul>${where}</ul>`:`<p>${t('not diatonic',{sym})}</p>`}
</section>
</div>
<section class="block" aria-labelledby="rel"><h2 id="rel">${t('Related chords')}</h2><div class="chips">${rel.slice(0,10).map(x=>chip(base,x)).join('')}</div></section>
${nav}`;
 return page({title:t('chord title',{sym,long}),description:t('chord description',{sym,long,notes:names.join(', ')}),canonical:'/'+c.url,base,alt:c.urls,body,scripts:['audio.js']});
}
function stepper(n,info,kind){
 const dots=n>1?`<span class="dots">${Array.from({length:n},(_,i)=>`<i${i?'':' class="on"'}></i>`).join('')}</span>`:'';
 return `<div class="stepnav"><button type="button" class="arrow" data-move="-1" aria-label="${t('Previous '+kind)}"${n<2?' disabled':''}>‹</button><div class="stepinfo" aria-live="polite"><b>1 / ${n} · <span data-info>${esc(info)}</span></b>${dots}</div><button type="button" class="arrow" data-move="1" aria-label="${t('Next '+kind)}"${n<2?' disabled':''}>›</button></div>`;
}

// ---------- key pages ----------
function chordMidis(pc,suf){const c=findChord(pc,suf);return Array.from(run(`pianoInversions(chordPitch(${J(c.root)},${J(c.formula)}))[0].midis`))}
function keyProgs(k){
 const d=k.chords,pr=k.mode==='major'?[
  ['I – V – vi – IV · '+t('pop'),[0,4,5,3],0],['ii – V – I · '+t('jazz'),[1,4,0],1],['I – vi – ii – V · '+t('turnaround'),[0,5,1,4],0],['vi – IV – I – V',[5,3,0,4],0]]:[
  ['i – VI – III – VII',[0,5,2,6],0],['i – iv – v – i',[0,3,4,0],0],['iiø – V7 – i · '+t('jazz minor'),[1,'V7',0],1],['i – VII – VI – VII',[0,6,5,6],0]];
 const progs=pr.map(([name,degs,sev])=>({name,steps:degs.map(x=>x==='V7'?{label:d[4].tri.replace(/m$/,'')+'7',pc:d[4].pc,suf:'7',deg:4}:sev?{label:d[x].sev,pc:d[x].pc,suf:d[x].sevSuf,deg:x}:{label:d[x].triDisp,pc:d[x].pc,suf:d[x].triSuf,deg:x}).map(i=>({label:i.label,deg:i.deg,sev:!!sev,url:findChord(i.pc,i.suf).url,midis:chordMidis(i.pc,i.suf)}))}));
 return {d,progs}}
function keyPage(k){
 const base=up(2),scaleMidis=[];let prev=59;for(const n of [...k.scale,k.scale[0]]){let m=60+pcOf(n);while(m<=prev)m+=12;scaleMidis.push(m);prev=m}
 if(scaleMidis[0]>=66)for(let i=0;i<scaleMidis.length;i++)scaleMidis[i]-=12;
 const deg=k.mode==='major'?['1','2','3','4','5','6','7']:['1','2','♭3','4','5','♭6','♭7'];
 const {d,progs}=keyProgs(k);
 const player=`<div class="card player" data-player='${esc(J(progs))}' data-base="${base}">
<div class="chips" role="radiogroup" aria-label="${t('Progression')}">${progs.map((p,i)=>`<button type="button" class="opt" role="radio" aria-checked="${i===0}" data-prog="${i}">${esc(p.name)}</button>`).join('')}</div>
<div class="psteps" data-steps aria-live="off"></div>
<div class="pcontrols">
<button type="button" class="btn" data-pplay>▶ ${t('Play')}</button>
<button type="button" class="opt" data-ploop aria-pressed="true">⟳ ${t('Loop')}</button>
<button type="button" class="opt" data-pclick aria-pressed="false">${t('Click')}</button>
<label class="bpm">${t('Tempo')} <input type="range" min="50" max="180" step="5" value="100" data-pbpm aria-label="${t('Tempo in BPM')}"> <output data-pbpmv>100</output> BPM</label>
<div class="seg" role="radiogroup" aria-label="${t('Sound')}"><button type="button" role="radio" aria-checked="true" data-pinst="piano">${t('Piano')}</button><button type="button" role="radio" aria-checked="false" data-pinst="guitar">${t('Guitar')}</button></div>
</div>
<p class="note">${t('player note')}</p>
</div>`;
 const card=(x,sev,j)=>{const c=findChord(x.pc,sev?x.sevSuf:x.triSuf),label=sev?x.sev:x.triDisp;return `<div class="card kchord" data-deg="${j}"><button type="button" class="kplay" data-play='${J(chordMidis(x.pc,sev?x.sevSuf:x.triSuf))}' data-glow="1" aria-label="${esc(t('Play {name}',{name:label}))}"><small class="rom">${sev?x.romSev:x.rom}</small><small>${t(x.role)}</small><b>${label}</b></button><a class="kgo" href="${base}${c.url}" aria-label="${esc(t('{sym} chord page',{sym:label}))}">→</a></div>`};
 const ring=KEYS.filter(x=>x.mode===k.mode),upK=ring[(k.i+1)%12],down=ring[(k.i+11)%12],other=k.mode==='major'?'minor':'major';
 const relative=KEYS.find(x=>x.mode===other&&x.i===k.i),parallel=keyBy(other,pcOf(k.tonic));
 const nb=[[down,t('One fifth down')],[upK,t('One fifth up')],[relative,t(k.mode==='major'?'Relative minor · same notes':'Relative major · same notes')],[parallel,t('Parallel '+other+' · same root')]].filter(x=>x[0]);
 const body=`
${crumbs(base,[[t('Home'),PT.home],[t('Keys'),PT.keys],[k.name,'']])}
<nav class="switcher card keysw" aria-label="${t('Change key')}">
<div class="opts roots">${KEYS.filter(x=>x.mode===k.mode).map(x=>`<a class="opt hue" style="--h:${hueAt(x.i)}" href="${base}${x.url}" data-keep-section${x===k?' aria-current="page"':''}>${x.tonic}${k.mode==='minor'?'m':''}</a>`).join('')}</div>
<div class="seg"><a role="button" href="${base}${(k.mode==='major'?k:parallelMajor(k)).url}" data-keep-section aria-current="${k.mode==='major'?'page':'false'}">${t('Major')}</a><a role="button" href="${base}${(k.mode==='minor'?k:keyBy('minor',pcOf(k.tonic))).url}" data-keep-section aria-current="${k.mode==='minor'?'page':'false'}">${t('Minor')}</a></div>
</nav>
<section class="chordhead" data-light-root>
<div class="stack">
<h1>${k.name}${LANG==='tr'?` <span class="solf">(${k.solf})</span>`:''}</h1>
<p class="lead">${sigText(k)}${k.acc.length?': '+k.acc.join(' · '):''} · ${t(k.mode==='major'?'relative minor lead':'relative major lead')} <a href="${base}${relative.url}">${relative.name}</a></p>
<div class="pills">${k.scale.map((n,i)=>pill(n,deg[i],pcOf(n))).join('')}</div>
</div>
<div class="row">${playBtn('▶ '+t('Play scale'),scaleMidis,{arp:1})}</div>
</section>
<section class="block" aria-labelledby="kc" data-sec="kc">
<div class="rowsplit"><h2 id="kc">${t('The chords of {key}',{key:k.name})}</h2>
<div class="seg" role="radiogroup" aria-label="${t('Chord size')}"><button type="button" role="radio" aria-checked="false" data-size="tri">${t('Triads')}</button><button type="button" role="radio" aria-checked="true" data-size="sev">${t('7th chords')}</button></div></div>
<p class="note">${t('tap a chord')}</p>
<div class="kgrid" data-sizegroup="tri" hidden>${d.map((x,j)=>card(x,false,j)).join('')}</div>
<div class="kgrid" data-sizegroup="sev">${d.map((x,j)=>card(x,true,j)).join('')}</div>
</section>
<section class="block" aria-labelledby="kp" data-sec="kp"><h2 id="kp">${t('Common progressions in {key}',{key:k.name})}</h2>${player}</section>
<section class="block" aria-labelledby="kn" data-sec="kn"><h2 id="kn">${t('Neighbouring keys')}</h2><div class="grid4">${nb.map(([x,l])=>`<a class="card navcard" href="${base}${x.url}"><small>${l} · ${sigText(x)}</small><b>${x.name}</b></a>`).join('')}</div></section>`;
 return page({title:t('key title',{key:k.name+(LANG==='tr'?` (${k.solf})`:'')}),alt:k.urls,description:t('key description',{key:k.name,sig:sigText(k),chords:d.map(x=>x.triDisp).join(', ')}),canonical:'/'+k.url,base,body,scripts:['audio.js','player.js']});
}

// ---------- progressions page (all 24 keys on one page, presets + build your own) ----------
function progressionsPage(){const base=up(1);
 const order=m=>KEYS.filter(x=>x.mode===m).sort((a,b)=>a.i-b.i);
 const data=KEYS.map(k=>{const {d,progs}=keyProgs(k);return {id:k.mode+'-'+k.i,mode:k.mode,pc:pcOf(k.tonic),name:k.name,url:k.url,
  chords:d.map(x=>({rom:x.rom,romSev:x.romSev,role:t(x.role),tri:{label:x.triDisp,url:findChord(x.pc,x.triSuf).url,midis:chordMidis(x.pc,x.triSuf)},sev:{label:x.sev,url:findChord(x.pc,x.sevSuf).url,midis:chordMidis(x.pc,x.sevSuf)}})),
  presets:progs}});
 const rootBtns=m=>order(m).map(x=>`<button type="button" class="opt hue" style="--h:${hueAt(x.i)}" data-key="${x.mode}-${x.i}">${x.tonic}${m==='minor'?'m':''}</button>`).join('');
 const body=`
${crumbs(base,[[t('Home'),PT.home],[t('Progressions'),'']])}
<section class="stack"><h1>${t('Progressions')}</h1><p class="lead">${t('progressions lead')}</p></section>
<div class="progpage" data-progpage='${esc(J(data))}' data-base="${base}">
<nav class="switcher card keysw" aria-label="${t('Change key')}">
<div class="opts roots" data-roots="major">${rootBtns('major')}</div>
<div class="opts roots" data-roots="minor" hidden>${rootBtns('minor')}</div>
<div class="seg" role="radiogroup" aria-label="${t('Major')} / ${t('Minor')}"><button type="button" role="radio" aria-checked="true" data-mode="major">${t('Major')}</button><button type="button" role="radio" aria-checked="false" data-mode="minor">${t('Minor')}</button></div>
</nav>
<section class="block" aria-labelledby="pc-t">
<div class="rowsplit"><h2 id="pc-t" data-ktitle></h2>
<div class="seg" role="radiogroup" aria-label="${t('Chord size')}"><button type="button" role="radio" aria-checked="false" data-size="tri">${t('Triads')}</button><button type="button" role="radio" aria-checked="true" data-size="sev">${t('7th chords')}</button></div></div>
<p class="note" data-chordnote>${t('tap a chord')}</p>
<div class="kgrid" data-kgrid></div>
</section>
<section class="block" aria-labelledby="pp-t"><h2 id="pp-t">${t('Play a progression')}</h2>
<div class="card player">
<div class="chips" role="radiogroup" aria-label="${t('Progression')}" data-presets></div>
<div class="psteps" data-steps aria-live="off"></div>
<div class="row ownrow" data-ownctl hidden><button type="button" class="opt" data-undo>↶ ${t('Undo')}</button><button type="button" class="opt" data-clear>${t('Clear')}</button></div>
<div class="pcontrols">
<button type="button" class="btn" data-pplay>▶ ${t('Play')}</button>
<button type="button" class="opt" data-ploop aria-pressed="true">⟳ ${t('Loop')}</button>
<button type="button" class="opt" data-pclick aria-pressed="false">${t('Click')}</button>
<label class="bpm">${t('Tempo')} <input type="range" min="50" max="180" step="5" value="100" data-pbpm aria-label="${t('Tempo in BPM')}"> <output data-pbpmv>100</output> BPM</label>
<div class="seg" role="radiogroup" aria-label="${t('Sound')}"><button type="button" role="radio" aria-checked="true" data-pinst="piano">${t('Piano')}</button><button type="button" role="radio" aria-checked="false" data-pinst="guitar">${t('Guitar')}</button></div>
</div>
<p class="note">${t('player note')}</p>
</div></section>
<p class="applink"><a data-keylink href="${base}${KEYS[0].url}"></a></p>
</div>`;
 return page({title:t('progressions title'),description:t('progressions description'),canonical:'/'+PT.progressions,base,alt:{en:PATHS.en.progressions,tr:PATHS.tr.progressions},body,scripts:['audio.js','progressions.js']});
}

// ---------- modes page (12 roots x 7 modes; colour note; compare by ear; relative family) ----------
function modesPage(){const base=up(1),ORDER=Array.from(run('MODELABORDER')),MK=Array.from(run('MODEKEYS')),ML=JSON.parse(run('JSON.stringify(MODESLAB)'));
 const roots=MK.map(r=>{const pc=pcOf(r);let b=60+pc;if(b>=66)b-=12;
  return {root:r,pc,hue:hueOf(r),modes:Object.fromEntries(ORDER.map(k=>[k,{notes:Array.from(run(`mlNotes(${J(r)},${J(k)})`)),midis:[...ML[k].i.map(x=>b+x),b+12]}]))}});
 const modes=Object.fromEntries(ORDER.map(k=>[k,{name:ML[k].n,f:ML[k].f,c:ML[k].c,x:ML[k].x,desc:run(`T(${J(ML[k].d)})`),alias:S['mode alias '+k]?t('mode alias '+k):'',
  cmp:Object.fromEntries(ORDER.filter(o=>o!==k).map(o=>[o,run(`compareExplanation(${J(k)},${J(o)})`)]))}]));
 const data={order:ORDER,roots,modes};
 const body=`
${crumbs(base,[[t('Home'),PT.home],[t('Modes'),'']])}
<section class="stack"><h1>${t('Modes')}</h1><p class="lead">${t('modes lead')}</p></section>
<div class="modepage" data-modepage='${esc(J(data))}'>
<nav class="switcher card" aria-label="${t('Root')}">
<div class="opts roots">${roots.map((r,i)=>`<button type="button" class="opt hue" style="--h:${r.hue}" data-root="${i}">${r.root}</button>`).join('')}</div>
<div class="opts modechooser">${ORDER.map(k=>`<button type="button" class="opt" data-mode="${k}">${ML[k].n}</button>`).join('')}</div>
</nav>
<section class="block card modecard" data-light-root aria-labelledby="m-t">
<div class="rowsplit"><div class="stack"><h2 id="m-t" data-mtitle></h2><p class="muted" data-mdesc></p></div>
<button type="button" class="btn" data-mplay>▶ ${t('Play scale')}</button></div>
<div class="pills" data-mpills></div>
<p class="note" data-mcolour></p>
</section>
<section class="block" aria-labelledby="c-t"><h2 id="c-t">${t('Compare by ear')}</h2>
<p class="muted" data-cintro></p>
<div class="opts" data-cpick></div>
<div class="row"><button type="button" class="btn" data-cplay>▶ ${t('Play A then B')}</button><span class="note" data-cstatus role="status"></span></div>
<p data-cwhy></p>
</section>
<section class="block" aria-labelledby="f-t"><h2 id="f-t">${t('Same notes, different home')}</h2>
<p class="muted" data-fintro></p>
<div class="grid4 family" data-family></div>
</section>
</div>`;
 return page({title:t('modes title'),description:t('modes description'),canonical:'/'+PT.modes,base,alt:{en:PATHS.en.modes,tr:PATHS.tr.modes},body,scripts:['audio.js','modes.js']});
}

// ---------- harmony page (24 keys x 4 techniques, playable, explained) ----------
const HTOPICS=['secondary','tritone','backdoor','modal'];
function harmonyChord(name){const m=name.match(/^([A-G](?:♯|♭)?)(.*)$/),c=findChord(pcOf(m[1]),m[2]);
 const odd=/^(F♭|C♭|E♯|B♯)/.test(name);return {label:odd?c.sym:name,url:c.url,midis:chordMidis(pcOf(m[1]),m[2])}}
function harmonyPage(){const base=up(1),H=JSON.parse(run('JSON.stringify(HARMONY)'));
 const order=m=>KEYS.filter(x=>x.mode===m).sort((a,b)=>a.i-b.i);
 const keys=KEYS.map(k=>({id:k.mode+'-'+k.i,mode:k.mode,pc:pcOf(k.tonic),name:k.name,url:k.url,
  topics:Object.fromEntries(HTOPICS.map(tp=>{const ex=JSON.parse(run(`JSON.stringify(harmonyExample(${J(tp)},${J(k.tonic)},${k.mode==='minor'}))`));
   const col=harmonyChord(ex.color).label;
   return [tp,{roman:ex.roman,normal:ex.normal.map(harmonyChord),alt:ex.alt?ex.alt.map(harmonyChord):null,color:col,why:ex.why.split(ex.color).join(col)}]}))}));
 const topics=Object.fromEntries(HTOPICS.map(tp=>[tp,{title:run(`T(${J(H[tp].title)})`),sub:run(`T(${J(H[tp].sub)})`),how:t('harmony how '+tp)}]));
 const rootBtns=m=>order(m).map(x=>`<button type="button" class="opt hue" style="--h:${hueAt(x.i)}" data-key="${x.mode}-${x.i}">${x.tonic}${m==='minor'?'m':''}</button>`).join('');
 const body=`
${crumbs(base,[[t('Home'),PT.home],[t('Harmony'),'']])}
<section class="stack"><h1>${t('Harmony Explorer')}</h1><p class="lead">${t('harmony lead')}</p></section>
<div class="harmpage" data-harmpage='${esc(J({keys,topics,order:HTOPICS}))}' data-base="${base}">
<nav class="switcher card keysw" aria-label="${t('Change key')}">
<div class="opts roots" data-roots="major">${rootBtns('major')}</div>
<div class="opts roots" data-roots="minor" hidden>${rootBtns('minor')}</div>
<div class="seg" role="radiogroup" aria-label="${t('Major')} / ${t('Minor')}"><button type="button" role="radio" aria-checked="true" data-mode="major">${t('Major')}</button><button type="button" role="radio" aria-checked="false" data-mode="minor">${t('Minor')}</button></div>
</nav>
<div class="seg tabs" role="tablist" aria-label="${t('Harmony')}">${HTOPICS.map(tp=>`<button type="button" role="tab" data-topic="${tp}">${topics[tp].title}</button>`).join('')}</div>
<section class="block card harmcard" aria-labelledby="h-t">
<h2 id="h-t" data-htitle></h2><p class="muted" data-hsub></p>
<div data-hrows></div>
<p class="why" data-hwhy></p>
</section>
<section class="block text" aria-labelledby="hw-t"><h2 id="hw-t">${t('How it works')}</h2><p data-hhow></p></section>
<p class="applink"><a data-keylink href="${base}${KEYS[0].url}"></a></p>
</div>`;
 return page({title:t('harmony title'),description:t('harmony description'),canonical:'/'+PT.harmony,base,alt:{en:PATHS.en.harmony,tr:PATHS.tr.harmony},body,scripts:['audio.js','harmony.js']});
}

// ---------- index pages ----------
const frag=(html,name)=>{const m=html.match(new RegExp('<!--frag:'+name+'-->([\\s\\S]*?)<!--/frag:'+name+'-->'));return m?m[1]:''};
function chordsIndex(){const base=up(1),def=CHORDS.find(c=>c.root==='C'&&c.suf==='');
 const html=chordPage(def),data=esc(J(CHORDS.map(c=>[c.root,c.suf,c.url,display(c.root,c.suf)])));
 const body=`${crumbs(base,[[t('Home'),PT.home],[t('Chords'),'']])}
<section class="stack"><h1>${t('Chord builder')}</h1><p class="lead">${t('builder lead')}</p></section>
<div class="grid2 pickers" data-builder='${data}'>
<section class="card picker" aria-labelledby="rt"><h2 id="rt" class="label">${t('Root')}</h2>
<div class="opts roots" role="radiogroup" aria-labelledby="rt">${ROOTS.map(r=>`<button type="button" class="opt hue" style="--h:${hueOf(r)}" role="radio" aria-checked="${r==='C'}" data-root="${r}">${r}</button>`).join('')}</div></section>
<section class="card picker" aria-labelledby="ty"><h2 id="ty" class="label">${t('Chord type')}</h2>
<div class="tabs" role="tablist" aria-labelledby="ty">${GROUPS.map(([g],i)=>`<button type="button" role="tab" class="tab" aria-selected="${i===0}" aria-controls="grp-${i}" id="tab-${i}">${t(g+' short')}</button>`).join('')}</div>
${GROUPS.map(([g,sufs],i)=>`<div class="opts types" role="radiogroup" id="grp-${i}" aria-labelledby="tab-${i}"${i?' hidden':''}>${sufs.map(su=>`<button type="button" class="opt" role="radio" aria-checked="${su===''}" data-type="${esc(su)}">${typeChip(su)}</button>`).join('')}</div>`).join('')}
</section></div>
<div id="builder-out" data-light-root aria-live="polite">${frag(html,'head')}${frag(html,'inst')}</div>
<p class="applink"><a id="b-page" href="${base}${def.url}">${t('Everything about {sym}',{sym:'C'})} →</a></p>
<details class="card all"><summary>${t('All 420 chords, A–Z')}</summary>
${ROOTS.map(r=>`<section class="rootsec" id="root-${ROOTSLUG(r)}" aria-labelledby="h-${ROOTSLUG(r)}"><h2 id="h-${ROOTSLUG(r)}">${t('{root} chords',{root:r})}</h2>
${GROUPS.map(([g,sufs])=>`<div class="group"><small>${t(g)}</small><div class="chips">${sufs.map(su=>chip(base,CHORDS.find(c=>c.root===r&&c.suf===su))).join('')}</div></div>`).join('')}</section>`).join('')}
</details>`;
 return page({title:t('chords index title'),description:t('chords index description'),canonical:'/'+PT.chords,base,alt:{en:PATHS.en.chords,tr:PATHS.tr.chords},body,scripts:['audio.js','builder.js']});
}
// Circle of fifths (colour wheel) shared by the home page and /keys/.
function circleData(modes){return KEYS.filter(k=>modes.includes(k.mode)).map(k=>{const half=k.acc.length>3?Math.ceil(k.acc.length/2):3;
 const deg=k.mode==='major'?['1','2','3','4','5','6','7','8']:['1','2','♭3','4','5','♭6','♭7','8'];let prev=59;const notes=[...k.scale,k.scale[0]].map((n,i)=>{let m=60+pcOf(n);while(m<=prev)m+=12;prev=m;return {n,d:deg[i],m,alt:/[♯♭]/.test(n)}});
 if(notes[0].m>=66)notes.forEach(x=>x.m-=12);
 return {mode:k.mode,i:k.i,name:k.name,url:k.url,acc:k.acc.length?[k.acc.slice(0,half).join(' '),k.acc.slice(half).join(' ')].filter(Boolean):[],sig:sigText(k),scale:notes,
  chords:k.chords.map(x=>{const c=findChord(x.pc,x.triSuf);return {rom:x.rom,name:x.triDisp,url:c.url,midis:chordMidis(x.pc,x.triSuf)}})}})}
function circleMarkup(modes,size){const keys=KEYS.filter(k=>modes.includes(k.mode)),k0=keys[0],two=modes.length>1;
 const btn=k=>{const outer=k.mode==='major',r=two?(outer?42:27):43,a=(k.i*30-90)*Math.PI/180,h=hueAt(k.i);
  return `<button type="button" class="rk ${k.mode}" style="--h:${h};left:${(50+r*Math.cos(a)).toFixed(2)}%;top:${(50+r*Math.sin(a)).toFixed(2)}%" data-mode="${k.mode}" data-i="${k.i}" aria-pressed="false" aria-label="${k.name}"><span>${k.tonic}${k.mode==='minor'?'m':''}</span><small class="rom"></small></button>`};
 return `<div class="cof ${two?'two':'one'}" style="--size:${size}px" role="group" aria-label="${t('Circle of fifths')}">
<div class="cof-disc" aria-hidden="true"><div class="cof-wedge"></div></div><div class="cof-hole" aria-hidden="true"></div>
${keys.map(btn).join('')}
<div class="cof-center" aria-live="polite"><b data-c="name">${k0.name}</b><span class="acc" data-c="acc"></span><small data-c="sig">${sigText(k0)}</small></div>
</div>`}
function keysIndex(){const base=up(1),cmaj=KEYS.find(k=>k.mode==='major'&&k.i===0);
 const body=`${crumbs(base,[[t('Home'),PT.home],[t('Keys'),'']])}
<section class="rowsplit"><div class="stack"><h1>${t('Circle of fifths')}</h1><p class="lead">${t('explorer lead')}</p></div>
<div class="seg" role="radiogroup" aria-label="${t('Major or minor')}"><button type="button" role="radio" aria-checked="true" data-modepick="major">${t('Major')}</button><button type="button" role="radio" aria-checked="false" data-modepick="minor">${t('Minor')}</button></div></section>
<div class="explorer" data-circle='${esc(J(circleData(['major','minor'])))}' data-base="${base}" data-light-root>
<div class="ex-circle">${circleMarkup(['major','minor'],380)}</div>
<div class="ex-side">
<section class="card text" aria-labelledby="sc"><div class="insthead"><h2 id="sc">${t('Scale')}</h2><button type="button" class="btn small" data-play-scale>▶ ${t('Play scale')}</button></div>
<div class="scale" data-c="scale"></div><p class="note">${t('scale note')}</p></section>
<section class="card text" aria-labelledby="ch"><h2 id="ch">${t('The seven chords — tap to hear')}</h2><div class="diatonic" data-c="chords"></div><p class="note">${t('wedge note')}</p></section>
<a class="more" data-c="link" href="${base}${cmaj.url}">${t('Everything about {key}',{key:cmaj.name})} →</a>
</div></div>
<details class="card all"><summary>${t('All 24 keys')}</summary>
<h2 class="label">${t('Major keys')}</h2><div class="chips">${KEYS.filter(k=>k.mode==='major').map(k=>`<a class="chip" href="${base}${k.url}">${k.name}</a>`).join('')}</div>
<h2 class="label">${t('Minor keys')}</h2><div class="chips">${KEYS.filter(k=>k.mode==='minor').map(k=>`<a class="chip" href="${base}${k.url}">${k.name}</a>`).join('')}</div>
</details>`;
 return page({title:t('keys index title'),description:t('keys index description'),canonical:'/'+PT.keys,base,alt:{en:PATHS.en.keys,tr:PATHS.tr.keys},body,scripts:['audio.js','circle.js']});
}


// ---------- lessons (HMK-25) ----------
function keyboardMarkup(){const WH=[0,2,4,5,7,9,11],whites=[],blacks=[];for(let m=60;m<84;m++)(WH.includes(m%12)?whites:blacks).push(m);
 return `<div class="kb" role="img" aria-label="${t('Piano keyboard')}"><div class="kb-w">${whites.map(m=>`<div class="kw" data-m="${m}"><span></span></div>`).join('')}</div>${blacks.map(m=>{const j=whites.indexOf(m-1)+1;return `<div class="kbk" data-m="${m}" style="left:calc(100% / 14 * ${j} - 100% / 14 * .31)"><span></span></div>`}).join('')}</div>`}
function lessonPage(L){const base=up(2),N=L.steps.length,usesCircle=L.steps.some(x=>x.circle||(x.quiz&&x.quiz.then&&x.quiz.then.circle));
 const visual=L.steps.map(x=>({circle:x.circle||null,kb:x.kb||null,row:x.row||null,play:x.play||null,quiz:x.quiz?{on:x.quiz.on,answer:x.quiz.answer,ok:x.quiz.ok,hint:x.quiz.hint,then:x.quiz.then||null}:null,chips:x.chips||null}));
 const body=`${crumbs(base,[[t('Home'),PT.home],[t('Learn'),PT.learn],[L.title,'']])}
<article class="lessonpage" data-lesson='${esc(J({steps:visual,next:L.next}))}' data-base="${base}">
<header class="stack"><span class="eyebrow">${t('Lesson {n}',{n:L.n})} · ${t('about {m} minutes',{m:L.minutes})}</span><h1>${L.title}</h1>
<div class="lbar" role="progressbar" aria-label="${t('Lesson progress')}" aria-valuemin="1" aria-valuemax="${N}" aria-valuenow="1"><i style="width:${100/N}%"></i></div></header>
<div class="lwrap">
<section class="card ltext" aria-live="polite">
${L.steps.map((x,i)=>`<div class="lstep" data-i="${i}"${i?' hidden':''}><span class="stepno">${t('Step {i} / {n}',{i:i+1,n:N})}</span><h2>${x.t}</h2><p>${x.x}</p>${x.play&&x.play.label?`<button type="button" class="btn lplay">▶ ${x.play.label}</button>`:''}${x.chips?`<div class="chips">${x.chips.map(c=>`<span class="pill alt"><b>${c}</b></span>`).join('')}</div>`:''}<p class="lmsg" hidden></p></div>`).join('')}
<div class="lnav"><button type="button" class="btn ghost" data-lback>‹ ${t('Back')}</button><button type="button" class="btn" data-lnext>${t('Next')} ›</button><a class="btn" data-ldone href="${base}${L.next.url}" hidden>${L.next.label} →</a></div>
</section>
<section class="card lpic" aria-label="${t('Interactive picture')}" data-light-root>
${usesCircle?`<div class="lcircle">${circleMarkup(['major','minor'],340)}</div>`:''}
<div class="diatonic lrow" data-lrow hidden></div>
${keyboardMarkup()}
</section>
</div>
</article>
<section class="block"><h2>${t('More lessons')}</h2><div class="grid3">${LESSONS.filter(x=>x!==L).map(x=>`<a class="card lesson" href="${base}${x.url}"><span class="eyebrow">${t('Lesson {n}',{n:x.n})}</span><h3>${x.title}</h3><p>${x.description.split(':')[0]}.</p><span class="go">${t('Start lesson')} →</span></a>`).join('')}</div></section>`;
 return page({title:`${L.title} – ${t('interactive lesson')} | Harmony Music Kit`,description:L.description,canonical:'/'+L.url,base,alt:L.urls,body,scripts:['audio.js','lesson.js']});
}
function learnIndex(){const base=up(1);
 const body=`${crumbs(base,[[t('Home'),PT.home],[t('Learn'),'']])}<section class="stack"><h1>${t('Learn by doing')}</h1><p class="lead">${t('learn index lead')}</p></section>
<div class="grid3" style="margin-top:18px">${LESSONS.map(x=>`<a class="card lesson" href="${base}${x.url}"><span class="eyebrow">${t('Lesson {n}',{n:x.n})} · ${t('about {m} minutes',{m:x.minutes})}</span><h3>${x.title}</h3><p>${x.description.split(':')[0]}.</p><span class="go">${t('Start lesson')} →</span></a>`).join('')}</div>`;
 return page({title:t('learn index title'),description:t('learn index description'),canonical:'/'+PT.learn,base,alt:{en:PATHS.en.learn,tr:PATHS.tr.learn},body});
}

// ---------- home ----------
function home(){
 const base=up(0),cmaj=KEYS.find(k=>k.mode==='major'&&k.i===0);
 const popular=[['C',''],['G',''],['A','m'],['F',''],['D','m7'],['G','7'],['C','maj7'],['E','7'],['B','m7♭5'],['C♯','m7']].map(([r,s])=>CHORDS.find(c=>c.root===r&&c.suf===s));
 const feats=[['Circle of Fifths','feat circle',PT.keys],['Chord Library','feat chords',PT.chords],['Progressions','feat progressions',PT.progressions],['Modes','feat modes',PT.modes],['Harmony Explorer','feat harmony',PT.harmony]];
 const body=`
<section class="hero" aria-labelledby="hero-title">
<div class="hero-text">
<span class="eyebrow">${t('Free interactive music theory')}</span>
<h1 id="hero-title">${t('See harmony.')}<br>${t('Hear it. Play it.')}</h1>
<p class="lead">${t('hero lead')}</p>
<form id="lookup" class="search" role="search" data-search='${searchData()}'><label class="sr" for="q">${t('Chord name')}</label><input id="q" type="search" autocomplete="off" placeholder="${t('Try C#m7, Fmaj7 or Bb7')}"><button class="btn" type="submit">${t('Find chord')}</button><p class="note searchmsg" role="status"></p></form>
<div class="chips">${popular.slice(0,8).map(c=>chip(base,c)).join('')}<a class="chip quiet" href="${base}${PT.chords}">${t('All chords')} →</a></div>
<span class="muted small">${t('Free, no sign-up. Listen to every chord right on the page.')} <a href="${base}${PT.keys}">${t('Browse keys')} →</a></span>
</div>
<div class="card circle-card explorer mini" data-circle='${esc(J(circleData(['major','minor'])))}' data-base="${base}">
<span class="muted small">${t('Tap a key — its chords appear below')}</span>
${circleMarkup(['major','minor'],340)}
<div class="diatonic" data-c="chords" data-links="1"></div>
<a class="more" data-c="link" href="${base}${cmaj.url}">${t('Everything about {key}',{key:cmaj.name})} →</a>
</div>
</section>
<section id="learn" class="block" aria-labelledby="learn-t">
<h2 id="learn-t">${t('Learn by doing')}</h2>
<p class="muted">${t('learn lead')}</p>
<div class="grid3">
${LESSONS.map(x=>`<a class="card lesson" href="${base}${x.url}"><span class="eyebrow">${t('Lesson {n}',{n:x.n})} · ${t('about {m} minutes',{m:x.minutes})}</span><h3>${t('lesson'+x.n+' title')}</h3><p>${t('lesson'+x.n+' text')}</p><span class="go">${t('Start lesson')} →</span></a>`).join('')}
</div>
</section>
<section class="block" aria-labelledby="feat-t">
<h2 id="feat-t">${t('What you can explore')}</h2>
<div class="grid5">${feats.map(([h,d,u])=>`<a class="card feat" href="${base}${u}"><b>${t(h)}</b><span>${t(d)}</span><small>${t('Explore')} →</small></a>`).join('')}</div>
</section>`;
 return page({title:t('home title'),description:t('home description'),canonical:'/'+PT.home,base,alt:{en:PATHS.en.home,tr:PATHS.tr.home},body,scripts:['audio.js','circle.js']});
}

// ---------- write ----------
const TR_DICT=JSON.parse(run('JSON.stringify(I18N_TR)'));
function lessonsFor(lang){return LESSONS_EN.map((L,li)=>{const tr=LESSONS_TR[li],urls={en:PATHS.en.learn+L.slug+'/',tr:PATHS.tr.learn+tr.slug+'/'};
 const nextUrl=L.next.url.replace(/^keys\//,PATHS[lang].keys);
 if(lang==='en')return {...L,urls,url:urls.en,next:{...L.next,url:nextUrl}};
 return {...L,urls,url:urls.tr,slug:tr.slug,title:tr.title,description:tr.description,next:{label:tr.next,url:nextUrl},
  steps:L.steps.map((st,si)=>{const x=tr.steps[si];return {...st,t:x.t,x:x.x,play:st.play?{...st.play,label:st.play.label?x.play:undefined}:st.play,
   row:st.row&&x.row?st.row.map((r,ri)=>({...r,t:x.row[ri]})):st.row,quiz:st.quiz?{...st.quiz,ok:x.ok,hint:x.hint}:st.quiz}})}})}
function setLang(lang){LANG=lang;S=STR[lang];PT=PATHS[lang];run(`lang=${J(lang)}`);LESSONS=lessonsFor(lang);
 for(const c of CHORDS)c.url=c.urls[lang];
 for(const k of KEYS){k.url=k.urls[lang];k.name=lang==='tr'?`${k.tonic} ${k.mode==='major'?'majör':'minör'}`:`${k.tonic} ${k.mode}`;k.solf=`${solf(k.tonic)} ${k.mode==='major'?'majör':'minör'}`}}
fs.rmSync(OUT,{recursive:true,force:true});
const urls=[];
for(const lang of ['en','tr']){setLang(lang);
 write(PT.home+'index.html',home());
 write(PT.chords+'index.html',chordsIndex());
 write(PT.keys+'index.html',keysIndex());
 write(PT.learn+'index.html',learnIndex());
 write(PT.progressions+'index.html',progressionsPage());
 write(PT.modes+'index.html',modesPage());
 write(PT.harmony+'index.html',harmonyPage());
 for(const L of LESSONS)write(L.url+'index.html',lessonPage(L));
 for(const c of CHORDS)write(c.url+'index.html',chordPage(c));
 for(const k of KEYS)write(k.url+'index.html',keyPage(k));
 urls.push(PT.home,PT.chords,PT.keys,PT.progressions,PT.modes,PT.harmony,PT.learn,...LESSONS.map(L=>L.url),...KEYS.map(k=>k.url),...CHORDS.map(c=>c.url));
}
setLang('en');
copyDir(path.join(__dirname,'assets'),path.join(OUT,'assets'));
copyDir(path.join(ROOT,'web'),path.join(OUT,'app'));
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${SITE}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
write('_headers',`/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/app/sounds/*\n  Cache-Control: public, max-age=604800\n`);
write('404.html',page({title:t('Page not found')+' — Harmony Music Kit',description:t('This page does not exist.'),canonical:'/404',base:'/',body:`<section class="block"><h1>${t('Page not found')}</h1><p class="muted">${t('404 text')}</p></section>`}));
console.log(`Built ${CHORDS.length} chord pages, ${KEYS.length} key pages and ${LESSONS.length} lessons in 2 languages, ${urls.length} URLs → ${OUT}`);
module.exports={CHORDS,KEYS,appearances};
