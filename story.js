
/* ==========================================================================
   Die Geschichte in Akten. Jeder Akt stellt die Figuren neu auf,
   und wer einen Raum betritt, wird angesprochen — nicht umgekehrt.
   ========================================================================== */
/* Aufstellung je Akt: welche Figur steht wo. Fehlt ein Eintrag, ist die Figur nicht im Bild. */
const AKTE = [
  /* 0 · Zelle: Elias allein. Beatrice hinter der Klappe. */
  { milo: null, beatrice: null, wren: null, clara: null, blackwell: null, matthias: null, einundzwanzig: null, aria: null, neun: null },
  /* 1 · Der Korridor: Milo zeichnet, Beatrice geht ihre Runde, Wren steht vor der Eins. */
  { milo: { szene: 'korridor', x: 470 }, beatrice: { szene: 'korridor', x: 760, laeuft: true }, wren: { szene: 'korridor', x: 330 },
    clara: null, blackwell: null, matthias: null, einundzwanzig: null, aria: { szene: 'zelle', x: 560 }, neun: null },
  /* 2 · Milo hat vom Tor erzählt: Wren stellt sich vor die Nische. Beatrice geht in die Zelle und sieht das leere Bett. */
  { milo: { szene: 'korridor', x: 470 }, beatrice: { szene: 'zelle', x: 540 }, wren: { szene: 'korridor', x: 800, blick: -1 },
    clara: null, blackwell: { szene: 'korridor', x: 200 }, matthias: null, einundzwanzig: null, aria: null, neun: { szene: 'korridor', x: 560 } },
  /* 3 · Elias war im Hof: die anderen Patienten sind draußen. Blackwell im Korridor. */
  { milo: { szene: 'korridor', x: 470 }, beatrice: { szene: 'korridor', x: 620, laeuft: true }, wren: null,
    clara: { szene: 'hof', x: 800 }, blackwell: { szene: 'korridor', x: 200 }, matthias: { szene: 'hof', x: 660 }, einundzwanzig: { szene: 'hof', x: 500 }, aria: { szene: 'hof', x: 420 }, neun: { szene: 'hof', x: 580 } },
  /* 3.5 · Die Glocke hat geschlagen: Beatrice kniet in der Kapelle, ihr Bund liegt auf der Bank. */
  { milo: { szene: 'korridor', x: 470 }, beatrice: { szene: 'kapelle', x: 760, blick: 1 }, wren: null,
    clara: { szene: 'hof', x: 800 }, blackwell: { szene: 'korridor', x: 200 }, matthias: { szene: 'kapelle', x: 300 }, einundzwanzig: { szene: 'hof', x: 500 }, aria: { szene: 'hof', x: 420 }, neun: { szene: 'hof', x: 580 } },
  /* 4 · Der Uhrmacher hat Elias erwischt: Milo sitzt in seiner Zelle. Wren ist weg. Beatrice horcht an der Nische. */
  { milo: { szene: 'zelle', x: 470 }, beatrice: { szene: 'korridor', x: 840, blick: 1 }, wren: null,
    clara: { szene: 'hof', x: 800 }, blackwell: { szene: 'hof', x: 140 }, matthias: { szene: 'korridor', x: 560 }, einundzwanzig: { szene: 'zelle', x: 460 }, aria: { szene: 'wren', x: 700 }, neun: { szene: 'korridor', x: 420 } }
];
/* Enden */
function ende(art) {
  S.ende = art;
  const E = {
    uhrmacher: ['Der Uhrmacher', 'Die Feder nimmt den Aufzug, als hätte sie ihn erwartet. Das Pendel schlägt einmal, dann nicht mehr — dann in einem Takt, der zu keiner Uhr gehört.<br><br>Am Morgen findet Beatrice die Zelle zwölf leer. Im Korridor steht ein sehr langer Mann mit einem runden Gesicht, und die Patienten sagen, er sei schon immer da gewesen.<br><br>Er rückt nur vor, wenn niemand hinsieht.'],
    morgen:    ['Sechs Uhr morgens', 'Beide Uhren stehen. Der Raum bleibt ein Raum. Elias wacht in Zelle zwölf auf, mit einer Taschenuhr, die nicht mehr geht, und einem Kopf, der nicht mehr kippt.<br><br>Dr. Wren kommt nicht zurück. Seine Akten übernimmt Blackwell. Die Uhren im Regal bekommen einen fünften Zettel.<br><br>Milo zeichnet ihn noch einmal: allein, mit offenen Augen.'],
    rueckkehr: ['Die Rückkehr', 'Elias stellt beide Uhren zurück — nicht an, nicht ab: zurück. Der Uhrmacher sieht zu und rührt sich nicht. Hier ist er zu Hause; hier hat er keine Eile.<br><br>Am Morgen sitzt Nr. 09 im Hof und weiß, dass sie dort sitzt. Nr. 21 zählt wieder in Jahren. Zwei von vier Uhren im Regal gehen vorwärts.<br><br>Wren kommt nicht zurück. In seiner Standuhr tickt es tausendfach, und wer genau hinhört, hört, dass die Zwölf und die Vier noch warten.'],
    drei:      ['Drei von vier', 'Drei Uhren gehen vorwärts. Nr. 09 weiß, wo sie tagsüber ist. Nr. 21 zählt in Jahren. Proband 12 sieht nicht mehr die Decke an, sondern die Tür, und wartet, dass jemand kommt, dem er nicht sagen muss, er sei wach.<br><br>Die Vier bleibt im Regal. Ihr Körper ist nicht mehr auf der Station, und der Uhrmacher sagt nicht, wo. Er sagt nur, dass er warten kann.<br><br>Elias behält seine Uhr. Sie geht vorwärts. Er zieht sie nie wieder ganz auf — aber er zieht sie auf.'],
    akte:      ['Die Akte', 'Beide Uhren stehen. Aber Elias hat mit jedem in diesem Haus gesprochen — und alle haben etwas gesagt, das in keiner Akte steht.<br><br>Um sechs schließt Beatrice die Tür der Zelle zwölf auf, ohne etwas zu notieren. Nr. 21 und Nr. 09 stehen im Korridor und sehen ihn zum ersten Mal an, statt durch ihn hindurch.<br><br>Die Uhren im Regal gehen wieder. Alle vier.']
  }[art];
  sag('Elias', '(Die Uhr in meiner Hand wird schwer.)');
  setTimeout(() => endeZeigen(E[0], E[1]), 2600);
}
function endeZeigen(titel, text) {
  document.getElementById('endetitel').textContent = titel;
  document.getElementById('endetext').innerHTML = text;
  document.getElementById('ende').classList.add('an');
  document.getElementById('uhr').classList.add('aus');
  Ton.melodie(false);
}
const AKT_INDEX = { 0: 0, 1: 1, 2: 2, 3: 3, 3.5: 4, 4: 5 };
function aufstellung(name) { const a = AKTE[AKT_INDEX[S.akt] === undefined ? AKTE.length - 1 : AKT_INDEX[S.akt]]; return a ? a[name] : null; }
function istHier(name) { const a = aufstellung(name); return a && a.szene === S.szene; }

/* Akt weiterschalten — mit einem Satz, der sagt, dass sich etwas verschoben hat */
function aktSetzen(n) {
  if (S.akt >= n) return;
  S.akt = n;
  /* Figuren auf ihre neuen Plätze setzen */
  const m = aufstellung('milo'); if (m) S.milo.x = m.x;
  const b = aufstellung('beatrice'); if (b) { S.bea.x = b.x; S.bea.ziel = b.x; S.bea.geht = false; S.bea.wartet = 3; }
  const w = aufstellung('wren'); if (w) S.wren.x = w.x;
  Ton.melodie(true);
}

/* Beim Betreten eines Raums spricht, wer dort wartet */
function beimBetreten(szene) {
  const k = S.akt + ':' + szene;
  if (S.angesprochen[k]) return;
  S.angesprochen[k] = true;
  const T = trance();
  if (szene === 'korridor' && S.akt === 1)
    return sag('Milo', '(ohne aufzusehen) „Du bist spät. Ich hab dich vor einer Stunde gezeichnet.“');
  if (szene === 'korridor' && S.akt === 2)
    return sag('Dr. Wren', '„Herr Vogt. Bleiben Sie doch bei den Türen, die es gibt.“',
                           '(Er steht genau vor der zugemauerten Nische. Zufällig, sagt sein Gesicht.)');
  if (szene === 'zelle' && S.akt === 2)
    return sag('Beatrice', '„Ihr Bett ist leer, Herr Vogt. Ich habe nachgesehen.“',
                           '„Ich schreibe es nicht auf. Aber Dr. Blackwell hat gefragt, wo Sie sind.“');
  if (szene === 'korridor' && S.akt === 3)
    return sag('Dr. Blackwell', '„Siebzehn. Sie haben Erde an den Schuhen.“',
                               '„Der Hof ist nachts abgeschlossen. Erklären Sie mir das nicht. Ich will es nicht wissen.“');
  if (szene === 'hof' && S.akt === 3)
    return sag('Clara', '„Sie lassen uns nachts raus, wenn die Uhren nicht gehen.“', '„Deine geht. Das ist das Problem.“');
  if (szene === 'kapelle' && S.akt === 3.5)
    return sag('Beatrice', '(Sie kniet am Altar, den Rücken zu mir, und betet zu laut, um mich nicht zu hören.)',
                           '„Wer nachts läutet, Herr Vogt, will gefunden werden. Ich habe Sie gefunden. Ich sage es niemandem.“');
  if (szene === 'zelle' && S.akt === 4)
    return sag('Milo', '(Er sitzt auf meiner Pritsche und zeichnet auf meine Wand.)',
                       '„Ich hab den Mann mit dem Uhrengesicht gezeichnet. Er ist jetzt in deinem Zimmer. Hier, auf dem Bild.“');
  if (szene === 'wren' && S.akt >= 4)
    return sag('Schwester Aria', '(Sie steht am Fenster, mit dem Rücken zu mir.)',
                                 '„Er hat vier Uhren im Regal, Herr Vogt. Er hat Platz für eine fünfte.“',
                                 '„Lesen Sie die Akte. Dann wissen Sie, welche Zahl draufsteht.“');
  if (szene === 'zelle' && S.akt === 1)
    return sag('Schwester Aria', '(durch die Klappe) „Ich bin nicht Beatrice. Ich frage nicht, ob Sie liegen.“',
                                 '„Ich sage nur: Die Neun ist heute Nacht wieder im Korridor. Gehen Sie nicht an ihr vorbei, ohne zu grüßen.“');
  if (szene === 'korridor' && S.akt === 4)
    return sag('Bruder Matthias', '„Wren ist heute Nacht nicht im Haus, Vogt. Sein Zimmer ist leer.“',
                                  '„Beatrice steht seit einer Stunde an der Mauer und horcht. Fragen Sie sie nicht, worauf.“');
}

/* Wer nah steht, reagiert auf die Uhr */
function reaktionAufUhr() {
  const n = S.elias.x;
  const nah = (name, x) => istHier(name) && Math.abs(x - n) < 240;
  if (nah('beatrice', S.bea.x)) return sag('Beatrice', trance() ? '„Ihre Augen, Herr Vogt.“' : '„… und wieder da. Sie waren kurz nicht hier.“');
  if (nah('wren', S.wren.x)) return sag('Dr. Wren', trance() ? '„Ganz aufgezogen. Das war nicht vorgesehen. Aber interessant.“' : '„Schreiben Sie es auf. Alles.“');
  if (nah('milo', S.milo.x)) return sag('Milo', trance() ? '„Jetzt siehst du es auch.“' : '„Weg. Und wieder da. Wie auf meinen Blättern.“');
  const cl = aufstellung('clara'); if (cl && nah('clara', cl.x)) return sag('Clara', trance() ? '„Deine Uhr geht. Meine steht. Deshalb wachsen sie mir aus dem Kopf.“' : '„Mach das nicht zu oft. Es bleibt was hängen.“');
  const bw = aufstellung('blackwell'); if (bw && nah('blackwell', bw.x)) return sag('Dr. Blackwell', trance() ? '„So sehen Sie mich also. Ich hätte mir mehr erhofft.“' : '„Was auch immer das war — es steht ab morgen in Ihrer Akte.“');
}
