// Checks that every internal link and asset in dist/ points to a file that exists.
const fs=require('fs'),path=require('path'),OUT=path.join(__dirname,'..','dist');let bad=[],n=0;
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(f.endsWith('.html')&&!f.includes(path.sep+'app'+path.sep)&&!f.endsWith('404.html')){
 const html=fs.readFileSync(f,'utf8');for(const m of html.matchAll(/(?:href|src)="([^"]*)"/g)){const u=m[1].split(/[?#]/)[0];if(!u||u.startsWith('/')||/^[a-z]+:/.test(m[1]))continue;n++;
  let target=path.resolve(path.dirname(f),u.replace(/&amp;/g,'&'));if(u.endsWith('/'))target=path.join(target,'index.html');if(!fs.existsSync(target))bad.push(path.relative(OUT,f)+' → '+u)}
 for(const m of html.matchAll(/data-search='([^']+)'/g))for(const [,u] of JSON.parse(m[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&'))){n++;if(!fs.existsSync(path.join(OUT,u,'index.html')))bad.push('search → '+u)}
 for(const m of html.matchAll(/data-circle='([^']+)'/g)){const d=JSON.parse(m[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&'));for(const k of d)for(const u of [k.url,...k.chords.map(c=>c.url)]){n++;if(!fs.existsSync(path.join(OUT,u,'index.html')))bad.push('circle → '+u)}}}}})(OUT);
if(bad.length){console.error('BROKEN LINKS ('+bad.length+'):\n'+[...new Set(bad)].slice(0,30).join('\n'));process.exit(1)}
console.log('PASS site links:',n,'checked');
