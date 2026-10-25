/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🥗 NUTRITION V2 — LE MOTEUR (jalon 2, 22/10/2026)
   ═══════════════════════════════════════════════════════════════════════════════════════════
   Décisions : D-096 (Michel, 22/10 : reconstruire le cœur Nutrition) · D-097 (architecture, PROPOSÉ) ·
   consigne de Michel du 22/10 : *« un adaptateur compatible avec les anciennes données, sans jamais
   modifier les originaux ni inventer de quantités manquantes »*. Cadre : `docs/NUTRITION-V2-ARCHITECTURE.md`.

   🔌 BRANCHÉ AUX ÉCRANS AU JALON 4 (sur la branche `claude/nutrition-v2`, non publié) : chargé par `index.html`
      avant `app.js`, qui est le SEUL à l'appeler (le « pont V2 », zone Nutrition d'`app.js`).
   ⛔ Il ne RÉPARE, ne RECLASSE et ne RÉÉCRIT aucune ancienne ligne : l'inventaire, la sauvegarde et la
      récupération des anciens journaux sont le chantier de Claude Principal (consigne du 22/10).

   Ce qu'il contient, et rien d'autre — des fonctions PURES (aucun écran, aucun stockage, aucune heure,
   aucun réseau : tout ce qu'elles savent leur est passé en paramètre) :
     ① calcule(fiche, quantite)  — LA fonction de calcul. Les valeurs consommées ne sortent que d'ici.
     ② ligneNouvelle(entree)     — l'écrivain des NOUVELLES lignes : il RENVOIE la ligne, il n'écrit nulle part.
     ③ lireAncienne(ligne, ctx)  — l'adaptateur des anciennes lignes, en LECTURE SEULE.
     ④ reprise(ligne, ctx)       — ce qu'une ligne (V2 ou ancienne) permet de reprendre, en LECTURE SEULE.

   ⭐ D-099 (Michel, 22/10) : *« les grammes et les millilitres sont prioritaires dans la saisie »* ; une portion nommée
      (« 2 steaks ») reste une possibilité SECONDAIRE, et seulement quand son poids (ou volume) est connu — jamais une
      quantité ambiguë, jamais imposée par défaut. D'où : pas de fiche « par portion », pas de portion sans poids.

   ⭐ CE QUI EST FERMÉ PAR CONSTRUCTION (causes racines du dossier de nuit du 21/10) :
     · une ligne ne reçoit jamais la quantité ou la fiche d'une autre : l'appelant fournit un objet COMPLET,
       l'écrivain ne lit rien d'autre (CR-1) ;
     · une correction à la main n'est jamais effacée par un recalcul (CR-2) ;
     · un champ absent reste absent, jamais 0 ; ml et portions restent ce qu'ils sont (CR-4) ;
     · la provenance est exigée, jamais déduite d'une valeur par défaut (CR-5 ; consigne de Michel :
       *« ne laisse pas cette provenance dépendre d'une valeur par défaut »*). */
(function (racine) {
  'use strict';

  var VERSION = 1;                                    // version de l'objet `n2` porté par une ligne V2
  var CHAMPS = ['kcal', 'prot', 'carbs', 'fat'];
  var NOM_MAX = 80;                                   // comme les écrivains de V1 (`.slice(0,80)`)
  var LIBELLE_MAX = 24;                               // comme `portionLabel` de V1 (`ft-v1186`)

  /* Le vocabulaire de provenance de V1 (`app.js`, `_afSetSrc`) : un écrivain V2 n'en produit pas d'autre.
     ⛔ `scan` et `photo-code` sont des valeurs ANCIENNES : l'adaptateur les lit, l'écrivain ne les produit
     plus (*« une provenance qu'on ne sait plus lire est pire qu'une provenance qu'on ne produit plus »*). */
  var SAISIES = ['manuel', 'camera-code-local', 'code-tape', 'photo-code-ia', 'photo-ia', 'ia-texte', 'ciqual',
                 'marque', 'recherche', 'etiquette-main', 'liste', 'historique'];
  var ORIGINES = ['utilisateur', 'off', 'etiquette', 'ia', 'ciqual', 'marque', 'reprise'];
  var FIABILITES = { source: 'fiable', estimee: 'estimee', declaree: 'declaree' };   // fiche → statut de ligne
  var ORIGINES_QTE = ['tapee', 'portion', 'proposee', 'estimee'];
  /* Les notes qu'un APPELANT peut poser (jalon 4) — liste fermée : le moteur pose les siennes lui-même.
     `reprise-non-verifiee` = nom, valeurs et quantité recopiés d'une ancienne ligne dont la fiche n'est pas vérifiée. */
  var NOTES_ENTREE = ['reprise-non-verifiee'];
  /* Ce que V1 portait déjà et qu'une ligne V2 garde (mêmes noms de champs, liste BLANCHE, jalon 4) :
     `fiab` = la trace du résolveur d'énergie (ft-v1207/ft-v1232 : la trace part avec la ligne) ;
     `codeDouteux` (code-barres lu sans clé vérifiée), `doute` (valeur signalée par une enseigne), `kcalDerivee`. */
  var TRACE_CLES = ['etat', 'methode', 'raison', 'brut', 'retenu', 'champ', 'champSource', 'confiance', 'origine'];

  function fini(x) { return typeof x === 'number' && isFinite(x); }
  function ko(code, detail) { return { ok: false, erreur: code, detail: detail || '' }; }
  function texte(x) { return typeof x === 'string' ? x.trim() : ''; }

  /* Un jeu de valeurs (pour 100 g ou pour 100 ml). Chaque champ PRÉSENT est un nombre
     fini ≥ 0 ; un champ absent (clé manquante, `null`, `undefined`) est INCONNU — jamais 0 (contrat du 22/10).
     Rend une COPIE : rien de ce qui sort ne partage d'objet avec ce qui est entré. */
  function lireValeurs(v) {
    if (!v || typeof v !== 'object') return ko('VALEURS_ABSENTES');
    var res = {}, n = 0;
    for (var i = 0; i < CHAMPS.length; i++) {
      var c = CHAMPS[i], x = v[c];
      if (x === undefined || x === null) continue;
      if (!fini(x) || x < 0) return ko('VALEUR_INVALIDE', c);
      res[c] = x; n++;
    }
    if (!n) return ko('VALEURS_VIDES');
    return { ok: true, valeurs: res };
  }

  function dateValide(d) {
    if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
    var a = +d.slice(0, 4), m = +d.slice(5, 7), j = +d.slice(8, 10);
    var t = new Date(Date.UTC(a, m - 1, j));
    return t.getUTCFullYear() === a && t.getUTCMonth() === m - 1 && t.getUTCDate() === j;
  }

  /* ═══ ① LE CALCUL ═══
     fiche    = { base:'g'|'ml', p100:{…} }  (+ densite:{gParMl, source})
     ⛔ D-099 : il n'existe PAS de fiche « par portion » — une portion sans poids connu n'est pas une quantité.
     quantite = { val > 0, unite:'g'|'ml'|'portion', portion?:{ libelle, poids, unite:'g'|'ml' } }
     ⭐ Conversions permises, et SEULEMENT elles : portion → masse par le poids d'UNE portion ; ml ↔ g par une
        densité SOURCÉE. Tout le reste est REFUSÉ — jamais « 1 ml = 1 g », jamais un poids de portion deviné.
     ⭐ Arrondi = celui de l'app aujourd'hui : `Math.round(masse × valeur / 100)`, à l'entier, dans cet ordre
        d'opérations (mesuré : les 206 lignes réelles « conformes » retombent ainsi à l'identique).
     ⭐ La masse totale d'une quantité en portions est RENDUE, jamais stockée (`ft-v1186` ②). */
  function calcule(fiche, q) {
    if (!fiche || typeof fiche !== 'object') return ko('FICHE_ABSENTE');
    var base = fiche.base;
    if (base !== 'g' && base !== 'ml') return ko('BASE_INCONNUE', String(base));
    var lv = lireValeurs(fiche.p100);
    if (!lv.ok) return ko('FICHE_INVALIDE', lv.erreur + (lv.detail ? ':' + lv.detail : ''));
    if (!q || typeof q !== 'object' || !fini(q.val) || !(q.val > 0)) return ko('QUANTITE_INVALIDE');
    if (q.unite !== 'g' && q.unite !== 'ml' && q.unite !== 'portion') return ko('UNITE_INCONNUE', String(q.unite));
    var out = {}, manque = [], i, c;
    var masse = q.val, u = q.unite;
    if (u === 'portion') {
      var p = q.portion;
      if (!p || !fini(p.poids) || !(p.poids > 0) || (p.unite !== 'g' && p.unite !== 'ml')) return ko('PORTION_SANS_POIDS');
      masse = q.val * p.poids; u = p.unite;
    }
    if (u !== base) {
      var d = fiche.densite;
      if (!d || !fini(d.gParMl) || !(d.gParMl > 0) || !texte(d.source)) {
        return ko('UNITE_INCOMPATIBLE', u + ' sur une fiche pour 100 ' + base + ', sans densité sourcée');
      }
      masse = (u === 'ml') ? masse * d.gParMl : masse / d.gParMl;
    }
    for (i = 0; i < CHAMPS.length; i++) {
      c = CHAMPS[i];
      if (c in lv.valeurs) out[c] = Math.round(masse * lv.valeurs[c] / 100); else manque.push(c);
    }
    return { ok: true, valeurs: out, manque: manque, masse: { val: masse, unite: base } };
  }

  /* ═══ ② L'ÉCRIVAIN DES NOUVELLES LIGNES ═══
     entree = { id, ts, date, repas, nom, origine:{saisie, origine},
                mode:'pesee',    fiche:{ base, p100|pourUne, cle?, source, version?, fiab, etat?, libelle?, densite? },
                                 quantite:{ val, unite, origine?, portion? }
              | mode:'declaree', declare:{…}, quantite:{ val, unite, portion? }, cle?, etat?,
                corrections?:[{ c, v, le, avant? }],
                notes?:['reprise-non-verifiee'],   remplace?:<la ligne que celle-ci remplace (même id)>,
                trace?:{ etat, methode, raison, brut, retenu, … },   signaux?:{ codeDouteux, doute, kcalDerivee } }
     ⛔ Il RENVOIE la ligne : l'enregistrer (journal, sauvegarde) est l'affaire de l'appelant.
     ⭐ Les champs plats de V1 gardent leur sens et SONT les données (`per100` est la fiche g / ml, `q`/`u`
        la quantité) : rien n'est recopié en double (R2). `n2` porte seulement ce qui manque à V1. */
  function ligneNouvelle(e) {
    if (!e || typeof e !== 'object') return ko('ENTREE_ABSENTE');
    if (typeof e.id !== 'string' || e.id.length < 8) return ko('ID_INVALIDE');
    if (!fini(e.ts)) return ko('TS_INVALIDE');
    if (!dateValide(e.date)) return ko('DATE_INVALIDE');
    var repas = texte(e.repas), nom = texte(e.nom);
    if (!repas) return ko('REPAS_ABSENT');
    if (!nom) return ko('NOM_ABSENT');
    var o = e.origine;
    if (!o || typeof o !== 'object' || !texte(o.saisie) || !texte(o.origine)) return ko('PROVENANCE_ABSENTE');
    if (SAISIES.indexOf(o.saisie) < 0 || ORIGINES.indexOf(o.origine) < 0) return ko('PROVENANCE_INCONNUE', o.saisie + '/' + o.origine);

    var q = e.quantite;
    if (!q || typeof q !== 'object' || !fini(q.val) || !(q.val > 0)) return ko('QUANTITE_INVALIDE');
    if (q.unite !== 'g' && q.unite !== 'ml' && q.unite !== 'portion') return ko('UNITE_INCONNUE', String(q.unite));
    /* ⛔ `ft-v1186` ① : une portion se NOMME (« steak », « part », « dose »), le nom n'est jamais deviné ;
       ⛔ D-099 : et elle n'existe que si son poids (ou volume) est connu — sinon, ce n'est pas une quantité. */
    if (q.unite === 'portion' && (!q.portion || !texte(q.portion.libelle))) return ko('PORTION_SANS_LIBELLE');
    if (q.unite === 'portion' && (!fini(q.portion.poids) || !(q.portion.poids > 0) ||
        (q.portion.unite !== 'g' && q.portion.unite !== 'ml'))) return ko('PORTION_SANS_POIDS');
    if (q.origine !== undefined && ORIGINES_QTE.indexOf(q.origine) < 0) return ko('ORIGINE_QUANTITE_INCONNUE', String(q.origine));

    var L = { date: e.date, meal: repas, name: nom.slice(0, NOM_MAX), ts: e.ts, id: e.id, v: 1,
              saisie: o.saisie, origine: o.origine, q: q.val, u: q.unite,
              per100: null, sourceId: null, etat: null };
    var n2 = { s: VERSION, m: null, st: null, qo: q.origine || 'tapee', manque: [], no: [], corr: [] };
    if (q.unite === 'portion') {
      L.portionLabel = texte(q.portion.libelle).slice(0, LIBELLE_MAX);
      if (q.portion.unite === 'g') L.portionWeightG = q.portion.poids;
      else n2.pv = { val: q.portion.poids, unite: 'ml' };
    }

    var calc;
    if (e.mode === 'pesee') {
      var f = e.fiche;
      if (!f || typeof f !== 'object') return ko('FICHE_ABSENTE');
      if (!texte(f.source) || !FIABILITES[f.fiab]) return ko('FICHE_SANS_PROVENANCE');
      var r = calcule(f, q);
      if (!r.ok) return r;
      calc = r.valeurs; n2.manque = r.manque;
      L.per100 = lireValeurs(f.p100).valeurs;                    // une COPIE de la fiche qui a servi
      n2.f = { src: f.source, ver: f.version || null, fiab: f.fiab, base: f.base };
      if (f.densite) n2.f.densite = { gParMl: f.densite.gParMl, source: texte(f.densite.source) };
      /* ⭐ Le NOM de l'aliment de la fiche (jalon 4) : si la personne renomme la ligne, on sait encore quelle fiche a
         servi — un nom changé ne cache jamais les valeurs d'un autre aliment (contrat du 22/10). */
      if (texte(f.libelle)) n2.f.lib = texte(f.libelle).slice(0, NOM_MAX);
      L.sourceId = texte(f.cle) ? texte(f.cle).slice(0, 32) : null;
      L.etat = texte(f.etat) || null;
      n2.m = 'p'; n2.st = FIABILITES[f.fiab];
    } else if (e.mode === 'declaree') {
      var dv = lireValeurs(e.declare);
      if (!dv.ok) return ko('DECLARE_INVALIDE', dv.erreur + (dv.detail ? ':' + dv.detail : ''));
      calc = dv.valeurs;
      for (var k = 0; k < CHAMPS.length; k++) if (!(CHAMPS[k] in calc)) n2.manque.push(CHAMPS[k]);
      n2.m = 'd'; n2.st = 'declaree';
      /* ⭐ NV2-FIAB (24/10) — L'IDENTITÉ DU PRODUIT SURVIT À UNE RECOPIE. Une ligne déclarée n'a pas de fiche, mais elle
         peut dire DE QUEL produit elle parle (son code-barres, `ciqual:…`) : avant, une reprise d'un aliment scanné écrivait
         `sourceId:null` — le produit redevenait un simple nom, et sa fiche ne pouvait plus jamais être retrouvée (mesuré :
         sonde du 24/10, « + Ajouter » d'un ancien scan). ⛔ Ce n'est PAS une fiche : rien n'est calculé avec. */
      if (texte(e.cle)) L.sourceId = texte(e.cle).slice(0, 32);
      if (texte(e.etat)) L.etat = texte(e.etat);
    } else {
      return ko('MODE_INCONNU', String(e.mode));
    }

    /* ⭐ LES CORRECTIONS À LA MAIN : par-dessus le calcul, jamais effacées par un recalcul (contrat du 22/10).
       `avant` = la valeur calculée au moment de la correction ; si le calcul a changé depuis (autre quantité,
       autre fiche), la correction RESTE et la ligne le signale (`correction-a-revoir`) : c'est la personne qui
       choisit de la garder ou de revenir au calcul, jamais le moteur. */
    var vus = {}, finales = {}, c, i;
    for (i = 0; i < CHAMPS.length; i++) { c = CHAMPS[i]; if (c in calc) finales[c] = calc[c]; }
    var corr = e.corrections;
    if (corr !== undefined && !Array.isArray(corr)) return ko('CORRECTION_INVALIDE');
    for (i = 0; corr && i < corr.length; i++) {
      var x = corr[i];
      if (!x || CHAMPS.indexOf(x.c) < 0 || !fini(x.v) || x.v < 0 || !fini(x.le) || vus[x.c]) return ko('CORRECTION_INVALIDE', String(x && x.c));
      if (x.avant !== undefined && x.avant !== null && (!fini(x.avant) || x.avant < 0)) return ko('CORRECTION_INVALIDE', x.c);
      vus[x.c] = 1;
      var avant = (x.avant === undefined) ? ((x.c in calc) ? calc[x.c] : null) : x.avant;
      n2.corr.push({ c: x.c, v: x.v, avant: avant, le: x.le });
      if ((x.c in calc ? calc[x.c] : null) !== avant && n2.no.indexOf('correction-a-revoir') < 0) n2.no.push('correction-a-revoir');
      finales[x.c] = x.v;
    }
    for (i = 0; i < CHAMPS.length; i++) { c = CHAMPS[i]; if (c in finales) L[c] = finales[c]; }   // absent = ABSENT

    /* La trace du résolveur et les signaux de saisie : recopiés champ par champ (liste blanche), jamais l'objet
       de l'appelant — rien de ce qui sort ne partage d'objet avec ce qui est entré. */
    if (e.trace !== undefined && e.trace !== null) {
      if (typeof e.trace !== 'object' || Array.isArray(e.trace)) return ko('TRACE_INVALIDE');
      var tr = {}, nt = 0;
      for (i = 0; i < TRACE_CLES.length; i++) {
        x = e.trace[TRACE_CLES[i]];
        if (typeof x === 'string' || fini(x)) { tr[TRACE_CLES[i]] = (typeof x === 'string') ? x.slice(0, 60) : x; nt++; }
      }
      if (nt) L.fiab = tr;
    }
    if (e.signaux !== undefined && e.signaux !== null) {
      var sg = e.signaux;
      if (typeof sg !== 'object' || Array.isArray(sg)) return ko('SIGNAUX_INVALIDES');
      if (sg.codeDouteux === true) L.codeDouteux = true;
      if (sg.kcalDerivee === true) L.kcalDerivee = true;
      if (texte(sg.doute)) L.doute = texte(sg.doute).slice(0, 90);
    }
    /* Les notes de l'appelant : une liste FERMÉE, jamais un texte libre. */
    if (e.notes !== undefined) {
      if (!Array.isArray(e.notes)) return ko('NOTE_INVALIDE');
      for (i = 0; i < e.notes.length; i++) {
        if (NOTES_ENTREE.indexOf(e.notes[i]) < 0) return ko('NOTE_INVALIDE', String(e.notes[i]));
        if (n2.no.indexOf(e.notes[i]) < 0) n2.no.push(e.notes[i]);
      }
    }
    /* ⭐ UNE MODIFICATION À LA MAIN EST CONSERVÉE ET TRACÉE (jalon 4) : quand une ligne est remplacée par sa version
       modifiée, elle ne peut remplacer QU'ELLE-MÊME (même `id`) ; une ANCIENNE ligne (sans `n2`) garde sa copie
       d'origine intégrale dans `n2.av` — rien de ce qu'elle portait n'est perdu. Une ligne V2 n'en a pas besoin :
       ses corrections sont déjà tracées une à une (`n2.corr`).
       ⛔⛔ ET LA COPIE D'ORIGINE SURVIT AUX MODIFICATIONS SUIVANTES (incident du 23/10, D-101 ④) : la 1ʳᵉ modification
       d'une ancienne ligne en fait une ligne V2 — qui portait `n2.av`, mais que la 2ᵉ ne recopiait plus (« une ligne V2
       n'en a pas besoin ») : l'original disparaissait au 2ᵉ « Enregistrer » (mesuré, B-NV2P P15 ㉘). Elle passe
       maintenant de version en version, telle quelle — jamais la version intermédiaire à sa place : la provenance
       d'origine (saisie, origine, valeurs, quantité) reste celle de la ligne d'avant V2. */
    if (e.remplace !== undefined && e.remplace !== null) {
      var rp = e.remplace;
      if (typeof rp !== 'object' || Array.isArray(rp)) return ko('REMPLACE_INVALIDE');
      if (rp.id !== e.id) return ko('REMPLACE_AUTRE_LIGNE');
      var av = null;
      try {
        if (!rp.n2) av = JSON.parse(JSON.stringify(rp));
        else if (rp.n2.av && typeof rp.n2.av === 'object') av = JSON.parse(JSON.stringify(rp.n2.av));
      } catch (err) { return ko('REMPLACE_INVALIDE'); }
      if (av) n2.av = av;
    }
    L.n2 = n2;
    return { ok: true, ligne: L };
  }

  /* ═══ ③ L'ADAPTATEUR DES ANCIENNES LIGNES — LECTURE SEULE ═══
     Rend une VUE V2 d'une ligne V1, calculée à la volée.
     ⛔⛔ Il ne MODIFIE jamais la ligne (ni champ, ni sous-objet) et ne garde AUCUNE référence vers elle : tout ce
        qui sort est copié. Rien n'est écrit sur l'ancienne ligne, ni maintenant ni plus tard.
     ⛔⛔ Il n'invente RIEN : une quantité absente reste absente, une unité absente reste absente (jamais « g »),
        une portion sans poids reste une portion sans poids, un repas inconnu reste ce qu'il est (jamais
        « déjeuner »), une valeur illisible devient absente et NOTÉE (jamais 0).
     Les valeurs de la vue sont celles ENREGISTRÉES, au chiffre près ; `q`, `u`, `per100` sont « notés » : ils ne
     servent à recalculer que si la ligne est `recalculable`, c'est-à-dire si sa fiche est retrouvée À
     L'IDENTIQUE dans une base embarquée (`ctx.ciqual`) ET si ses valeurs en découlent exactement. Ce n'est PAS
     un classement de récupération (A/B/C/D, chantier de Claude Principal) : c'est seulement la condition pour
     qu'une modification future de la quantité repasse par le calcul au lieu de garder des chiffres figés. */
  var SAISIES_ANCIENNES = SAISIES.concat(['scan', 'photo-code']);

  function lireAncienne(l, ctx) {
    if (!l || typeof l !== 'object' || Array.isArray(l)) return { ok: false, erreur: 'LIGNE_ILLISIBLE' };
    var notes = [];
    var vue = {
      id: (typeof l.id === 'string' && l.id) ? l.id : null,
      ts: fini(l.ts) ? l.ts : null,
      date: typeof l.date === 'string' ? l.date : null,
      repas: (typeof l.meal === 'string' && l.meal) ? l.meal : null,
      nom: typeof l.name === 'string' ? l.name : '',
      mode: 'heritee',
      valeurs: {},
      qteNotee: null,
      ficheNotee: null,
      provenance: {
        v: (l.v === undefined) ? null : l.v,
        saisie: (typeof l.saisie === 'string') ? l.saisie : null,
        origine: (typeof l.origine === 'string') ? l.origine : null,
        sourceId: (typeof l.sourceId === 'string' && l.sourceId) ? l.sourceId : null,
        etat: (typeof l.etat === 'string' && l.etat) ? l.etat : null
      },
      recalculable: false,
      notes: notes
    };
    if (!vue.id) notes.push('sans-id');
    if (!dateValide(l.date)) notes.push('date-illisible');
    if (!vue.repas) notes.push('repas-absent');
    if (l.v === undefined) notes.push('sans-version');
    if (vue.provenance.saisie && SAISIES_ANCIENNES.indexOf(vue.provenance.saisie) < 0) notes.push('saisie-inconnue');

    var i, c, x;
    for (i = 0; i < CHAMPS.length; i++) {
      c = CHAMPS[i]; x = l[c];
      if (x === undefined || x === null) continue;               // absent : reste absent
      if (fini(x) && x >= 0) vue.valeurs[c] = x; else notes.push('valeur-illisible:' + c);
    }

    var aQ = (l.q !== undefined && l.q !== null), aU = (typeof l.u === 'string' && l.u !== '');
    if (aQ) {
      if (fini(l.q) && l.q > 0) {
        vue.qteNotee = { val: l.q, unite: aU ? l.u : null };
        if (!aU) notes.push('quantite-sans-unite');
      } else notes.push('quantite-illisible');
    } else {
      notes.push('sans-quantite');
      if (aU) notes.push('unite-sans-quantite');
    }
    if (vue.qteNotee && vue.qteNotee.unite === 'portion') {
      var pp = fini(l.portionWeightG) && l.portionWeightG > 0 ? l.portionWeightG : null;
      vue.qteNotee.portion = { libelle: (typeof l.portionLabel === 'string' && l.portionLabel) ? l.portionLabel : null,
                               poids: pp, unite: pp ? 'g' : null };
      if (!pp) notes.push('portion-sans-poids');
    }

    if (l.per100 !== undefined && l.per100 !== null) {
      var lv = lireValeurs(l.per100);
      if (lv.ok) {
        vue.ficheNotee = { p100: lv.valeurs, cle: vue.provenance.sourceId };
        if (!vue.qteNotee) notes.push('fiche-sans-quantite');
      } else notes.push('fiche-illisible');
    } else if (vue.qteNotee && (vue.qteNotee.unite === 'g' || vue.qteNotee.unite === 'ml')) {
      notes.push('quantite-sans-fiche');
    }

    /* La seule vérification : la fiche notée est-elle, À L'IDENTIQUE (±0,05 : la décimale gardée par l'app),
       la fiche CIQUAL embarquée que nomme `sourceId`, et les valeurs en découlent-elles exactement ? */
    var m = vue.provenance.sourceId ? /^ciqual:(\d+)$/.exec(vue.provenance.sourceId) : null;
    if (m && ctx && typeof ctx.ciqual === 'function' && vue.ficheNotee && vue.qteNotee && vue.qteNotee.unite === 'g') {
      var ref = null;
      try { ref = ctx.ciqual(m[1]); } catch (err) { ref = null; }
      var p = vue.ficheNotee.p100, q = vue.qteNotee.val, ok = !!ref;
      for (i = 0; ok && i < CHAMPS.length; i++) {
        c = CHAMPS[i];
        if (!(c in p) || !fini(ref[c]) || Math.abs(p[c] - ref[c]) > 0.05 + 1e-9) { ok = false; break; }
        if (vue.valeurs[c] !== Math.round(q * p[c] / 100)) ok = false;
      }
      vue.recalculable = ok;
      if (!ok) notes.push('fiche-non-verifiee');
    } else if (vue.ficheNotee) {
      notes.push('fiche-non-verifiee');
    }
    return { ok: true, vue: vue };
  }

  /* La fiche d'une vue `recalculable`, prête pour `calcule` ; `null` sinon (on ne recalcule JAMAIS une ligne
     dont la fiche n'est pas vérifiée). */
  function ficheVerifiee(vue) {
    if (!vue || !vue.recalculable || !vue.ficheNotee) return null;
    var p = lireValeurs(vue.ficheNotee.p100);
    if (!p.ok) return null;
    return { base: 'g', p100: p.valeurs, cle: vue.provenance.sourceId, source: 'ciqual', version: 'CIQUAL-2025', fiab: 'source' };
  }

  /* ═══ ④ CE QU'UNE LIGNE PERMET DE REPRENDRE (jalon 4) — lecture seule, ligne V2 OU ancienne ═══
     Pour l'ajout rapide, un repas habituel, un favori, une reprise depuis le journal ou une modification.
     Rend { ok, statut, nom, valeurs, fiche, quantite, corrections } :
       · statut   'v2'           — ligne écrite par V2 : sa fiche (si pesée) et sa quantité sont celles qu'elle porte ;
                  'verifiee'     — ancienne ligne `recalculable` (fiche CIQUAL retrouvée à l'identique) ;
                  'non-verifiee' — ancienne ligne sans fiche vérifiée : nom et valeurs seulement, quantité « notée ».
       · fiche    une fiche de CONFIANCE prête pour `calcule`, ou null — ⛔ une fiche notée mais non vérifiée n'est
                  JAMAIS rendue (M1 : un pour-100 g fabriqué ne se propage plus) ;
       · quantite la quantité de la ligne si elle est VALIDE (g, ml, ou portion avec son nom ET son poids — D-099),
                  sinon null — ⛔ jamais complétée, jamais une unité supposée.
     Rien n'est écrit sur la ligne : tout ce qui sort est copié. */
  function quantiteValide(q, u, libelle, poids, unitePoids) {
    if (!fini(q) || !(q > 0)) return null;
    if (u === 'g' || u === 'ml') return { val: q, unite: u };
    if (u === 'portion' && texte(libelle) && fini(poids) && poids > 0 && (unitePoids === 'g' || unitePoids === 'ml')) {
      return { val: q, unite: 'portion', portion: { libelle: texte(libelle).slice(0, LIBELLE_MAX), poids: poids, unite: unitePoids } };
    }
    return null;
  }
  function reprise(l, ctx) {
    if (!l || typeof l !== 'object' || Array.isArray(l)) return { ok: false, erreur: 'LIGNE_ILLISIBLE' };
    var i, c, x, valeurs = {};
    for (i = 0; i < CHAMPS.length; i++) { c = CHAMPS[i]; x = l[c]; if (fini(x) && x >= 0) valeurs[c] = x; }
    var nom = typeof l.name === 'string' ? l.name : '';
    var n2 = l.n2;
    if (n2 && typeof n2 === 'object' && n2.s === VERSION) {
      var fiche = null, f = n2.f;
      if (n2.m === 'p' && f && (f.base === 'g' || f.base === 'ml') && texte(f.src) && FIABILITES[f.fiab]) {
        var lv = lireValeurs(l.per100);
        if (lv.ok) {
          fiche = { base: f.base, p100: lv.valeurs, cle: (typeof l.sourceId === 'string' && l.sourceId) ? l.sourceId : null,
                    source: f.src, version: f.ver || null, fiab: f.fiab, etat: (typeof l.etat === 'string' && l.etat) ? l.etat : null };
          if (f.densite && fini(f.densite.gParMl)) fiche.densite = { gParMl: f.densite.gParMl, source: f.densite.source };
          if (texte(f.lib)) fiche.libelle = f.lib;
        }
      }
      var pv = n2.pv;
      var quantite = quantiteValide(l.q, l.u, l.portionLabel,
                                    pv ? pv.val : l.portionWeightG, pv ? 'ml' : 'g');
      var corr = [];
      if (Array.isArray(n2.corr)) for (i = 0; i < n2.corr.length; i++) {
        x = n2.corr[i];
        if (x && CHAMPS.indexOf(x.c) >= 0 && fini(x.v)) corr.push({ c: x.c, v: x.v, avant: fini(x.avant) ? x.avant : null, le: fini(x.le) ? x.le : null });
      }
      return { ok: true, statut: 'v2', mode: n2.m, nom: nom, valeurs: valeurs, fiche: fiche, quantite: quantite, corrections: corr };
    }
    var r = lireAncienne(l, ctx);
    if (!r.ok) return r;
    var v = r.vue, qn = v.qteNotee, q = null;
    if (qn) q = quantiteValide(qn.val, qn.unite, qn.portion && qn.portion.libelle, qn.portion && qn.portion.poids, qn.portion && qn.portion.unite);
    return { ok: true, statut: v.recalculable ? 'verifiee' : 'non-verifiee', mode: null, nom: v.nom, valeurs: v.valeurs,
             fiche: ficheVerifiee(v), quantite: q, corrections: [] };
  }

  /* Tout un journal, en lecture : une vue par ligne, DANS L'ORDRE, sans en perdre une (une ligne illisible
     donne une vue en échec, elle ne disparaît pas). */
  function lireJournal(liste, ctx) {
    if (!Array.isArray(liste)) return { ok: false, erreur: 'JOURNAL_ILLISIBLE', vues: [] };
    var vues = [];
    for (var i = 0; i < liste.length; i++) vues.push(lireAncienne(liste[i], ctx));
    return { ok: true, vues: vues };
  }

  var NUT2 = { VERSION: VERSION, CHAMPS: CHAMPS.slice(), calcule: calcule, ligneNouvelle: ligneNouvelle,
               lireAncienne: lireAncienne, lireJournal: lireJournal, ficheVerifiee: ficheVerifiee, reprise: reprise };
  if (Object.freeze) { Object.freeze(NUT2.CHAMPS); Object.freeze(NUT2); }
  if (typeof module !== 'undefined' && module.exports) module.exports = NUT2;
  else racine.NUT2 = NUT2;
})(typeof window !== 'undefined' ? window : this);
