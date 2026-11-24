// Builds the public website into dist/: the site at /, the app at /app (copied from web/).
// Cloudflare Pages: build command `node site/build.js`, output directory `dist`.
const fs=require('fs'),path=require('path');
const {loadCore}=require('./core');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'dist'),SITE=process.env.SITE_URL||'https://harmonymusickit.pages.dev';
const core=loadCore();
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function write(rel,content){const f=path.join(OUT,rel);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,content)}
function copyDir(src,dst){fs.mkdirSync(dst,{recursive:true});for(const e of fs.readdirSync(src,{withFileTypes:true})){const a=path.join(src,e.name),b=path.join(dst,e.name);e.isDirectory()?copyDir(a,b):fs.copyFileSync(a,b)}}

// Circle of fifths data from the app's own spelling.
const KEYS=['C','G','D','A','E','B','F♯','D♭','A♭','E♭','B♭','F'];
const SIG=['No sharps or flats','1 sharp','2 sharps','3 sharps','4 sharps','5 sharps','6 sharps','5 flats','4 flats','3 flats','2 flats','1 flat'];
const QUAL=['','m','m','','','m','°'],ROMAN=['I','ii','iii','IV','V','vi','vii°'];
const circle=KEYS.map((k,i)=>({key:k,sig:SIG[i],chords:Array.from(core.run(`chordPitch(${JSON.stringify(k)},['1','2','3','4','5','6','7'])`),(n,j)=>({name:n.name+QUAL[j],roman:ROMAN[j]}))}));

// base: relative path to the site root ('./' on the home page, '../../' two folders down); the 404 page uses '/'.
function page({title,description,canonical,body,base='./'}){return `<!doctype html>
<html lang="en">
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
<link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${base}assets/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="wrap">
<header class="top">
<a class="brand" href="${base}"><span class="logo" aria-hidden="true">♫</span>HARMONY <span>MUSIC KIT</span></a>
<nav aria-label="Main"><a href="${base}app/">Chords</a><a href="${base}app/">Keys</a><a href="${base}#learn">Learn</a><a class="quiet" href="#app">App</a></nav>
</header>
<main id="main">
${body}
</main>
<section id="app" class="appbox" aria-labelledby="app-title">
<div><h2 id="app-title">Practise with the app</h2><p>The free Harmony Music Kit app adds a practice player with loop and tempo, mode comparison by ear and the harmony explorer. In the browser or on Android.</p></div>
<div class="row"><a class="btn ghost" href="${base}app/">Open in browser</a></div>
</section>
<footer class="foot"><span>Made by a guitarist, for musicians.</span><span class="row"><a href="https://github.com/Byduran/harmony-music-kit">GitHub</a><a href="${base}app/">Sound credits</a></span></footer>
</div>
<script src="${base}assets/site.js" defer></script>
</body>
</html>
`}

const popular=['C','G','Am','F','Dm7','G7','Cmaj7','E7','Bm7♭5','C♯m7'];
const home=page({title:'Harmony Music Kit — chords, keys and music theory you can hear',
 description:'Free interactive music theory for guitarists and pianists: guitar shapes and piano voicings for 420 chords, every key with its chords, and short lessons — with real piano and guitar sound.',
 canonical:'/',body:`
<section class="hero" aria-labelledby="hero-title">
<div class="hero-text">
<span class="eyebrow">Free interactive music theory</span>
<h1 id="hero-title">See harmony.<br>Hear it. Play it.</h1>
<p class="lead">Guitar shapes and piano voicings for 420 chords, every key with its chords, and short interactive lessons — all with real piano and guitar sound. Made for guitarists and pianists who want to understand what they play.</p>
<div class="row"><a class="btn" href="#lookup">Find a chord</a><a class="btn ghost" href="app/">Browse keys</a></div>
<span class="muted small">Free, no sign-up. Listen to every chord right on the page.</span>
</div>
<div class="card circle-card">
<span class="muted small" id="circle-help">Tap a key — its chords appear below</span>
<div class="circle" role="group" aria-label="Circle of fifths" aria-describedby="circle-help" data-circle='${esc(JSON.stringify(circle))}'>
<div class="circle-center"><b id="ck">C major</b><span id="cs">No sharps or flats</span></div>
${KEYS.map((k,i)=>{const a=(i*30-90)*Math.PI/180;return `<button type="button" class="ckey${i===0?' on':''}" data-i="${i}" aria-pressed="${i===0}" aria-label="${k} major" style="left:calc(50% + ${(43*Math.cos(a)).toFixed(2)}% - 23px);top:calc(50% + ${(43*Math.sin(a)).toFixed(2)}% - 23px)">${k}</button>`}).join('')}
</div>
<div class="diatonic" id="cd">${circle[0].chords.map(c=>`<span class="dchord"><small>${c.roman}</small><b>${c.name}</b></span>`).join('')}</div>
</div>
</section>
<section id="lookup" class="block" aria-labelledby="lookup-t">
<h2 id="lookup-t">Look up any chord</h2>
<p class="muted">Guitar shapes in every position, piano inversions, and how it sounds. 420 chords, 12 roots.</p>
<form class="search" role="search" action="app/"><label class="sr" for="q">Chord name</label><input id="q" name="q" type="search" placeholder="Try C#m7, Fmaj7 or Bb7"><button class="btn" type="submit">Find chord</button></form>
<div class="chips">${popular.map(p=>`<a class="chip" href="app/">${p}</a>`).join('')}</div>
</section>
<section id="learn" class="block" aria-labelledby="learn-t">
<h2 id="learn-t">Learn by doing</h2>
<p class="muted">Short lessons where you tap, listen and see each idea.</p>
<div class="grid3">
<article class="card lesson"><span class="eyebrow">Lesson 1 · coming soon</span><h3>The circle of fifths</h3><p>Why keys sit in this order, how sharps and flats add up, and how to find any key's chords at a glance.</p></article>
<article class="card lesson"><span class="eyebrow">Lesson 2 · coming soon</span><h3>Diatonic chords</h3><p>Build the seven chords of a key from its scale, hear their roles, and read roman numerals.</p></article>
<article class="card lesson"><span class="eyebrow">Lesson 3 · coming soon</span><h3>The ii–V–I</h3><p>The most common progression in jazz: hear the pull to home, follow the voice leading, play it in every key.</p></article>
</div>
</section>
<section class="block" aria-labelledby="feat-t">
<h2 id="feat-t">What you can explore</h2>
<div class="grid5">
<div class="card feat"><b>Circle of Fifths</b><span>Majors and relative minors, each key's chords as a wedge, sharps and flats in view.</span></div>
<div class="card feat"><b>Chord Library</b><span>420 chords with guitar shapes, finger numbers and piano inversions.</span></div>
<div class="card feat"><b>Progressions</b><span>Common progressions with a practice player, loop and tempo control.</span></div>
<div class="card feat"><b>Modes</b><span>Hear each mode on the same root and compare two by ear.</span></div>
<div class="card feat"><b>Harmony Explorer</b><span>Secondary dominants, tritone subs, backdoor and modal interchange, explained.</span></div>
</div>
</section>`});

fs.rmSync(OUT,{recursive:true,force:true});
write('index.html',home);
copyDir(path.join(__dirname,'assets'),path.join(OUT,'assets'));
copyDir(path.join(ROOT,'web'),path.join(OUT,'app'));
const urls=['/','/app/'];
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
write('_headers',`/assets/*\n  Cache-Control: public, max-age=86400\n/app/sounds/*\n  Cache-Control: public, max-age=604800\n`);
write('404.html',page({title:'Page not found — Harmony Music Kit',description:'This page does not exist.',canonical:'/404',base:'/',body:`<section class="block"><h1>Page not found</h1><p class="muted">Try the <a href="/">home page</a> or <a href="/app/">open the app</a>.</p></section>`}));
console.log('Built',fs.readdirSync(OUT).join(', '),'→',OUT);
