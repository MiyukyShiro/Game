'use strict';
/* Minimales Canvas-2D in reinem JS: Pfade, Füllen, Strichen, Verläufe,
   Clip-Masken, Kompositmodi — genug, um das Spiel wirklich zu sehen. */
const zlib = require('zlib');
const SS = 2;                                   // Supersampling

function farbe(s) {
  if (!s || s === 'none') return null;
  if (typeof s === 'object') return s;           // Verlauf
  s = String(s).trim();
  if (s[0] === '#') {
    let h = s.slice(1);
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16), 1];
  }
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) { const t = m[1].split(',').map(v=>parseFloat(v));
    return [t[0]|0, t[1]|0, t[2]|0, t.length>3?t[3]:1]; }
  return [255,0,255,1];
}
function mischF(a,b,t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t, a[3]+(b[3]-a[3])*t]; }

class Verlauf {
  constructor(art,p){ this.art=art; this.p=p; this.stops=[]; }
  addColorStop(t,c){ this.stops.push([t,farbe(c)]); this.stops.sort((a,b)=>a[0]-b[0]); }
  bei(x,y){
    if(!this.stops.length) return [0,0,0,0];
    let t;
    if(this.art==='linear'){
      const [x0,y0,x1,y1]=this.p, dx=x1-x0, dy=y1-y0, l=dx*dx+dy*dy;
      t = l? ((x-x0)*dx+(y-y0)*dy)/l : 0;
    } else {
      const [x0,y0,r0,x1,y1,r1]=this.p;
      const d=Math.hypot(x-x1,y-y1);
      t = (r1-r0)? (d-r0)/(r1-r0) : 0;
    }
    t=Math.max(0,Math.min(1,t));
    if(t<=this.stops[0][0]) return this.stops[0][1];
    for(let i=1;i<this.stops.length;i++){
      if(t<=this.stops[i][0]){
        const a=this.stops[i-1], b=this.stops[i];
        const u=(t-a[0])/((b[0]-a[0])||1);
        return mischF(a[1],b[1],u);
      }
    }
    return this.stops[this.stops.length-1][1];
  }
}

class Ctx {
  constructor(cv){
    this.cv=cv; this.B=cv._b; this.H=cv._h;
    this.buf=new Float32Array(this.B*SS*this.H*SS*4);
    this.t=[1,0,0,1,0,0];
    this.fillStyle='#000'; this.strokeStyle='#000'; this.lineWidth=1;
    this.globalAlpha=1; this.globalCompositeOperation='source-over';
    this.lineJoin=''; this.lineCap=''; this.font=''; this.textAlign=''; this.filter='none';
    this.clip_=null; this.stapel=[]; this.sub=[]; this.akt=null;
  }
  save(){ this.stapel.push({t:this.t.slice(),f:this.fillStyle,s:this.strokeStyle,lw:this.lineWidth,
    ga:this.globalAlpha,gc:this.globalCompositeOperation,cl:this.clip_}); }
  restore(){ const s=this.stapel.pop(); if(!s)return;
    this.t=s.t; this.fillStyle=s.f; this.strokeStyle=s.s; this.lineWidth=s.lw;
    this.globalAlpha=s.ga; this.globalCompositeOperation=s.gc; this.clip_=s.cl; }
  setTransform(a,b,c,d,e,f){ this.t=[a,b,c,d,e,f]; }
  translate(x,y){ const t=this.t; t[4]+=t[0]*x+t[2]*y; t[5]+=t[1]*x+t[3]*y; }
  scale(x,y){ const t=this.t; t[0]*=x; t[1]*=x; t[2]*=y; t[3]*=y; }
  rotate(a){ const t=this.t, c=Math.cos(a), s=Math.sin(a);
    const n=[t[0]*c+t[2]*s, t[1]*c+t[3]*s, t[0]*-s+t[2]*c, t[1]*-s+t[3]*c, t[4], t[5]];
    this.t=n; }
  p(x,y){ const t=this.t; return [ (t[0]*x+t[2]*y+t[4])*SS, (t[1]*x+t[3]*y+t[5])*SS ]; }
  massstab(){ const t=this.t; return Math.sqrt(Math.abs(t[0]*t[3]-t[1]*t[2]))*SS; }

  beginPath(){ this.sub=[]; this.akt=null; }
  moveTo(x,y){ this.akt=[this.p(x,y)]; this.sub.push(this.akt); }
  lineTo(x,y){ if(!this.akt) return this.moveTo(x,y); this.akt.push(this.p(x,y)); }
  closePath(){ if(this.akt&&this.akt.length>1) this.akt.push(this.akt[0].slice()); }
  quadraticCurveTo(cx,cy,x,y){
    if(!this.akt) this.moveTo(cx,cy);
    const a=this.akt[this.akt.length-1], c=this.p(cx,cy), b=this.p(x,y);
    for(let i=1;i<=12;i++){ const t=i/12, u=1-t;
      this.akt.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0], u*u*a[1]+2*u*t*c[1]+t*t*b[1]]); }
  }
  bezierCurveTo(c1x,c1y,c2x,c2y,x,y){ this.quadraticCurveTo(c1x,c1y,x,y); }
  arc(x,y,r,a0,a1,ccw){
    if(a1===undefined){a0=0;a1=Math.PI*2;}
    let d=a1-a0; if(ccw&&d>0)d-=Math.PI*2; if(!ccw&&d<0)d+=Math.PI*2;
    const n=Math.max(8,Math.ceil(Math.abs(d)*14));
    for(let i=0;i<=n;i++){ const a=a0+d*i/n;
      const pt=this.p(x+Math.cos(a)*r, y+Math.sin(a)*r);
      if(i===0&&!this.akt) { this.akt=[pt]; this.sub.push(this.akt); } else this.akt.push(pt); }
  }
  ellipse(x,y,rx,ry,rot,a0,a1){
    const n=48; const pts=[];
    for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n;
      const px=x+Math.cos(a)*rx*Math.cos(rot)-Math.sin(a)*ry*Math.sin(rot);
      const py=y+Math.cos(a)*rx*Math.sin(rot)+Math.sin(a)*ry*Math.cos(rot);
      pts.push(this.p(px,py)); }
    this.akt=pts; this.sub.push(pts);
  }
  rect(x,y,w,h){ this.moveTo(x,y); this.lineTo(x+w,y); this.lineTo(x+w,y+h); this.lineTo(x,y+h); this.closePath(); }
  fillRect(x,y,w,h){ this.beginPath(); this.rect(x,y,w,h); this.fill(); }
  clearRect(){}
  fillText(){}
  createLinearGradient(x0,y0,x1,y1){ const a=this.p(x0,y0), b=this.p(x1,y1); return new Verlauf('linear',[a[0],a[1],b[0],b[1]]); }
  createRadialGradient(x0,y0,r0,x1,y1,r1){ const a=this.p(x0,y0), b=this.p(x1,y1), m=this.massstab();
    return new Verlauf('radial',[a[0],a[1],r0*m,b[0],b[1],r1*m]); }
  createImageData(w,h){ return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)}; }
  putImageData(d,x,y){ this.cv._bild=d; }
  getImageData(){ return this.createImageData(1,1); }

  /* --- Rasterung --- */
  _maske(sub){
    const B=this.B*SS, H=this.H*SS;
    const m=new Float32Array(B*H);
    const kanten=[];
    for(const s of sub){
      if(s.length<2) continue;
      const pts=s.slice();
      if(pts[0][0]!==pts[pts.length-1][0]||pts[0][1]!==pts[pts.length-1][1]) pts.push(pts[0]);
      for(let i=0;i<pts.length-1;i++) kanten.push([pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]]);
    }
    if(!kanten.length) return m;
    let y0=1e9,y1=-1e9;
    for(const k of kanten){ y0=Math.min(y0,k[1],k[3]); y1=Math.max(y1,k[1],k[3]); }
    y0=Math.max(0,Math.floor(y0)); y1=Math.min(H-1,Math.ceil(y1));
    const xs=[];
    for(let y=y0;y<=y1;y++){
      const yc=y+0.5; xs.length=0;
      for(const k of kanten){
        const [ax,ay,bx,by]=k;
        if((ay<=yc&&by>yc)||(by<=yc&&ay>yc)){
          const t=(yc-ay)/(by-ay);
          xs.push([ax+(bx-ax)*t, by>ay?1:-1]);
        }
      }
      if(!xs.length) continue;
      xs.sort((a,b)=>a[0]-b[0]);
      let w=0;
      for(let i=0;i<xs.length-1;i++){
        w+=xs[i][1];
        if(w!==0){
          let xa=xs[i][0], xb=xs[i+1][0];
          const ia=Math.max(0,Math.floor(xa)), ib=Math.min(B-1,Math.ceil(xb));
          for(let x=ia;x<=ib;x++){
            const c=Math.min(x+1,xb)-Math.max(x,xa);
            if(c>0) m[y*B+x]=Math.min(1,m[y*B+x]+c);
          }
        }
      }
    }
    return m;
  }
  _male(maske, stil){
    const B=this.B*SS, H=this.H*SS;
    const g=(typeof stil==='object'&&stil instanceof Verlauf)?stil:null;
    const c=g?null:farbe(stil);
    if(!g&&!c) return;
    const ga=this.globalAlpha, op=this.globalCompositeOperation, cl=this.clip_;
    const buf=this.buf;
    for(let y=0;y<H;y++){
      for(let x=0;x<B;x++){
        const i=y*B+x;
        let a=maske[i]; if(a<=0.002) continue;
        if(cl){ a*=cl[i]; if(a<=0.002) continue; }
        const f=g?g.bei(x,y):c;
        a*=f[3]*ga;
        if(a<=0.002) continue;
        const o=i*4;
        if(op==='lighter'){ buf[o]+=f[0]*a; buf[o+1]+=f[1]*a; buf[o+2]+=f[2]*a; buf[o+3]=Math.min(1,buf[o+3]+a); }
        else if(op==='multiply'){ const k=1-a;
          buf[o]=buf[o]*(k+a*f[0]/255); buf[o+1]=buf[o+1]*(k+a*f[1]/255); buf[o+2]=buf[o+2]*(k+a*f[2]/255); }
        else if(op==='destination-out'){ const k=1-a;
          buf[o]*=k; buf[o+1]*=k; buf[o+2]*=k; buf[o+3]*=k; }
        else { const k=1-a;
          buf[o]=buf[o]*k+f[0]*a; buf[o+1]=buf[o+1]*k+f[1]*a; buf[o+2]=buf[o+2]*k+f[2]*a;
          buf[o+3]=buf[o+3]*k+a; }
      }
    }
  }
  fill(){ this._male(this._maske(this.sub), this.fillStyle); }
  stroke(){
    const lw=Math.max(0.7,this.lineWidth*this.massstab());
    const quads=[];
    for(const s of this.sub){
      for(let i=0;i<s.length-1;i++){
        const [ax,ay]=s[i], [bx,by]=s[i+1];
        let dx=bx-ax, dy=by-ay; const l=Math.hypot(dx,dy);
        if(l<0.001) continue;
        dx/=l; dy/=l;
        const nx=-dy*lw/2, ny=dx*lw/2;
        quads.push([[ax+nx,ay+ny],[bx+nx,by+ny],[bx-nx,by-ny],[ax-nx,ay-ny],[ax+nx,ay+ny]]);
        const r=lw/2, k=[];
        for(let a=0;a<8;a++) k.push([bx+Math.cos(a/8*6.283)*r, by+Math.sin(a/8*6.283)*r]);
        k.push(k[0]); quads.push(k);
      }
    }
    for(const q of quads) this._male(this._maske([q]), this.strokeStyle);
  }
  clip(){
    const m=this._maske(this.sub);
    if(this.clip_){ const n=new Float32Array(m.length);
      for(let i=0;i<m.length;i++) n[i]=m[i]*this.clip_[i];
      this.clip_=n;
    } else this.clip_=m;
  }
  drawImage(bild,dx,dy,dw,dh){
    if(bild && bild._ctx){                       // Canvas auf Canvas
      const q=bild._ctx.buf, B=this.B*SS, H=this.H*SS;
      if(q.length!==this.buf.length) return;     // andere Größe (Korn) — überspringen
      const ga=this.globalAlpha;
      for(let i=0;i<B*H;i++){
        const o=i*4, a=q[o+3]*ga;
        if(a<=0.002) continue;
        if(this.globalCompositeOperation==='lighter'){
          this.buf[o]+=q[o]; this.buf[o+1]+=q[o+1]; this.buf[o+2]+=q[o+2];
        } else { const k=1-a;
          this.buf[o]=this.buf[o]*k+q[o]; this.buf[o+1]=this.buf[o+1]*k+q[o+1]; this.buf[o+2]=this.buf[o+2]*k+q[o+2];
          this.buf[o+3]=this.buf[o+3]*k+a; }
      }
    }
  }
}
class Canvas {
  constructor(b,h){ this._b=b; this._h=h; this._ctx=new Ctx(this); }
  get width(){ return this._b*1; } set width(v){ this._b=Math.round(v); this._neu(); }
  get height(){ return this._h*1; } set height(v){ this._h=Math.round(v); this._neu(); }
  _neu(){ const c=this._ctx; c.B=this._b; c.H=this._h;
    c.buf=new Float32Array(this._b*SS*this._h*SS*4); c.clip_=null; c.stapel=[]; }
  getContext(){ return this._ctx; }
  addEventListener(){} setPointerCapture(){}
  get classList(){ return {add(){},remove(){},toggle(){},contains(){return false}}; }
  png(){
    const B=this._b, H=this._h, buf=this._ctx.buf, BS=B*SS;
    const roh=Buffer.alloc(H*(B*3+1));
    let o=0;
    for(let y=0;y<H;y++){
      roh[o++]=0;
      for(let x=0;x<B;x++){
        let r=0,g=0,b=0;
        for(let sy=0;sy<SS;sy++) for(let sx=0;sx<SS;sx++){
          const i=((y*SS+sy)*BS+(x*SS+sx))*4;
          r+=buf[i]; g+=buf[i+1]; b+=buf[i+2];
        }
        const n=SS*SS;
        roh[o++]=Math.max(0,Math.min(255,Math.round(r/n)));
        roh[o++]=Math.max(0,Math.min(255,Math.round(g/n)));
        roh[o++]=Math.max(0,Math.min(255,Math.round(b/n)));
      }
    }
    const crcT=[];
    for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; crcT[n]=c>>>0; }
    const crc=b=>{ let c=0xFFFFFFFF; for(const x of b) c=crcT[(c^x)&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0; };
    const chunk=(typ,d)=>{ const l=Buffer.alloc(4); l.writeUInt32BE(d.length);
      const t=Buffer.from(typ), c=Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t,d])));
      return Buffer.concat([l,t,d,c]); };
    const ihdr=Buffer.alloc(13);
    ihdr.writeUInt32BE(B,0); ihdr.writeUInt32BE(H,4);
    ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
    return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),
      chunk('IHDR',ihdr), chunk('IDAT',zlib.deflateSync(roh)), chunk('IEND',Buffer.alloc(0))]);
  }
}
module.exports = { Canvas };
