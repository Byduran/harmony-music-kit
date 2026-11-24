// Home page: tap a key on the circle to see its seven chords.
(function(){
 var c=document.querySelector('[data-circle]');if(!c)return;
 var data=JSON.parse(c.getAttribute('data-circle')),btns=c.querySelectorAll('.ckey'),
     ck=document.getElementById('ck'),cs=document.getElementById('cs'),cd=document.getElementById('cd');
 function pick(i){
  btns.forEach(function(b,k){var d=Math.min((k-i+12)%12,(i-k+12)%12);b.classList.toggle('on',k===i);b.classList.toggle('near',d===1);b.setAttribute('aria-pressed',String(k===i))});
  ck.textContent=data[i].key+' major';cs.textContent=data[i].sig;
  cd.innerHTML=data[i].chords.map(function(x){return '<span class="dchord"><small>'+x.roman+'</small><b>'+x.name+'</b></span>'}).join('');
 }
 btns.forEach(function(b){b.addEventListener('click',function(){pick(+b.dataset.i)})});
 pick(0);
})();
