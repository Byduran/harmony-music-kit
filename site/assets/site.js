// Harmony Music Kit website: circle, chord search, position/inversion steppers, triad/7th toggle.
(function(){
 var base=document.body.getAttribute('data-base')||'./';
 // Chord search: same spelling rules as the app (C#m7, Dbm7, Bb7, Cmin7, A-7, Bm7b5...).
 var PCS={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
 function key(text){var m=String(text||'').trim().replace(/\s+/g,'').match(/^([A-Ga-g])(♯|#|♭|b)?(.*)$/);if(!m)return null;
  var pc=(PCS[m[1].toUpperCase()]+(m[2]==='#'||m[2]==='♯'?1:m[2]?11:0))%12,suf=m[3].replace(/#/g,'♯').replace(/b(?=\d)/g,'♭').replace(/^(maj|major|M)$/,'').replace(/^(min|minor|-)(?=$|\d|\(|maj|6|7|9|11|13)/,'m').replace(/^(Δ|M7|Δ7)$/,'maj7').replace(/^ø7?$/,'m7♭5').replace(/^°7$/,'dim7').replace(/^°$/,'dim').replace(/^\+$/,'aug');
  return pc+'|'+suf}
 document.querySelectorAll('form[data-search]').forEach(function(f){
  var map={};JSON.parse(f.getAttribute('data-search')).forEach(function(x){map[key(x[0])]=x[1]});
  f.addEventListener('submit',function(e){e.preventDefault();var v=f.querySelector('input').value,u=map[key(v)],msg=f.querySelector('.searchmsg');
   if(u)location.href=base+u;else if(msg)msg.textContent=v.trim()?'No chord found — try a name like C#m7, Fmaj7 or Bb7.':''})});
 // Steppers: guitar positions and piano inversions (arrows, dots, swipe). Also used by the chord builder.
 function initSteppers(scope){(scope||document).querySelectorAll('[data-stepper]').forEach(function(box){
  var steps=box.querySelectorAll('.step'),info=box.querySelector('.stepinfo [data-info]'),dots=box.querySelectorAll('.dots i'),n=steps.length,i=0,count=box.querySelector('.stepinfo b');
  var show=function(k){i=(k+n)%n;steps.forEach(function(s,j){s.hidden=j!==i});dots.forEach(function(d,j){d.classList.toggle('on',j===i)});count.firstChild.nodeValue=(i+1)+' / '+n+' · ';info.textContent=steps[i].getAttribute('data-info')};
  box.querySelectorAll('[data-move]').forEach(function(b){b.addEventListener('click',function(){show(i+(+b.dataset.move))})});
  var stage=box.querySelector('.stage'),x0=null;
  if(stage&&n>1){stage.addEventListener('pointerdown',function(e){x0=e.clientX});stage.addEventListener('pointerup',function(e){if(x0===null)return;var dx=e.clientX-x0;x0=null;if(Math.abs(dx)>40)show(i+(dx<0?1:-1))})}
  box.currentMidis=function(){return JSON.parse(steps[i].getAttribute('data-midis'))};
 })}
 initSteppers();window.HMK={initSteppers:initSteppers,base:base};
 // Key pages: triads / 7th chords.
 document.querySelectorAll('[data-size]').forEach(function(b){b.addEventListener('click',function(){
  document.querySelectorAll('[data-size]').forEach(function(x){x.setAttribute('aria-checked',String(x===b))});
  document.querySelectorAll('[data-sizegroup]').forEach(function(g){g.hidden=g.getAttribute('data-sizegroup')!==b.dataset.size})})});
})();
