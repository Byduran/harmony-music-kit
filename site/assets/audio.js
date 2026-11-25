// Website sound: the app's own piano and nylon-guitar samples (app/sounds/*.js), pitch-shifted to the nearest sample.
(function(){
 var base=document.body.getAttribute('data-base')||'./',ctx=null,out=null,banks={},token=0;
 function ac(){if(!ctx){ctx=new(window.AudioContext||window.webkitAudioContext)();var comp=ctx.createDynamicsCompressor();comp.threshold.value=-12;comp.knee.value=8;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.2;comp.connect(ctx.destination);out=comp}if(ctx.state==='suspended')ctx.resume();return ctx}
 function load(name){if(banks[name])return banks[name];
  banks[name]=new Promise(function(ok,no){
   var decode=function(){var data=window.HMK_SAMPLES&&window.HMK_SAMPLES[name],c=ac(),bank={buffers:{},keys:[]};if(!data)return no();
    Promise.all(Object.keys(data).map(function(k){return new Promise(function(r,x){var bin=atob(data[k]),arr=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);c.decodeAudioData(arr.buffer,function(b){bank.buffers[k]=b;r()},x)})}))
    .then(function(){bank.keys=Object.keys(bank.buffers).map(Number).sort(function(a,b){return a-b});ok(bank)},no)};
   var s=document.createElement('script');s.src=base+'app/sounds/'+name+'.js';s.onload=decode;s.onerror=no;document.head.appendChild(s)});
  banks[name].catch(function(){delete banks[name]});return banks[name]}
 function note(bank,m,at,len,vol){var c=ac(),k=bank.keys.reduce(function(a,b){return Math.abs(b-m)<Math.abs(a-m)?b:a}),src=c.createBufferSource(),g=c.createGain(),t=c.currentTime+at;
  src.buffer=bank.buffers[k];src.playbackRate.value=Math.pow(2,(m-k)/12);g.gain.setValueAtTime(vol,t);g.gain.setValueAtTime(vol,t+len);g.gain.exponentialRampToValueAtTime(.0001,t+len+.3);src.connect(g);g.connect(out);src.start(t);src.stop(t+len+.35)}
 // Light up the notes on screen as they sound: elements with data-m (midi) or data-pc (pitch class) inside the nearest [data-light-root].
 function light(scope,m,at,len){setTimeout(function(){var els=scope.querySelectorAll('[data-m="'+m+'"],[data-pc="'+(m%12)+'"]');els.forEach(function(e){e.classList.add('lit')});
  setTimeout(function(){els.forEach(function(e){e.classList.remove('lit')})},len*1000)},at*1000)}
 function play(midis,o){o=o||{};var my=++token,inst=o.inst==='guitar'?'nylon':'piano',vol=inst==='piano'?.19:.16;ac();
  return load(inst).then(function(bank){if(my!==token)return;var scope=o.scope;
   if(scope&&!o.seq)midis.forEach(function(m,i){light(scope,m,o.arp?i*.33:o.strum?i*.035:0,o.arp?.42:1.1)});
   if(o.seq){midis.forEach(function(ch,j){ch.forEach(function(m){note(bank,m,j*1.1,1,vol*.8)})});return}
   midis.forEach(function(m,i){note(bank,m,o.arp?i*.33:o.strum?i*.035:0,o.len?Math.max(.3,o.len*.9):o.arp?.6:1.6,o.arp?vol*1.2:vol)})})}
 // Used by the progression player.
 function click(at,accent){var c=ac(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+(at||0);o.frequency.value=accent?1500:1000;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(accent?.25:.15,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+.06);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.08)}
 window.HMKAudio={play:function(midis,o){return play(midis,o||{})},click:click,ready:function(inst){ac();return load(inst==='guitar'?'nylon':'piano')}};
 document.addEventListener('click',function(e){
  var b=e.target.closest('[data-play],[data-seq],[data-play-current]');if(!b)return;
  var done=function(){b.classList.remove('loading')};b.classList.add('loading');var scope=b.closest('[data-light-root]');
  if(b.hasAttribute('data-glow')){b.classList.add('lit');setTimeout(function(){b.classList.remove('lit')},900)}
  var p;if(b.hasAttribute('data-seq'))p=play(JSON.parse(b.getAttribute('data-seq')),{seq:1});
  else if(b.hasAttribute('data-play-current')){var box=b.closest('[data-stepper]');p=play(box.currentMidis(),{inst:b.dataset.inst,strum:b.hasAttribute('data-strum'),scope:box})}
  else p=play(JSON.parse(b.getAttribute('data-play')),{inst:b.dataset.inst,arp:b.hasAttribute('data-arp'),strum:b.hasAttribute('data-strum'),scope:scope});
  p.then(done,function(){done();b.title='Sound could not load'})});
})();
