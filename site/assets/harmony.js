// Harmony Explorer page: pick any of the 24 keys and a technique (secondary dominant, tritone sub, backdoor, modal interchange); hear and see it.
(function(){
 var root=document.querySelector('[data-harmpage]');if(!root)return;
 var D=JSON.parse(root.getAttribute('data-harmpage')),base=root.getAttribute('data-base')||'./',T=function(k,v){var s=window.HMK.t(k);if(v)for(var n in v)s=s.split('{'+n+'}').join(v[n]);return s};
 var $=function(q){return root.querySelector(q)},$$=function(q){return root.querySelectorAll(q)};
 var key=null,topic='secondary',timer=null;
 function byId(id){for(var i=0;i<D.keys.length;i++)if(D.keys[i].id===id)return D.keys[i]}
 function row(chords,roman,color,label,ri){
  return '<div class="hrow">'+(label?'<span class="eyebrow">'+label+'</span>':'')+'<div class="hchords">'+chords.map(function(c,i){
   return '<a class="hchord'+(c.label===color?' colour':'')+'" href="'+base+c.url+'" data-r="'+ri+'" data-i="'+i+'"><small>'+roman[i]+'</small><b>'+c.label+'</b></a>'}).join('<span class="parrow" aria-hidden="true">→</span>')+
  '</div><button type="button" class="btn" data-hplay="'+ri+'">▶ '+T('Play')+'</button></div>'}
 function render(){var x=key.topics[topic],tp=D.topics[topic];
  $$('[data-key]').forEach(function(b){b.setAttribute('aria-current',String(b.getAttribute('data-key')===key.id))});
  $$('[data-mode]').forEach(function(b){b.setAttribute('aria-checked',String(b.getAttribute('data-mode')===key.mode))});
  $$('[data-roots]').forEach(function(r){r.hidden=r.getAttribute('data-roots')!==key.mode});
  $$('[data-topic]').forEach(function(b){b.setAttribute('aria-selected',String(b.getAttribute('data-topic')===topic))});
  $('[data-htitle]').textContent=tp.title+' · '+key.name;$('[data-hsub]').textContent=tp.sub;
  var roman=x.roman,romanAlt=x.alt?roman.map(function(r,i){return x.alt[i].label===x.color?'subV':r}):null;
  $('[data-hrows]').innerHTML=x.alt?row(x.normal,roman,null,T('Original'),0)+row(x.alt,romanAlt,x.color,T('Substitute'),1):row(x.normal,roman,x.color,'',0);
  $('[data-hwhy]').textContent=x.why;$('[data-hhow]').textContent=tp.how;
  var kl=$('[data-keylink]');kl.href=base+key.url;kl.textContent=T('Everything about {key} — scale, chords and neighbouring keys',{key:key.name})+' →';
  try{history.replaceState(null,'','#'+topic+'-'+key.mode+'-'+key.pc)}catch(e){}}
 function playRow(ri){clearTimeout(timer);var x=key.topics[topic],list=ri===1?x.alt:x.normal,i=0,els=$$('.hchord[data-r="'+ri+'"]');
  (function next(){els.forEach(function(e){e.classList.remove('lit')});if(i>=list.length)return;els[i].classList.add('lit');
   window.HMKAudio.play(list[i].midis,{len:1.1});i++;timer=setTimeout(next,1200)})()}
 root.addEventListener('click',function(e){var b;
  if((b=e.target.closest('[data-key]'))){key=byId(b.getAttribute('data-key'));render();return}
  if((b=e.target.closest('[data-mode]'))){var m=b.getAttribute('data-mode');if(m===key.mode)return;for(var i=0;i<D.keys.length;i++)if(D.keys[i].mode===m&&D.keys[i].pc===key.pc){key=D.keys[i];break}render();return}
  if((b=e.target.closest('[data-topic]'))){topic=b.getAttribute('data-topic');render();return}
  if((b=e.target.closest('[data-hplay]'))){playRow(+b.getAttribute('data-hplay'));return}
 });
 var h=(location.hash||'').match(/^#(secondary|tritone|backdoor|modal)-(major|minor)-(\d+)$/);
 if(h){topic=h[1];for(var j=0;j<D.keys.length;j++)if(D.keys[j].mode===h[2]&&D.keys[j].pc===+h[3])key=D.keys[j]}
 if(!key)for(var k=0;k<D.keys.length;k++)if(D.keys[k].mode==='major'&&D.keys[k].pc===0)key=D.keys[k];
 render();
})();
