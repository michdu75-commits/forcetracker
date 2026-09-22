/* ══════════════════════════════════════════════════════════════════════════════════════
   🍽️ « CE QUE L'APP A APPRIS » — ORDRE FIXE DES REPAS ET ÉTAT VIDE EXPLICITE (22/09/2026)

   Cas réel de Michel : la carte sortait **Dîner → Déjeuner → Petit-déj → Collation 2**.

   ⛔⛔ LA CAUSE EST MESURÉE, PAS DEVINÉE — et ce n'est AUCUN des tris qu'on soupçonne :
   ni par fréquence, ni par heure, ni alphabétique. `_blocApprisHTML` lisait
   `Object.keys(pa.habitudes)` ; cet objet naît de `Object.keys(parRepas)`, dont les clés
   apparaissent dans l'ordre de **PREMIÈRE APPARITION de chaque repas dans `S.foodLog`**.
   👉 ***L'écran affichait les repas dans l'ordre où ils avaient été tapés la première fois.***
   C'est la famille du `[0]` qui suppose un tri — *un affichage qui dépend de l'ordre de
   stockage change sans que rien n'ait changé* —, déjà fermée par ft-v1233 À L'INTÉRIEUR d'un
   repas (le départage déterministe des aliments) et restée ouverte ENTRE les repas.

   ⛔ SECOND DÉFAUT DU MÊME ENDROIT : un repas qui ne passe pas les seuils est simplement
   ABSENT de `habitudes`, donc sa ligne **disparaissait**. *Une ligne absente et une ligne vide
   ne disent pas la même chose : la première se lit « ce repas n'existe pas », la seconde
   « je ne sais pas encore ».*

   ⭐⭐ RIEN N'EST INVENTÉ : `FOOD_MEALS` EST DÉJÀ L'ORDRE CANONIQUE de journée, et c'est déjà
   lui qui range les puces de l'écran d'ajout. On le lit (**R2**), on ne le recopie pas — *une
   deuxième liste d'ordre divergerait le jour où un repas est ajouté, et le désordre
   reviendrait par l'autre bout*.

   ⛔⛔ ET LA LOGIQUE MÉTIER DE ft-v1233 NE BOUGE PAS D'UNE LIGNE : `_PA_MIN_JOURS`, le comptage
   par JOURS, la sélection des aliments, le départage déterministe, la règle des heures,
   `_afMealDefautHoraire()`, la population du journal. Les témoins ⑬→⑳ le figent depuis
   `app.js`, qui n'est pas touché par ce chantier.
   ══════════════════════════════════════════════════════════════════════════════════════ */

module.exports.source = function (t, ROOT, fs, path) {
  /* ⚠️ COMMENTAIRES NEUTRALISÉS D'ABORD : ceux du correctif citent `FOOD_MEALS`, « ordre »,
     « Pas encore assez de données » et `Object.keys(pa.habitudes)` en toutes lettres — R30
     exige que la raison soit écrite à côté du code, et un témoin qui lirait la source brute
     mesurerait la documentation au lieu du mécanisme (`BUGS.md` §64). */
  const decom = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:"'`])\/\/[^\n]*/gm, '$1');
  const SCb = decom(fs.readFileSync(path.join(ROOT, 'screens.js'), 'utf8'));
  const APb = decom(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8'));
  /* ⚠️ LE PIÈGE DE L'ESPACE, PAYÉ ONZE FOIS DANS CE DÉPÔT : on retire TOUS les espaces de la
     source ET on écrit les motifs sans espace. Les deux du même geste, sinon le garde mesure
     sa propre mise en forme. */
  const SC = SCb.replace(/\s+/g, ''), AP = APb.replace(/\s+/g, '');

  const corps = (src, n) => {
    const m = new RegExp('function\\s+' + n + '\\s*\\([^)]*\\)\\s*\\{').exec(src);
    if (!m) return '';
    const i = m.index + m[0].length - 1; let d = 0;
    for (let j = i; j < src.length; j++) {
      if (src[j] === '{') d++; else if (src[j] === '}') { d--; if (!d) return src.slice(i, j + 1); }
    }
    return '';
  };
  const BA = corps(SCb, '_blocApprisHTML').replace(/\s+/g, '');

  console.log('\n═══ B-CCCL. L\'ordre des repas, figé dans la source ═══');

  t('B-CCCL ① ⭐⭐ la carte n\'affiche plus l\'ordre de STOCKAGE (`Object.keys(pa.habitudes)`)',
    BA.length > 0 && !/Object\.keys\(pa\.habitudes\)\.(map|filter|forEach)/.test(BA),
    'la boucle d\'affichage est revenue sur les clés de l\'objet');
  t('B-CCCL ② ⭐⭐ elle parcourt la liste canonique des repas',
    /FOOD_MEALS/.test(BA) && /\.map\(m=>\{?/.test(BA), 'FOOD_MEALS n\'est plus parcouru');

  /* ⛔⛔ LE TÉMOIN QUI COMPTE VRAIMENT : l'ordre ne doit exister QU'À UN ENDROIT. Un correctif
     qui recopie la liste sur place rend l'écran juste aujourd'hui et fabrique la 2ᵉ source de
     vérité qui divergera demain (R2). On mesure donc que `screens.js` ne déclare AUCUNE suite
     de clés de repas. */
  const suiteClefs = /['"]petitdej['"][^;]{0,80}['"]collation['"][^;]{0,80}['"]dejeuner['"]/;
  t('B-CCCL ③ ⛔⛔ l\'ordre n\'est PAS recopié dans `screens.js` (une seule source de vérité)',
    !suiteClefs.test(SC), 'une liste d\'ordre des repas a été recopiée dans l\'écran');
  t('B-CCCL ④ ⛔ et les libellés non plus : le `LBL={petitdej:…}` local a bien disparu',
    !/LBL=\{['"]?petitdej/.test(SC), 'la 2ᵉ source de vérité des libellés est revenue');

  /* ⭐ `FOOD_MEALS` reste déclaré UNE fois, et dans l'ORDRE DE LA JOURNÉE — si quelqu'un le
     retriait, la carte suivrait sans qu'aucun autre témoin ne bronche. */
  t('B-CCCL ⑤ ⭐ `FOOD_MEALS` n\'est déclaré qu\'une fois, et dans `app.js`',
    (AP.match(/constFOOD_MEALS=/g) || []).length === 1 && !/constFOOD_MEALS=/.test(SC),
    'la liste des repas est déclarée ailleurs ou deux fois');
  t('B-CCCL ⑥ ⭐⭐ … et il est dans l\'ordre de la journée',
    /constFOOD_MEALS=\[\{k:'petitdej'.*?k:'collation'.*?k:'dejeuner'.*?k:'collation2'.*?k:'diner'/.test(AP),
    'l\'ordre canonique de la journée a changé');

  t('B-CCCL ⑦ ⭐ un repas sans habitude garde une ligne, avec un état explicite',
    /Pasencoreassezdedonnées/.test(BA), 'l\'état vide a disparu de la carte');
  /* ⛔ L'ÉTAT VIDE N'INVENTE RIEN : la ligne vide est fabriquée SANS heure. On mesure l'appel,
     pas le commentaire qui l'explique. */
  t('B-CCCL ⑧ ⛔ la ligne vide ne porte AUCUNE heure (`undefined` passé explicitement)',
    /\(m\.lbl,undefined,['"]Pasencoreassezdedonnées['"],true\)/.test(BA),
    'la ligne vide reçoit une heure');
  /* ⭐ UN SEUL GABARIT DE LIGNE : sinon les lignes vides dériveraient de l'alignement à colonne
     fixe payé en ft-v1031 (5 départs différents pour 5 lignes lues en colonne). */
  t('B-CCCL ⑨ ⭐ un SEUL fabricant de ligne — vides et pleines partagent le gabarit',
    (BA.match(/class="nu-lgn"/g) || []).length === 1, 'le gabarit de ligne a été dupliqué');
  t('B-CCCL ⑩ ⛔ l\'heure reste conditionnelle, jamais fabriquée',
    /\(h!==undefined\)\?/.test(BA), 'l\'affichage de l\'heure n\'est plus conditionnel');
  /* ⚠️ « Autre » n'est pas un 6ᵉ repas : il n'a jamais de ligne vide, mais il ne disparaît pas
     non plus s'il porte une vraie habitude (R30 — un retrait silencieux perdrait des données). */
  t('B-CCCL ⑪ ⚠️ « Autre » survit s\'il porte une habitude, sans jamais de ligne vide',
    /pa\.habitudes\.autre/.test(BA), '« Autre » a été supprimé en silence');
  t('B-CCCL ⑫ ⛔ échec fermé : `FOOD_MEALS` introuvable ne rend pas un cadre muet',
    /typeofFOOD_MEALS!=='undefined'/.test(BA) && /Pasencored\\?'habitudequisedégage/.test(SC),
    'le repli a disparu');

  /* ═══ ⛔⛔ CE CHANTIER NE TOUCHE PAS À LA LOGIQUE MÉTIER DE ft-v1233 ═══════════════════════
     Ces sept témoins lisent `app.js`, qui doit rester intact. *Un correctif d'affichage qui
     déplace une règle métier est exactement ce que le périmètre interdit.* */
  const PA = corps(APb, '_profilAlimentaire').replace(/\s+/g, '');
  t('B-CCCL ⑬ ⛔ `_PA_MIN_JOURS` vaut toujours 3 et n\'est pas dupliqué',
    (AP.match(/const_PA_MIN_JOURS=3;/g) || []).length === 1, 'le seuil a bougé ou a été recopié');
  t('B-CCCL ⑭ ⛔ le seuil s\'applique toujours au REPAS et à l\'ALIMENT',
    (PA.match(/<_PA_MIN_JOURS\)return;/g) || []).length === 2 && /\.filter\(a=>a\.jours>=_PA_MIN_JOURS\)/.test(PA),
    'un des deux filtres de ft-v1233 a sauté');
  t('B-CCCL ⑮ ⛔ on compte toujours en JOURS, pas en lignes',
    /jours:Object\.keys\(a\.jours\)\.length/.test(PA), 'le comptage par jours a disparu');
  t('B-CCCL ⑯ ⛔ le départage déterministe par le nom est intact',
    /a\.nom\.localeCompare\(b\.nom,'fr'\)/.test(PA), 'le départage par le nom a sauté');
  t('B-CCCL ⑰ ⛔ la règle des heures passe toujours par `_afMealDefautHoraire`',
    /_FAMILLE\[_afMealDefautHoraire\(h\)\]!==attendu\)return;/.test(PA),
    'la règle des heures de ft-v1233 a changé');
  t('B-CCCL ⑱ ⛔ `_afMealDefautHoraire` reste déclarée une seule fois',
    (AP.match(/function_afMealDefautHoraire\(/g) || []).length === 1,
    'la table d\'horaires a été dupliquée');
  t('B-CCCL ⑲ ⛔⛔ la population reste le journal ENTIER (aucune fenêtre glissante)',
    !/fl\.slice\(/.test(PA) && !/\.slice\(-/.test(PA), 'une fenêtre est apparue sur le journal');
};

module.exports.ecran = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  /* ⚠️ LE GARDE EST OBLIGATOIRE : `addInitScript` se rejoue à CHAQUE navigation, RECHARGEMENT
     COMPRIS. Sans lui, le cas G effacerait lui-même ce qu'il vient mesurer — défaut payé en
     ft-v1230. */
  await pg.addInitScript(`(()=>{try{if(localStorage.getItem('_decorOrdre')==='1')return;
    localStorage.clear();localStorage.setItem('_decorOrdre','1');}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  console.log('\n-- B-CCCLI. L\'ordre des repas, conduit dans le navigateur --');

  const ORDRE = ['Petit-déj', 'Collation', 'Déjeuner', 'Collation 2', 'Dîner'];
  const VIDE = 'Pas encore assez de données';

  /* ⛔ ON LIT L'ÉCRAN, PAS L'OBJET : c'est l'ordre AFFICHÉ qui est en cause, et lui seul. */
  const lire = () => pg.evaluate(async () => {
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
    await new Promise(r => setTimeout(r, 150));
    renderNutrition();
    await new Promise(r => setTimeout(r, 400));
    const L = [...document.querySelectorAll('#nu-appris .nu-lgn')];
    return {
      lignes: L.map(d => {
        const g = (d.children[0].innerText || '').trim();
        return { lbl: g.replace(/\s*~\d+\s*h$/, '').trim(),
                 h: (g.match(/~\s*(\d+)\s*h/) || [])[1],
                 txt: (d.children[1].innerText || '').trim(),
                 x: Math.round(d.children[1].getBoundingClientRect().left) };
      }),
      brut: (document.getElementById('nu-appris').innerText || '').replace(/\s+/g, ' ').trim()
    };
  });

  const poser = (spec) => pg.evaluate(s => {
    const iso = d => new Date(2026, 6, 1 + d).toISOString().slice(0, 10);
    const J = [];
    s.forEach(x => {
      for (let i = 0; i < x.jours; i++) {
        const d = (x.decale || 0) + i;
        (x.noms || [x.nom]).forEach(n => J.push({
          date: iso(d), meal: x.meal, name: n,
          ts: new Date(2026, 6, 1 + d, x.h, 0, 0).getTime(),
          kcal: 100, prot: 5, carbs: 10, fat: 2
        }));
      }
    });
    S.foodLog = J; persist(); return J.length;
  }, spec);

  const labels = r => r.lignes.map(l => l.lbl).join(' → ');
  /* ⛔⛔ ACCÈS SÛR PAR INDICE — TROUVÉ PAR LE CONTRÔLE NÉGATIF, ET C'EST SON MÉTIER.
     Trois mutations rendaient PLANTAGE au lieu de ROUGE parce qu'un témoin déréférençait
     `r.lignes[2]` sur une carte qui n'a plus que deux lignes. *Un témoin qui plante au lieu
     de rougir ne dit plus lequel a échoué, et peut masquer les suivants* (défaut déjà payé en
     ft-v1232). L'indice reste le sujet du test — c'est l'ORDRE qu'on mesure — mais son absence
     devient une réponse, pas une exception. */
  const at = (rr, i) => rr.lignes[i] || { lbl: '(ligne absente)', txt: '(ligne absente)', h: undefined, x: -1 };

  // ═══ CAS A — assez de jours notés, aucun repas retenu ══════════════════════
  /* ⚠️ 6 JOURS NOTÉS, AUCUN REPAS À 3 : sous 3 jours notés la carte bascule dans sa branche
     « pas encore de quoi dégager une habitude » et n'affiche AUCUNE ligne — le cas ne
     testerait alors pas ce qu'on croit (défaut payé en ft-v1233). */
  await poser([
    { meal: 'diner', nom: 'Saumon', jours: 2, h: 20 },
    { meal: 'dejeuner', nom: 'Poulet', jours: 2, h: 13, decale: 10 },
    { meal: 'petitdej', nom: 'Avoine', jours: 2, h: 8, decale: 20 },
  ]);
  let r = await lire();
  t('B-CCCLI ① ⭐⭐ CAS A · les 5 repas sont là malgré zéro habitude',
    labels(r) === ORDRE.join(' → '), labels(r));
  t('B-CCCLI ② ⭐⭐ CAS A · toutes les lignes portent l\'état vide',
    r.lignes.length === 5 && r.lignes.every(l => l.txt === VIDE),
    JSON.stringify(r.lignes.map(l => l.txt)));
  t('B-CCCLI ③ ⛔ CAS A · aucune heure inventée sur une ligne vide',
    r.lignes.every(l => l.h === undefined), JSON.stringify(r.lignes.map(l => l.h)));

  // ═══ CAS B — données pour Déjeuner et Dîner seulement ══════════════════════
  await poser([
    { meal: 'dejeuner', nom: 'Poulet', jours: 20, h: 13 },
    { meal: 'diner', nom: 'Saumon', jours: 20, h: 20 },
  ]);
  r = await lire();
  t('B-CCCLI ④ ⭐⭐ CAS B · ordre fixe, les 5 lignes présentes',
    labels(r) === ORDRE.join(' → '), labels(r));
  t('B-CCCLI ⑤ ⭐⭐ CAS B · seuls Petit-déj / Collation / Collation 2 sont vides',
    r.lignes.filter(l => l.txt === VIDE).map(l => l.lbl).join('|') === 'Petit-déj|Collation|Collation 2',
    JSON.stringify(r.lignes.map(l => [l.lbl, l.txt])));
  t('B-CCCLI ⑥ ⭐ CAS B · les deux repas renseignés gardent aliment ET heure',
    at(r, 2).txt === 'Poulet' && at(r, 2).h === '13'
    && at(r, 4).txt === 'Saumon' && at(r, 4).h === '20',
    JSON.stringify([at(r, 2), at(r, 4)]));

  // ═══ CAS C — les 5 repas renseignés ════════════════════════════════════════
  const CINQ = [
    { meal: 'petitdej', nom: 'Avoine', jours: 20, h: 8 },
    { meal: 'collation', nom: 'Banane', jours: 20, h: 16 },
    { meal: 'dejeuner', nom: 'Poulet', jours: 20, h: 13 },
    { meal: 'collation2', nom: 'Amandes', jours: 20, h: 17 },
    { meal: 'diner', nom: 'Saumon', jours: 20, h: 20 },
  ];
  await poser(CINQ);
  r = await lire();
  const pleinC = JSON.stringify(r.lignes.map(l => [l.lbl, l.txt]));
  t('B-CCCLI ⑦ ⭐⭐ CAS C · ordre fixe complet',
    labels(r) === ORDRE.join(' → '), labels(r));
  t('B-CCCLI ⑧ ⛔ CAS C · aucune ligne vide',
    r.lignes.every(l => l.txt !== VIDE), pleinC);

  // ═══ CAS D — même journal, rangé à l'envers ════════════════════════════════
  /* ⛔⛔ LE TÉMOIN CENTRAL, et il MORDAIT sur le code d'avant : l'ordre affiché venait de
     l'ordre de première apparition dans `S.foodLog`. Inverser le journal suffisait donc à
     retourner la carte — sans qu'une seule donnée ait changé. */
  const inverse = await pg.evaluate(() => { S.foodLog = (S.foodLog || []).slice().reverse(); persist(); return S.foodLog.length; });
  r = await lire();
  t('B-CCCLI ⑨ ⭐⭐ CAS D · journal inversé → affichage IDENTIQUE',
    labels(r) === ORDRE.join(' → ') && JSON.stringify(r.lignes.map(l => [l.lbl, l.txt])) === pleinC,
    'lignes=' + inverse + ' · ' + labels(r));
  /* ⭐ Et un ordre d'insertion mélangé, pas seulement inversé. */
  await poser([CINQ[4], CINQ[1], CINQ[0], CINQ[3], CINQ[2]]);
  r = await lire();
  t('B-CCCLI ⑩ ⭐⭐ CAS D · ordre d\'insertion mélangé → affichage IDENTIQUE',
    labels(r) === ORDRE.join(' → '), labels(r));

  // ═══ CAS E — 2 jours → 3 jours, sans intervention ══════════════════════════
  await poser([
    { meal: 'diner', nom: 'Saumon', jours: 20, h: 20 },
    { meal: 'petitdej', nom: 'Avoine', jours: 2, h: 8, decale: 40 },
  ]);
  r = await lire();
  t('B-CCCLI ⑪ ⭐ CAS E · à 2 jours, le petit-déj est vide (mais présent)',
    at(r, 0).lbl === 'Petit-déj' && at(r, 0).txt === VIDE, JSON.stringify(at(r, 0)));
  /* ⛔ AUCUNE MIGRATION, AUCUN BOUTON : on ajoute une ligne au journal et on re-rend. */
  await pg.evaluate(() => {
    const iso = d => new Date(2026, 6, 1 + d).toISOString().slice(0, 10);
    S.foodLog.push({ date: iso(42), meal: 'petitdej', name: 'Avoine',
      ts: new Date(2026, 6, 43, 8, 0, 0).getTime(), kcal: 100, prot: 5, carbs: 10, fat: 2 });
    persist();
  });
  r = await lire();
  t('B-CCCLI ⑫ ⭐⭐ CAS E · au 3ᵉ jour, la ligne se remplit toute seule',
    at(r, 0).lbl === 'Petit-déj' && at(r, 0).txt === 'Avoine', JSON.stringify(at(r, 0)));

  // ═══ CAS F — habitude sans heure admissible ════════════════════════════════
  /* ⭐ LE CAS EXACT DE MICHEL : un petit-déjeuner enregistré à midi. La règle horaire répond
     « déjeuner », donc l'heure est refusée — mais l'ALIMENT, lui, est parfaitement connu. */
  await poser([
    { meal: 'petitdej', nom: 'Avoine', jours: 20, h: 12 },
    { meal: 'diner', nom: 'Saumon', jours: 20, h: 20 },
  ]);
  r = await lire();
  t('B-CCCLI ⑬ ⭐⭐ CAS F · aliment affiché, heure refusée',
    at(r, 0).txt === 'Avoine' && at(r, 0).h === undefined, JSON.stringify(at(r, 0)));
  t('B-CCCLI ⑭ ⛔ CAS F · et le dîner, lui, garde la sienne',
    at(r, 4).txt === 'Saumon' && at(r, 4).h === '20', JSON.stringify(at(r, 4)));

  // ═══ CAS G — rechargement complet ══════════════════════════════════════════
  await poser(CINQ);
  const avant = await lire();
  await pg.reload(); await pg.waitForTimeout(2200);
  r = await lire();
  t('B-CCCLI ⑮ ⭐⭐ CAS G · après rechargement, même ordre et même état',
    labels(r) === ORDRE.join(' → ')
    && JSON.stringify(r.lignes.map(l => [l.lbl, l.txt, l.h])) === JSON.stringify(avant.lignes.map(l => [l.lbl, l.txt, l.h])),
    labels(r));

  // ═══ L'ALIGNEMENT PAYÉ EN ft-v1031 NE DOIT PAS ÊTRE PERDU ══════════════════
  await poser([
    { meal: 'collation2', nom: 'Amandes', jours: 20, h: 17 },
    { meal: 'diner', nom: 'Saumon', jours: 20, h: 20 },
  ]);
  r = await lire();
  t('B-CCCLI ⑯ ⛔ lignes vides et pleines partagent le MÊME départ de colonne',
    [...new Set(r.lignes.map(l => l.x))].length === 1, JSON.stringify(r.lignes.map(l => [l.lbl, l.x])));
  t('B-CCCLI ⑰ ⛔ aucune fuite `NaN` / `undefined` / `null` dans la carte',
    !/NaN|undefined|null/.test(r.brut), r.brut.slice(0, 160));
  /* ⛔ La population reste dite : l'ordre fixe ne doit pas avoir mangé le bas de page. */
  t('B-CCCLI ⑱ ⭐ le bas de page dit toujours sur quoi la carte porte',
    /tout ton journal/i.test(r.brut) && /jours? notés?/i.test(r.brut), r.brut.slice(-120));

  // ═══ SOUS 3 JOURS NOTÉS : la branche décidée en ft-v1021 n'est PAS touchée ══
  /* ⛔ DÉCISION ACTÉE, PAS ROUVERTE (règle d'or #15) : en dessous de 3 jours notés la carte
     explique qu'elle n'a pas de quoi observer. Ce chantier corrige l'ORDRE d'une liste ; là
     il n'y a pas de liste, donc pas de désordre à corriger. */
  await poser([{ meal: 'dejeuner', nom: 'Poulet', jours: 2, h: 13 }]);
  r = await lire();
  t('B-CCCLI ⑲ ⛔ sous 3 jours notés, la branche « insuffisant » est inchangée',
    r.lignes.length === 0 && /pas encore de quoi dégager une habitude/i.test(r.brut),
    r.brut.slice(0, 160));

  t('B-CCCLI ⑳ ⛔ aucune erreur de page sur tout le parcours', errs.length === 0, errs.join(' | '));
  await cx.close();
};
