// Loads the app's music code (web/index.html) so the website uses exactly the same chord spelling,
// guitar shapes and piano inversions as the app. One source of truth: fix it in the app, the site follows.
const fs=require('fs'),path=require('path'),vm=require('vm');
function loadCore(){
 const html=fs.readFileSync(path.join(__dirname,'..','web','index.html'),'utf8');
 const src=html.split('<script>')[1].split('</script>')[0];
 const fake=()=>({innerHTML:'',textContent:'',value:'C',dataset:{},style:{},classList:{toggle(){},add(){},remove(){}},querySelector:()=>fake(),querySelectorAll:()=>[],onclick:null,setAttribute(){},addEventListener(){}});
 const map=new Map(),doc={documentElement:{dataset:{}},querySelector:q=>{if(!map.has(q))map.set(q,fake());return map.get(q)},querySelectorAll:()=>[],addEventListener(){}};
 map.set('#libraryType',{...fake(),value:'0'});
 const ctx={document:doc,window:{matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(){}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},setTimeout:()=>{},console};
 vm.createContext(ctx);vm.runInContext(src.replace('initHarmonyKeys();renderHarmony();renderModesStandalone();buildCircle();selectKey(0);',''),ctx);
 return {run:code=>vm.runInContext(code,ctx),ctx};
}
module.exports={loadCore};
