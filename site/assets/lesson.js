// Interactive lessons: one step at a time; the circle, keyboard and chord row change with each step.
(function(){
 var root=document.querySelector('[data-lesson]');if(!root)return;
 var L=JSON.parse(root.getAttribute('data-lesson')),steps=L.steps,N=steps.length,i=0,solved=false,timers=[],
     texts=root.querySelectorAll('.lstep'),bar=root.querySelector('.lbar i'),barBox=root.querySelector('.lbar'),pic=root.querySelector('.lpic'),
     rowEl=root.querySelector('[data-lrow]'),back=root.querySelector('[data-lback]'),next=root.querySelector('[data-lnext]'),done=root.querySelector('[data-ldone]'),
     cof=root.querySelector('.cof'),rk=root.querySelectorAll('.rk'),A=window.HMKAudio;
 function clear(){timers.forEach(clearTimeout);timers=[]}
 function later(f,ms){timers.push(setTimeout(f,ms))}
 function setCircle(c){if(!cof)return;var wrap=cof.parentNode;wrap.hidden=!c;if(!c)return;
  rk.forEach(function(b){var id=(b.getAttribute('data-mode')==='major'?'M':'m')+b.getAttribute('data-i'),on=c.on.indexOf(id)>=0;b.classList.toggle('on',on);b.classList.toggle('dimmed',!on&&c.on.length<3);b.querySelector('.rom').textContent=''});
  var w=cof.querySelector('.cof-wedge');w.style.opacity=c.wedge==null?0:1;w.style.transform='rotate('+((c.wedge||0)*30)+'deg)';
  cof.querySelector('[data-c="name"]').textContent=c.name;cof.querySelector('[data-c="sig"]').textContent=c.sig;
  cof.querySelector('[data-c="acc"]').innerHTML=(c.acc||[]).map(function(r){return '<span>'+r+'</span>'}).join('')}
 function setKb(k){pic.querySelectorAll('.kb [data-m]').forEach(function(e){var m=e.getAttribute('data-m'),on=k&&k.notes.indexOf(+m)>=0;
  e.classList.toggle('on',!!on);e.classList.toggle('alt',!!(on&&k.alt&&k.alt.indexOf(+m)>=0));e.classList.toggle('dim',!!(k&&k.dim&&k.dim.indexOf(+m)>=0));
  e.querySelector('span').textContent=on&&k.labels&&k.labels[m]!=null?k.labels[m]:''})}
 function setRow(r,quiz){rowEl.hidden=!r;if(!r)return;rowEl.style.gridTemplateColumns='repeat('+r.length+',minmax(0,1fr))';
  rowEl.innerHTML=r.map(function(x,j){return '<button type="button" class="dchord" data-j="'+j+'"'+(quiz?'':' data-play=\''+JSON.stringify(x.midis)+'\' data-glow="1"')+'><small>'+x.sub+'</small><b>'+x.t+'</b></button>'}).join('')}
 function playThing(p){if(!p)return;clear();
  if(p.seq){p.seq.forEach(function(s,j){later(function(){if(s.kb)setKb(s.kb);rowEl.querySelectorAll('.dchord').forEach(function(b,k){b.classList.toggle('lit',k===s.row)});A.play(s.midis,{scope:pic,len:1.1})},j*1300)});
   later(function(){rowEl.querySelectorAll('.dchord').forEach(function(b){b.classList.remove('lit')})},p.seq.length*1300);return}
  A.play(p.midis,{scope:pic,arp:p.mode==='arp'})}
 function msg(text,ok){var m=texts[i].querySelector('.lmsg');m.hidden=!text;m.textContent=text||'';m.classList.toggle('ok',!!ok)}
 function show(k){clear();i=Math.max(0,Math.min(N-1,k));solved=false;var s=steps[i];
  texts.forEach(function(t,j){t.hidden=j!==i});bar.style.width=((i+1)/N*100)+'%';barBox.setAttribute('aria-valuenow',i+1);
  setCircle(s.circle);setKb(s.kb);setRow(s.row,s.quiz&&s.quiz.on==='row');msg('');
  if(cof)cof.classList.toggle('quiz',!!(s.quiz&&s.quiz.on==='circle'));
  back.style.visibility=i===0?'hidden':'visible';var last=i===N-1;next.hidden=last;done.hidden=!last;
  next.textContent=s.quiz?'Skip ›':'Next ›';
  var pb=texts[i].querySelector('.lplay');if(pb)pb.onclick=function(){playThing(s.play)}}
 function answer(given){var s=steps[i],q=s.quiz;if(!q||solved)return;
  if(given===q.answer){solved=true;msg(q.ok,true);next.textContent='Next ›';var th=q.then||{};if(th.circle)setCircle(th.circle);if(th.kb)setKb(th.kb);if(th.play)playThing(th.play);
   if(q.on==='row'){var b=rowEl.querySelector('[data-j="'+given+'"]');if(b)b.classList.add('right')}}
  else msg(q.hint,false)}
 rk.forEach(function(b){b.addEventListener('click',function(){var s=steps[i];if(!(s.quiz&&s.quiz.on==='circle'))return;answer((b.getAttribute('data-mode')==='major'?'M':'m')+b.getAttribute('data-i'))})});
 rowEl.addEventListener('click',function(e){var b=e.target.closest('.dchord');if(!b)return;var s=steps[i];if(s.quiz&&s.quiz.on==='row'){A.play(s.row[+b.getAttribute('data-j')].midis,{scope:pic});answer(+b.getAttribute('data-j'))}});
 next.addEventListener('click',function(){show(i+1);root.scrollIntoView({block:'start',behavior:'smooth'})});
 back.addEventListener('click',function(){show(i-1)});
 document.addEventListener('keydown',function(e){if(e.target.closest('input,textarea'))return;if(e.key==='ArrowRight'&&!next.hidden)show(i+1);if(e.key==='ArrowLeft')show(i-1)});
 show(0);
})();
