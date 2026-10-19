/* ═══════════════════════════════════════════════════════════════════════════════
   💪🔗 LE RIR EN SUPERSET : UNE QUESTION PAR MOUVEMENT, CHACUNE À SON EXERCICE (19/10/2026, retour de recette iPhone de
   Michel sur le clone D-088, blocs B-RSS-*) — branche locale claude/rir-superset-d088.
   Le retour : *« en prod, pendant le repos d'un superset, le panneau RIR affiche séparément les deux exercices ; dans le
   clone D-088, une seule question générale “Il t'en restait combien ?” »*. ⭐ MESURÉ AVANT D'ÉCRIRE CE BANC : le moteur du
   RIR (`_renderRirRow`, `_rirQuestionHtml`, `setRir`, `_rirDeSet`, le dépôt `_rirPending` dans `toggleSet`, sa consommation
   dans `startRest`) est IDENTIQUE entre la prod ft-v1256 et D-088, et dix parcours réels donnent le même écran sur les deux
   — et à travers le clone publié. La question unique et sans nom apparaît, sur les DEUX versions, quand une seule série
   attend sa réponse au moment du repos : le 2ᵉ exercice validé en premier, ou la page rechargée entre les deux séries.
   Ce banc ne corrige donc rien : il VERROUILLE ce que Michel veut garder (une question par mouvement, nommée, chacune
   enregistrée sur SA série jusqu'à l'historique, l'export et Milo) — vert sur la prod ET sur D-088, rouge dès qu'on le casse
   (contrôle négatif : tools/mut_rir_superset.py, dont P00 = le code de la prod ft-v1256, qui doit rester vert).
   Ce que les témoins CONDUISENT : la vraie app servie en local, de vrais gestes — la coche d'une série, l'ouverture d'une carte,
   les boutons de réponse du repos, « Passer », un vrai rechargement, « Terminer la séance » —, 4 largeurs d'iPhone.
   Ce qu'ils OBSERVENT : le panneau de repos (ouvert ou non, chaque question, le nom qu'elle porte, la série que vise CHACUN de
   ses boutons, la place de chaque bouton à l'écran), la série écrite par chaque réponse (mémoire, brouillon, rechargement,
   séance terminée), les lignes de l'export, le contexte de Milo (construit localement, jamais envoyé), la colonne
   « Précédent » de la séance suivante, les erreurs de page et chaque requête (réseau coupé et compté).
   Ce qu'ils NE COUVRENT PAS : Safari / l'iPhone réel ; ce que la personne comprend ; le SENS des réponses pour Milo (aucun
   appel) ; et ils ne figent PAS le nombre de questions quand l'ordre est inversé ou après un rechargement (comportement
   actuel, identique à la prod, ouvert à décision) — seulement qu'aucune réponse n'y va jamais au mauvais mouvement.
   ═══════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_lms: '2026-10', ft4_sessions: '[]' };
const _det = o => JSON.stringify(o);
const OI = 'Machine Oiseau', MA = 'Marteau', CP = 'Curl Poulie';
const N = (kg, reps) => ({ kg, reps, done: false, type: 'N' }), E = (kg, reps) => ({ kg, reps, done: false, type: 'É' });
const SS = (membres, apres) => ({ date: '__TODAY__', progLabel: 'Test', startHour: 18,
  exs: membres.map(([name, sets]) => ({ name, group: 'ssT', groupType: 'super', sets })).concat(apres || []) });
const TAILLES = [[360, 740], [375, 667], [390, 844], [430, 932]];
const IA = ['coach', 'summarizeCoach', 'seanceJson', 'importProgram', 'importHistory', 'importBodyScan', 'importBloodTest', 'foodLabel', 'readBarcode',
  'morphoAnalysis', 'bodyStudy', 'estimateFood', 'importMealPlan', 'generateMealPlan'];

/* Lectures DANS la page — le panneau de repos tel qu'il est AFFICHÉ (un libellé `.rir-lbl` puis sa rangée `.rir-row`). */
const AIDE = `(()=>{
  window.__rssDock=()=>{ const bar=document.getElementById('rest-bar'), z=document.getElementById('rest-rir');
    const ouvert=!!(bar&&bar.classList.contains('show')&&getComputedStyle(bar).display!=='none');
    const lbls=z?[...z.querySelectorAll('.rir-lbl')]:[], rows=z?[...z.querySelectorAll('.rir-row')]:[];
    const q=lbls.map((l,i)=>{ const btns=rows[i]?[...rows[i].querySelectorAll('.rir-b')].filter(b=>!b.classList.contains('rir-x')):[];
      const cib=[...new Set(btns.map(b=>((b.getAttribute('onclick')||'').match(/setRir\\((\\d+),(\\d+),/)||[]).slice(1,3).join(',')).filter(Boolean))];
      return { texte:l.textContent.replace(/\\s+/g,' ').trim(), nom:((l.querySelector('.rir-nom')||{}).textContent||'').trim(), cibles:cib, n:btns.length,
        on:btns.filter(b=>b.classList.contains('on')).map(b=>((b.getAttribute('onclick')||'').match(/,(\\d+)\\)$/)||[])[1]) }; });
    return { ouvert, q, temps:((document.getElementById('rest-time')||{}).textContent||'').trim(), chrono:(typeof restIv!=='undefined')&&!!restIv }; };
  // Chaque bouton de réponse est-il ENTIER à l'écran, au-dessus de la barre du bas, et non recouvert (le doigt l'atteint) ?
  window.__rssBoutons=()=>{ const nav=document.querySelector('.nav'), haut=nav&&getComputedStyle(nav).display!=='none'?nav.getBoundingClientRect().top:innerHeight;
    return [...document.querySelectorAll('#rest-rir .rir-b')].map(b=>{ const r=b.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
      const dessus=(y>=0&&y<=innerHeight&&x>=0&&x<=innerWidth)?document.elementFromPoint(x,y):null;
      return { ok:r.width>=30&&r.height>=30&&r.top>=-0.5&&r.left>=-0.5&&r.right<=innerWidth+0.5&&r.bottom<=Math.min(innerHeight,haut)+0.5&&!!dessus&&(dessus===b||b.contains(dessus)),
        r:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)] }; }); };
  // Les réponses ENREGISTRÉES, série par série (mémoire), et ce que garde le brouillon sur le disque.
  window.__rssRir=()=>(S.wkt&&S.wkt.exs||[]).map(e=>e.name+':'+(e.sets||[]).map(s=>(s.done?'✓':'·')+(s.rir!=null?s.rir:'')).join(' '));
  window.__rssDisque=()=>{ try{ const w=JSON.parse(localStorage.getItem('ft4_wkt')||'null'); return w?w.exs.map(e=>e.name+':'+(e.sets||[]).map(s=>(s.done?'✓':'·')+(s.rir!=null?s.rir:'')).join(' ')):null; }catch(e){ return 'ERR'; } };
})();`;

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const W = opts.w || 390, H = opts.h || 844;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: W, height: H }, timezoneId: 'Europe/Paris', locale: 'fr-FR', hasTouch: true });
    const req = [];   // toutes les requêtes hors du serveur local : coupées et notées (Milo compris)
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => { const pd = String(rt.request().postData() || '');
      const m = /"action":"([A-Za-z]+)"/.exec(pd) || /[?&]action=([A-Za-z]+)/.exec(rt.request().url());
      req.push({ url: rt.request().url().slice(0, 70), action: m ? m[1] : '' }); return rt.abort(); });
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(opts.sessions || []) });
    if (opts.wkt) { init.ft4_wkt = JSON.stringify(opts.wkt); init.ft4_wkt_draft = JSON.stringify(opts.wkt); }
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_rss'))return; sessionStorage.setItem('_rss','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){} })();`);
    await cx.addInitScript(AIDE);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const X = { cx, pg, errs, req, W, H };
    await apresChargement(X);
    return X;
  };
  const apresChargement = async X => {
    await nettoyer(X.pg);
    await X.pg.evaluate(() => { if (S.wkt && S.wkt.date === '__TODAY__') { S.wkt.date = today(); persist(); } });
    await X.pg.evaluate(() => { goScreen('log', document.getElementById('nb-log')); renderLog(); });
    await X.pg.waitForTimeout(300);
  };
  const nettoyer = pg => pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; });
  const dock = X => X.pg.evaluate(() => window.__rssDock());
  const rir = X => X.pg.evaluate(() => window.__rssRir());
  const appelsIA = X => X.req.filter(r => IA.includes(r.action)).map(r => r.action);
  const visible = (pg, sel) => pg.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => { const r = x.getBoundingClientRect();
      const cs = getComputedStyle(x); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; }); if (!e) return false;
    e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!top && (top === e || e.contains(top)); }, sel);
  const clic = async (pg, sel) => { const loc = pg.locator(sel).filter({ visible: true });
    if (!(await loc.count())) return false; try { await loc.first().click({ timeout: 2500 }); } catch (e) { return false; } await pg.waitForTimeout(250); return true; };
  /* La coche d'une série, comme un doigt : si la carte est repliée, on la déplie d'abord en la touchant — à un endroit NEUTRE
     de la carte (ni bouton, ni vignette, ni nom cliquable : la carte repliée de la prod porte « ⚡ Super »…, celle de D-088 un
     « ▾ »), cherché dans la page puis touché à la souris, pour rester le même geste dans les deux versions. */
  const deplier = async (X, ei) => {
    const p = await X.pg.evaluate(ei => { const bl = document.getElementById('ex-block-' + ei); if (!bl) return null; bl.scrollIntoView({ block: 'center' });
      const r = bl.getBoundingClientRect();
      for (let y = r.top + 8; y < Math.min(r.bottom, innerHeight) - 4; y += 6) for (let x = r.left + 8; x < r.right - 8; x += 10) {
        let e = document.elementFromPoint(x, y); if (!e || !bl.contains(e)) continue; let neutre = true;
        for (let n = e; n && n !== bl; n = n.parentElement) { const tg = n.tagName; if (n.getAttribute('onclick') || /^(BUTTON|INPUT|A|SELECT|TEXTAREA|IMG|LABEL)$/.test(tg)) { neutre = false; break; } }
        if (neutre) return { x, y };
      } return null; }, ei);
    if (!p) return false; await X.pg.mouse.click(p.x, p.y); await X.pg.waitForTimeout(300); return true; };
  const cocher = async (X, ei, si) => { const sel = '#sr-' + ei + '-' + si + ' .chk';
    if (!(await visible(X.pg, sel))) await deplier(X, ei);
    const ok = await clic(X.pg, sel); await nettoyer(X.pg); await X.pg.waitForTimeout(250);
    return ok && await X.pg.evaluate(([ei, si]) => !!(S.wkt && S.wkt.exs[ei] && S.wkt.exs[ei].sets[si] && S.wkt.exs[ei].sets[si].done), [ei, si]); };
  const repondre = (X, ei, si, n) => clic(X.pg, '#rest-rir .rir-b[onclick="setRir(' + ei + ',' + si + ',' + n + ')"]');
  const passer = async X => { const ok = await clic(X.pg, '#rest-bar button[onclick="skipRest()"]'); await X.pg.waitForTimeout(250); return ok; };
  /* « Terminer la séance », le bouton du bas de l'écran : `terminerSeance()` depuis D-085 (confirmation s'il reste du travail),
     `finishWorkout()` dans la prod ft-v1256 — le banc conduit les deux, pour rester comparable. */
  const terminer = async X => {
    const ok = (await clic(X.pg, '#log-finish button[onclick="terminerSeance()"]')) || (await clic(X.pg, '#log-finish button[onclick="finishWorkout()"]'));
    await X.pg.waitForTimeout(400);
    if (await X.pg.evaluate(() => { const o = document.getElementById('ov-confirm'); return !!(o && o.classList.contains('open')); }))
      await clic(X.pg, '#ov-confirm button:has-text("Terminer quand même")');
    await X.pg.waitForTimeout(1500); await nettoyer(X.pg);
    return ok; };
  // Une question est-elle À SON EXERCICE ? Une seule série visée, faite, et — si la question porte un nom — le nom de CET exercice.
  const attribuee = (D, wkt) => D.q.every(q => q.cibles.length === 1 && (() => { const [ei, si] = q.cibles[0].split(',').map(Number);
    const ex = wkt.exs[ei], st = ex && ex.sets[si]; return !!st && st.done && (q.nom === '' || q.nom === ex.name) && q.n === 5; })());
  const wktDe = X => X.pg.evaluate(() => JSON.parse(JSON.stringify(S.wkt)));
  const resume = D => _det({ ouvert: D.ouvert, q: D.q.map(q => [q.nom, q.cibles.join('|'), q.n, q.on.join('')]) });

  /* ══ ① AUX QUATRE LARGEURS : L'ORDRE NORMAL D'UN SUPERSET — DEUX QUESTIONS NOMMÉES, CHACUNE À SON EXERCICE ══════════════ */
  for (const [W, H] of TAILLES) {
    const X = await ouvrir({ w: W, h: H, wkt: SS([[OI, [N(35, 12), N(35, 12), N(35, 12)]], [MA, [N(40, 8), N(40, 8), N(40, 8)]]], [{ name: CP, sets: [N(20, 12), N(20, 12)] }]) });
    const a0 = await cocher(X, 0, 0);
    const D1 = await dock(X);
    const versB = await visible(X.pg, '#sr-1-0 .chk');
    t('B-RSS-①a ' + W + ' px : la 1ʳᵉ série du superset (Machine Oiseau) est validée par sa coche — aucun repos, aucune question : le superset enchaîne, et c\'est la série du Marteau qui s\'offre au doigt',
      a0 && !D1.ouvert && D1.q.length === 0 && versB, _det({ a0, ouvert: D1.ouvert, q: D1.q.length, versB }));
    const b0 = await cocher(X, 1, 0);
    const D2 = await dock(X);
    t('B-RSS-①b ⭐⭐ ' + W + ' px : au repos du tour, le panneau porte DEUX questions, dans l\'ordre du superset — « Machine Oiseau — … » vise la série de l\'Oiseau, « Marteau — … » celle du Marteau, cinq réponses chacune',
      b0 && D2.ouvert && D2.q.length === 2 && D2.q[0].nom === OI && _det(D2.q[0].cibles) === _det(['0,0']) && D2.q[0].n === 5 && D2.q[0].texte.indexOf(OI) === 0
        && D2.q[1].nom === MA && _det(D2.q[1].cibles) === _det(['1,0']) && D2.q[1].n === 5 && D2.q[1].texte.indexOf(MA) === 0, resume(D2));
    const B2 = await X.pg.evaluate(() => window.__rssBoutons());
    t('B-RSS-①c ⭐ ' + W + ' px : les 10 boutons de réponse sont ENTIERS à l\'écran, au-dessus de la barre du bas, et rien ne les recouvre — les deux mouvements se répondent sans défiler',
      B2.length === 10 && B2.every(x => x.ok), _det(B2.filter(x => !x.ok).slice(0, 4)) + ' / ' + B2.length);
    const t0 = D2.temps;
    const ra = await repondre(X, 0, 0, 1), rb = await repondre(X, 1, 0, 2);
    const R = await rir(X), D3 = await dock(X);
    t('B-RSS-②a ⭐⭐ ' + W + ' px : « 1 » touché sous l\'Oiseau s\'écrit sur la 1ʳᵉ série de l\'Oiseau, « 2 » sous le Marteau sur celle du Marteau — nulle part ailleurs ; chaque rangée montre SA réponse',
      ra && rb && _det(R) === _det([OI + ':✓1 · ·', MA + ':✓2 · ·', CP + ':· ·']) && D3.q.length === 2 && _det(D3.q[0].on) === _det(['1']) && _det(D3.q[1].on) === _det(['2']),
      _det(R) + ' ' + resume(D3));
    await X.pg.waitForTimeout(1300);
    const D4 = await dock(X);
    t('B-RSS-②b ' + W + ' px : répondre n\'arrête pas le chrono — le repos continue de courir (le temps affiché a changé, le minuteur tourne)',
      D4.ouvert && D4.chrono && !!t0 && D4.temps !== t0, _det({ avant: t0, apres: D4.temps, chrono: D4.chrono }));
    const p1 = await passer(X);
    const D5 = await dock(X);
    const versA1 = await visible(X.pg, '#sr-0-1 .chk');
    t('B-RSS-②c ' + W + ' px : « Passer » ferme le repos, et le tour suivant repart de l\'Oiseau (sa 2ᵉ série s\'offre au doigt)',
      p1 && !D5.ouvert && versA1, _det({ p1, ouvert: D5.ouvert, versA1 }));
    const a1 = await cocher(X, 0, 1); const D6 = await dock(X);
    const b1 = await cocher(X, 1, 1); const D7 = await dock(X);
    t('B-RSS-②d ⭐ ' + W + ' px : 2ᵉ tour — Oiseau sans repos, puis deux questions nommées qui visent les 2ᵉ séries (et plus les 1ʳᵉˢ)',
      a1 && b1 && !D6.ouvert && D7.ouvert && D7.q.length === 2 && D7.q[0].nom === OI && _det(D7.q[0].cibles) === _det(['0,1']) && D7.q[1].nom === MA && _det(D7.q[1].cibles) === _det(['1,1']),
      resume(D6) + ' → ' + resume(D7));
    await passer(X);
    const c0 = await cocher(X, 2, 0); const D8 = await dock(X);
    t('B-RSS-②e ' + W + ' px : un exercice HORS superset garde la question d\'avant — une seule, SANS nom, sur sa série',
      c0 && D8.ouvert && D8.q.length === 1 && D8.q[0].nom === '' && _det(D8.q[0].cibles) === _det(['2,0']) && D8.q[0].texte.indexOf(CP) < 0 && D8.q[0].n === 5, resume(D8));
    t('B-RSS-②f ' + W + ' px : aucune erreur de page, aucun appel d\'IA (Milo compris)', X.errs.length === 0 && appelsIA(X).length === 0, X.errs.concat(appelsIA(X)).join(' | ').slice(0, 200));
    await X.cx.close();
  }

  /* ══ ③ LA CHAÎNE DES DEUX RÉPONSES : ENREGISTRÉES → RESTAURÉES → SÉANCE TERMINÉE → EXPORT → MILO → « PRÉCÉDENT » ═══════════ */
  {
    const X = await ouvrir({ wkt: SS([[OI, [N(35, 12)]], [MA, [N(40, 8)]]]) });
    const ok = (await cocher(X, 0, 0)) && (await cocher(X, 1, 0)) && (await repondre(X, 0, 0, 1)) && (await repondre(X, 1, 0, 2));
    const disque = await X.pg.evaluate(() => window.__rssDisque());
    t('B-RSS-③a ⭐ les deux réponses sont ENREGISTRÉES sur le téléphone (brouillon de la séance), chacune sur sa série',
      ok && _det(disque) === _det([OI + ':✓1', MA + ':✓2']), _det({ ok, disque }));
    await X.pg.reload(); await X.pg.waitForTimeout(1500); await apresChargement(X);
    const apres = await rir(X);
    t('B-RSS-③b ⭐ après un vrai rechargement, les deux réponses sont RESTAURÉES, chacune sur sa série', _det(apres) === _det([OI + ':✓1', MA + ':✓2']), _det(apres));
    await X.pg.evaluate(() => { try { if (document.getElementById('rest-bar').classList.contains('show')) skipRest(); } catch (e) {} });
    const fin = await terminer(X);
    const sess = await X.pg.evaluate(() => { const s = (S.sessions || [])[0]; return s ? s.exs.map(e => e.name + ':' + e.sets.map(x => x.rir == null ? '∅' : x.rir).join(',')) : null; });
    t('B-RSS-③c ⭐⭐ « Terminer la séance » : la séance rangée garde RIR 1 sur l\'Oiseau et RIR 2 sur le Marteau',
      fin && _det(sess) === _det([OI + ':1', MA + ':2']), _det({ fin, sess }));
    const exp = await X.pg.evaluate(() => { try { return _histoLignes(false).map(r => r.exercise + ':' + r.set_num + ':' + r.rir); } catch (e) { return 'ERR ' + e.message; } });
    t('B-RSS-③d l\'export de l\'historique (colonne RIR) porte 1 sur la ligne de l\'Oiseau et 2 sur celle du Marteau',
      Array.isArray(exp) && exp.indexOf(OI + ':1:1') >= 0 && exp.indexOf(MA + ':1:2') >= 0, _det(exp));
    const ctx = await X.pg.evaluate(() => { try { const c = buildCoachContext('test'); return typeof c === 'string' ? c : JSON.stringify(c); } catch (e) { return 'ERR ' + e.message; } });
    const lO = (ctx.match(/Machine Oiseau[^·\n]*: S1 35×12[^·\n]*/) || [''])[0], lM = (ctx.match(/Marteau[^·\n]*: S1 40×8[^·\n]*/) || [''])[0];
    t('B-RSS-③e ⭐ le contexte de Milo (construit ici, jamais envoyé) dit « S1 35×12 RIR1 » pour l\'Oiseau et « S1 40×8 RIR2 » pour le Marteau, chacun présenté en superset avec l\'autre',
      /RIR1/.test(lO) && /RIR2/.test(lM) && /superset/i.test(lO) && /superset/i.test(lM) && !/RIR2/.test(lO) && !/RIR1/.test(lM), (lO + ' ‖ ' + lM).slice(0, 300));
    await X.pg.evaluate(() => { S.wkt = { date: today(), progLabel: 'Test', startHour: 18, exs: [
      { name: 'Machine Oiseau', group: 'ssU', groupType: 'super', sets: [{ kg: 35, reps: 12, done: false, type: 'N' }] },
      { name: 'Marteau', group: 'ssU', groupType: 'super', sets: [{ kg: 40, reps: 8, done: false, type: 'N' }] }] }; persist(); _expandedEx = 0; renderLog(); });
    await X.pg.waitForTimeout(300);
    // Lecture seule de la colonne « Précédent » : chaque carte est dépliée par l'app elle-même (`_expandedEx`), sans geste à tester ici.
    const prec = ei => X.pg.evaluate(ei => { _expandedEx = ei; renderExBlocks(); return ((document.querySelector('#sr-' + ei + '-0 .prev-rir') || {}).textContent || '').trim(); }, ei);
    const precO = await prec(0), precM = await prec(1);
    t('B-RSS-③f la séance suivante relit chaque réponse sous « Précédent » : ·1r sur l\'Oiseau, ·2r sur le Marteau', precO === '·1r' && precM === '·2r', _det({ precO, precM }));
    t('B-RSS-③g aucune erreur de page, aucun appel d\'IA sur toute la chaîne (Milo compris)', X.errs.length === 0 && appelsIA(X).length === 0, X.errs.concat(appelsIA(X)).join(' | ').slice(0, 200));
    await X.cx.close();
  }

  /* ══ ④ L'ORDRE INVERSÉ ET LE RECHARGEMENT : PEU IMPORTE LE NOMBRE DE QUESTIONS, AUCUNE RÉPONSE NE VA AU MAUVAIS MOUVEMENT ══ */
  {
    const X = await ouvrir({ wkt: SS([[OI, [N(35, 12), N(35, 12)]], [MA, [N(40, 8), N(40, 8)]]]) });
    const b0 = await cocher(X, 1, 0); const W0 = await wktDe(X); const D1 = await dock(X);
    t('B-RSS-④a le Marteau validé AVANT l\'Oiseau : la question posée vise la série du Marteau, et elle seule (jamais l\'Oiseau, pas encore fait)',
      b0 && D1.ouvert && D1.q.length >= 1 && attribuee(D1, W0) && D1.q.every(q => q.cibles[0] === '1,0'), resume(D1));
    await repondre(X, 1, 0, 2);
    const a0 = await cocher(X, 0, 0); const b1 = await cocher(X, 1, 1);
    const W1 = await wktDe(X); const D2 = await dock(X);
    t('B-RSS-④b ⭐ … l\'Oiseau fait ensuite, sa question vient au repos suivant — NOMMÉE et visant SA série — à côté de celle du Marteau (2ᵉ série)',
      a0 && b1 && D2.ouvert && attribuee(D2, W1) && D2.q.some(q => q.nom === OI && q.cibles[0] === '0,0') && D2.q.some(q => q.cibles[0] === '1,1'), resume(D2));
    await repondre(X, 0, 0, 3);
    const R = await rir(X);
    t('B-RSS-④c … et la réponse de l\'Oiseau s\'écrit sur l\'Oiseau : la réponse déjà donnée au Marteau n\'a pas bougé',
      _det(R) === _det([OI + ':✓3 ·', MA + ':✓2 ✓']), _det(R));
    await X.cx.close();
    const Y = await ouvrir({ wkt: SS([[OI, [N(35, 12)]], [MA, [N(40, 8)]]]) });
    const ya = await cocher(Y, 0, 0);
    await Y.pg.reload(); await Y.pg.waitForTimeout(1500); await apresChargement(Y);
    const yb = await cocher(Y, 1, 0); const WY = await wktDe(Y); const DY = await dock(Y);
    t('B-RSS-④d la page rechargée ENTRE les deux séries : chaque question posée vise une série faite et porte, si elle a un nom, celui de son exercice',
      ya && yb && DY.ouvert && DY.q.length >= 1 && attribuee(DY, WY), resume(DY));
    t('B-RSS-④e aucune erreur de page, aucun appel d\'IA', X.errs.length === 0 && Y.errs.length === 0 && appelsIA(X).length + appelsIA(Y).length === 0, X.errs.concat(Y.errs).join(' | ').slice(0, 200));
    await Y.cx.close();
  }

  /* ══ ⑤ TROIS MOUVEMENTS, ÉCHAUFFEMENTS, DROPSET : LA MÊME RÈGLE, ET RIEN DE CHANGÉ HORS SUPERSET ══════════════════════════ */
  {
    const X = await ouvrir({ wkt: SS([[OI, [N(35, 12)]], [MA, [N(40, 8)]], [CP, [N(20, 12)]]]) });
    const ok = (await cocher(X, 0, 0)) && (await cocher(X, 1, 0));
    const D0 = await dock(X);
    const c0 = await cocher(X, 2, 0); const D1 = await dock(X);
    t('B-RSS-⑤a ⭐ un superset de TROIS : aucun repos avant le 3ᵉ, puis trois questions nommées, chacune sur son exercice, dans l\'ordre',
      ok && c0 && !D0.ouvert && D1.ouvert && D1.q.length === 3 && _det(D1.q.map(q => [q.nom, q.cibles.join('|')])) === _det([[OI, '0,0'], [MA, '1,0'], [CP, '2,0']]), resume(D0) + ' → ' + resume(D1));
    const errX = X.errs.concat(appelsIA(X));
    await X.cx.close();
    const Y = await ouvrir({ wkt: SS([[OI, [E(20, 10), N(35, 12)]], [MA, [E(20, 10), N(40, 8)]]]) });
    const e = (await cocher(Y, 0, 0)) && (await cocher(Y, 1, 0)); const DE = await dock(Y);
    await passer(Y);
    const n = (await cocher(Y, 0, 1)) && (await cocher(Y, 1, 1)); const DN = await dock(Y);
    t('B-RSS-⑤b les ÉCHAUFFEMENTS du superset ne posent aucune question ; les séries de travail qui suivent en posent une chacune, nommée',
      e && n && DE.q.length === 0 && DN.ouvert && DN.q.length === 2 && DN.q[0].nom === OI && DN.q[0].cibles[0] === '0,1' && DN.q[1].nom === MA && DN.q[1].cibles[0] === '1,1',
      resume(DE) + ' → ' + resume(DN));
    await Y.cx.close();
    const Z = await ouvrir({ wkt: { date: '__TODAY__', progLabel: 'Test', startHour: 18, exs: [
      { name: MA, group: 'dsT', groupType: 'drop', sets: [N(40, 8)] }, { name: OI, group: 'dsT', groupType: 'drop', sets: [N(30, 8)] }] } });
    const d = (await cocher(Z, 0, 0)); const DZ0 = await dock(Z); const d2 = await cocher(Z, 1, 0); const DZ = await dock(Z);
    t('B-RSS-⑤c un DROPSET (groupe d\'un autre type) reste comme avant : pas de repos entre les paliers, puis UNE question, sans nom, sur le dernier palier',
      d && d2 && !DZ0.ouvert && DZ.ouvert && DZ.q.length === 1 && DZ.q[0].nom === '' && DZ.q[0].cibles[0] === '1,0', _det({ d, d2 }) + ' ' + resume(DZ0) + ' → ' + resume(DZ));
    t('B-RSS-⑤d aucune erreur de page, aucun appel d\'IA', errX.length === 0 && Y.errs.length === 0 && Z.errs.length === 0 && appelsIA(Y).length + appelsIA(Z).length === 0,
      errX.concat(Y.errs, Z.errs).join(' | ').slice(0, 200));
    await Z.cx.close();
  }
}

module.exports = { ecran };
