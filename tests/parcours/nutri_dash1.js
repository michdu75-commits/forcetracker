/* ══════════════════════════════════════════════════════════════════════════════════════
   🍽️ NUTRITION LOT 2 — NUT-DASH1 : LA TUILE « NUTRITION » DU TABLEAU DE BORD AFFICHE LA CIBLE,
   PAS LA DÉPENSE (01/10/2026, session-B, à la demande de Michel) — blocs B-CDXX → B-CDXXI.

   LE DÉFAUT (docs/SUIVI-AUDIT.md, dette NUT-DASH1) : `dashboard.js` lisait `m.kcal || m.cal` et
   `m.prot || m.p` sur `calcMacros(...)`, qui rend `calories` et `prot_g`. Les deux lectures valaient
   `undefined`, le repli sur `calcTDEE()` affichait la DÉPENSE sous « Objectif du jour », et les
   protéines ne s'affichaient jamais. Mesuré sur master `21eddae3` : 130 kg perte décharge → 2 482
   au lieu de 1 932 ; 85 kg muscle → 2 759 au lieu de 3 209 ; cible manuelle 2 000 → 2 759.

   L'INVARIANT DEMANDÉ : tuile du tableau de bord === « Cible » de l'onglet Nutrition (même profil,
   même jour, même cycle), protéines === « Protéines » de l'onglet ; aucun chiffre sans cible.
   ⛔ Les deux côtés sont LUS dans le rendu réel (index.html → renderNutrition ; dashboard.html →
   renderDashboard), jamais recalculés ici. Profils = valeurs de TEST. Contrôle négatif :
   `tools/mut_nutri_dash1.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');
const GEL = '2026-09-20T12:00:00';   // un dimanche
const PROFILS = {
  A1: { ft4_bw: '85', ft4_age: '40', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'muscle', ft4_nphase: 'charge' },
  D1: { ft4_bw: '130', ft4_age: '60', ft4_ht: '170', ft4_gender: 'H', ft4_act: '1.2', ft4_goal: 'perte', ft4_nphase: 'decharge' },
  MAN: { ft4_bw: '85', ft4_age: '40', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'muscle', ft4_nphase: 'charge', ft4_manualkcal: '2000' },
  GAP: { ft4_bw: '100', ft4_age: '40', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'perte', ft4_nphase: 'charge', ft4_manualkcal: '800' },
  B1: { ft4_age: '40', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'perte', ft4_nphase: 'charge' },
  B2: { ft4_age: '40', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'perte', ft4_nphase: 'charge', ft4_manualkcal: '2000' },
  NEUF: { ft4_bw: '80', ft4_age: '35', ft4_ht: '175', ft4_gender: 'H', ft4_goal: 'muscle', ft4_nphase: 'charge' },
};

module.exports.source = function (t, ROOT, fs, path) {
  const DJ = _sansCommentaires(fs.readFileSync(path.join(ROOT, 'dashboard.js'), 'utf8')).replace(/\s+/g, '');
  const j = DJ.indexOf("T.push(_dTuile({titre:'Nutrition'"), i = DJ.lastIndexOf('letkcal=null,prot=null;', j);
  const bloc = (i >= 0 && j > i) ? DJ.slice(i, j) : '';
  console.log('\n═══ B-CDXX. NUT-DASH1 — la tuile Nutrition lit les clés de `calcMacros` (source) ═══');
  t('B-CDXX ① la tuile lit `calories` et `prot_g`, les clés que `calcMacros` rend',
    bloc.includes('kcal=m.calories!=null?m.calories:null;') && bloc.includes('prot=m.prot_g!=null?m.prot_g:null;'),
    bloc.slice(0, 300));
  t('B-CDXX ② plus aucune ancienne clé (`m.kcal`, `m.cal`, `m.prot`, `m.p`) sur l\'objet de `calcMacros`',
    bloc.length > 0 && !/\bm\.(kcal|cal|prot|p)\b/.test(bloc), bloc.slice(0, 300));
  t('B-CDXX ③ ⛔ plus de repli sur la dépense : `calcTDEE` n\'alimente plus la tuile',
    bloc.length > 0 && !/calcTDEE/.test(bloc), bloc.slice(0, 300));
};

/* Pose un profil sur le disque (le vrai chemin `localStorage → load()`), avec des séances si demandé. */
const _poserLS = `(D, ses) => {
  localStorage.clear();
  Object.keys(D).forEach(k => localStorage.setItem(k, D[k]));
  if (D.ft4_act) localStorage.setItem('ft4_act_src', 'choisi');
  localStorage.setItem('ft4_work', 'bureau'); localStorage.setItem('ft4_ob2', '1');
  if (ses) {
    const T = new Date('2026-09-20T12:00:00'), s = [];
    for (let d = 0; d < 28; d++) { const x = new Date(T - d * 864e5);
      if (ses.includes(x.getDay())) s.push({ date: x.toISOString().slice(0, 10), exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true }] }] }); }
    localStorage.setItem('ft4_sessions', JSON.stringify(s));
  }
}`;

async function _ctx(b) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 }, timezoneId: 'Europe/Paris' });
  await cx.addInitScript(`(()=>{const F=new Date(${JSON.stringify(GEL)});const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
      static now(){return F.getTime();}};})();`);
  return cx;
}

module.exports.ecran = async function (t, b, PORT) {
  const cx = await _ctx(b);
  const pn = await cx.newPage(), pd = await cx.newPage();
  const errs = []; pn.on('pageerror', e => errs.push('index: ' + e.message)); pd.on('pageerror', e => errs.push('dashboard: ' + e.message));
  await pn.goto('http://localhost:' + PORT + '/index.html'); await pn.waitForTimeout(2200);
  await pd.goto('http://localhost:' + PORT + '/dashboard.html'); await pd.waitForTimeout(1500);
  console.log('\n-- B-CDXXI. NUT-DASH1 — tableau de bord et onglet Nutrition, même profil, même jour (rendu réel) --');

  /* L'onglet Nutrition : « Cible » et « Protéines » LUES dans l'écran rendu. */
  const nutri = (D, ses) => pn.evaluate(({ D, ses, src }) => {
    eval(src)(D, ses); load(); renderNutrition();
    const m = calcMacros(S.nutritionPhase);
    return { cible: document.getElementById('m-kcal').textContent.trim(), prot: document.getElementById('m-prot').textContent.trim(),
             tdee: calcTDEE(), jour: m.cycle ? m.cycle.jour : null };
  }, { D, ses: ses || null, src: _poserLS });
  /* Le tableau de bord : la tuile « Nutrition » LUE dans le rendu de `renderDashboard`. */
  const dash = (D, ses, casser) => pd.evaluate(({ D, ses, src, casser }) => {
    eval(src)(D, ses);
    const vrai = window.calcMacros;
    if (casser) window.calcMacros = () => { throw new Error('panne simulée'); };
    try { renderDashboard(); } finally { window.calcMacros = vrai; }
    const tu = [...document.querySelectorAll('#dash-kpis .kpi')].find(k => (k.querySelector('.kpi-t') || {}).textContent === 'Nutrition');
    if (!tu) return { absente: true };
    const v = tu.querySelector('.kpi-v'), s = tu.querySelector('.kpi-s'), vide = tu.querySelector('.vide');
    return { kcal: v ? v.textContent.replace(/kcal/, '').trim() : null, sous: s ? s.textContent.trim() : null,
             vide: vide ? vide.textContent.trim() : null, texte: tu.textContent.replace(/\s+/g, ' ').trim() };
  }, { D, ses: ses || null, src: _poserLS, casser: !!casser });
  const nb = s => (s == null ? null : (String(s).replace(/[\s  ]/g, '') || null));
  const det = (n, d) => 'Nutrition ' + JSON.stringify(n) + ' | tableau de bord ' + JSON.stringify(d);
  const meme = (n, d) => !d.absente && n.cible !== '—' && nb(d.kcal) === nb(n.cible)
    && (n.prot === '—' ? d.sous === 'Objectif du jour' : d.sous === 'Protéines ' + nb(n.prot) + ' g');

  const A = [await nutri(PROFILS.A1), await dash(PROFILS.A1)];
  t('B-CDXXI A profil normal (85 kg muscle) : tuile = Cible de l\'onglet (3209), protéines = onglet (187 g), pas le TDEE (2759)',
    meme(...A) && nb(A[1].kcal) === '3209' && A[1].sous === 'Protéines 187 g' && nb(A[1].kcal) !== String(A[0].tdee), det(...A));

  const B = [await nutri(PROFILS.D1), await dash(PROFILS.D1)];
  t('B-CDXXI B ⭐ D1 (130 kg perte décharge) : TDEE 2482 ≠ cible 1932 — la tuile affiche la CIBLE 1932',
    B[0].tdee === 2482 && nb(B[0].cible) === '1932' && meme(...B) && nb(B[1].kcal) === '1932' && B[1].sous === 'Protéines 325 g',
    det(...B));

  const C = [await nutri(PROFILS.D1, [0, 3]), await dash(PROFILS.D1, [0, 3])];
  const C2 = [await nutri(PROFILS.A1, [0, 2, 4, 6]), await dash(PROFILS.A1, [0, 2, 4, 6])];
  /* NUT-LIPIDES-25-01 (02/10) : D1 n'a plus de cycle séance/repos (lipides 54 g < plancher du cycle 0,6 g/kg
     = 78 g) — la tuile doit toujours égaler l'onglet ; c'est A1 qui porte désormais le « cycle actif ». */
  t('B-CDXXI C jour de SÉANCE : tuile = Cible de l\'onglet ce jour-là (D1 1932 sans cycle depuis NUT-LIPIDES-25-01, A1 3209 cycle actif)',
    C[0].jour === null && meme(...C) && nb(C[1].kcal) === '1932' && C2[0].jour === 'seance' && meme(...C2) && nb(C2[1].kcal) === '3209',
    det(...C) + ' || ' + det(...C2));

  const D = [await nutri(PROFILS.D1, [1, 4]), await dash(PROFILS.D1, [1, 4])];
  const D2 = [await nutri(PROFILS.A1, [1, 2, 4, 6]), await dash(PROFILS.A1, [1, 2, 4, 6])];
  t('B-CDXXI D jour de REPOS : tuile = Cible de l\'onglet ce jour-là (D1 1932 sans cycle depuis NUT-LIPIDES-25-01, A1 3209 cycle actif)',
    D[0].jour === null && meme(...D) && nb(D[1].kcal) === '1932' && D2[0].jour === 'repos' && meme(...D2) && nb(D2[1].kcal) === '3209',
    det(...D) + ' || ' + det(...D2));

  const E = [await nutri(PROFILS.MAN), await dash(PROFILS.MAN)];
  const E2 = [await nutri(PROFILS.GAP), await dash(PROFILS.GAP)];
  t('B-CDXXI E cible MANUELLE respectée : 2000 tapés (TDEE 2759) → 2000 ; 800 tapés à 100 kg → 800, protéines 250 g',
    meme(...E) && nb(E[1].kcal) === '2000' && E[0].tdee === 2759 && meme(...E2) && nb(E2[1].kcal) === '800' && E2[1].sous === 'Protéines 250 g',
    det(...E) + ' || ' + det(...E2));

  const F = [await nutri(PROFILS.B1), await dash(PROFILS.B1)];
  const F2 = [await nutri(PROFILS.NEUF), await dash(PROFILS.NEUF)];
  t('B-CDXXI F profil INCOMPLET (sans poids ; sans niveau d\'activité) : aucun chiffre, le message historique',
    F[0].cible === '—' && F[1].kcal == null && /^Complète ton profil/.test(F[1].vide || '') && !/\d/.test(F[1].vide || '')
    && F2[0].cible === '—' && F2[1].kcal == null && /^Complète ton profil/.test(F2[1].vide || ''),
    det(...F) + ' || ' + det(...F2));

  const F3 = [await nutri(PROFILS.B2), await dash(PROFILS.B2)];
  t('B-CDXXI F′ cible manuelle SANS poids : la tuile suit « Cible » de l\'onglet (2000) et n\'invente pas de protéines',
    F3[0].prot === '—' && meme(...F3) && nb(F3[1].kcal) === '2000' && F3[1].sous === 'Objectif du jour', det(...F3));

  const G = await dash(PROFILS.D1, null, true);
  t('B-CDXXI G ⛔ `calcMacros` en panne : la tuile ne retombe PAS sur la dépense (2482), elle ne donne aucun chiffre',
    G.kcal == null && /^Complète ton profil/.test(G.vide || '') && !/2\s?482/.test(G.texte || ''), JSON.stringify(G));

  t('B-CDXXI aucune erreur de page pendant ces rendus', errs.length === 0, errs.slice(0, 3).join(' | '));
  await cx.close();
};
