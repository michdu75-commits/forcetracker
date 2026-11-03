'use strict';
/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🪞 FINALISATION NUTRITION (03/11/2026, ordre de Michel) — LE MIROIR SUPABASE N'ACCEPTE PLUS COMME VALIDE UN VOLET NUTRITION QU'APPS SCRIPT A REFUSÉ, SUSPENDU OU NON CONFIRMÉ.
   Bloc : B-FNL01. Banc : tools/banc_nut_miroir_fnl.js · contrôle négatif : tools/mut_nut_miroir_fnl.py

   LE DÉFAUT, MESURÉ AVANT LE CORRECTIF. `_cloudSync` lance la requête Apps Script puis, SANS attendre sa réponse, envoie le même corps au miroir. La porte du miroir (`sbEnvoyer`) ne retirait que `foodLog` et `foodSupprimes`
   (NUT-SYNC-01 FINAL) : `savedFoods` (favoris) et `hiddenFoods` (masquages, D-141) — qui sont du MÊME volet Nutrition, refusé ou suspendu par Apps Script avec le reste — partaient donc au miroir à chaque synchronisation. Le miroir
   REMPLACE un champ présent (migration 0003) : il gardait des favoris et des masquages qu'Apps Script n'avait jamais acceptés (NUT_SUSPENDU, NUT_CLIENT_INCOMPATIBLE…), et les montrait « écrits » dans la carte Admin.

   CONDUIT : le VRAI client (index.html + scripts) dans un contexte navigateur, relié à DE VRAIS PROCESSUS serveur (le vrai Code.js) ; la suspension est posée dans les propriétés PARTAGÉES, comme en exploitation (une propriété de script).
   Les refus que le serveur réel ne peut pas produire pour un client à jour (NUT_CLIENT_INCOMPATIBLE, NUT_ZONE_DRIVE, NUT_INTERNE, NUT_LOCK_BUSY) sont ÉCRITS par le banc (`reponseFabriquee`) : la requête n'atteint alors pas le serveur.
   OBSERVE : le compte stocké (favoris, masquages, pesées, records, séances), ce que reçoit le miroir (chaque requête, champ par champ) et ce qu'il garde.
   SIMULÉ : le réseau, le miroir Supabase (un MODÈLE du contrat d'écriture de la migration 0003 : un champ PRÉSENT remplace le champ entier, un champ absent garde sa valeur).
   NE COUVRE PAS : le vrai Supabase (RPC, RLS), le vrai Worker Cloudflare, le vrai Apps Script déployé, l'iPhone — « NON TESTÉ » dans le rapport. Les anciens appareils (≤ ft-v1263) gardent l'ancienne porte : ce banc éprouve le NOUVEAU client.
   ⛔⛔ DONNÉES INVENTÉES SEULEMENT (domaine example.test, favoris « Fav … test »). Aucune écriture hors des dossiers temporaires du banc. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const S2 = require('./nut_sync02.js');
const CL = require('./nut_sync02_clients.js');

/* `FNL01_SEULEMENT=P,S,R,N,A,H` (liste) : ne rejouer que certains scénarios (les mutations ne rejouent que ce dont elles ont besoin) ; absent = tout. P = la porte seule · S = suspension réelle · R = reprise · N = refus écrits par le banc · A = sans accusé valide · H = envoi en vol. */
const SECT = process.env.FNL01_SEULEMENT || '';
const voulu = (x) => !SECT || SECT.split(',').indexOf(x) >= 0;

module.exports.ecran = async function ecran(t0, b, PORT) {
  console.log('\n-- B-FNL01. Le miroir Supabase n\'accepte pas un volet Nutrition qu\'Apps Script a refusé · suspendu · non confirmé --');
  const O = S2.outils;
  const { email, CODE_PERSO, pause, J, lancerPool } = O;
  const t = (nom, cond, detail) => t0('B-FNL01 ' + nom, cond, detail);
  /* Un témoin qui LÈVE une exception est un ROUGE nommé, jamais un abandon silencieux du banc. */
  const garde = async (id, f) => { try { await f(); } catch (e) { t(id + ' ⛔ le témoin a levé une exception (' + String(e && e.message || e).slice(0, 100) + ')', false, String(e && e.stack || e).slice(0, 300)); } };
  const erreursGlobales = [];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fnl01_'));
  const pool = lancerPool(dir, 2);
  const propSusp = path.join(dir, 'p_' + encodeURIComponent('NUT_SUSPENDU'));           // la suspension : UNE propriété de script, vue par tous les processus sans redéploiement

  const noms = (l) => (Array.isArray(l) ? l : []).map((x) => x && x.name).filter(Boolean).sort();
  const cles = (l) => (Array.isArray(l) ? l : []).map((x) => x && x.k).filter(Boolean).sort();
  const fav = (n) => ({ name: n, kcal: 100, prot: 5, carbs: 10, fat: 2 });
  const compte = (mail) => pool.lire(0, mail);
  /* un favori ET un masquage de plus, côté téléphone (les masquages sont en minuscules : le normaliseur du client les y met) */
  const ajoute = (A, n, k) => A.ev((x) => { S.savedFoods = (S.savedFoods || []).concat([x.f]); S.hiddenFoods = (S.hiddenFoods || []).concat([{ k: x.k, t: Date.now() - 1000 }]); persist(); }, { f: fav(n), k });
  /* la nouvelle tentative planifiée après un refus réessayable (30 s) n'a rien à faire dans le banc : on la coupe, sinon elle polluerait un scénario suivant */
  const calmer = (A) => A.ev(() => { try { clearTimeout(_nutRelance.timer); _nutRelance.timer = null; _nutRelance.n = 0; } catch (e) { /* pas de minuteur */ } });
  const etat = async (m, miroir) => { const c = await compte(m); const p = c.profile || {}; return { sf: noms(p.savedFoods), sh: cles(p.hiddenFoods), mf: noms(miroir.savedFoods), mh: cles(miroir.hiddenFoods) }; };
  const aFavoris = (recus) => recus.some((d) => 'savedFoods' in d || 'hiddenFoods' in d);
  /* la suspension ne survit JAMAIS à son scénario : tout sous-ensemble du banc doit rester vert sur le code sain (l'outil de mutations le vérifie avant de muter quoi que ce soit) */
  const suspendu = async (f) => { fs.writeFileSync(propSusp, '1'); try { return await f(); } finally { try { fs.unlinkSync(propSusp); } catch (e) { /* déjà levée */ } } };
  const refus = (code, o) => (c) => Object.assign({ status: 'nut_refuse', ok: false, code, message: 'refus écrit par le banc', retryable: false, requestId: c.requestId, profilEnregistre: true }, o || {});

  try {
    await pool.prets;
    const appareil = CL.fabriquerAppareils(b, PORT, pool, O, erreursGlobales);

    /* ═══ Q — LA PARITÉ : les champs que le SERVEUR traite comme « volet Nutrition » sont EXACTEMENT ceux que la PORTE du miroir retient. La liste existe en DEUX endroits (R2 : deux copies finissent par diverger) — et c'est ainsi que le défaut est né :
         D-141 a ajouté `hiddenFoods` au volet du serveur, personne n'a ajouté le champ à la porte. Ce témoin est la seule chose qui fera rougir le PROCHAIN champ ajouté d'un seul côté. ═══ */
    if (voulu('P')) await garde('FNL11', async () => {
      const code = fs.readFileSync(path.join(O.RACINE, 'Code.js'), 'utf8'), sb = fs.readFileSync(path.join(O.RACINE, 'supabase.js'), 'utf8');
      const iDebut = code.indexOf('function _nutCompatibilite_('), iFin = code.indexOf('function _nutProtoDe_(');
      const fonction = iDebut >= 0 && iFin > iDebut ? code.slice(iDebut, iFin) : '';
      const serveur = Array.from(((fonction.match(/var volet = [^\n]*/) || [''])[0]).matchAll(/body\.(\w+) !== undefined/g)).map((x) => x[1]).sort();
      const porte = ((sb.match(/const _SB_SNAPSHOT_NUTRITION=\[([^\]]*)\]/) || [])[1] || '').split(',').map((x) => x.replace(/['"\s]/g, '')).filter(Boolean).sort();
      t('FNL11 ⭐⭐⭐ la PARITÉ : les champs que le serveur traite comme « volet Nutrition » (`_nutCompatibilite_`, Code.js) sont EXACTEMENT ceux que la porte du miroir retient (`_SB_SNAPSHOT_NUTRITION`, supabase.js) — un champ ajouté d\'un seul côté fait rougir ce témoin (les deux listes ont déjà divergé une fois)',
        serveur.length === 4 && J(serveur) === J(porte), J({ serveur, porte }));
    });

    /* ═══ P — LA PORTE du miroir, appelée directement : par défaut elle retire les favoris et les masquages de TOUT envoi ; seule la fonction nommée les laisse passer ═══ */
    if (voulu('P')) await garde('FNL09', async () => {
      const m = email('porte'); await pool.init(0, m, { code: CODE_PERSO, extra: { nutProto: 3 } });
      const miroir = {}; const A = await appareil('P', 1, m, { miroir });
      A.miroirRecus.length = 0;
      await A.ev((x) => { sbEnvoyer({ action: 'saveProfile', bw: 80, savedFoods: x.sf, hiddenFoods: x.sh, foodLog: [{ id: 'x-00000001' }], foodSupprimes: [{ i: 'x-00000001', t: 1 }] }); }, { sf: [fav('Fav porte test')], sh: [{ k: 'nom:porte', t: 1760000000000 }] });
      await pause(300);
      const parDefaut = A.miroirRecus.slice(); A.miroirRecus.length = 0;
      const existe = await A.ev(() => typeof sbEnvoyerFavoris === 'function');
      if (existe) await A.ev((x) => { sbEnvoyerFavoris(x.sf, x.sh); }, { sf: [fav('Fav porte test')], sh: [{ k: 'nom:porte', t: 1760000000000 }] });
      await pause(300);
      const autorise = A.miroirRecus.slice();
      t('FNL09 ⭐⭐⭐ la PORTE du miroir (`sbEnvoyer`) retire les favoris et les masquages de TOUT envoi — même si l\'appelant les a mis dans le corps, avec le journal et le registre — ; seule `sbEnvoyerFavoris` les laisse passer, et elle ne laisse passer RIEN d\'autre (ni journal, ni registre, ni le reste du profil)',
        parDefaut.length === 1 && parDefaut[0].bw === 80 && !['savedFoods', 'hiddenFoods', 'foodLog', 'foodSupprimes'].some((k) => k in parDefaut[0])
        && existe === true && autorise.length === 1 && J(Object.keys(autorise[0]).sort()) === J(['action', 'hiddenFoods', 'savedFoods']) && noms(autorise[0].savedFoods).join() === 'Fav porte test' && cles(autorise[0].hiddenFoods).join() === 'nom:porte',
        J({ parDefaut: parDefaut.map((d) => Object.keys(d)), existe, autorise: autorise.map((d) => Object.keys(d)) }));
      await A.fermer();
    });

    /* ═══ S, R, N, A, H — UN appareil, UN compte, UN miroir : les scénarios s'enchaînent, chacun dit ce que le SERVEUR a retenu avant de dire ce que le MIROIR a gardé ═══ */
    if (['S', 'R', 'N', 'A', 'H'].some(voulu)) {
      const m = email('miroir'); await pool.init(0, m, { code: CODE_PERSO, extra: { nutProto: 3 } });
      const miroir = {};                                                                    // le « blob » du compte côté Supabase
      const A = await appareil('A', 1, m, { miroir });
      await A.ev(() => { S.name = 'Testeur fnl'; S.bw = 80; S.savedFoods = []; S.hiddenFoods = []; S.weightLog = []; S.prs = {}; S.sessions = []; persist(); });
      let compteur = 0;

      /* 0. L'état de départ : un envoi ACCEPTÉ par Apps Script — le serveur et le miroir ont le même favori et le même masquage (le filet fonctionne) */
      await garde('FNL01', async () => {
        await ajoute(A, 'Fav accepte test 1', 'nom:masque accepte 1');
        A.miroirRecus.length = 0;
        await A.sync(); await pause(300);
        const e = await etat(m, miroir);
        t('FNL01 ⭐ (état de départ) un envoi ACCEPTÉ : Apps Script retient le favori ET le masquage, et le miroir reçoit les mêmes — le filet fonctionne',
          J(e.sf) === J(['Fav accepte test 1']) && J(e.sh) === J(['nom:masque accepte 1']) && J(e.mf) === J(e.sf) && J(e.mh) === J(e.sh), J(e));
      });

      /* S. LA SUSPENSION, EN VRAI : le serveur (vrai Code.js, propriété `NUT_SUSPENDU` partagée) refuse le volet Nutrition et enregistre le reste */
      if (voulu('S')) await garde('FNL02', async () => {
        await ajoute(A, 'Fav refuse test 2', 'nom:masque refuse 2');
        await A.ev(() => { S.weightLog = [{ date: '2026-11-02', kg: 81 }]; S.prs = { 'Squat (barre)': { rm1: 100, kg: 80, reps: 6, date: '2026-11-02' } }; S.sessions = [{ date: '2026-11-02', exs: [{ name: 'Squat (barre)', sets: [{ kg: 80, reps: 6, done: true }] }], vol: 480 }]; persist(); });
        A.miroirRecus.length = 0;
        await suspendu(async () => { await A.sync(); await pause(300); await calmer(A); });             // la suspension est posée UNIQUEMENT pour cette synchronisation
        const c = await compte(m); const e = await etat(m, miroir); const recus = A.miroirRecus.slice();
        t('FNL02 ⭐ (prémisse mesurée) SUSPENSION : Apps Script a REFUSÉ le volet Nutrition — le favori et le masquage de cette synchronisation ne sont PAS au compte — et a quand même ENREGISTRÉ le reste (pesée, record, séance : règle d\'or n°3)',
          J(e.sf) === J(['Fav accepte test 1']) && J(e.sh) === J(['nom:masque accepte 1']) && (c.weightLog || []).length === 1 && !!(c.prs || {})['Squat (barre)'] && (c.sessions || []).length === 1, J({ sf: e.sf, sh: e.sh, wl: (c.weightLog || []).length, prs: Object.keys(c.prs || {}), s: (c.sessions || []).length }));
        t('FNL03 ⭐⭐⭐ SUSPENSION : le miroir N\'ACCEPTE PAS ce qu\'Apps Script a suspendu — il garde exactement les favoris et les masquages qu\'Apps Script avait acceptés (aucune requête vers lui n\'en porte un seul), au lieu de les montrer « écrits »',
          J(e.mf) === J(['Fav accepte test 1']) && J(e.mh) === J(['nom:masque accepte 1']) && !aFavoris(recus), J({ miroirFav: e.mf, miroirMasques: e.mh, requetes: recus.map((d) => Object.keys(d).filter((k) => /savedFoods|hiddenFoods/.test(k))) }));
        t('FNL04 ⭐⭐ … et le miroir reçoit quand même, TOUT DE SUITE, le reste de la sauvegarde — pesée, record, séance — sans attendre aucun accusé (la sauvegarde Séance, records et pesées n\'est pas touchée)',
          recus.some((d) => 'weightLog' in d && 'prs' in d && 'sessions' in d) && (miroir.weightLog || []).length === 1 && !!(miroir.prs || {})['Squat (barre)'] && (miroir.sessions || []).length === 1, J({ requetes: recus.map((d) => Object.keys(d).length), wl: (miroir.weightLog || []).length }));
      });

      /* R. LA REPRISE : la suspension est levée, l'envoi suivant est acquitté — le miroir rattrape le compte, par UNE petite requête dédiée (pas un second corps entier) */
      if (voulu('R')) await garde('FNL05', async () => {
        A.miroirRecus.length = 0;                                                            // la suspension a été levée à la sortie de S : l'envoi suivant est acquitté
        await A.sync(); await pause(350);
        const e = await etat(m, miroir); const recus = A.miroirRecus.slice();
        t('FNL05 ⭐⭐ la REPRISE : suspension levée, l\'envoi suivant est ACQUITTÉ — Apps Script retient les deux favoris et les deux masquages, et le miroir les a AUSSI, identiques (il ne reste pas privé de ses favoris pour toujours)',
          J(e.sf) === J(['Fav accepte test 1', 'Fav refuse test 2']) && J(e.sh) === J(['nom:masque accepte 1', 'nom:masque refuse 2']) && J(e.mf) === J(e.sf) && J(e.mh) === J(e.sh), J(e));
        const avecFavoris = recus.filter((d) => 'savedFoods' in d || 'hiddenFoods' in d);
        t('FNL06 ⭐⭐ … les favoris et les masquages arrivent au miroir par UNE requête dédiée qui ne porte QUE ces deux listes ; le corps complet, lui, n\'en porte plus — et il part toujours tout de suite (le reste du profil n\'attend aucun accusé)',
          avecFavoris.length === 1 && J(Object.keys(avecFavoris[0]).sort()) === J(['action', 'hiddenFoods', 'savedFoods']) && recus.some((d) => 'weightLog' in d && !('savedFoods' in d) && !('hiddenFoods' in d)), J(recus.map((d) => Object.keys(d).length)));
      });

      /* N. LES REFUS QUE LE SERVEUR RÉEL NE PEUT PAS PRODUIRE POUR UN CLIENT À JOUR — écrits par le banc ; la requête n'atteint pas le serveur : AUCUN favori ni masquage de cet envoi n'est accepté, ni chez Apps Script, ni au miroir */
      if (voulu('N')) await garde('FNL07', async () => {
        const cas = [
          ['NUT_CLIENT_INCOMPATIBLE', refus('NUT_CLIENT_INCOMPATIBLE', { details: { versionClient: 3, versionMin: 3 } })],                 // définitif : il faut mettre l'application à jour
          ['NUT_ZONE_DRIVE', refus('NUT_ZONE_DRIVE', { retryable: true, details: { liste: 'foodLog' } })],                                  // réessayable : la zone de sécurité est indisponible
          ['NUT_INTERNE', refus('NUT_INTERNE', { retryable: true })],                                                                      // réessayable : erreur du serveur, état d'avant restitué
          ['NUT_SUSPENDU', refus('NUT_SUSPENDU', { retryable: true })],                                                                    // réessayable : suspension voulue
          ['NUT_LOCK_BUSY', (c) => ({ status: 'error', ok: false, code: 'NUT_LOCK_BUSY', retryable: true, requestId: c.requestId })],      // réessayable : verrou occupé, RIEN n'a été enregistré
        ];
        const ratees = [];
        for (const [code, rep] of cas) {
          compteur++; const nf = 'Fav ' + code.toLowerCase() + ' test ' + compteur, kf = 'nom:masque ' + code.toLowerCase() + ' ' + compteur;
          await ajoute(A, nf, kf);
          A.fabriqueSeul = true; A.reponseFabriquee = rep; A.miroirRecus.length = 0;
          await A.sync(); await pause(300);
          A.fabriqueSeul = false; A.reponseFabriquee = null; await calmer(A);
          const e = await etat(m, miroir);
          if (e.mf.includes(nf) || e.mh.includes(kf) || aFavoris(A.miroirRecus)) ratees.push({ code, miroirFav: e.mf.includes(nf), miroirMasque: e.mh.includes(kf), requetes: A.miroirRecus.filter((d) => 'savedFoods' in d || 'hiddenFoods' in d).length });
          else if (!A.miroirRecus.some((d) => 'weightLog' in d)) ratees.push({ code, restePerdu: true });   // le reste de la sauvegarde, lui, doit toujours partir
        }
        t('FNL07 ⭐⭐⭐ cinq REFUS d\'Apps Script — version incompatible · zone de sécurité indisponible · erreur interne · suspension · verrou occupé : à CHAQUE fois, le miroir n\'accepte ni le favori ni le masquage de l\'envoi refusé (aucune requête vers lui n\'en porte), et il reçoit quand même le reste de la sauvegarde',
          ratees.length === 0, J(ratees));
      });

      /* A. PAS D'ACCUSÉ VALIDE : on ne SAIT pas si Apps Script a retenu quoi que ce soit — le miroir n'accepte rien de ce volet, mais le reste de la sauvegarde part */
      if (voulu('A')) await garde('FNL08', async () => {
        const cas = [
          ['réponse illisible (page d\'erreur HTML)', () => { A.reponseIllisible = true; }, () => { A.reponseIllisible = false; }],
          ['Apps Script injoignable (réseau coupé vers lui)', () => { A.horsLigne = true; }, () => { A.horsLigne = false; }],
          ['ancien serveur (`{"status":"ok"}`, ni `ok` ni `requestId`)', () => { A.ancienServeur = true; }, () => { A.ancienServeur = false; }],
          ['accusé d\'une AUTRE opération (requestId différent)', () => { A.autreOperation = true; }, () => { A.autreOperation = false; }],
          ['accusé bien formé (ok:true, notre requestId) mais SANS compte rendu du volet (pas de `nut` : rien ne dit qu\'Apps Script l\'a appliqué)', () => { A.fabriqueSeul = true; A.reponseFabriquee = (c) => ({ status: 'ok', ok: true, requestId: c.requestId, serverRevision: 0 }); }, () => { A.fabriqueSeul = false; A.reponseFabriquee = null; }],
        ];
        const ratees = [];
        for (const [titre, regler, defaire] of cas) {
          compteur++; const nf = 'Fav sansaccuse test ' + compteur, kf = 'nom:masque sansaccuse ' + compteur;
          await ajoute(A, nf, kf);
          regler(); A.miroirRecus.length = 0;
          await A.sync(); await pause(300);
          defaire(); await calmer(A);
          const e = await etat(m, miroir);
          if (e.mf.includes(nf) || e.mh.includes(kf) || aFavoris(A.miroirRecus)) ratees.push({ titre, miroirFav: e.mf.includes(nf), miroirMasque: e.mh.includes(kf) });
          else if (!A.miroirRecus.some((d) => 'weightLog' in d)) ratees.push({ titre, restePerdu: true });
        }
        t('FNL08 ⭐⭐⭐ SANS ACCUSÉ VALIDE — réponse illisible · Apps Script injoignable · ancien serveur · accusé d\'une autre opération · accusé sans compte rendu du volet : le miroir n\'accepte NI le favori NI le masquage (on ne sait pas si Apps Script les a retenus), et il reçoit quand même le reste de la sauvegarde — le filet ne dépend pas du serveur principal',
          ratees.length === 0, J(ratees));
        /* le rattrapage : le premier accusé VALIDE qui suit apporte au miroir TOUT ce qu'Apps Script retient (les envois sans accusé n'ont rien perdu, ils ont attendu) */
        A.miroirRecus.length = 0;
        await A.sync(); await pause(350);
        const e = await etat(m, miroir); const local = await A.ev(() => ({ f: S.savedFoods.length, h: S.hiddenFoods.length }));
        t('FNL08b ⭐⭐ … et le premier accusé VALIDE qui suit RATTRAPE : Apps Script retient TOUS les favoris et masquages du téléphone, et le miroir a de nouveau EXACTEMENT les mêmes (les envois sans accusé n\'ont rien fait perdre, ils ont attendu)',
          e.sf.length === local.f && e.sh.length === local.h && local.f >= 5 && J(e.mf) === J(e.sf) && J(e.mh) === J(e.sh), J({ local, sf: e.sf.length, mf: e.mf.length, sh: e.sh.length, mh: e.mh.length }));
      });

      /* H. CE QUE LE MIROIR REÇOIT, C'EST CE QUE CET ENVOI PORTAIT — pas ce que le téléphone contient quand l'accusé revient */
      if (voulu('H')) await garde('FNL10', async () => {
        await ajoute(A, 'Fav envoye test 10', 'nom:masque envoye 10');
        let lacher; A.retenir = new Promise((r) => { lacher = r; });                         // la requête est PARTIE (corps figé) mais le serveur ne la reçoit pas encore
        A.miroirRecus.length = 0;
        const n0 = await A.ev(() => window.__net.envoyes);
        await A.ev(() => { _cloudSync(); });
        await pause(300);
        await ajoute(A, 'Fav tardif test 10', 'nom:masque tardif 10');                       // ajoutés PENDANT que la requête est en vol
        A.retenir = null; lacher();
        for (let i = 0; i < 120; i++) { const r = await A.ev(() => window.__net); if (r.envoyes > n0 && r.termines >= r.envoyes) break; await pause(50); }
        await pause(500);
        const e = await etat(m, miroir);
        t('FNL10 ⭐⭐ ce que le miroir reçoit après l\'accusé, c\'est ce que CET envoi portait : le favori et le masquage ajoutés pendant que la requête était en vol ne sont NI chez Apps Script (elle ne les portait pas) NI au miroir — ils partiront avec l\'envoi suivant, et seront acquittés',
          e.sf.includes('Fav envoye test 10') && e.mf.includes('Fav envoye test 10') && e.mh.includes('nom:masque envoye 10') && !e.sf.includes('Fav tardif test 10') && !e.mf.includes('Fav tardif test 10') && !e.mh.includes('nom:masque tardif 10'), J({ sf: e.sf.slice(-2), mf: e.mf.slice(-2), mh: e.mh.slice(-2) }));
        await A.sync(); await pause(350);
        const e2 = await etat(m, miroir);
        t('FNL10b … et l\'envoi suivant, acquitté, les apporte aux DEUX (Apps Script et miroir identiques)',
          e2.sf.includes('Fav tardif test 10') && J(e2.mf) === J(e2.sf) && J(e2.mh) === J(e2.sh), J({ sf: e2.sf.length, mf: e2.mf.length }));
      });
      await A.fermer();
    }
  } finally {
    try { pool.tuer(); } catch (e) { /* déjà mort */ }
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* déjà parti */ }
  }
  const erreurs = erreursGlobales.filter((x) => !/Failed to fetch|NetworkError|net::ERR|Load failed|AbortError|aborted/i.test(x));
  t('FNL99 aucune erreur de page JavaScript pendant le banc (les échecs réseau fabriqués sont exclus)', erreurs.length === 0, J(erreurs.slice(0, 3)));
};
