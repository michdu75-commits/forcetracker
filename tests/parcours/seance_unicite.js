/* ═══════════════════════════════════════════════════════════════════════════════════════
   🔬 MILO-SEANCE-01 — UNE RÉPONSE, UNE SÉANCE, UNE CARTE (26/09/2026)

   Témoin DÉDIÉ demandé par Michel (§7) : une réponse de Milo qui contient UNE séance produit UNE
   seule carte « Cette séance te convient ? » et UN seul bouton principal — à l'arrivée, après le
   retour de la traduction, après le repli, après une traduction TARDIVE, après rechargement du
   fil, et après réouverture depuis « Mes discussions ». Jamais 2, jamais N.
   ⭐ Et deux témoins d'INTÉGRITÉ, qui décrivent l'état mesuré le 26/09 :
     · U8 — une proposition de MÉMOIRE dans la même réponse : la carte mémoire porte la même classe
       (`coach-prog-save`) que la carte séance, et la garde de `_appendStartSessionBtn` la prend pour
       « déjà un bouton dessous » → AUCUNE carte séance ;
     · U9 — la séance traduite (4 exercices) redevient celle du repli (2) au rechargement.
   ⛔ NON BRANCHÉ dans la passe complète : U8 et U9 sont ROUGES sur le code servi (ft-v1235) et
   décrivent des défauts que Michel n'a pas encore décidé de corriger. Banc : tools/banc_seance_unicite.js
   ═══════════════════════════════════════════════════════════════════════════════════════ */
const E = [
  { n: 'Développé couché', s: 4, r: 6, kg: 80, rest: '2 min 30', sec: 150, cue: 'omoplates serrées, pieds ancrés au sol' },
  { n: 'Rowing barre', s: 4, r: 8, kg: 60, rest: '2 min', sec: 120, cue: 'dos neutre, tire la barre vers le nombril' },
  { n: 'Développé militaire', s: 3, r: 8, kg: 40, rest: '2 min', sec: 120, cue: 'gainage fort, ne cambre pas' },
  { n: 'Extension triceps', s: 3, r: 12, kg: 20, rest: '90 s', sec: 90, cue: 'coudes fixes, descente contrôlée' },
];
const INTRO = 'Voilà ta séance haut du corps pour ce soir 💪\n\n', FIN = '\n\nBonne séance.';
const COURT = INTRO + E.map(e => `${e.n} : ${e.s}×${e.r} @ ${e.kg} kg`).join('\n') + FIN;                         // le repli lit 4
const MIXTE = INTRO + E.map((e, i) => i < 2 ? `${e.n} : ${e.s}×${e.r} @ ${e.kg} kg`
  : `${i + 1}. ${e.n} — ${e.s}×${e.r} à ${e.kg} kg, repos ${e.rest} — ${e.cue}`).join('\n') + FIN;                 // le repli lit 2
const COMPLET = INTRO + E.map((e, i) => `${i + 1}. ${e.n} — ${e.s}×${e.r} à ${e.kg} kg, repos ${e.rest} — ${e.cue}`).join('\n') + FIN; // le repli lit 0
const BLOC = COURT + '\n```json\n' + JSON.stringify({ seance: { label: 'Haut', exs: E.map(e => ({ name: e.n, sets: Array.from({ length: e.s }, () => ({ reps: e.r, kg: e.kg })) })) } }) + '\n```';
const MEMOIRE = '\n```json\n{"retiens":["préfère les séances courtes le soir"]}\n```';
const TRAD = { status: 'ok', seance: { label: 'Haut du corps', exs: E.map(e => ({ name: e.n, note: e.cue,
  sets: Array.from({ length: e.s }, () => ({ reps: e.r, kg: e.kg, type: 'N', rest: e.sec })) })) } };

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CCCLXXXVI. MILO-SEANCE-01 — une réponse, une séance, une carte (écran conduit) ═══');
  const parcours = async (texte, cervelet, suite) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|supabase\.co/, r => r.abort());
    const appels = [];
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      appels.push(c.action || '');
      if (c.action === 'coach') return r.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ reply: texte, _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false }) });
      if (c.action === 'seanceJson') {
        if (cervelet === 'panne') return r.abort('failed');
        if (cervelet === 'lent') { await new Promise(z => setTimeout(z, 13000)); try { await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TRAD) }); } catch (e) {} return; }
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TRAD) });
      }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_su'))return; sessionStorage.setItem('_su','1'); localStorage.clear();
      const D={ft4_bw:'80',ft4_age:'40',ft4_ht:'178',ft4_gender:'H',ft4_goal:'force',ft4_ob2:'1',ft4_name:'Test','ft4_devtoken':'${'f'.repeat(64)}'};
      Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const r = await pg.evaluate(async (suite) => {
      document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      S.premium = true; window._premiumPending = false;
      const attendre = async (f, ms) => { const t = Date.now(); while (Date.now() - t < ms) { try { const v = f(); if (v) return v; } catch (e) {} await new Promise(z => setTimeout(z, 200)); } return null; };
      // ⭐ on compte sur TOUT LE FIL, pas seulement sur la dernière bulle : deux cartes dans deux bulles restent deux cartes
      const compte = () => { const m = document.getElementById('coach-msgs');
        const oui = [...m.querySelectorAll('.coach-prog-save button')].filter(e => /Oui, (on démarre|utiliser)/.test(e.textContent)).map(e => e.textContent.trim());
        return { seance: oui.length, oui, questions: (m.textContent.match(/Cette séance te convient/g) || []).length,
                 cartes: m.querySelectorAll('.coach-prog-save').length, memoire: /Je retiens/.test(m.textContent) }; };
      const nEx = s => { const x = String(s || '').match(/\((\d+) exercices?\)/); return x ? +x[1] : null; };
      if (suite.precedente) {                                          // une séance plus ancienne dans le même fil (même jour)
        coachHistory.push({ role: 'user', content: 'Une séance jambes ?', ts: Date.now() - 60000 },
          { role: 'assistant', content: 'Squat : 4×6 @ 100 kg\nPresse à cuisses : 3×10 @ 180 kg', ts: Date.now() - 50000 });
      }
      await sendToCoach('Donne-moi une séance haut du corps pour ce soir, 4 exercices');
      const j = {};
      await attendre(() => compte().seance, suite.attente || 3000);
      j.arrivee = compte();
      await new Promise(z => setTimeout(z, 2500)); j.tardif = compte();  // une réponse tardive poserait-elle une 2ᵉ carte ?
      if (suite.tap) { const b = [...document.querySelectorAll('.coach-prog-save button')].find(e => /Oui, on démarre/.test(e.textContent) && nEx(e.textContent) == null);
        if (b) { b.click(); await attendre(() => [...document.querySelectorAll('.coach-prog-save button')].some(e => nEx(e.textContent) != null) || document.querySelector('.milo-ask-fail'), 16000); }
        j.tap = compte(); }
      j.nArrivee = nEx((j.tap || j.tardif).oui[0]);
      if (suite.recharger) { for (let k = 0; k < suite.recharger; k++) { _saveCoachHist(); coachHistory = []; _pendingMiloSessions.length = 0; _loadCoachHist(); _renderCoachThread(); await new Promise(z => setTimeout(z, 300)); }
        j.recharge = compte(); j.nRecharge = nEx(j.recharge.oui[0]); }
      if (suite.discussions) { newCoachChat(); loadCoachConv((S.coachConversations[0] || {}).id); await new Promise(z => setTimeout(z, 400));
        j.discussions = compte(); j.nDiscussions = nEx(j.discussions.oui[0]); }
      j.enAttente = _pendingMiloSessions.length;
      return j;
    }, suite || {});
    r.appels = appels.filter(a => a && a !== 'summarizeCoach'); r.errs = errs; await cx.close(); return r;
  };
  const un = x => x && x.seance === 1 && x.questions === 1;
  const js = x => JSON.stringify(x).slice(0, 300);

  const u1 = await parcours(BLOC, 'ok');
  t('U1 bloc caché (voie ①) → UNE carte séance, aucune traduction appelée', un(u1.arrivee) && un(u1.tardif) && !u1.appels.includes('seanceJson'), js(u1));
  const u2 = await parcours(MIXTE, 'ok');
  t('U2 traduction réussie (voie ②) → UNE carte, 4 exercices', un(u2.arrivee) && un(u2.tardif) && u2.nArrivee === 4, js(u2));
  const u3 = await parcours(MIXTE, 'panne');
  t('U3 traduction en panne → repli (voie ③) : UNE carte', un(u3.arrivee) && un(u3.tardif), js(u3));
  const u4 = await parcours(MIXTE, 'lent', { attente: 14000 });
  t('U4 traduction TARDIVE (13 s > 12 s) → UNE carte, et la réponse tardive n\'en pose pas une 2ᵉ', un(u4.arrivee) && un(u4.tardif), js(u4));
  const u5 = await parcours(COMPLET, 'panne', { tap: true });
  t('U5 repli vide → question, tap, échec annoncé : toujours UNE carte, jamais deux', un(u5.arrivee) && un(u5.tap), js(u5));
  const u6 = await parcours(MIXTE, 'ok', { recharger: 2 });
  t('U6 fil rechargé DEUX fois → toujours UNE carte', un(u6.recharge), js(u6));
  const u7 = await parcours(MIXTE, 'ok', { discussions: true });
  t('U7 rangée puis rouverte depuis « Mes discussions » → UNE carte', un(u7.discussions), js(u7));
  const u10 = await parcours(COURT, 'ok', { precedente: true, recharger: 1 });
  t('U10 deux séances dans le même fil → UNE seule carte, sur la plus récente', un(u10.arrivee) && un(u10.recharge), js(u10));
  const u8t = await parcours(COURT, 'ok');
  t('U8-témoin même réponse SANS mémoire → UNE carte séance (contrôle)', un(u8t.arrivee), js(u8t));
  const u8 = await parcours(COURT + MEMOIRE, 'ok', { attente: 5000 });
  t('U8 ⚠️ INTÉGRITÉ — séance + proposition de mémoire → la carte séance doit exister (ROUGE sur ft-v1235 : la carte mémoire bloque la garde)',
    u8.arrivee.memoire && un(u8.tardif), js(u8));
  t('U9 ⚠️ INTÉGRITÉ — la séance ne change pas de taille au rechargement (ROUGE sur ft-v1235 : 4 traduits → 2 relus par le repli)',
    u6.nArrivee === 4 && u6.nRecharge === 4, 'arrivée ' + u6.nArrivee + ' → rechargée ' + u6.nRecharge);
  const tous = [u1, u2, u3, u4, u5, u6, u7, u8, u8t, u10];
  t('U∅ aucune erreur de page', tous.every(x => !x.errs.length), tous.map(x => x.errs.join('|')).join(' ').slice(0, 200));
};
