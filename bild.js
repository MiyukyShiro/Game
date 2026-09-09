
/* ==========================================================================
   Bild und Bedienung
   ========================================================================== */
function zeichne() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#050506'; ctx.fillRect(0, 0, cv.width / dpr, cv.height / dpr);
  ctx.save();
  const at = 1 + S.druck * 0.006 * Math.sin(zeit * 1.9);
  ctx.translate(versatzX + VB * 0.5 * skala, versatzY + VH * 0.5 * skala);
  ctx.scale(skala * at, skala * at);
  ctx.translate(-VB * 0.5, -VH * 0.5);
  ctx.beginPath(); ctx.rect(0, 0, VB, VH); ctx.clip();

  szene().zeichne(S.welt);
  /* Elias als gezeichnete Figur; das Wippen ersetzt die Gliederanimation */
  const geht = S.elias.geht;
  const heben = geht ? Math.abs(Math.sin(S.elias.ph * 2)) * 4 : Math.sin(zeit * 1.2) * 1.4;
  const neig = geht ? Math.sin(S.elias.ph) * 0.035 : 0;
  ctx.save();
  ctx.translate(S.elias.x, BODEN);
  ctx.rotate(neig);
  ctx.translate(-S.elias.x, -BODEN);
  person('elias', S.elias.x, BODEN, S.elias.blick, geht, S.elias.ph, S.zieht > 0.02 ? 'zieht' : null);
  /* die Uhr beim Aufziehen sichtbar über der Bildfigur */
  if (S.zieht > 0.02) { ctx.save(); ctx.translate(S.elias.x + S.elias.blick * 30, BODEN - 112);
    ctx.scale(S.elias.blick * 1.4, 1.4); uhrZeichnen(0, 0, 'zieht'); ctx.restore(); }
  ctx.restore();


  if (trance()) {
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .3;
    ctx.fillStyle = '#6A3FA0'; ctx.fillRect(0, 0, VB, VH); ctx.restore();
    vignette(1, 'rgba(6,3,14,' + (0.5 + S.druck * 0.3) + ')');
  } else {
    /* die Wachwelt ist bereits entsättigt angelegt — nur ein kalter Hauch darüber */
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .18;
    ctx.fillStyle = '#8A94A0'; ctx.fillRect(0, 0, VB, VH); ctx.restore();
    vignette(1, 'rgba(6,7,8,.58)');
  }
  /* Beim Aufziehen zieht sich das Bild zusammen */
  if (S.zieht > 0.02) {
    ctx.save();
    ctx.globalAlpha = S.zieht * .5;
    vignette(1, 'rgba(0,0,0,.95)');
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(S.elias.x, BODEN - 120, 0, S.elias.x, BODEN - 120, 260 * S.zieht);
    g.addColorStop(0, 'rgba(240,200,96,' + (0.16 * S.zieht) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VB, VH);
    ctx.restore();
  }
  pfeileZeichnen();
  korn(0.06 + S.druck * 0.04);
  if (S.karteOffen) karteZeichnen();
  if (S.karte) {
    const t = S.karte.zeit;
    const a = t < 0.6 ? t / 0.6 : (t > 2.6 ? klemm(1 - (t - 2.6) / 1, 0, 1) : 1);
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(5,5,6,.55)'; ctx.fillRect(0, VH * .34, VB, 92);
    ctx.font = '300 34px Gloock, Newsreader, Georgia, serif';
    ctx.fillStyle = '#EDE3D3'; ctx.textAlign = 'center';
    ctx.fillText(S.karte.t, VB / 2, VH * .34 + 58);
    ctx.restore();
  }
  ctx.restore();
  const b = cv.width / dpr, h = cv.height / dpr;
  if (S.uebergang) {
    const t = S.uebergang.t;
    const a = t < 0.32 ? t / 0.32 : klemm(1 - (t - 0.32) / 0.36, 0, 1);
    ctx.fillStyle = 'rgba(5,5,6,' + a + ')'; ctx.fillRect(0, 0, b, h);
  }
}

const elMarke = document.getElementById('marke');
const uhrKnopf = document.getElementById('uhr');
function imMenue() { return document.getElementById('titel').classList.contains('an') || document.getElementById('ende').classList.contains('an'); }
cv.addEventListener('pointerdown', e => {
  Ton.start();
  if (!S || imMenue()) return;
  const p = zuBuehne(e.clientX, e.clientY);
  if (S.karteOffen) { karteKlick(p.x, p.y); return; }
  klickAuf(p.x, p.y);
});
document.getElementById('kartenknopf').addEventListener('click', e => { e.preventDefault(); Ton.start();
  if (!S || imMenue() || S.text) return; S.karteOffen = !S.karteOffen; Ton.rauschen(.25, 900, 300, .06, 1.5); });
cv.addEventListener('pointermove', e => {
  if (e.pointerType && e.pointerType !== 'mouse') return;
  if (!S || S.text || imMenue()) { elMarke.classList.remove('an'); return; }
  const p = zuBuehne(e.clientX, e.clientY), d = treffer(p.x, p.y);
  if (d) { elMarke.textContent = d.name;
    elMarke.style.left = (e.clientX + 14) + 'px'; elMarke.style.top = (e.clientY - 26) + 'px';
    elMarke.classList.add('an'); cv.classList.add('zeigend'); }
  else { elMarke.classList.remove('an'); cv.classList.remove('zeigend'); }
});
let uhrGesperrt = 0;
function uhrAntippen(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (performance.now() - uhrGesperrt < 400) return;      // doppelte Ereignisse (touch + pointer) abfangen
  uhrGesperrt = performance.now();
  Ton.start(); uhrKlick();
}
uhrKnopf.addEventListener('pointerdown', uhrAntippen);
uhrKnopf.addEventListener('touchstart', uhrAntippen, { passive: false });
uhrKnopf.addEventListener('click', uhrAntippen);
addEventListener('keydown', e => {
  Ton.start();
  const k = e.key.toLowerCase();
  if (k === 'arrowleft' || k === 'a') linksTaste = true;
  if (k === 'arrowright' || k === 'd') rechtsTaste = true;
  if (k === 'q') uhrKlick();
  if (k === 'm' && S && !imMenue() && !S.text) S.karteOffen = !S.karteOffen;
  if (k === ' ' || k === 'enter') { e.preventDefault(); if (S && S.text) textWeiter(); }
});
addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (k === 'arrowleft' || k === 'a') linksTaste = false;
  if (k === 'arrowright' || k === 'd') rechtsTaste = false;
});
addEventListener('blur', () => { linksTaste = rechtsTaste = false; uhrHalten(false); });

function starte() {
  neu();
  document.getElementById('titel').classList.remove('an');
  uhrKnopf.classList.remove('aus'); knopfBeschriften();
  S.gesehen.zelle = true; kapitelKarte(SZENEN.zelle.titel);
  sag('Elias', 'Sechste Woche in Kelmore. Zelle zwölf, Ostflügel, Bett am Fenster.',
               'Dr. Wren nennt es ein Experiment: eine Uhr, ein Takt, ein „geordneter Schlaf im Wachen“.',
               'Was er nicht weiß: Wenn ich die Feder ganz aufziehe, kippt nicht mein Schlaf, sondern das Haus.',
               '(Ein Tipp auf die Uhr rechts zieht die Feder auf. Der zweite hält sie an.)');
}
document.getElementById('anfangen').onclick = () => { Ton.start(); starte(); };
document.getElementById('nochmal').onclick = () => { document.getElementById('ende').classList.remove('an'); Ton.start(); starte(); };
const andersK = document.getElementById('anders'); if (andersK) andersK.style.display = 'none';
const titelK = document.getElementById('zumtitel'); if (titelK) titelK.onclick = () => { document.getElementById('ende').classList.remove('an'); document.getElementById('titel').classList.add('an'); };
let letzte = 0;
function schleife(t) {
  requestAnimationFrame(schleife);
  const dt = Math.min(0.05, letzte ? (t - letzte) / 1000 : 0.016);
  letzte = t;
  if (!S) return;
  if (!imMenue()) rechne(dt); else { zeit += dt; kochen = Math.floor(zeit * 7); }
  zeichne();
}
passeAn(); neu(); uhrKnopf.classList.add('aus');
requestAnimationFrame(schleife);
