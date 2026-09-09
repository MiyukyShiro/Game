/* ==========================================================================
   Raum: Die Uhrenkammer — Zeichnung, Dinge, Dialoge
   ========================================================================== */
SZENEN.kammer = {
  titel: 'Dritter Teil · Die Uhrenkammer', links: 90, rechts: 870,
  zeichne(w) {
    const p = P();
    ctx.fillStyle = p.luft; ctx.fillRect(0, 0, VB, VH);
    /* Wände aus Zifferblättern */
    for (let r2 = 0; r2 < 3; r2++) for (let i = 0; i < 9; i++) {
      const cx = 60 + i * 110 + (r2 % 2) * 55, cy = 70 + r2 * 120, rad = 34 + hash3(i, r2, 1) * 12;
      kreis(cx, cy, rad, '#1A1226', p.linie, 2, 1.2);
      kreis(cx, cy, rad * .8, '#D8CBA0', p.linie, 1.2, 1);
      const w1 = hash3(i, r2, 2) * TAU, w2 = hash3(i, r2, 3) * TAU;
      linie(cx, cy, cx + Math.cos(w1) * rad * .6, cy + Math.sin(w1) * rad * .6, '#3A3020', 2, .3);
      linie(cx, cy, cx + Math.cos(w2) * rad * .42, cy + Math.sin(w2) * rad * .42, '#3A3020', 2.6, .3);
    }
    ctx.fillStyle = 'rgba(6,4,12,.55)'; ctx.fillRect(0, 0, VB, 400);
    linie(0, BODEN, VB, BODEN, p.linie, 3, 2);
    ctx.fillStyle = p.boden; ctx.fillRect(0, BODEN, VB, VH - BODEN);
    ctx.save(); ctx.globalAlpha = .3;
    for (let i = 0; i < 40; i++) { const gx = hash3(i, 4, 5) * VB, gy = BODEN + hash3(i, 6, 7) * (VH - BODEN);
      kreis(gx, gy, 3 + hash3(i, 8, 9) * 6, '#D8CBA0', null, 0, 1); }   // Zahnräder am Boden
    ctx.restore();
    /* Pendel, die von der Decke hängen */
    for (let i = 0; i < 5; i++) { const px = 140 + i * 180, pend = Math.sin(zeit * (1.2 + i * .3) + i) * 30;
      linie(px, 0, px + pend, 250, '#8A7A4A', 2, 1); kreis(px + pend, 258, 10, '#C8B676', p.linie, 1.6, .6); }
    /* Tür zurück */
    tuerZeichnen(40, 186, 100, 256, p, true, true, null);
    /* Uhren der Probanden auf einem Podest */
    tuschen([600, 340, 860, 340, 860, 442, 600, 442], '#1A1226', p.linie, 2.6, 1.4);
    const uhrAuf = (x, nr, da) => {
      tuschen([x - 30, 340, x + 30, 340, x + 30, 352, x - 30, 352], '#2A1A44', p.linie, 1.8, 1);
      ctx.font = '600 12px Bricolage Grotesque, sans-serif'; ctx.fillStyle = '#F0C860'; ctx.textAlign = 'center';
      ctx.fillText(String(nr), x, 372);
      if (!da) return;
      kreis(x, 316, 14, '#D8CBA0', p.linie, 2, .6); kreis(x, 316, 10, '#F2ECDC', p.linie, 1.2, .5);
      linie(x, 316, x + Math.cos(zeit * -2 + nr) * 7, 316 + Math.sin(zeit * -2 + nr) * 7, '#3A3020', 1.5, .3);
    };
    uhrAuf(640, 9, !S.hat.uhr9); uhrAuf(710, 21, !S.hat.uhr21); uhrAuf(780, 12, true); uhrAuf(850, 4, true);
    /* Der Uhrmacher — hier bewegt er sich nicht. Hier ist er zu Hause. */
    uhrmacherZeichnen(420, 442, S.elias.x > 420 ? 1 : -1, 1, 0);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(730, 320, 0, 730, 320, 200);
    g.addColorStop(0, 'rgba(240,200,96,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VB, VH); ctx.restore();
    eckenAbdunkeln(480, 300, 560);
  },
  dinge: [
    { id: 'zurueck', x: 40, y: 186, b: 100, h: 256, name: 'Zurück durch den Uhrenschrank', tun: () => wechsle('wren', 540) },
    { id: 'meister', x: 370, y: 100, b: 100, h: 342, name: 'Der Uhrmacher', laufX: 250,
      tun: () => {
        if (!S.meisterGesprochen) {
          S.meisterGesprochen = true;
          return frage('Der Uhrmacher', '„Sie kommen zu mir. Das tun die wenigsten. Die meisten warten, bis ich komme.“', [
            { text: '„Wem gehören die Uhren?“', dann: () => sag('Der Uhrmacher',
                '„Neun. Einundzwanzig. Zwölf. Vier. Sie haben ganz aufgezogen, und ich habe sie nachgestellt.“',
                '„Ihre Körper stehen in Ihrem Haus herum. Ihre Zeit steht hier. Beides ist in Ordnung, so wie es ist.“') },
            { text: '„Stellen Sie mich nach.“', dann: () => sag('Der Uhrmacher', '„Noch nicht. Sie gehen noch nicht falsch genug.“',
                '„Kommen Sie wieder, wenn Sie ganz aufgezogen haben. Dann gehört Ihre Uhr hierher.“') }
          ]);
        }
        sag('Der Uhrmacher', '„Nehmen Sie, was Sie nehmen wollen. Was hier steht, geht rückwärts, wohin Sie es auch tragen.“');
      } },
    { id: 'uhr9', x: 620, y: 296, b: 40, h: 60, name: 'Uhr Nr. 9', sichtbar: () => !S.hat.uhr9,
      tun: () => { S.hat.uhr9 = true; Ton.klang(2100, .08, 'square', .06);
        sag('Elias', '(Die Uhr der Neun. Sie geht rückwärts, und sie ist kalt.)', 'Wenn ich sie ihr zurückgebe — wach, in ihre Hand — was kommt dann zurück?'); } },
    { id: 'uhr21', x: 690, y: 296, b: 40, h: 60, name: 'Uhr Nr. 21', sichtbar: () => !S.hat.uhr21,
      tun: () => { S.hat.uhr21 = true; Ton.klang(2100, .08, 'square', .06);
        sag('Elias', '(Die Uhr der Einundzwanzig. Rückwärts, kalt, und schwerer als meine.)'); } },
    { id: 'uhr12', x: 760, y: 296, b: 40, h: 60, name: 'Uhr Nr. 12', sichtbar: () => !S.hat.uhr12b,
      tun: () => {
        if (!(S.hat.uhr9 && S.hat.uhr21)) return sag('Elias', 'Die Zwölf. Die habe ich schon — die aus dem Zimmer 1 ist ihr Zwilling.',
          'Zwei Uhren für einen Mann, der die Decke ansieht. Eine reicht nicht mehr.');
        S.hat.uhr12b = true; Ton.klang(2100, .08, 'square', .06);
        sag('Elias', '(Ich nehme auch die Zwölf. Zwei Uhren in der Tasche, die rückwärts gehen, und meine, die noch vorwärts geht.)',
                     'Der Uhrmacher sieht zu. Er sagt nichts. Er wartet, ob ich sie zurückbringe oder behalte.');
      } },
    { id: 'uhr4', x: 830, y: 296, b: 40, h: 60, name: 'Uhr Nr. 4',
      tun: () => sag('Elias', 'Die Vier. Ihr Körper ist nicht mehr auf der Station.', 'Niemand weiß, wo. Ihre Uhr weiß es, aber sie sagt es rückwärts.') }
  ]
};
