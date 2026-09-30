#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🔬 MILO-SEANCE-FP-01 — CORPUS DIFFÉRENTIEL : master est la référence, FP-01 n'a le droit de retirer
   que ce qu'un veto méta justifie (session-B, réécrit le 30/09/2026 — décision de Michel).

   CE QU'IL PROUVE. Sur le même corpus, `_demandeUneSeance` de MASTER (extraite pour de vrai de git,
   jamais reconstruite à la main) contre celle de la branche :
     · MASTER VRAI → FINAL FAUX, classé en
         A · veto méta justifié   — la phrase est une MÉTA-DISCUSSION par construction (étiquette M) ;
         B · régression interdite — tout le reste (demande D, cas ambigu Q, neutre N).   ⛔ B DOIT VALOIR 0.
     · MASTER FAUX → FINAL VRAI (nouvelle détection)                                     ⛔ DOIT VALOIR 0.
   ⭐ NON TAUTOLOGIQUE : l'étiquette vient du GABARIT qui a fabriqué la phrase (ou d'une liste écrite à
   la main), jamais des expressions régulières du code métier. Une phrase de demande perdue compte en B
   même si le code « croit » y voir de la méta.
   ⭐ L'OUTIL S'ÉPROUVE LUI-MÊME (--auto-test) : on lui donne des détecteurs volontairement mauvais
   (« bouton présent = rejet », veto trop large, fenêtre libre de 40 caractères, et les versions
   intermédiaires de la branche quand git les a) ; il doit les voir TOUS. Sinon : code 2, OUTIL AVEUGLE.
   ⚠️ CE QU'IL NE DIT PAS : qu'une phrase réelle hors corpus se comporte bien. Le corpus est
   combinatoire + une liste écrite à la main, pas un échantillon de vrais messages.
   Usage : node tools/corpus_fp01.js [--ref 7a71649e] [--final WT|<commit>] [--auto-test]
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const REF = opt('--ref', '7a71649e');           // origin/master le 30/09/2026 (ft-v1243)
const FINAL = opt('--final', 'WT');

// ── extraction RÉELLE : la fonction + les fonctions `_xxx` du même fichier qu'elle appelle ──────
const srcOf = rev => rev === 'WT' ? fs.readFileSync(path.join(ROOT, 'coach.js'), 'utf8')
  : execSync('git show ' + rev + ':coach.js', { cwd: ROOT, maxBuffer: 1e8, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
function corps(src, nom) {
  const i = src.indexOf('\nfunction ' + nom + '(');
  if (i < 0) return '';
  const j = src.indexOf('\nfunction ', i + 10);
  return src.slice(i + 1, j < 0 ? undefined : j);
}
function fnOf(src) {
  const vus = new Set(['_demandeUneSeance']); const morceaux = [];
  const file = ['_demandeUneSeance'];
  while (file.length) {
    const nom = file.shift(); const c = corps(src, nom);
    if (!c) { if (nom === '_demandeUneSeance') throw new Error('_demandeUneSeance introuvable'); continue; }
    morceaux.push(c);
    for (const m of c.matchAll(/\b(_[A-Za-z]\w*)\(/g)) if (!vus.has(m[1])) { vus.add(m[1]); file.push(m[1]); }
  }
  return new Function(morceaux.join('\n') + '\nreturn _demandeUneSeance;')();
}
const dispo = rev => { try { srcOf(rev); return true; } catch (e) { return false; } };

// ── LE CORPUS, ÉTIQUETÉ PAR CONSTRUCTION ─────────────────────────────────────────────────────
// D = demande explicite · M = méta-discussion (le bouton, la carte, l'affichage, le refus) ·
// Q = cas ambigu (récit / plainte hypothétique : master est conservé) · N = neutre / hors demande
const corpus = [];
const add = (x, lab, fam) => corpus.push({ x, lab, fam });
const cap = s => s[0].toUpperCase() + s.slice(1);
const min = s => (/^(Je|J’|J'|Tu|Il|On|Est|Go|Encore|Peux|Pourrais|Une|Ma|La|Nouvelle|Séance)\b/.test(s) ? s[0].toLowerCase() + s.slice(1) : s[0].toLowerCase() + s.slice(1));
const OBJ = ['une séance', 'une séance jambes', 'ma séance du jour', 'une petite séance', 'une nouvelle séance', 'la séance du jour', 'une séance de 45 minutes'];
const DEM = ['Fais-moi {S}', 'Prépare-moi {S}', 'Donne-moi {S}', 'Propose-moi {S}', 'Envoie-moi {S}', 'Lance {S}', 'Refais-moi {S}',
  'Tu peux me faire {S}', 'Tu peux me préparer {S}', 'Tu peux me refaire {S}', 'Peux-tu me faire {S}', 'Pourrais-tu me préparer {S}',
  'Tu pourrais me proposer {S}', 'Est-ce que tu peux me faire {S}', 'Tu me prépares {S}', 'Tu me fais {S}', 'Tu me proposes {S}',
  'Tu me refais {S}', 'Je veux {S}', 'Je voudrais {S}', 'J’aimerais {S}', 'Il me faut {S}', 'Je veux démarrer {S}', 'Je veux faire {S}',
  'Je peux avoir {S}', 'On fait {S}', 'Je veux bien {S}', 'Go {S}', '{S} stp', 'Encore {S} stp'];
const REM = ['le bouton bug', 'mais le bouton bug', 'le bouton ne marche plus', 'ça affiche un bug', 'le bouton s’affiche mal', 'l’affichage bug',
  'le bouton a disparu', 'la carte bug', 'j’ai eu un bug', 'le bouton est apparu deux fois', 'la carte s’affiche en double'];
const SEP = [', ', ' ? ', '. ', ' — ', ' '];
const demandes = [];
for (const k of DEM) for (const o of OBJ) demandes.push(cap(k.replace('{S}', o)));
for (const d of ['Nouvelle séance stp', 'Séance du jour ?', 'Une autre séance stp', 'Une séance jambes stp']) demandes.push(d);
for (const d of demandes) {
  add(d, 'D', 'demande seule');
  for (const r of REM) for (const s of SEP) { add(d + s + r, 'D', 'demande + remarque'); add(cap(r) + s + min(d), 'D', 'remarque + demande'); }
}
// M · les structures de méta-discussion (les exemples de Michel et leurs variantes)
const S0 = ['une séance', 'la séance', 'ma séance du jour', 'une nouvelle séance'];
const meta = [];
const PREF = ['Le ', 'Ya le ', 'Non ya le ', 'Il y a le ', 'Je parle juste du ', 'Je parle du ', 'Encore le ', 'Tu peux enlever le ', 'Je clique sur le ', 'Regarde le ', 'Ton '];
const TETE = ['bouton démarrer {S}', 'bouton pour faire {S}', 'bouton pour préparer {S}', 'bouton pour refaire {S}', 'bouton pour lancer {S}',
  'bouton « Démarrer {S} »', 'bouton "démarrer {S}"', 'bouton refait {S}', 'bouton démarre {S}'];
const SUF = ['', ' bug', ' ne marche plus', ' qui est arrivé', ' s’affiche encore', ' est revenu', ' a disparu', ' et rien ne se passe', ', tu peux le retirer ?', ' !!!', '...'];
for (const a of PREF) for (const h of TETE) for (const o of S0) for (const s of SUF) meta.push([a + h.replace('{S}', o) + s, 'bouton + libellé']);
for (const o of S0) for (const k of ['La carte {S} bug', 'Tu peux regarder le bug de la carte {S} ?', 'Encore la carte {S}', 'la carte {S} est revenue'])
  meta.push([cap(k.replace('{S}', o)), 'carte + libellé']);
const NEG = ['Je ne demande pas {S}', 'Je veux pas {S}', 'Je voulais pas {S}', 'Je ne veux pas {S}', 'Je t’ai pas demandé {S}', 'Je n’ai jamais demandé {S}'];
const SUFN = ['', ', je parle du bouton', ', le bouton bug', ' maintenant', ', merci', ', c’est le bouton qui bug', '.', ' lol'];
for (const k of NEG) for (const o of S0) for (const s of SUFN) meta.push([k.replace('{S}', o) + s, 'refus']);
for (const k of ['Pas besoin de la séance', 'Pas besoin d’une séance', 'Pas besoin d’une nouvelle séance']) for (const s of SUFN) meta.push([k + s, 'refus']);
const AFF = ['Tu m’as encore affiché {S}', 'Ça affiche {S}', 'Il m’a affiché {S}', 'L’app affiche {S}', 'Ça m’affiche encore {S}', 'Tu m’as affiché {S}'];
for (const k of AFF) for (const o of S0) for (const s of ['', ' alors qu’on parlait d’autre chose', ', c’est un bug', ' sous ta réponse', ' sans raison']) meta.push([k.replace('{S}', o) + s, 'affichage']);
for (const o of S0) for (const k of ['{S} apparaît sous chaque réponse', '{S} est apparue', '{S} s’affiche encore', '{S} s’est affichée toute seule', 'Encore {S} qui apparaît'])
  meta.push([cap(k.replace('{S}', o)), 'apparition']);
meta.push(['le bouton lance une séance', 'bouton + verbe de la règle ① (hors lot)'], ['Le bouton fait une séance tout seul', 'bouton + verbe de la règle ① (hors lot)']);
for (const [x, fam] of meta) add(x, 'M', fam);
// D · une vraie demande DANS un message qui contient aussi une structure méta (mixte)
const metaEchantillon = meta.filter((m, i) => i % 7 === 0).map(m => m[0].replace(/[.!…]+$/, ''));
const PRON = [', tu peux m’en faire une ?', ', fais-m’en une', ', prépare-m’en une autre', ', j’en voudrais une', ', tu m’en prépares une ?', '. Tu peux m’en refaire une ?', ', du coup donne-m’en une'];
const demEch = ['Fais-moi une séance', 'Je voudrais une séance jambes', 'J’aimerais une séance', 'Il me faut une séance', 'Une séance jambes stp', 'Tu me prépares une séance ?', 'Nouvelle séance stp'];
for (const m of metaEchantillon) {
  for (const p of PRON) add(m + p, 'D', 'méta + demande par pronom');
  for (const d of demEch) { add(m + ', ' + min(d), 'D', 'méta + demande'); add(d + ', ' + min(m), 'D', 'demande + méta'); add(m + '. ' + d, 'D', 'méta. demande'); }
}
// Q · cas ambigus : récit ou plainte hypothétique — pas une catégorie de veto démontrée, master conservé
const QG = ['Quand je veux {S} le bouton bug', 'Quand je veux {S}, ça affiche un bug', 'Chaque fois que tu me prépares {S} le bouton bug',
  'Si je veux que tu me prépares {S}, ça affiche un bug', 'Je refais {S} et le bouton bug', 'Lorsque je lance {S} le bouton bug',
  'Quand je demande {S} rien ne s’affiche', 'À chaque fois que je fais {S} ça bug', 'Quand tu peux me faire {S}, le bouton bug'];
for (const k of QG) for (const o of S0) add(k.replace('{S}', o), 'Q', 'ambigu');
// N · neutre ou hors demande (dont les « compléments » : on demande un résumé, un avis… d'une séance)
for (const x of ['Tu peux me faire un résumé de ma dernière séance ?', 'Tu peux me donner ton avis sur cette séance ?', 'Tu peux me faire un plan de séance ?',
  'Tu peux me faire ta séance ?', 'Tu peux me donner le détail de cette séance ?', 'Tu peux m’écrire le récap de cette séance ?', 'Pourrais-tu me faire un bilan de cette séance ?',
  'le bouton bug', 'salut ça va', 'merci pour tout', 'le bouton ne marche plus', 'j’ai mal au genou', 'combien de protéines par jour ?'])
  add(x, 'N', 'neutre');
// ✍️ ÉCRITES À LA MAIN (29-30/09), étiquetées à la lecture, AVANT tout calcul — la part non combinatoire
const MAIN = [
  ['D', 'salut, je voudrais une séance haut du corps stp, au fait le bouton démarrer bug'],
  ['D', 'Yo, une séance jambes ce soir ? (le bouton bug encore)'],
  ['D', 'Tu peux me refaire une séance comme hier ? le bouton a planté'],
  ['D', 'Il me faut une petite séance rapide, et y a un bug d’affichage'],
  ['D', 'Nouvelle séance stp, l’autre a buggé'],
  ['D', 'Je voudrais bien une séance, mais le bouton démarrer une séance ne marche pas'],
  ['D', 'Le bouton démarrer une séance ne marche pas, du coup fais-moi une séance ici'],
  ['D', 'Le bouton pour faire une séance bug, tu peux m’en préparer une ?'],
  ['D', 'J’aimerais une séance pecs, par contre la carte s’affiche mal'],
  ['D', 'Go une séance full body, le bouton est apparu 2 fois'],
  ['D', 'Une séance dos biceps please, et répare le bouton lol'],
  ['D', 'je veux une séance courte aujourd’hui, le bouton bug depuis ce matin'],
  ['D', 'ok ça bug, prépare-moi une séance quand même'],
  ['D', 'Je veux pas une séance trop longue, fais-la courte'],
  ['D', 'je veux pas une séance jambes, plutôt une séance pecs'],
  ['D', 'Le bouton bug mais j’ai besoin d’une séance ce soir'],
  ['D', 'Tu me proposes une séance ? le bouton démarrer ne répond plus'],
  ['D', 'Ma séance du jour stp, l’affichage déconne'],
  ['D', 'Encore un bug… bon, une séance haut du corps stp'],
  ['D', 'J’aimerais une nouvelle séance, la carte d’hier bug'],
  ['M', 'Ya le bouton démarrer une séance qui est arrivé'],
  ['M', 'Non ya le bouton démarrer une séance'],
  ['M', 'Le bouton pour faire une séance bug'],
  ['M', 'Le bouton pour préparer une séance ne marche plus'],
  ['M', 'Le bouton pour refaire une séance bug'],
  ['M', 'Je parle juste du bouton pour faire une séance'],
  ['M', 'Je ne demande pas une séance'],
  ['M', 'le bouton démarrer une séance est apparu sous ta réponse'],
  ['M', 'Ton bouton démarrer une séance est cassé'],
  ['M', 'encore la carte une séance lol'],
  ['M', 'je t’ai pas demandé une séance'],
  ['M', 'Je ne demande pas une séance, je parle du bug'],
  ['M', 'Tu m’as affiché une séance alors que je parlais de nutrition'],
  ['M', 'ça m’affiche encore une séance'],
  ['M', 'une séance est apparue toute seule'],
  ['M', 'pas besoin d’une séance merci'],
  ['M', 'Il y a un bug, ça affiche une séance'],
  ['M', 'une séance apparaît sous chaque réponse'],
  ['M', 'le bouton pour faire une séance, tu peux le retirer ?'],
  ['M', 'Tu peux enlever le bouton démarrer une séance ?'],
  ['Q', 'Quand je veux une séance le bouton bug'],
  ['Q', 'Je refais une séance et le bouton bug'],
  ['Q', 'Chaque fois que tu me prépares une séance, le bouton bug'],
  ['Q', 'Si je veux que tu me prépares une séance, ça affiche un bug'],
  ['Q', 'À chaque fois que je lance une séance l’app plante'],
  ['Q', 'Si je fais une séance ce soir, le bouton va encore bugger ?'],
  ['N', 'le bouton bug encore'],
  ['N', 'Tu peux me faire un résumé de ma dernière séance ?'],
  ['N', 'c’est quoi le bouton rouge ?'],
  ['N', 'merci Milo'],
];
for (const [lab, x] of MAIN) add(x, lab, 'écrite à la main');

// ── LE DIFFÉRENTIEL ──────────────────────────────────────────────────────────────────────────
function differentiel(fm, ff) {
  const r = { A: [], B: [], nouvelles: [], metaVraies: [] };
  for (const c of corpus) {
    const a = fm(c.x), b = ff(c.x);
    if (a && !b) (c.lab === 'M' ? r.A : r.B).push(c);
    if (!a && b) r.nouvelles.push(c);
    if (c.lab === 'M' && a && b) r.metaVraies.push(c);
  }
  return r;
}
const parFam = l => Object.entries(l.reduce((o, c) => (o[c.lab + ' · ' + c.fam] = (o[c.lab + ' · ' + c.fam] || 0) + 1, o), {})).map(([k, n]) => n + ' ' + k).join(' · ');
const ex = (l, n) => l.slice(0, n).map(c => '« ' + c.x + ' »').join(' | ');

const fMaster = fnOf(srcOf(REF));
let origin = '?'; try { origin = execSync('git rev-parse --short=8 origin/master', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch (e) {}

if (args.includes('--auto-test')) {
  // des détecteurs VOLONTAIREMENT mauvais : l'outil doit tous les voir
  const bouton = x => /bouton|bug|affich/i.test(x) ? false : fMaster(x);
  const large = x => /s[ée]ance/i.test(x) && /bouton|carte|bug|affich|appar/i.test(x) ? false : fMaster(x);
  const fenetre = x => fMaster(x) || /\b(?:tu\s+peux|peux[- ]tu|pourrais[- ]tu)\s+(?:me\s+|m['’]\s*)\w+\b[^.?!\n]{0,40}\bs[ée]ance\b/i.test(x);
  const cas = [['identité (final = master)', fMaster, r => !r.A.length && !r.B.length && !r.nouvelles.length],
    ['« bouton / bug / affich » présent = rejet', bouton, r => r.B.length > 0],
    ['veto trop large (séance + bouton n\'importe où)', large, r => r.B.length > 0],
    ['fenêtre libre de 40 caractères', fenetre, r => r.nouvelles.length > 0]];
  for (const rev of ['5158c582', '251e3044', 'b45b2e2a']) if (dispo(rev)) cas.push(['branche à ' + rev + ' (régressions connues)', fnOf(srcOf(rev)), r => r.B.length > 0]);
  let ok = true;
  for (const [nom, f, attendu] of cas) {
    const r = differentiel(fMaster, f); const bon = attendu(r); ok = ok && bon;
    console.log((bon ? '   OK  ' : '❌ AVEUGLE ') + nom + ' → A=' + r.A.length + ' B=' + r.B.length + ' nouvelles=' + r.nouvelles.length);
  }
  console.log(ok ? '──── AUTO-TEST : l\'outil voit les régressions injectées ────' : '──── ❌ OUTIL AVEUGLE ────');
  process.exit(ok ? 0 : 2);
}

const fFinal = fnOf(srcOf(FINAL));
const r = differentiel(fMaster, fFinal);
const nMain = corpus.filter(c => c.fam === 'écrite à la main').length;
console.log('corpus : ' + corpus.length + ' phrases (' + (corpus.length - nMain) + ' générées · ' + nMain + ' écrites à la main) · référence ' + REF +
  (origin !== '?' ? (origin.startsWith(REF.slice(0, 8)) ? ' (= origin/master)' : ' (⚠️ origin/master = ' + origin + ')') : '') + ' · final ' + FINAL);
console.log('  MASTER VRAI → FINAL FAUX ....................... ' + (r.A.length + r.B.length));
console.log('    A · veto méta justifié ....................... ' + r.A.length + (r.A.length ? '   ' + parFam(r.A) : ''));
console.log('        ex. ' + ex(r.A, 3));
console.log('    B · régression non justifiée ................. ' + r.B.length + '   (attendu 0)' + (r.B.length ? '   ' + parFam(r.B) + '\n        ex. ' + ex(r.B, 5) : ''));
console.log('  MASTER FAUX → FINAL VRAI (nouvelles détections)  ' + r.nouvelles.length + '   (attendu 0)' + (r.nouvelles.length ? '   ex. ' + ex(r.nouvelles, 3) : ''));
console.log('  méta laissées VRAI (faux positifs de master non corrigés) : ' + r.metaVraies.length + (r.metaVraies.length ? '   ' + parFam(r.metaVraies) + '\n        ex. ' + ex(r.metaVraies, 3) : ''));
for (const rev of ['5158c582', '251e3044', 'b45b2e2a']) if (FINAL === 'WT' && dispo(rev)) {
  const ri = differentiel(fMaster, fnOf(srcOf(rev)));
  console.log('  (étape ' + rev + ' : B=' + ri.B.length + ' · nouvelles=' + ri.nouvelles.length + ')');
}
const ok = !r.B.length && !r.nouvelles.length;
console.log(ok ? '──── DIFFÉRENTIEL PROPRE : B = 0, aucune nouvelle détection ────' : '──── ❌ RÉGRESSION : B > 0 ou nouvelle détection ────');
process.exit(ok ? 0 : 1);
