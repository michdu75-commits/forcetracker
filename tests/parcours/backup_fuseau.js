/* ════════════════════════════════════════════════════════════════════════════════════════
   BLOC B-CCCXXX — LES HEURES DE SAUVEGARDE NE MENTENT PLUS SUR LEUR FUSEAU (ft-v1223)

   ⚠️⚠️ CE DÉFAUT A ÉTÉ TROUVÉ EN VÉRIFIANT UNE HYPOTHÈSE DE MICHEL, PAS EN CHERCHANT UN BUG.
   Il proposait que les échecs de sauvegarde miroir tombent « au moment de la sauvegarde ».
   L'écran annonçait « 2× par jour (2h et 14h UTC) » — donc, en été, 16h heure de Paris, très
   loin des faits. C'est le NOM du fichier (`backup-2026-09-18-14-08.json`, formaté en
   `Europe/Paris`) qui a révélé que le libellé était faux : `.atHour()` suit le fuseau déclaré
   dans `appsscript.json`, pas l'UTC.
   👉 ***Un libellé faux ne se contente pas d'être faux : il fait raisonner de travers ceux
   qui le lisent.*** C'est la famille « fuseaux horaires » de `BUGS.md`, appliquée à un
   message d'écran plutôt qu'à un calcul.

   ⛔ CE BLOC NE MESURE QUE DES PROPRIÉTÉS DE SOURCE : `Code.js` tourne chez Google, pas ici.
   Ce qu'on prouve, c'est qu'aucune phrase servie n'annonce un fuseau qu'elle ne tient pas.
   ════════════════════════════════════════════════════════════════════════════════════════ */

function source(t, ROOT, fs, path) {
  const CJ = fs.readFileSync(path.join(ROOT, 'Code.js'), 'utf8');
  const MAN = fs.readFileSync(path.join(ROOT, 'appsscript.json'), 'utf8');
  /* ⚠️ ON MESURE LE CODE, PAS LA DOCUMENTATION : le commentaire de cette correction cite
     abondamment « UTC », puisque R30 exige d'écrire la raison à côté du code. Un témoin qui
     lirait le fichier brut resterait rouge pour toujours, quoi qu'on corrige. */
  const nuC = (s) => String(s || '').replace(/\/\*[\s\S]*?\*\//g, '')
                                    .replace(/(^|[^:"'])\/\/[^\n]*/gm, '$1');
  const C = nuC(CJ);
  const corps = (n) => {
    const m = new RegExp('function\\s+' + n + '\\s*\\([^)]*\\)\\s*\\{').exec(C);
    if (!m) return '';
    let i = m.index + m[0].length - 1, d = 0;
    for (let j = i; j < C.length; j++) {
      if (C[j] === '{') d++;
      else if (C[j] === '}') { d--; if (!d) return C.slice(i, j + 1); }
    }
    return '';
  };
  const LBL = corps('_backupSchedLabel_');
  const FZ = corps('_fuseauLisible_');

  console.log('\n═══ B-CCCXXX. Les heures de sauvegarde et leur fuseau ═══');

  /* ⭐⭐ LE TÉMOIN CENTRAL : plus aucune phrase SERVIE n'annonce « UTC ». On le cherche dans
     le code débarrassé de ses commentaires — sinon on mesurerait la note qui EXPLIQUE la
     correction, et le témoin serait rouge sur du code parfaitement juste. */
  t('B-CCCXXX ① ⭐⭐ RETOURNÉ — aucune phrase servie n\'annonce plus « UTC »',
    !/UTC/.test(LBL) && !/UTC/.test(corps('installerBackupTriggers_') || '')
    && !/'\s*UTC|UTC\s*'|UTC\)/.test(C), '');

  /* ⭐ R2 — LE FUSEAU A UN SEUL PROPRIÉTAIRE : la configuration du projet. Écrire « Paris »
     en dur reproduirait le défaut un cran plus loin, en silence, le jour où elle change. */
  t('B-CCCXXX ② ⭐ le libellé DÉRIVE du fuseau réel, il ne le réécrit pas',
    /Session\.getScriptTimeZone\(\)/.test(FZ) && /_fuseauLisible_\(\)/.test(LBL), '');
  t('B-CCCXXX ③ ⛔ « Paris » n\'est écrit à la main nulle part dans le libellé',
    !/Paris/.test(LBL) && !/Paris/.test(FZ), '');
  /* ⛔ ET SI LE FUSEAU N'EST PAS LISIBLE, ON NE DEVINE PAS : on le dit. */
  t('B-CCCXXX ④ ⛔ un fuseau illisible donne un repli honnête, pas une invention',
    /heure du serveur/.test(FZ) && /catch/.test(FZ), '');

  /* ⛔ NON-RÉGRESSION : on corrige ce qui est DIT, pas ce qui est FAIT. Les heures elles-mêmes
     ne bougent pas — les déplacer serait un autre chantier, et une décision de Michel. */
  t('B-CCCXXX ⑤ ⛔ les heures de sauvegarde n\'ont PAS bougé (on corrige le dit, pas le fait)',
    /BACKUP_HOURS_\s*=\s*\[\s*2\s*,\s*14\s*\]/.test(C), '');
  t('B-CCCXXX ⑥ ⛔ le déclencheur emploie toujours `atHour` (c\'est lui qui suit le fuseau)',
    /\.atHour\(h\)/.test(C), '');

  /* ⭐ LA COHÉRENCE AVEC LA CONFIGURATION RÉELLE — la seule mesure qui relie la phrase au
     fait qu'elle décrit. Si le projet passait en UTC un jour, ce témoin le dirait. */
  {
    let tz = '';
    try { tz = (JSON.parse(MAN).timeZone) || ''; } catch (e) {}
    t('B-CCCXXX ⑦ ⭐ le projet déclare bien un fuseau, et ce n\'est pas l\'UTC',
      !!tz && !/^(UTC|Etc\/UTC|GMT)$/i.test(tz), 'timeZone = ' + (tz || '(absent)'));
  }
}

module.exports = { source };
