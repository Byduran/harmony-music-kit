// Chord builder (/chords/): pick a root and a type; the chord's own page supplies the diagrams, so both always match.
(function(){
 var box=document.querySelector('[data-builder]');if(!box)return;
 var list=JSON.parse(box.getAttribute('data-builder')),out=document.getElementById('builder-out'),pageLink=document.getElementById('b-page'),appLink=document.getElementById('b-app'),
     base=window.HMK.base,cache={},root='C',suf='',busy=0;
 function find(r,s){for(var i=0;i<list.length;i++)if(list[i][0]===r&&list[i][1]===s)return list[i]}
 function mark(){box.querySelectorAll('[data-root]').forEach(function(b){b.setAttribute('aria-checked',String(b.getAttribute('data-root')===root))});
  box.querySelectorAll('[data-type]').forEach(function(b){var on=b.getAttribute('data-type')===suf;b.setAttribute('aria-checked',String(on));if(on)showGroup(b.parentNode.id)})}
 function showGroup(id){box.querySelectorAll('[role=tab]').forEach(function(t){var on=t.getAttribute('aria-controls')===id;t.setAttribute('aria-selected',String(on));document.getElementById(t.getAttribute('aria-controls')).hidden=!on})}
 function load(push){var c=find(root,suf);if(!c)return;mark();var my=++busy;
  pageLink.href=c[2];pageLink.textContent='Everything about '+c[3]+' — all positions, inversions, where it is used →';appLink.href=base+'app/?page=chords&chord='+encodeURIComponent(c[0]+c[1]);
  if(push&&history.replaceState)history.replaceState(null,'','?c='+encodeURIComponent(c[0]+c[1]));
  var got=cache[c[2]]||(cache[c[2]]=fetch(c[2]).then(function(r){if(!r.ok)throw Error(r.status);return r.text()}));
  got.then(function(html){if(my!==busy)return;var doc=new DOMParser().parseFromString(html,'text/html');
   ['head','inst'].forEach(function(n){var nw=doc.querySelector('[data-frag="'+n+'"]'),old=out.querySelector('[data-frag="'+n+'"]');if(nw&&old){nw.classList.add('fresh');old.replaceWith(document.importNode(nw,true))}});
   window.HMK.initSteppers(out)}).catch(function(){delete cache[c[2]];location.href=c[2]})}
 box.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-root')){root=b.getAttribute('data-root');load(true)}
  else if(b.hasAttribute('data-type')){suf=b.getAttribute('data-type');load(true)}
  else if(b.getAttribute('role')==='tab')showGroup(b.getAttribute('aria-controls'))});
 try{var want=new URLSearchParams(location.search).get('c');if(want){var hit=null;list.forEach(function(x){if(x[0]+x[1]===want)hit=x});if(hit){root=hit[0];suf=hit[1];load(false)}}}catch(e){}
})();
