// Modes page: pick a root and a mode, hear the scale with its colour note marked, compare two modes by ear, jump within the relative family.
(function(){
 var root=document.querySelector('[data-modepage]');if(!root)return;
 var D=JSON.parse(root.getAttribute('data-modepage')),T=function(k,v){var s=window.HMK.t(k);if(v)for(var n in v)s=s.split('{'+n+'}').join(v[n]);return s};
 var $=function(q){return root.querySelector(q)},$$=function(q){return root.querySelectorAll(q)};
 var ri=0,mode='dorian',other=null,timer=null;
 function R(){return D.roots[ri]}
 function nameOf(i,k){return D.roots[i].root+' '+D.modes[k].name}
 function render(){var r=R(),m=D.modes[mode],sc=r.modes[mode];other=other&&other!==mode?other:m.x;
  $$('[data-root]').forEach(function(b){b.setAttribute('aria-current',String(+b.getAttribute('data-root')===ri))});
  $$('[data-mode]').forEach(function(b){b.setAttribute('aria-current',String(b.getAttribute('data-mode')===mode))});
  $('[data-mtitle]').textContent=nameOf(ri,mode)+(m.alias?' · '+m.alias:'');
  $('[data-mdesc]').textContent=m.desc;
  $('[data-mpills]').innerHTML=sc.notes.map(function(n,i){return '<span class="pill'+(m.f[i]===m.c?' colour':'')+'" data-m="'+sc.midis[i]+'"><b>'+n+'</b><small>'+m.f[i]+'</small></span>'}).join('');
  $('[data-mcolour]').textContent=T('Colour note: {deg}',{deg:m.c+' ('+sc.notes[m.f.indexOf(m.c)]+')'});
  $('[data-cintro]').textContent=T('Compare {a} with:',{a:'A = '+nameOf(ri,mode)});
  $('[data-cpick]').innerHTML=D.order.filter(function(k){return k!==mode}).map(function(k){return '<button type="button" class="opt" data-other="'+k+'" aria-current="'+(k===other)+'">B = '+D.modes[k].name+'</button>'}).join('');
  $('[data-cwhy]').textContent=m.cmp[other];$('[data-cstatus]').textContent='';
  // relative family: the seven modes built on the notes of this root's major scale
  var ion=r.modes.ionian.notes;$('[data-fintro]').textContent=T('family intro',{key:r.root});
  $('[data-family]').innerHTML=D.order.map(function(k,i){var j=idxOfNote(ion[i]);return '<button type="button" class="card navcard" data-fam="'+j+'|'+k+'"'+(j===ri&&k===mode?' aria-current="true"':'')+'><small>'+(i+1)+' · '+D.modes[k].name+'</small><b>'+ion[i]+' '+D.modes[k].name+'</b></button>'}).join('')}
 var PCS={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
 function pcOf(n){var p=PCS[n[0]];if(n.indexOf('♯')>0)p++;if(n.indexOf('♭')>0)p--;return (p+12)%12}
 function idxOfNote(n){var p=pcOf(n);for(var i=0;i<D.roots.length;i++)if(D.roots[i].pc===p)return i;return 0}
 function play(midis,scope){return window.HMKAudio.play(midis,{arp:1,scope:scope})}
 root.addEventListener('click',function(e){var b;
  if((b=e.target.closest('[data-root]'))){ri=+b.getAttribute('data-root');render();return}
  if((b=e.target.closest('[data-mode]'))){mode=b.getAttribute('data-mode');other=null;render();return}
  if((b=e.target.closest('[data-other]'))){other=b.getAttribute('data-other');render();return}
  if((b=e.target.closest('[data-fam]'))){var v=b.getAttribute('data-fam').split('|');ri=+v[0];mode=v[1];other=null;render();$('.modecard').scrollIntoView({behavior:'smooth',block:'start'});return}
  if(e.target.closest('[data-mplay]')){clearTimeout(timer);play(R().modes[mode].midis,$('.modecard'));return}
  if(e.target.closest('[data-cplay]')){clearTimeout(timer);var r=R(),a=r.modes[mode].midis,bb=r.modes[other].midis,st=$('[data-cstatus]'),wait=(a.length*.33+.9)*1000;
   st.textContent=T('Now playing A · {name}',{name:nameOf(ri,mode)});play(a,$('.modecard'));
   timer=setTimeout(function(){st.textContent=T('Now playing B · {name}',{name:nameOf(ri,other)});play(bb,null);timer=setTimeout(function(){st.textContent=T('Comparison complete')},wait)},wait);return}
 });
 render();
})();
