// Circle of fifths (colour wheel): home page (majors) and /keys/ explorer (majors + minors).
(function(){
 var ROM={major:{0:'I',11:'IV',1:'V'},minor:{0:'vi',11:'ii',1:'iii'}},ROMm={minor:{0:'i',11:'iv',1:'v'},major:{0:'III',11:'VI',1:'VII'}};
 document.querySelectorAll('[data-circle]').forEach(function(box){
  var data=JSON.parse(box.getAttribute('data-circle')),base=box.getAttribute('data-base')||'./',btns=box.querySelectorAll('.rk'),wedge=box.querySelector('.cof-wedge'),
      q=function(n){return box.querySelector('[data-c="'+n+'"]')},cur=null;
  function find(mode,i){for(var j=0;j<data.length;j++)if(data[j].mode===mode&&data[j].i===i)return data[j]}
  function pick(mode,i,fromUser){var k=find(mode,i);if(!k)return;cur=k;
   var rom=mode==='major'?ROM:ROMm;
   btns.forEach(function(b){var md=b.getAttribute('data-mode'),bi=+b.getAttribute('data-i'),off=(bi-i+12)%12,r=rom[md]&&rom[md][off]||'',on=md===mode&&bi===i;
    b.classList.toggle('on',on);b.classList.toggle('inw',!!r&&!on);b.setAttribute('aria-pressed',String(on));b.querySelector('.rom').textContent=r});
   if(wedge)wedge.style.transform='rotate('+(i*30)+'deg)';
   q('name').textContent=k.name;q('sig').textContent=k.sig;
   q('acc').innerHTML=k.acc.map(function(r){return '<span>'+r+'</span>'}).join('');
   var sc=q('scale');if(sc)sc.innerHTML=k.scale.map(function(n){return '<span class="pill'+(n.alt?' alt':'')+'" data-m="'+n.m+'"><b>'+n.n+'</b><small>'+n.d+'</small></span>'}).join('');
   var ch=q('chords'),links=ch&&ch.hasAttribute('data-links');
   if(ch)ch.innerHTML=k.chords.map(function(c){return links?'<a class="dchord" href="'+base+c.url+'"><small>'+c.rom+'</small><b>'+c.name+'</b></a>'
     :'<button type="button" class="dchord" data-play=\''+JSON.stringify(c.midis)+'\' data-glow="1" aria-label="Play '+c.name+'"><small>'+c.rom+'</small><b>'+c.name+'</b></button>'}).join('');
   var ln=q('link');if(ln){ln.href=base+k.url;ln.textContent='Everything about '+k.name+' →'}
   document.querySelectorAll('[data-modepick]').forEach(function(b){b.setAttribute('aria-checked',String(b.getAttribute('data-modepick')===mode))});
   if(fromUser&&history.replaceState&&box.classList.contains('explorer')&&!box.classList.contains('mini'))history.replaceState(null,'','?key='+encodeURIComponent(k.name))}
  btns.forEach(function(b){b.addEventListener('click',function(){pick(b.getAttribute('data-mode'),+b.getAttribute('data-i'),true)})});
  document.querySelectorAll('[data-modepick]').forEach(function(b){b.addEventListener('click',function(){pick(b.getAttribute('data-modepick'),cur?cur.i:0,true)})});
  var ps=box.querySelector('[data-play-scale]');if(ps){ps.setAttribute('data-arp','1');ps.addEventListener('click',function(){ps.setAttribute('data-play',JSON.stringify(cur.scale.map(function(n){return n.m})))},true)}
  var start=null;try{var p=new URLSearchParams(location.search).get('key');if(p)data.forEach(function(k){if(k.name===p)start=k})}catch(e){}
  start?pick(start.mode,start.i):pick(data[0].mode,data[0].i);
 });
})();
