// Progression player on key pages: choose a progression, play/pause, loop, tempo (2 beats per chord, like the app), click, piano/guitar.
(function(){
 var box=document.querySelector('[data-player]');if(!box)return;
 var progs=JSON.parse(box.getAttribute('data-player')),base=box.getAttribute('data-base')||'./',stepsEl=box.querySelector('[data-steps]'),playBtn=box.querySelector('[data-pplay]'),
     loopBtn=box.querySelector('[data-ploop]'),clickBtn=box.querySelector('[data-pclick]'),bpmIn=box.querySelector('[data-pbpm]'),bpmOut=box.querySelector('[data-pbpmv]'),
     sel=0,step=0,playing=false,timer=null,inst='piano',loop=true,clickOn=false,BEATS=2;
 function render(){var p=progs[sel];stepsEl.innerHTML=p.steps.map(function(s,i){return '<a class="pstep'+(playing&&i===step?' on':'')+'" href="'+base+s.url+'"><b>'+s.label+'</b></a>'}).join('<span class="parrow" aria-hidden="true">→</span>');
  box.querySelectorAll('[data-prog]').forEach(function(b){b.setAttribute('aria-checked',String(+b.getAttribute('data-prog')===sel))});
  playBtn.textContent=playing?'❚❚ Pause':'▶ Play';
  document.querySelectorAll('.kchord').forEach(function(c){c.classList.remove('lit')});
  if(playing){var s=p.steps[step];document.querySelectorAll('[data-sizegroup="'+(s.sev?'sev':'tri')+'"] .kchord[data-deg="'+s.deg+'"]').forEach(function(c){c.classList.add('lit')})}}
 function tick(){if(!playing)return;var p=progs[sel],s=p.steps[step],beat=60/(+bpmIn.value);
  window.HMKAudio.play(s.midis,{inst:inst,strum:inst==='guitar',len:beat*BEATS});
  if(clickOn)for(var b=0;b<BEATS;b++)window.HMKAudio.click(b*beat,b===0);
  render();
  timer=setTimeout(function(){step++;if(step>=p.steps.length){if(!loop){stop();return}step=0}tick()},beat*BEATS*1000)}
 function stop(){playing=false;clearTimeout(timer);step=0;render()}
 playBtn.addEventListener('click',function(){if(playing){stop();return}playing=true;step=0;window.HMKAudio.ready(inst).then(tick,function(){playing=false;render()})});
 box.querySelectorAll('[data-prog]').forEach(function(b){b.addEventListener('click',function(){var was=playing;stop();sel=+b.getAttribute('data-prog');render();if(was){playing=true;tick()}})});
 loopBtn.addEventListener('click',function(){loop=!loop;loopBtn.setAttribute('aria-pressed',String(loop))});
 clickBtn.addEventListener('click',function(){clickOn=!clickOn;clickBtn.setAttribute('aria-pressed',String(clickOn))});
 bpmIn.addEventListener('input',function(){bpmOut.textContent=bpmIn.value});
 box.querySelectorAll('[data-pinst]').forEach(function(b){b.addEventListener('click',function(){inst=b.getAttribute('data-pinst');box.querySelectorAll('[data-pinst]').forEach(function(x){x.setAttribute('aria-checked',String(x===b))});window.HMKAudio.ready(inst)})});
 render();
})();
