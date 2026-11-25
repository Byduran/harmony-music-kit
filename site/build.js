// Builds the public website into dist/: the site at /, the app at /app (copied from web/).
// Cloudflare Pages: build command `node site/build.js`, output directory `dist`.
// All music data (spelling, keys, guitar shapes, piano inversions, chord parsing) comes from the app via core.js.
const fs=require('fs'),path=require('path');
const {loadCore}=require('./core');
const STR=require('./strings');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'dist'),SITE=process.env.SITE_URL||'https://harmony-music-kit.pages.dev';
const core=loadCore(),run=c=>core.run(c),J=x=>JSON.stringify(x);
const crypto=require('crypto'),V=crypto.createHash('sha1').update(fs.readdirSync(path.join(__dirname,'assets')).sort().map(f=>fs.readFileSync(path.join(__dirname,'assets',f))).join('')).digest('hex').slice(0,8);
const S=STR.en,t=(k,v)=>{let s=S[k]??k;for(const [a,b] of Object.entries(v||{}))s=s.split('{'+a+'}').join(b);return s};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function write(rel,content){const f=path.join(OUT,rel);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,content)}
function copyDir(src,dst){fs.mkdirSync(dst,{recursive:true});for(const e of fs.readdirSync(src,{withFileTypes:true})){const a=path.join(src,e.name),b=path.join(dst,e.name);e.isDirectory()?copyDir(a,b):fs.copyFileSync(a,b)}}

// ---------- music data from the app ----------
const ROOTS=Array.from(run('LIBROOTS')),TYPES=Array.from(run('LIBTYPES')).map(x=>Array.from(x)),pcOf=n=>run(`pc(${J(n)})`);
const pitches=(root,formula)=>Array.from(run(`chordPitch(${J(root)},${J(formula)})`)).map(p=>({...p}));
const ROOTSLUG=n=>n[0].toLowerCase()+(n.includes('♯')?'-sharp':n.includes('♭')?'-flat':'');
const ROOTLONG=n=>n[0]+(n.includes('♯')?' sharp':n.includes('♭')?' flat':'');
const TYPESLUG={'':'major','5':'power-chord','sus2':'sus2','sus4':'sus4','add9':'add9','6':'6','6/9':'6-9','maj7':'major-7','maj9':'major-9','maj7♯11':'major-7-sharp-11','maj13':'major-13','m':'minor','m(add9)':'minor-add9','m6':'minor-6','m(♭6)':'minor-flat-6','m6/9':'minor-6-9','m7':'minor-7','m7♭5':'half-diminished','m9':'minor-9','m11':'minor-11','m13':'minor-13','m(maj7)':'minor-major-7','7':'7','7sus4':'7sus4','9':'9','9sus4':'9sus4','11':'11','13':'13','13sus4':'13sus4','7♭9':'7-flat-9','7♯9':'7-sharp-9','7♯11':'7-sharp-11','dim':'diminished','dim7':'diminished-7','aug':'augmented'};
const ALSO={'':['maj'],'m':['min','-'],'m7':['min7','-7'],'maj7':['M7','Δ7'],'m7♭5':['ø7','m7b5'],'dim':['°'],'dim7':['°7'],'aug':['+'],'m(maj7)':['m/M7','mΔ7'],'7':['dom7']};
const ENH={'C♯':'D♭','E♭':'D♯','F♯':'G♭','A♭':'G♯','B♭':'A♯'};
const chordUrl=(root,suf)=>`chords/${ROOTSLUG(root)}-${TYPESLUG[suf]}/`;
const display=(root,suf)=>root+(suf==='dim'?'°':suf==='dim7'?'°7':suf);
const libRoot=pc=>ROOTS.find(r=>pcOf(r)===pc);
const CHORDS=[];
for(const root of ROOTS)TYPES.forEach((ty,ti)=>CHORDS.push({root,ti,label:ty[0],suf:ty[1],formula:ty[2].split(' '),sym:root+ty[1],url:chordUrl(root,ty[1])}));
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
 KEYS.push({mode,i,tonic,scale,acc,chords,name:`${tonic} ${mode}`,slug:`${ROOTSLUG(tonic)}-${mode}`,url:`keys/${ROOTSLUG(tonic)}-${mode}/`});
});
const keyBy=(mode,pc)=>KEYS.find(k=>k.mode===mode&&pcOf(k.tonic)===pc);
const sigText=k=>k.acc.length?t(k.acc[0].includes('♯')?'{n} sharps':'{n} flats',{n:k.acc.length}).replace(/^1 (sharp|flat)s/,'1 $1'):t('No sharps or flats');

// Where each chord appears: degree in major and natural minor keys (triads and seventh chords).
function appearances(c){const pc=pcOf(c.root),out=[];
 for(const k of KEYS)k.chords.forEach((d,j)=>{if(d.pc!==pc)return;if(d.triSuf===c.suf)out.push({k,j,rom:d.rom,sev:false});if(d.sevSuf===c.suf)out.push({k,j,rom:d.romSev,sev:true})});
 const order=[0,4,3,1,5,2,6];return out.sort((a,b)=>(a.k.mode===b.k.mode?0:a.k.mode==='major'?-1:1)||order.indexOf(a.j)-order.indexOf(b.j));}

// ---------- page shell ----------
function page({title,description,canonical,body,base='./',lang='en',scripts=[]}){return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#101827">
<link rel="icon" href="${base}assets/favicon.svg?v=${V}" type="image/svg+xml">
<link rel="stylesheet" href="${base}assets/site.css?v=${V}">
</head>
<body data-base="${base}">
<a class="skip" href="#main">${t('Skip to content')}</a>
<div class="wrap">
<header class="top">
<a class="brand" href="${base}"><span class="logo" aria-hidden="true">♫</span>HARMONY <span>MUSIC KIT</span></a>
<nav aria-label="Main"><a href="${base}chords/">${t('Chords')}</a><a href="${base}keys/">${t('Keys')}</a><a href="${base}#learn">${t('Learn')}</a><a class="quiet" href="#app">${t('App')}</a></nav>
</header>
<main id="main">
${body}
</main>
<section id="app" class="appbox" aria-labelledby="app-title">
<div><h2 id="app-title">${t('Practise with the app')}</h2><p>${t('app blurb')}</p></div>
<div class="row"><a class="btn ghost" href="${base}app/">${t('Open in browser')}</a></div>
</section>
<footer class="foot"><span>${t('Made by a guitarist, for musicians.')}</span><span class="row"><a href="https://github.com/Byduran/harmony-music-kit">GitHub</a></span>
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
const CAT=c=>{const f=c.formula;if(c.suf==='5')return 'power';if(f.includes('𝄫7')||c.suf==='dim')return 'dim';if(c.suf==='aug')return 'aug';if(c.suf==='m7♭5')return 'half';if(f.includes('4')||f.includes('2')&&!f.includes('3')&&!f.includes('♭3'))return 'sus';if(f.includes('♭3'))return 'minor';if(f.includes('♭7'))return 'dominant';return 'major'};
function chordPage(c){
 const base='../../',P=pitches(c.root,c.formula),names=P.map(p=>p.name),sym=display(c.root,c.suf),long=`${ROOTLONG(c.root)} ${c.label.toLowerCase()}`;
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
${crumbs(base,[[t('Home'),''],[t('Chords'),'chords/'],[c.root,`chords/#root-${ROOTSLUG(c.root)}`],[sym,'']])}
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
<p>${t('built sentence',{sym,label:c.label.toLowerCase(),notes:names.join(' – '),formula:c.formula.join(' – ')})} ${desc}</p>
${also.length?`<p>${t('Also written')} ${also.map(a=>`<b>${a}</b>`).join(', ')}.</p>`:''}
</section>
<section class="card text" aria-labelledby="where"><h2 id="where">${t('Where it shows up')}</h2>
${where?`<ul>${where}</ul>`:`<p>${t('not diatonic',{sym})}</p>`}
</section>
</div>
<section class="block" aria-labelledby="rel"><h2 id="rel">${t('Related chords')}</h2><div class="chips">${rel.slice(0,10).map(x=>chip(base,x)).join('')}</div></section>
${nav}
<p class="applink"><a href="${base}app/?page=chords&amp;chord=${encodeURIComponent(c.sym)}">${t('Open {sym} in the app',{sym})} →</a></p>`;
 return page({title:t('chord title',{sym,long}),description:t('chord description',{sym,long,notes:names.join(', ')}),canonical:'/'+c.url,base,body,scripts:['audio.js']});
}
function stepper(n,info,kind){
 const dots=n>1?`<span class="dots">${Array.from({length:n},(_,i)=>`<i${i?'':' class="on"'}></i>`).join('')}</span>`:'';
 return `<div class="stepnav"><button type="button" class="arrow" data-move="-1" aria-label="${t('Previous '+kind)}"${n<2?' disabled':''}>‹</button><div class="stepinfo" aria-live="polite"><b>1 / ${n} · <span data-info>${esc(info)}</span></b>${dots}</div><button type="button" class="arrow" data-move="1" aria-label="${t('Next '+kind)}"${n<2?' disabled':''}>›</button></div>`;
}

// ---------- key pages ----------
function chordMidis(pc,suf){const c=findChord(pc,suf);return Array.from(run(`pianoInversions(chordPitch(${J(c.root)},${J(c.formula)}))[0].midis`))}
function keyPage(k){
 const base='../../',scaleMidis=[];let prev=59;for(const n of [...k.scale,k.scale[0]]){let m=60+pcOf(n);while(m<=prev)m+=12;scaleMidis.push(m);prev=m}
 if(scaleMidis[0]>=66)for(let i=0;i<scaleMidis.length;i++)scaleMidis[i]-=12;
 const deg=k.mode==='major'?['1','2','3','4','5','6','7']:['1','2','♭3','4','5','♭6','♭7'];
 const d=k.chords,pr=k.mode==='major'?[
  ['I – V – vi – IV · pop',[0,4,5,3],0],['ii – V – I · jazz',[1,4,0],1],['I – vi – ii – V · turnaround',[0,5,1,4],0],['vi – IV – I – V',[5,3,0,4],0]]:[
  ['i – VI – III – VII',[0,5,2,6],0],['i – iv – v – i',[0,3,4,0],0],['iiø – V7 – i · jazz minor',[1,'V7',0],1],['i – VII – VI – VII',[0,6,5,6],0]];
 const progs=pr.map(([name,degs,sev])=>{const items=degs.map(x=>x==='V7'?{label:d[4].tri.replace(/m$/,'')+'7',pc:d[4].pc,suf:'7'}:sev?{label:d[x].sev,pc:d[x].pc,suf:d[x].sevSuf}:{label:d[x].triDisp,pc:d[x].pc,suf:d[x].triSuf});
  return `<div class="card prog"><div><small>${name}</small><b>${items.map(i=>`<a href="${base}${findChord(i.pc,i.suf).url}">${i.label}</a>`).join(' – ')}</b></div><button type="button" class="round" aria-label="${esc(t('Play {name}',{name}))}" data-seq='${J(items.map(i=>chordMidis(i.pc,i.suf)))}'>▶</button></div>`}).join('');
 const card=(x,sev)=>{const c=findChord(x.pc,sev?x.sevSuf:x.triSuf),label=sev?x.sev:x.triDisp;return `<div class="card kchord"><small>${sev?x.romSev:x.rom} · ${t(x.role)}</small><a href="${base}${c.url}">${label}</a><button type="button" class="btn small ghost" data-play='${J(chordMidis(x.pc,sev?x.sevSuf:x.triSuf))}' aria-label="${esc(t('Play {name}',{name:label}))}">▶ ${t('Listen')}</button></div>`};
 const ring=KEYS.filter(x=>x.mode===k.mode),up=ring[(k.i+1)%12],down=ring[(k.i+11)%12],other=k.mode==='major'?'minor':'major';
 const relative=KEYS.find(x=>x.mode===other&&x.i===k.i),parallel=keyBy(other,pcOf(k.tonic));
 const nb=[[down,t('One fifth down')],[up,t('One fifth up')],[relative,t(k.mode==='major'?'Relative minor · same notes':'Relative major · same notes')],[parallel,t('Parallel '+other+' · same root')]].filter(x=>x[0]);
 const body=`
${crumbs(base,[[t('Home'),''],[t('Keys'),'keys/'],[k.name,'']])}
<section class="chordhead" data-light-root>
<div class="stack">
<h1>${k.name}</h1>
<p class="lead">${sigText(k)}${k.acc.length?': '+k.acc.join(' · '):''} · ${t(k.mode==='major'?'relative minor':'relative major')} <a href="${base}${relative.url}">${relative.name}</a></p>
<div class="pills">${k.scale.map((n,i)=>pill(n,deg[i],pcOf(n))).join('')}</div>
</div>
<div class="row">${playBtn('▶ '+t('Play scale'),scaleMidis,{arp:1})}</div>
</section>
<section class="block" aria-labelledby="kc">
<div class="rowsplit"><h2 id="kc">${t('The chords of {key}',{key:k.name})}</h2>
<div class="seg" role="radiogroup" aria-label="${t('Chord size')}"><button type="button" role="radio" aria-checked="false" data-size="tri">${t('Triads')}</button><button type="button" role="radio" aria-checked="true" data-size="sev">${t('7th chords')}</button></div></div>
<div class="kgrid" data-sizegroup="tri" hidden>${d.map(x=>card(x,false)).join('')}</div>
<div class="kgrid" data-sizegroup="sev">${d.map(x=>card(x,true)).join('')}</div>
</section>
<section class="block" aria-labelledby="kp"><h2 id="kp">${t('Common progressions in {key}',{key:k.name})}</h2><div class="grid2 progs">${progs}</div></section>
<section class="block" aria-labelledby="kn"><h2 id="kn">${t('Neighbouring keys')}</h2><div class="grid4">${nb.map(([x,l])=>`<a class="card navcard" href="${base}${x.url}"><small>${l} · ${sigText(x)}</small><b>${x.name}</b></a>`).join('')}</div></section>
<p class="applink"><a href="${base}app/?key=${encodeURIComponent(k.tonic)}&amp;mode=${k.mode}">${t('Open {key} on the circle in the app',{key:k.name})} →</a></p>`;
 return page({title:t('key title',{key:k.name}),description:t('key description',{key:k.name,sig:sigText(k),chords:d.map(x=>x.triDisp).join(', ')}),canonical:'/'+k.url,base,body,scripts:['audio.js']});
}

// ---------- index pages ----------
const GROUPS=[['Triads & power chords',['','m','dim','aug','sus2','sus4','5']],['Sixths & added notes',['6','m6','add9','m(add9)','6/9','m6/9','m(♭6)']],['Seventh chords',['maj7','7','m7','m7♭5','dim7','m(maj7)','7sus4']],['Extended chords',['maj9','9','m9','9sus4','11','m11','maj13','13','m13','13sus4']],['Altered dominants',['7♭9','7♯9','7♯11','maj7♯11']]];
const typeChip=su=>({'':t('Major'),'m':t('Minor'),'dim':t('Dim'),'aug':t('Aug'),'5':t('5 (power)'),'sus2':'sus2','sus4':'sus4'}[su]??su);
const frag=(html,name)=>{const m=html.match(new RegExp('<!--frag:'+name+'-->([\\s\\S]*?)<!--/frag:'+name+'-->'));return m?m[1]:''};
function chordsIndex(){const base='../',def=CHORDS.find(c=>c.root==='C'&&c.suf==='');
 const html=chordPage(def),data=esc(J(CHORDS.map(c=>[c.root,c.suf,c.url.replace(/^chords\//,''),display(c.root,c.suf)])));
 const body=`${crumbs(base,[[t('Home'),''],[t('Chords'),'']])}
<section class="stack"><h1>${t('Chord builder')}</h1><p class="lead">${t('builder lead')}</p></section>
<div class="grid2 pickers" data-builder='${data}'>
<section class="card picker" aria-labelledby="rt"><h2 id="rt" class="label">${t('Root')}</h2>
<div class="opts roots" role="radiogroup" aria-labelledby="rt">${ROOTS.map(r=>`<button type="button" class="opt" role="radio" aria-checked="${r==='C'}" data-root="${r}">${r}</button>`).join('')}</div></section>
<section class="card picker" aria-labelledby="ty"><h2 id="ty" class="label">${t('Chord type')}</h2>
<div class="tabs" role="tablist" aria-labelledby="ty">${GROUPS.map(([g],i)=>`<button type="button" role="tab" class="tab" aria-selected="${i===0}" aria-controls="grp-${i}" id="tab-${i}">${t(g+' short')}</button>`).join('')}</div>
${GROUPS.map(([g,sufs],i)=>`<div class="opts types" role="radiogroup" id="grp-${i}" aria-labelledby="tab-${i}"${i?' hidden':''}>${sufs.map(su=>`<button type="button" class="opt" role="radio" aria-checked="${su===''}" data-type="${esc(su)}">${typeChip(su)}</button>`).join('')}</div>`).join('')}
</section></div>
<div id="builder-out" data-light-root aria-live="polite">${frag(html,'head')}${frag(html,'inst')}</div>
<p class="applink"><a id="b-page" href="${def.url.replace(/^chords\//,'')}">${t('Everything about {sym}',{sym:'C'})} →</a> <span class="muted">·</span> <a id="b-app" class="quietlink" href="${base}app/?page=chords&amp;chord=C">${t('Open in the app')}</a></p>
<details class="card all"><summary>${t('All 420 chords, A–Z')}</summary>
${ROOTS.map(r=>`<section class="rootsec" id="root-${ROOTSLUG(r)}" aria-labelledby="h-${ROOTSLUG(r)}"><h2 id="h-${ROOTSLUG(r)}">${t('{root} chords',{root:r})}</h2>
${GROUPS.map(([g,sufs])=>`<div class="group"><small>${t(g)}</small><div class="chips">${sufs.map(su=>chip(base,CHORDS.find(c=>c.root===r&&c.suf===su))).join('')}</div></div>`).join('')}</section>`).join('')}
</details>`;
 return page({title:t('chords index title'),description:t('chords index description'),canonical:'/chords/',base,body,scripts:['audio.js','builder.js']});
}
// Circle of fifths (colour wheel) shared by the home page and /keys/.
function circleData(modes){return KEYS.filter(k=>modes.includes(k.mode)).map(k=>{const half=k.acc.length>3?Math.ceil(k.acc.length/2):3;
 const deg=k.mode==='major'?['1','2','3','4','5','6','7','8']:['1','2','♭3','4','5','♭6','♭7','8'];let prev=59;const notes=[...k.scale,k.scale[0]].map((n,i)=>{let m=60+pcOf(n);while(m<=prev)m+=12;prev=m;return {n,d:deg[i],m,alt:/[♯♭]/.test(n)}});
 if(notes[0].m>=66)notes.forEach(x=>x.m-=12);
 return {mode:k.mode,i:k.i,name:k.name,url:k.url,acc:k.acc.length?[k.acc.slice(0,half).join(' '),k.acc.slice(half).join(' ')].filter(Boolean):[],sig:sigText(k),scale:notes,
  chords:k.chords.map(x=>{const c=findChord(x.pc,x.triSuf);return {rom:x.rom,name:x.triDisp,url:c.url,midis:chordMidis(x.pc,x.triSuf)}})}})}
function circleMarkup(modes,size){const keys=KEYS.filter(k=>modes.includes(k.mode)),k0=keys[0],two=modes.length>1;
 const btn=k=>{const outer=k.mode==='major',r=two?(outer?42:27):43,a=(k.i*30-90)*Math.PI/180,h=(210+k.i*30)%360;
  return `<button type="button" class="rk ${k.mode}" style="--h:${h};left:${(50+r*Math.cos(a)).toFixed(2)}%;top:${(50+r*Math.sin(a)).toFixed(2)}%" data-mode="${k.mode}" data-i="${k.i}" aria-pressed="false" aria-label="${k.name}"><span>${k.tonic}${k.mode==='minor'?'m':''}</span><small class="rom"></small></button>`};
 return `<div class="cof ${two?'two':'one'}" style="--size:${size}px" role="group" aria-label="${t('Circle of fifths')}">
<div class="cof-disc" aria-hidden="true"><div class="cof-wedge"></div></div><div class="cof-hole" aria-hidden="true"></div>
${keys.map(btn).join('')}
<div class="cof-center" aria-live="polite"><b data-c="name">${k0.name}</b><span class="acc" data-c="acc"></span><small data-c="sig">${sigText(k0)}</small></div>
</div>`}
function keysIndex(){const base='../';
 const body=`${crumbs(base,[[t('Home'),''],[t('Keys'),'']])}
<section class="rowsplit"><div class="stack"><h1>${t('Circle of fifths')}</h1><p class="lead">${t('explorer lead')}</p></div>
<div class="seg" role="radiogroup" aria-label="${t('Major or minor')}"><button type="button" role="radio" aria-checked="true" data-modepick="major">${t('Major')}</button><button type="button" role="radio" aria-checked="false" data-modepick="minor">${t('Minor')}</button></div></section>
<div class="explorer" data-circle='${esc(J(circleData(['major','minor'])))}' data-base="${base}" data-light-root>
<div class="ex-circle">${circleMarkup(['major','minor'],380)}</div>
<div class="ex-side">
<section class="card text" aria-labelledby="sc"><div class="insthead"><h2 id="sc">${t('Scale')}</h2><button type="button" class="btn small" data-play-scale>▶ ${t('Play scale')}</button></div>
<div class="scale" data-c="scale"></div><p class="note">${t('scale note')}</p></section>
<section class="card text" aria-labelledby="ch"><h2 id="ch">${t('The seven chords — tap to hear')}</h2><div class="diatonic" data-c="chords"></div><p class="note">${t('wedge note')}</p></section>
<a class="more" data-c="link" href="${base}keys/c-major/">${t('Everything about {key}',{key:'C major'})} →</a>
</div></div>
<details class="card all"><summary>${t('All 24 keys')}</summary>
<h2 class="label">${t('Major keys')}</h2><div class="chips">${KEYS.filter(k=>k.mode==='major').map(k=>`<a class="chip" href="${base}${k.url}">${k.name}</a>`).join('')}</div>
<h2 class="label">${t('Minor keys')}</h2><div class="chips">${KEYS.filter(k=>k.mode==='minor').map(k=>`<a class="chip" href="${base}${k.url}">${k.name}</a>`).join('')}</div>
</details>`;
 return page({title:t('keys index title'),description:t('keys index description'),canonical:'/keys/',base,body,scripts:['audio.js','circle.js']});
}

// ---------- home ----------
function home(){
 const base='./';
 const popular=[['C',''],['G',''],['A','m'],['F',''],['D','m7'],['G','7'],['C','maj7'],['E','7'],['B','m7♭5'],['C♯','m7']].map(([r,s])=>CHORDS.find(c=>c.root===r&&c.suf===s));
 const feats=[['Circle of Fifths','feat circle','keys/'],['Chord Library','feat chords','chords/'],['Progressions','feat progressions','app/?page=progressions'],['Modes','feat modes','app/?page=modes'],['Harmony Explorer','feat harmony','app/?page=harmony']];
 const body=`
<section class="hero" aria-labelledby="hero-title">
<div class="hero-text">
<span class="eyebrow">${t('Free interactive music theory')}</span>
<h1 id="hero-title">${t('See harmony.')}<br>${t('Hear it. Play it.')}</h1>
<p class="lead">${t('hero lead')}</p>
<div class="row"><a class="btn" href="#lookup">${t('Find a chord')}</a><a class="btn ghost" href="keys/">${t('Browse keys')}</a></div>
<span class="muted small">${t('Free, no sign-up. Listen to every chord right on the page.')}</span>
</div>
<div class="card circle-card explorer mini" data-circle='${esc(J(circleData(['major','minor'])))}' data-base="${base}">
<span class="muted small">${t('Tap a key — its chords appear below')}</span>
${circleMarkup(['major','minor'],340)}
<div class="diatonic" data-c="chords" data-links="1"></div>
<a class="more" data-c="link" href="keys/c-major/">${t('Everything about {key}',{key:'C major'})} →</a>
</div>
</section>
<section id="lookup" class="block" aria-labelledby="lookup-t">
<h2 id="lookup-t">${t('Look up any chord')}</h2>
<p class="muted">${t('lookup lead')}</p>
<form class="search" role="search" data-search='${searchData()}'><label class="sr" for="q">${t('Chord name')}</label><input id="q" type="search" autocomplete="off" placeholder="${t('Try C#m7, Fmaj7 or Bb7')}"><button class="btn" type="submit">${t('Find chord')}</button><p class="note searchmsg" role="status"></p></form>
<div class="chips">${popular.map(c=>chip(base,c)).join('')}<a class="chip quiet" href="chords/">${t('All chords')} →</a></div>
</section>
<section id="learn" class="block" aria-labelledby="learn-t">
<h2 id="learn-t">${t('Learn by doing')}</h2>
<p class="muted">${t('learn lead')}</p>
<div class="grid3">
${[[1,'keys/'],[2,'keys/c-major/#kc'],[3,'keys/c-major/#kp']].map(([n,u])=>`<a class="card lesson" href="${u}"><span class="eyebrow">${t('Lesson {n}',{n})}</span><h3>${t('lesson'+n+' title')}</h3><p>${t('lesson'+n+' text')}</p><span class="go">${t('lesson'+n+' go')} →</span><small class="soon">${t('Step-by-step lesson coming soon')}</small></a>`).join('')}
</div>
</section>
<section class="block" aria-labelledby="feat-t">
<h2 id="feat-t">${t('What you can explore')}</h2>
<div class="grid5">${feats.map(([h,d,u])=>`<a class="card feat" href="${u}"><b>${t(h)}</b><span>${t(d)}</span><small>${u.startsWith('app/')?t('In the app'):t('On this site')} →</small></a>`).join('')}</div>
</section>`;
 return page({title:t('home title'),description:t('home description'),canonical:'/',base,body,scripts:['audio.js','circle.js']});
}

// ---------- write ----------
fs.rmSync(OUT,{recursive:true,force:true});
write('index.html',home());
write('chords/index.html',chordsIndex());
write('keys/index.html',keysIndex());
for(const c of CHORDS)write(c.url+'index.html',chordPage(c));
for(const k of KEYS)write(k.url+'index.html',keyPage(k));
copyDir(path.join(__dirname,'assets'),path.join(OUT,'assets'));
copyDir(path.join(ROOT,'web'),path.join(OUT,'app'));
const urls=['','chords/','keys/',...KEYS.map(k=>k.url),...CHORDS.map(c=>c.url),'app/'];
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${SITE}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
write('_headers',`/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/app/sounds/*\n  Cache-Control: public, max-age=604800\n`);
write('404.html',page({title:t('Page not found')+' — Harmony Music Kit',description:t('This page does not exist.'),canonical:'/404',base:'/',body:`<section class="block"><h1>${t('Page not found')}</h1><p class="muted">${t('404 text')}</p></section>`}));
console.log(`Built ${CHORDS.length} chord pages, ${KEYS.length} key pages, ${urls.length} URLs → ${OUT}`);
module.exports={CHORDS,KEYS,appearances};
