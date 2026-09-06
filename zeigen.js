const fs=require('fs'), vm=require('vm'), {Canvas}=require('./canvas.js');
const SPIEL='/home/claude/nl4/spiel.js';
function machEl(id){const e={id,style:{},textContent:'',onclick:null,_kids:[],
 classList:{_s:new Set(),add(){},remove(){},toggle(){},contains(){return false}},
 appendChild(k){e._kids.push(k);return k},addEventListener(){}};
 Object.defineProperty(e,'innerHTML',{get(){return ''},set(){}}); return e;}
function starten(breite,hoehe){
  const haupt=new Canvas(breite,hoehe);
  const els={};
  const document={ getElementById:id=>{ if(id==='c') return haupt;
      return els[id]||(els[id]=machEl(id)); },
    createElement:t=> t==='canvas'? new Canvas(breite,hoehe) : machEl('n'),
    addEventListener(){} };
  const c={document,console,Math,JSON,Date,parseInt,parseFloat,isNaN,Uint8ClampedArray,
   window:{innerWidth:breite,innerHeight:hoehe,devicePixelRatio:1,addEventListener(){}},
   performance:{now:()=>0},requestAnimationFrame:()=>0,setTimeout:()=>0,clearTimeout(){},addEventListener(){}};
  c.globalThis=c; vm.createContext(c);
  vm.runInContext(fs.readFileSync(SPIEL,'utf8')+
   "\nglobalThis.__z={get S(){return S},neu:neu,zeichne:zeichne,SZENEN:SZENEN,ctx:ctx,"+
   "nell:nellZeichnen,jonas:jonasZeichnen,russ:russZeichnen,setZeit:v=>{zeit=v;kochen=Math.floor(v*7);}};",
   c,{filename:'spiel.js'});
  return {c,haupt};
}
function bild(datei, breite, hoehe, fn){
  const {c,haupt}=starten(breite,hoehe);
  c.__z.neu(); c.__z.setZeit(2.3);
  fn(c,haupt);
  fs.writeFileSync(datei, haupt.png());
  console.log('  '+datei);
}
/* 1: Gehzyklus in vier Phasen */
bild('gang.png', 640, 300, (c,h)=>{
  const x=h.getContext(); x.setTransform(1,0,0,1,0,0);
  x.fillStyle='#241D33'; x.fillRect(0,0,640,300);
  x.fillStyle='#2E2540'; x.fillRect(0,240,640,60);
  for(let i=0;i<4;i++){
    x.save(); x.translate(80+i*160,275); x.scale(1.25,1.25);
    c.__z.nell(0,0,1,true,i*Math.PI/2,false,null); x.restore();
  }
});
/* 2: Nell groß, neutraler Hintergrund */
bild('figur.png', 420, 320, (c,h)=>{
  const x=h.getContext();
  x.setTransform(1,0,0,1,0,0);
  x.fillStyle='#241D33'; x.fillRect(0,0,420,320);
  x.fillStyle='#2E2540'; x.fillRect(0,250,420,70);
  const S=c.__z.S;
  x.save(); x.translate(90,290); x.scale(1.5,1.5);
  c.__z.nell(0,0,1,false,0,false,null); x.restore();
  x.save(); x.translate(215,290); x.scale(1.5,1.5);
  c.__z.nell(0,0,1,true,1.1,false,null); x.restore();
  S.hat.lampe=true; S.hat.lampeAn=true;
  x.save(); x.translate(330,290); x.scale(1.5,1.5);
  c.__z.nell(0,0,1,false,0,false,true); x.restore();
});
/* 2: Zimmer, ganze Szene */
bild('zimmer.png', 960, 540, (c)=>{ const S=c.__z.S; S.szene='zimmer'; S.nell.x=330; c.__z.zeichne(); });
/* 3: drüben */
bild('drueben.png', 960, 540, (c)=>{ const S=c.__z.S; S.szene='zimmer'; S.welt='drueben'; S.nell.x=560; c.__z.zeichne(); });
/* 4: Keller mit Taschenlampe */
bild('keller.png', 960, 540, (c)=>{ const S=c.__z.S; S.szene='keller'; S.nell.x=430; S.nell.blick=1;
  S.hat.lampe=true; S.hat.lampeAn=true; S.jonasDabei=true; S.jonas.x=380; c.__z.zeichne(); });
