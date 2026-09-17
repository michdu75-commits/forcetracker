/* ════════════════════════════════════════════════════════════════════════════════════════
   BLOC B-CCCXXI — S2-B : LA SAUVEGARDE SUPABASE PASSE PAR LE WORKER

   ⛔ TÉMOINS DE SOURCE, ET C'EST DIT PLUTÔT QUE MASQUÉ. Ce Worker ne s'exécute pas dans le
   banc : il tourne chez Cloudflare, avec `crypto.subtle`, un réseau et des secrets. Ce qui
   est vérifié ici, ce sont donc des PROPRIÉTÉS DE SA SOURCE — la position de la route, ce
   qu'elle n'appelle pas, ce qu'elle ne laisse pas fuiter. *Un témoin de source prouve la
   présence d'une règle, jamais son obéissance à l'exécution* : celle-là se mesurera sur le
   compte de test, en réseau réel.

   ⭐ FICHIER À PART, comme `identite_ligne.js` et `accueil_mini.js` : le contrôle négatif
   rejoue ces témoins en secondes au lieu de relancer une passe complète.
   ════════════════════════════════════════════════════════════════════════════════════════ */

function source(t, ROOT, fs, path) {
  const W = fs.readFileSync(path.join(ROOT, 'worker.js'), 'utf8');
  // ⚠️ On mesure le CODE, pas la documentation : ce fichier est très commenté, et ses
  // commentaires citent abondamment tout ce que les témoins cherchent.
  const nuC = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const C = nuC(W);
  const corps = (nom) => {
    const d = C.indexOf('async function ' + nom + '(');
    if (d < 0) return '';
    let i = C.indexOf('{', d), p = 0;
    for (let j = i; j < C.length; j++) {
      if (C[j] === '{') p++;
      else if (C[j] === '}') { p--; if (!p) return C.slice(i, j + 1); }
    }
    return C.slice(i);
  };
  const CS = corps('cloudSave');

  console.log('\n═══ B-CCCXXI. S2-B — LA SAUVEGARDE SUPABASE PASSE PAR LE WORKER ═══');

  t('B-CCCXXI ① la route cloudSave existe dans le Worker',
    /body\.action === 'cloudSave'/.test(C), '');

  /* ⭐⭐ LE TÉMOIN LE PLUS IMPORTANT DU BLOC, ET IL MESURE UNE POSITION.
     Le Worker finit par un relais attrape-tout qui réexpédie à Apps Script toute action
     inconnue. Une route de sauvegarde placée APRÈS ce relais n'échouerait pas : elle
     enverrait l'instantané ENTIER chez Google, en silence. */
  {
    const iRoute = C.indexOf("body.action === 'cloudSave'");
    const iRelais = C.indexOf('APPS_SCRIPT_URL,', C.indexOf('const up = await fetch('));
    t('B-CCCXXI ② ⭐⭐ la route est traitée AVANT le relais attrape-tout',
      iRoute > 0 && iRelais > 0 && iRoute < iRelais,
      'route@' + iRoute + ' relais@' + iRelais);
    const iIA = C.indexOf('_ACTIONS_IA.has(body.action)');
    t('B-CCCXXI ③ elle est aussi traitée avant le bloc des actions IA (aucun quota consommé)',
      iRoute > 0 && iIA > 0 && iRoute < iIA, 'route@' + iRoute + ' bloc IA@' + iIA);
  }

  /* ⛔ Une sauvegarde n'est pas une dépense d'IA. Si `cloudSave` entrait dans `_ACTIONS_IA`,
     elle userait le quota de Milo — et pire, elle passerait par `_identiteIA` en préalable
     BLOQUANT, ce qui annulerait tout l'intérêt de la résolution directe dans Supabase. */
  {
    const m = C.match(/_ACTIONS_IA\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
    t('B-CCCXXI ④ ⛔ cloudSave n\'est PAS une action IA (ni quota, ni pont obligatoire)',
      !!m && !/cloudSave/.test(m[1]), '');
    t('B-CCCXXI ⑤ le compteur d\'IA n\'est pas appelé depuis la sauvegarde',
      CS.length > 100 && !/_compterIA/.test(CS), '');
  }

  // ── ce que la route fait de l'identité ──────────────────────────────────────────────
  t('B-CCCXXI ⑥ le jeton est haché AVANT tout appel à Supabase',
    /const hache = await _hacher\(brut\)/.test(CS)
    && CS.indexOf('_hacher(brut)') < CS.indexOf('_sbAppel('), '');
  t('B-CCCXXI ⑦ ⛔ le jeton BRUT ne part jamais vers Supabase',
    !/_sbAppel\([^)]*brut/.test(CS)
    && !/p_hachage:\s*brut/.test(CS) && !/p_data:\s*brut/.test(CS), '');
  t('B-CCCXXI ⑧ ⛔ aucune adresse n\'est acceptée comme identité',
    !/body\.email/.test(CS) && !/p_email/.test(CS) && !/p_compte:\s*body/.test(CS), '');
  t('B-CCCXXI ⑨ le compte inscrit vient du PONT, jamais de la charge utile',
    /p_compte:\s*moi\.email/.test(CS), '');
  t('B-CCCXXI ⑩ la forme du jeton est contrôlée avant tout le reste',
    /_FORME_JETON\.test\(brut\)/.test(CS)
    && CS.indexOf('_FORME_JETON.test') < CS.indexOf('_hacher('), '');
  t('B-CCCXXI ⑪ la forme exigée est bien 64 caractères hexadécimaux',
    /_FORME_JETON\s*=\s*\/\^\[0-9a-f\]\{64\}\$\//.test(C), '');

  /* ⭐ LE PONT N'EST TENTÉ QUE SUR UN REFUS, JAMAIS EN PREMIER — c'est ce qui fait décroître
     la dépendance à Google appareil par appareil. Un pont appelé systématiquement rendrait
     le miroir Supabase indisponible dès qu'Apps Script tousse. */
  t('B-CCCXXI ⑫ ⭐ le pont Apps Script n\'est appelé QU\'APRÈS un refus de Supabase',
    CS.indexOf("_sbAppel(env, 'ft_enregistrer_instantane'") < CS.indexOf('_identiteIA(brut, env)'),
    '');
  t('B-CCCXXI ⑬ ⭐ un refus d\'identité ferme la porte (aucun repli permissif)',
    /if \(!moi\.ok\)[\s\S]{0,140}error: 'auth'/.test(CS), '');
  t('B-CCCXXI ⑭ une panne du cloud n\'est PAS présentée comme un refus d\'identité',
    /e\.raison !== 'refus'[\s\S]{0,160}error: 'cloud'/.test(CS), '');

  /* ⭐⭐ PAS DE BOUCLE : on retente UNE fois après inscription. Si la seconde tentative
     échoue encore, c'est que la ligne existe et qu'elle est RÉVOQUÉE — et un jeton révoqué
     dans Supabase ne doit pas pouvoir être ressuscité par le pont. */
  t('B-CCCXXI ⑮ ⭐⭐ exactement deux tentatives d\'écriture, jamais une boucle',
    (CS.match(/_sbAppel\(env, 'ft_enregistrer_instantane'/g) || []).length === 2
    && !/while\s*\(/.test(CS) && !/for\s*\(/.test(CS), '');
  t('B-CCCXXI ⑯ la seconde tentative refusée est annoncée comme une révocation',
    /raison: 'revoque'/.test(CS), '');

  // ── ce qui ne doit JAMAIS sortir ────────────────────────────────────────────────────
  {
    const sbA = corps('_sbAppel');
    t('B-CCCXXI ⑰ ⛔ la clé serveur ne vit que dans les secrets (jamais en dur)',
      /env && env\.SUPABASE_SECRET/.test(sbA) && !/sb_secret_|service_role/.test(C), '');
    t('B-CCCXXI ⑱ ⛔ le corps d\'erreur de Supabase n\'est jamais renvoyé au client',
      !/await r\.text\(\)/.test(sbA) && !/await r\.json\(\)/.test(sbA), '');
    t('B-CCCXXI ⑲ ⛔ la route ne journalise rien (ni jeton, ni haché, ni clé)',
      !/console\.(log|error|warn)/.test(CS) && !/console\.(log|error|warn)/.test(sbA), '');
    t('B-CCCXXI ⑳ une configuration manquante ferme la porte au lieu de l\'ouvrir',
      /if \(!base \|\| !cle\) return \{ ok: false[\s\S]{0,60}'config'/.test(sbA), '');
  }

  /* ⛔ NON-RÉGRESSION : ce chantier ne doit RIEN changer à ce qui existait. */
  t('B-CCCXXI ㉑ ⛔ les 14 actions IA sont intactes',
    (nuC(C).match(/_ACTIONS_IA\s*=\s*new Set\(\[([\s\S]*?)\]\)/) || [, ''])[1]
      .split(',').filter(x => x.trim()).length === 14, '');
  /* ⚠️ TÉMOIN RESSERRÉ APRÈS UNE MUTATION QUI L'A LAISSÉ VERT — quatrième fois de ce
     chantier que la même faiblesse apparaît. Il cherchait « reseau » dans TOUT le fichier,
     or `_sbAppel` en porte un aussi depuis S2-B : casser le repli du pont le laissait
     parfaitement vert. *Un motif qui cherche une présence ne mesure pas une absence
     LOCALE.* On regarde donc DANS le corps du pont, et on exige ce qui compte : son repli
     rend un refus, jamais une identité. */
  {
    const PT = corps('_identiteIA');
    t('B-CCCXXI ㉒ ⛔ le pont d\'identité des appels IA est toujours fail-closed',
      /async function _identiteIA\(token, env\)/.test(C)
      && /catch \(e\) \{ return \{ ok: false, raison: 'reseau' \}; \}/.test(PT)
      && !/ok: true[^}]*body\.email/.test(PT), '');
  }
  t('B-CCCXXI ㉓ ⛔ le filtre d\'origine est toujours là',
    /_origin !== ALLOWED_ORIGIN/.test(C), '');
  t('B-CCCXXI ㉔ ⛔ le relais attrape-tout vers Apps Script est préservé',
    /body: raw,/.test(C), '');

  /* ⛔⛔ V2 EST TOUJOURS OUVERTE, ET LE TÉMOIN LE DIT DANS LES DEUX SENS. Le client appelle
     encore l'ancienne fonction avec une adresse : tant que ce n'est pas basculé ET prouvé
     par un refus réseau réel, on n'écrit nulle part que V2 est fermée. */
  {
    const SB = fs.readFileSync(path.join(ROOT, 'supabase.js'), 'utf8');
    t('B-CCCXXI ㉕ ⛔ NON RETOURNÉ, ET C\'EST VOULU — le client envoie encore une adresse',
      /p_email:\s*email/.test(SB), '');
  }
}

module.exports = { source };
