// Progressions page: pick any of the 24 keys, hear its diatonic chords, play a preset progression or build your own (loop, tempo, click, piano/guitar).
(function(){
 var root=document.querySelector('[data-progpage]');if(!root)return;
 var KEYS=JSON.parse(root.getAttribute('data-progpage')),base=root.getAttribute('data-base')||'./',T=function(k,v){var s=window.HMK.t(k);if(v)for(var n in v)s=s.split('{'+n+'}').join(v[n]);return s};
 var $=function(q){return root.querySelector(q)},$$=function(q){return root.querySelectorAll(q)};
 var grid=$('[data-kgrid]'),title=$('[data-ktitle]'),presetsEl=$('[data-presets]'),stepsEl=$('[data-steps]'),own=$('[data-ownctl]'),note=$('[data-chordnote]'),keylink=$('[data-keylink]'),
     playBtn=$('[data-pplay]'),loopBtn=$('[data-ploop]'),clickBtn=$('[data-pclick]'),bpmIn=$('[data-pbpm]'),bpmOut=$('[data-pbpmv]');
 var key=null,size='sev',sel=0,mine=[],step=0,playing=false,timer=null,inst='piano',loop=true,clickOn=false,BEATS=2;
 var OWN='own';
 function byId(id){for(var i=0;i<KEYS.length;i++)if(KEYS[i].id===id)return KEYS[i]}
 function steps(){return sel===OWN?mine:key.presets[sel].steps}
 function chordStep(j){var c=key.chords[j],x=size==='sev'?c.sev:c.tri;return {label:x.label,deg:j,sev:size==='sev',url:x.url,midis:x.midis}}
 function renderChords(){
  title.textContent=T('The chords of {key}',{key:key.name});
  grid.innerHTML=key.chords.map(function(c,j){var x=size==='sev'?c.sev:c.tri;
   return '<div class="card kchord" data-deg="'+j+'"><button type="button" class="kplay" data-j="'+j+'"><small class="rom">'+(size==='sev'?c.romSev:c.rom)+'</small><small>'+c.role+'</small><b>'+x.label+'</b></button><a class="kgo" href="'+base+x.url+'" aria-label="'+x.label+'">→</a></div>'}).join('');
  note.textContent=sel===OWN?T('build note'):T('tap a chord');
  keylink.href=base+key.url;keylink.textContent=T('Everything about {key} — scale, chords and neighbouring keys',{key:key.name})+' →'}
 function renderPresets(){presetsEl.innerHTML=key.presets.map(function(p,i){return '<button type="button" class="opt" role="radio" aria-checked="'+(sel===i)+'" data-prog="'+i+'">'+p.name+'</button>'}).join('')+
  '<button type="button" class="opt ownchip" role="radio" aria-checked="'+(sel===OWN)+'" data-prog="own">✎ '+T('Your own')+'</button>'}
 function renderSteps(){var s=steps();own.hidden=sel!==OWN;
  if(!s.length){stepsEl.innerHTML='<span class="muted">'+T('build empty')+'</span>'}
  else stepsEl.innerHTML=s.map(function(x,i){return '<a class="pstep'+(playing&&i===step?' on':'')+'" href="'+base+x.url+'"><b>'+x.label+'</b></a>'}).join('<span class="parrow" aria-hidden="true">→</span>');
  playBtn.textContent=playing?T('js pause'):T('js play');playBtn.disabled=!s.length;
  $$('.kchord').forEach(function(c){c.classList.toggle('lit',playing&&s[step]&&+c.getAttribute('data-deg')===s[step].deg)})}
 function render(){renderChords();renderPresets();renderSteps()}
 function tick(){if(!playing)return;var s=steps();if(!s.length){stop();return}if(step>=s.length)step=0;var x=s[step],beat=60/(+bpmIn.value);
  window.HMKAudio.play(x.midis,{inst:inst,strum:inst==='guitar',len:beat*BEATS});
  if(clickOn)for(var b=0;b<BEATS;b++)window.HMKAudio.click(b*beat,b===0);
  renderSteps();
  timer=setTimeout(function(){step++;if(step>=steps().length){if(!loop){stop();return}step=0}tick()},beat*BEATS*1000)}
 function stop(){playing=false;clearTimeout(timer);step=0;renderSteps()}
 function setKey(id,keepPlaying){var was=playing&&keepPlaying;clearTimeout(timer);playing=false;key=byId(id);
  // keep "your own" progression by scale degree when the key changes
  mine=mine.map(function(x){var c=key.chords[x.deg],y=x.sev?c.sev:c.tri;return {label:y.label,deg:x.deg,sev:x.sev,url:y.url,midis:y.midis}});
  $$('[data-key]').forEach(function(b){b.setAttribute('aria-current',String(b.getAttribute('data-key')===id))});
  $$('[data-mode]').forEach(function(b){b.setAttribute('aria-checked',String(b.getAttribute('data-mode')===key.mode))});
  $$('[data-roots]').forEach(function(r){r.hidden=r.getAttribute('data-roots')!==key.mode});
  if(sel!==OWN&&sel>=key.presets.length)sel=0;
  try{history.replaceState(null,'','#'+key.mode+'-'+key.pc)}catch(e){}
  render();if(was){playing=true;step=0;tick()}}
 root.addEventListener('click',function(e){var b;
  if((b=e.target.closest('[data-key]')))return setKey(b.getAttribute('data-key'),true);
  if((b=e.target.closest('[data-mode]'))){var m=b.getAttribute('data-mode');if(m===key.mode)return;for(var i=0;i<KEYS.length;i++)if(KEYS[i].mode===m&&KEYS[i].pc===key.pc)return setKey(KEYS[i].id,true);return}
  if((b=e.target.closest('[data-size]'))){size=b.getAttribute('data-size');$$('[data-size]').forEach(function(x){x.setAttribute('aria-checked',String(x===b))});renderChords();renderSteps();return}
  if((b=e.target.closest('[data-prog]'))){var was=playing;stop();var v=b.getAttribute('data-prog');sel=v===OWN?OWN:+v;renderPresets();renderChords();renderSteps();if(was&&steps().length){playing=true;tick()}return}
  if((b=e.target.closest('.kplay'))){var j=+b.getAttribute('data-j'),x=chordStep(j);
   b.classList.add('lit');setTimeout(function(){b.classList.remove('lit')},900);
   if(sel===OWN&&mine.length<8){mine.push(x);renderSteps()}
   if(!playing)window.HMKAudio.play(x.midis,{inst:inst,strum:inst==='guitar'});return}
  if(e.target.closest('[data-undo]')){mine.pop();if(step>=mine.length)step=0;renderSteps();return}
  if(e.target.closest('[data-clear]')){mine=[];stop();return}
 });
 playBtn.addEventListener('click',function(){if(playing){stop();return}if(!steps().length)return;playing=true;step=0;window.HMKAudio.ready(inst).then(tick,function(){playing=false;renderSteps()})});
 loopBtn.addEventListener('click',function(){loop=!loop;loopBtn.setAttribute('aria-pressed',String(loop))});
 clickBtn.addEventListener('click',function(){clickOn=!clickOn;clickBtn.setAttribute('aria-pressed',String(clickOn))});
 bpmIn.addEventListener('input',function(){bpmOut.textContent=bpmIn.value});
 $$('[data-pinst]').forEach(function(b){b.addEventListener('click',function(){inst=b.getAttribute('data-pinst');$$('[data-pinst]').forEach(function(x){x.setAttribute('aria-checked',String(x===b))});window.HMKAudio.ready(inst)})});
 var h=(location.hash||'').match(/^#(major|minor)-(\d+)$/),start=null;
 if(h)for(var i=0;i<KEYS.length;i++)if(KEYS[i].mode===h[1]&&KEYS[i].pc===+h[2])start=KEYS[i].id;
 setKey(start||KEYS.filter(function(k){return k.mode==='major'&&k.pc===0})[0].id,false);
})();
