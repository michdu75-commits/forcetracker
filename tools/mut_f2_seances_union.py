#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — F2-A' (12/11/2026) : les temoins B-F2A savent-ils ROUGIR quand on casse la fusion des seances ?

[!!] CHAQUE MUTATION EST APPLIQUEE A UN ARBRE COPIE (Code.js + le banc), JAMAIS AU DEPOT (BUGS.md §60). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Un mutant est TUE quand AU MOINS UN des tests ATTENDUS (prefixes ci-dessous) passe au rouge — pas « n'importe lequel » : un rouge ailleurs ne prouve pas que la garantie visee est protegee.
Un rouge qui est seulement un PLANTAGE de section (`...-PLANTAGE`) ne compte PAS : un banc qui plante ne prouve rien. Une ancre qui n'apparait pas exactement une fois rend le mutant INVALIDE (pas de mutant creux).
Deux mutants sont VOLONTAIREMENT sans effet attendu : un commentaire (le banc ne doit pas mesurer du texte) et un « equivalent » (remplacer une seance par sa copie identique) — ils doivent rester VERTS, la raison est ecrite.
M00 = le Code.js d'AVANT F2-A' (master fd8bf703, ft-v1266), lu avec `git show` : les temoins doivent ROUGIR sur le comportement qu'on corrige.
Usage : python3 tools/mut_f2_seances_union.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CO = 'Code.js'
COPIES = ('Code.js', 'tests/_garde_reseau.js', 'tests/parcours/nut_secu_p1.js', 'tests/parcours/f2_seances_union.js', 'tools/banc_f2_seances_union.js', 'tools/nut_serveur_proc.js', 'tools/aide_restauration_v4.js')
SHA_AVANT = 'fd8bf7039fff0aae4564bb585dd5e1f13c84da4e'   # master ft-v1266, juste AVANT F2-A'

APPEL = "        existing.sessions = _sessFusion_(exSess, inSess).liste;\n"
REMPL = "    if (JSON.stringify(liste[j]) !== JSON.stringify(s)) { liste[j] = s; res.remplacees++; }\n"
IDENT = "  if ((t === 'string' && id.trim() !== '') || (t === 'number' && isFinite(id))) return 'i:' + String(id);\n"
AJOUT = "      if (!(k in parId)) { parId[k] = liste.length; liste.push(s); res.ajoutees++; return; }\n"

# (nom, ancre | liste de (ancre, remplacement) | 'AVANT', remplacement, tests ATTENDUS (prefixes), sections a rejouer, attendu 'GARDE' | 'OK')
MUT = [
    ("M00 le Code.js d'AVANT F2-A' (master fd8bf703) : remplacement + garde de taille (60 % des 30)", 'AVANT', None,
     ['F2A-A·C02a', 'F2A-A·C02b', 'F2A-A·C04', 'F2A-A·C05', 'F2A-A2a', 'F2A-A3a', 'F2A-F1', 'F2A-U01', 'F2A-S01'], 'Z,A,B,C,D,E,F,U,S', 'GARDE'),
    ("M01 remplacement pur : `existing.sessions = envoi` (le comportement d'avant, sans la fusion)", APPEL,
     "        existing.sessions = inSess;\n", ['F2A-A·C02a', 'F2A-A·C04', 'F2A-A2a', 'F2A-A3a', 'F2A-E01e', 'F2A-F1'], 'A,E,F', 'GARDE'),
    ("M02 la base n'est plus conservee : la liste de depart est VIDE (seul l'envoi reste)", "  var liste = stockees.slice(), parId = Object.create(null), libres = Object.create(null);\n",
     "  var liste = [], parId = Object.create(null), libres = Object.create(null);\n", ['F2A-A·C02a', 'F2A-A·C08a', 'F2A-A·C08b', 'F2A-A3a'], 'A', 'GARDE'),
    ("M03 un identifiant connu n'est plus remplace : la version de la BASE gagne toujours", REMPL,
     "    if (false) { liste[j] = s; res.remplacees++; }\n", ['F2A-B01', 'F2A-B02', 'F2A-B04', 'F2A-A3a'], 'A,B', 'GARDE'),
    ("M04 aucune deduplication par identifiant : tout identifiant est de nouveau AJOUTE (un rejeu duplique)", AJOUT,
     "      if (true) { parId[k] = liste.length; liste.push(s); res.ajoutees++; return; }\n", ['F2A-A·C13', 'F2A-A·C01', 'F2A-A3c', 'F2A-F4'], 'A,F', 'GARDE'),
    ("M05 l'identifiant n'est pas normalise : 1700000000000 (nombre) et \"1700000000000\" (texte) deviennent DEUX seances", IDENT,
     "  if ((t === 'string' && id.trim() !== '') || (t === 'number' && isFinite(id))) return 'i:' + t + ':' + String(id);\n", ['F2A-B05'], 'B', 'GARDE'),
    ("M06 l'identifiant est « normalise » trop loin (minuscules, espaces) : deux seances distinctes fusionnent", IDENT,
     "  if ((t === 'string' && id.trim() !== '') || (t === 'number' && isFinite(id))) return 'i:' + String(id).trim().toLowerCase();\n", ['F2A-B06'], 'B', 'GARDE'),
    ("M07 un identifiant VIDE est pris pour un identifiant : toutes les seances d'id « » se confondent", IDENT,
     "  if ((t === 'string') || (t === 'number' && isFinite(id))) return 'i:' + String(id);\n", ['F2A-B07a', 'F2A-B07b'], 'B', 'GARDE'),
    ("M08 l'identifiant 0 n'en est plus un (test « vrai/faux » au lieu de « nombre fini »)", IDENT,
     "  if ((t === 'string' && id.trim() !== '') || (t === 'number' && isFinite(id) && id)) return 'i:' + String(id);\n", ['F2A-B07c'], 'B', 'GARDE'),
    ("M09 un objet, une liste ou un booleen est pris pour un identifiant (« [object Object] »)", IDENT,
     "  if (id !== null && id !== undefined && id !== '') return 'i:' + String(id);\n", ['F2A-B07b'], 'B', 'GARDE'),
    ("M10 les entrees invalides sont ECRITES (une liste ou un nombre dans la liste est accepte comme seance)", "  function valide(s) { return !!s && typeof s === 'object' && !Array.isArray(s); }\n",
     "  function valide(s) { return !!s && typeof s === 'object'; }\n", ['F2A-C05'], 'C', 'GARDE'),
    ("M11 une liste invalide (objet, texte...) n'est plus ecartee : on la traite comme une liste", "      if (body.sessions !== null && !Array.isArray(body.sessions)) {\n",
     "      if (false) {\n", ['F2A-C04'], 'C', 'GARDE'),
    ("M12 l'empreinte des seances SANS identifiant inclut « synced » : un drapeau qui bascule cree un DOUBLON", "  return 'e:' + _sessCanon_(s, true);\n",
     "  return 'e:' + _sessCanon_(s, false);\n", ['F2A-A·C11', 'F2A-B04'], 'A,B', 'GARDE'),
    ("M13 multi-ensemble perdu : sans identifiant, plusieurs copies identiques s'ecrasent en une", "      j = libres[k].shift();\n",
     "      j = libres[k][0];\n", ['F2A-B11'], 'B', 'GARDE'),
    ("M14 l'ANCIEN GARDE-FOU DE TAILLE revient : un envoi < 60 % d'une base >= 30 n'est pas fusionne (les neuves sont perdues)", APPEL,
     "        if (!retreci) existing.sessions = _sessFusion_(exSess, inSess).liste;\n", ['F2A-A·C05', 'F2A-A2b', 'F2A-A3a', 'F2A-F3'], 'A,F', 'GARDE'),
    ("M15 le SIGNAL « appareil amputé » n'est plus ecrit (HIST_SHRINK)", "          _logHistShrink_(email, inSess.length, exSess.length);\n",
     "", ['F2A-C03', 'F2A-G06'], 'C,G', 'GARDE'),
    ("M16 l'envoi VIDE efface la base", APPEL,
     "        existing.sessions = inSess.length === 0 ? [] : _sessFusion_(exSess, inSess).liste;\n", ['F2A-A·C08a', 'F2A-C03'], 'A,C', 'GARDE'),
    ("M17 une seance remplacee CHANGE DE PLACE (retiree puis ajoutee a la fin)", REMPL,
     "    if (JSON.stringify(liste[j]) !== JSON.stringify(s)) { liste.splice(j, 1); liste.push(s); res.remplacees++; }\n", ['F2A-B01', 'F2A-A3a'], 'A,B', 'GARDE'),
    ("M18 la telemetrie parle a chaque envoi (plus de seuil)", "        const retreci = exSess.length >= SEUIL_SIGNAL && inSess.length < exSess.length * PART_SIGNAL;\n",
     "        const retreci = true;\n", ['F2A-G05'], 'G', 'GARDE'),
    ("M19 l'erreur d'ecriture du compte est AVALEE (la reponse dit « ok » alors que rien n'est ecrit)", "    saveUserData_(email, existing);\n    // ⚙️ NUT-SYNC-01 FINAL : l'écriture durable est faite",
     "    try { saveUserData_(email, existing); } catch (eSilence) {}\n    // ⚙️ NUT-SYNC-01 FINAL : l'écriture durable est faite", ['F2A-E01', 'F2A-E02'], 'E', 'GARDE'),
    ("M20 le VERROU ne verrouille plus rien (un faux verrou toujours accorde) : deux envois simultanes se perdent", "    verrou = _nutVerrouPrendre_();\n    if (!verrou) return json_({status:'error', ok:false, code:'NUT_LOCK_BUSY'",
     "    verrou = { v: { releaseLock: function() {} }, t0: 0, rendu: false, ms: 0 };\n    if (!verrou) return json_({status:'error', ok:false, code:'NUT_LOCK_BUSY'", ['F2A-F1', 'F2A-F3', 'F2A-F4'], 'F', 'GARDE'),
    ("M21 les seances INCONNUES de la base ne sont plus ajoutees (l'envoi n'apporte rien de neuf)", AJOUT,
     "      if (!(k in parId)) { res.ignorees++; return; }\n", ['F2A-A·C01', 'F2A-A·C04', 'F2A-A·C05', 'F2A-C10'], 'A,C', 'GARDE'),
    ("M22 la fusion modifie la liste de la base EN PLACE (plus de copie) — equivalent en production, mais la pureté de la fonction est un invariant", "  var liste = stockees.slice(), parId = Object.create(null), libres = Object.create(null);\n",
     "  var liste = stockees, parId = Object.create(null), libres = Object.create(null);\n", ['F2A-A4a'], 'A', 'GARDE'),
    ("M23 le journal du serveur recopie l'adresse du compte dans la ligne « envoi plus court » (fuite de donnee)", "                     exSess.length + ' en base — aucune séance retirée, les neuves sont ajoutées');\n",
     "                     exSess.length + ' en base — aucune séance retirée, les neuves sont ajoutées (' + email + ')');\n", ['F2A-C04b'], 'C', 'GARDE'),
    ("M24 (commentaire) un mot du commentaire de F2-A' est modifie : le banc doit rester VERT", "   · Rejouer le même envoi ne change plus rien (idempotent)",
     "   · Rejouer le même envoi ne modifie plus rien (idempotent)", [], 'Z,A,B,C', 'OK'),
    ("M25 (EQUIVALENT, attendu VERT) une seance identique est « remplacee » par sa copie : aucun effet observable, ni sur le contenu ni sur l'ordre", REMPL,
     "    if (true) { liste[j] = s; res.remplacees++; }\n", [], 'A,B', 'OK'),
    # ── 16/11/2026 : U-29 (identite par `ts`) et la sauvegarde qui dit ce qu'elle n'a pas pu ecrire ──
    ("M29 sauvegarde : le champ `erreurs` n'est plus ecrit (un compte illisible redevient invisible)", "      erreurs: erreurs,\n", "", ['F2A-S01'], 'S', 'GARDE'),
    ("M30 sauvegarde : `user_count_attendu` compte les comptes ECRITS (plus de moyen de voir l'ecart)", "      user_count_attendu: userKeys.length,\n", "      user_count_attendu: users.length,\n", ['F2A-S01'], 'S', 'GARDE'),
    ("M31 sauvegarde : l'echec de lecture d'un compte n'est plus note dans `erreurs`", "        erreurs.push({ cle: k, raison: String((e && e.message) || e).slice(0, 80) });\n", "", ['F2A-S01'], 'S', 'GARDE'),
    ("M32 sauvegarde : le journal ne signale plus l'ecart", "(erreurs.length ? ' ⚠️ '", "(false ? ' ⚠️ '", ['F2A-S03'], 'S', 'GARDE'),
    ("M33 restauration : la restauration d'un compte n'ecrit plus ses seances (le test de restauration isolee doit le voir)", "      saveUserData_(email, data);\n    } catch (eEcriture) {",
     "      saveUserData_(email, Object.assign({}, data, { sessions: [] }));\n    } catch (eEcriture) {", ['F2A-S04', 'F2A-S07'], 'S', 'GARDE'),
    # ── 16/11/2026 (2ᵉ passe, contre-expertise) : U-29 durci (preuve + ambiguïté) et restauration (santé, garde de complétude, échec partiel) ──
    ("M41 restauration : la section `sante` du fichier n'est plus fusionnee", "if (_santeFichier[c] !== undefined) _pf[c] = _santeFichier[c];", "", ['F2A-S07', 'F2A-S10'], 'S', 'GARDE'),
    ("M45 restauration : `sante` laisse passer N'IMPORTE QUEL champ (premium, name...), pas seulement la sante", "_CHAMPS_SANTE_.forEach(function(c) { if (_santeFichier[c] !== undefined) _pf[c] = _santeFichier[c]; });",
     "Object.keys(_santeFichier).forEach(function(c) { _pf[c] = _santeFichier[c]; });", ['F2A-S08'], 'S', 'GARDE'),
    ("M46 restauration : une `sante` qui n'est pas un objet n'est plus refusee", "  if (_santeFichier !== undefined && (_santeFichier === null || typeof _santeFichier !== 'object' || Array.isArray(_santeFichier))) {", "  if (false) {", ['F2A-S08b'], 'S', 'GARDE'),
    ("M47 restauration : en cas d'echec, la sante ecrite en premier n'est plus retablie", "      try { if (_hAvant === null || _hAvant === undefined) _sp.deleteProperty(santeKey_(email)); else _sp.setProperty(santeKey_(email), _hAvant); } catch (e2) { _retabli = false; }", "", ['F2A-S11', 'F2A-S12'], 'S', 'GARDE'),
    ("M48 restauration : l'echec d'ecriture est annonce « ok »", "return json_({status:'error', ok:false, error:'restauration_echouee'", "return json_({status:'ok', ok:true, error:'restauration_echouee'", ['F2A-S11'], 'S', 'GARDE'),
    # ── 17/11/2026 (contre-expertise ciblee) : U-29 RETIRE (identite = contenu seul) et restauration durcie ──
    ("M26 U-29 RETIRE : le `ts` + jour + exercices identifie de nouveau une seance sans id (l'ecart F2-ancien-identite-ambigue : la version differente ECRASE l'autre)", "  return 'e:' + _sessCanon_(s, true);\n}\nfunction _sessFusion_",
     "  if (typeof s.ts === 'number' && isFinite(s.ts) && typeof s.date === 'string' && Array.isArray(s.exs)) return 't:' + s.ts + '|' + s.date + '|' + s.exs.map(function(x) { return x && x.name; }).join(',');\n  return 'e:' + _sessCanon_(s, true);\n}\nfunction _sessFusion_", ['F2A-U14', 'F2A-U14b', 'F2A-U14c', 'F2A-U15'], 'U', 'GARDE'),
    ("M27 U-29 RETIRE : le `ts` SEUL identifie une seance sans id (la collision du 16/11)", "  return 'e:' + _sessCanon_(s, true);\n}\nfunction _sessFusion_",
     "  if (typeof s.ts === 'number' && isFinite(s.ts)) return 't:' + s.ts;\n  return 'e:' + _sessCanon_(s, true);\n}\nfunction _sessFusion_", ['F2A-U09', 'F2A-U12', 'F2A-U14'], 'U', 'GARDE'),
    ("M28 les copies strictement identiques ne sont plus reconnues (chaque envoi les AJOUTE : un rejeu duplique)", "      j = libres[k].shift();\n", "      if (true) { liste.push(s); res.ajoutees++; return; }\n", ['F2A-U22', 'F2A-U23', 'F2A-U07'], 'U', 'GARDE'),
    ("M34 un `id` PRESENT mais invalide est de nouveau confondu avec un `ts` (l'identite par ts s'applique a un id objet)", "  return 'e:' + _sessCanon_(s, true);\n}\nfunction _sessFusion_",
     "  if (typeof s.ts === 'number' && isFinite(s.ts)) return 't:' + s.ts;\n  return 'e:' + _sessCanon_(s, true);\n}\nfunction _sessFusion_", ['F2A-U05'], 'U,B', 'GARDE'),
    ("M42 restauration : la GARDE DE COMPLETUDE est eteinte (un compte sans sante est restaure sans que personne ne le dise)", "    if (!_aSante && body.sansSante !== true) {", "    if (false) {", ['F2A-S05', 'F2A-S09'], 'S', 'GARDE'),
    ("M43 restauration : `sansSante: true` n'est plus entendu (la garde refuse meme une declaration explicite)", "    if (!_aSante && body.sansSante !== true) {", "    if (!_aSante) {", ['F2A-S05b', 'F2A-S14b', 'F2A-S04'], 'S', 'GARDE'),
    ("M44 restauration : une `sante` VIDE (`{}`) est de nouveau prise pour une sauvegarde complete (REST-sante-vide)", "    if (!_aSante && body.sansSante !== true) {", "    if (!_aSante && !_santeFichier && body.sansSante !== true) {", ['F2A-S14'], 'S', 'GARDE'),
    ("M49 restauration : `sansSante: true` n'est plus controle pour sa COHERENCE (declare « sans sante » avec une sante presente)", "    if (body.sansSante === true && _aSante) {", "    if (false) {", ['F2A-S15'], 'S', 'GARDE'),
    ("M50 restauration : la relecture ne compare plus que les CARDINALITES (REST-meme-nombre-contenu-corrompu)", "    } else if (_sessCanon_(readBack[k], false) !== _sessCanon_(data[k], false)) _manquants.push(k);",
     "    } else if (((readBack[k] || []).length) !== ((data[k] || []).length)) _manquants.push(k);", ['F2A-S16a', 'F2A-S16b'], 'S', 'GARDE'),
    ("M51 restauration : la relecture ne compare plus le PROFIL (ni la sante) champ par champ", "        if (_sessCanon_((readBack.profile || {})[c], false) !== _sessCanon_(data.profile[c], false)) _manquants.push('profile.' + c);", "        if (false) _manquants.push('profile.' + c);", ['F2A-S16c', 'F2A-S16d'], 'S', 'GARDE'),
    ("M52 restauration : la relecture invente un `partial` (faux positif : un `partial` des que le nom change)", "    } else if (_sessCanon_(readBack[k], false) !== _sessCanon_(data[k], false)) _manquants.push(k);", "    } else if (true) _manquants.push(k);", ['F2A-S16e', 'F2A-S07'], 'S', 'GARDE'),
    ("M53 restauration : la relecture oublie les records (`prs`)", "    } else if (_sessCanon_(readBack[k], false) !== _sessCanon_(data[k], false)) _manquants.push(k);", "    } else if (k !== 'prs' && _sessCanon_(readBack[k], false) !== _sessCanon_(data[k], false)) _manquants.push(k);", ['F2A-S16b'], 'S', 'GARDE'),
    # ── 18/11/2026 (arbitrage de Michel : P1–P4) : une neutralisation PAR protection ajoutée ──
    ("M60 P1 : `sourceEmail` n'est plus exigé (l'identité est de nouveau devinée)", "  if (typeof _src !== 'string' || !_src.trim()) return json_(", "  if (false) return json_(", ['F2A-P1a', 'F2A-P1e'], 'P', 'GARDE'),
    ("M61 P1 : `sourceEmail` n'est plus comparé au compte visé (les données de B vers A)", "[['sourceEmail', _src], ['data.email', data.email], ['data.profile.email', data.profile.email]]", "[['data.email', data.email], ['data.profile.email', data.profile.email]]", ['F2A-P1b'], 'P', 'GARDE'),
    ("M62 P1 : `data.email` n'est plus comparé", "['data.email', data.email], ['data.profile.email', data.profile.email]]", "['data.profile.email', data.profile.email]]", ['F2A-P1c'], 'P', 'GARDE'),
    ("M63 P1 : `data.profile.email` n'est plus comparé", ", ['data.profile.email', data.profile.email]]", "]", ['F2A-P1d'], 'P', 'GARDE'),
    ("M64 P1 : la comparaison n'est plus normalisée (une ancienne sauvegarde légitime à adresse en majuscules est refusée)", "x[1].toLowerCase().trim() !== email); }).map(function(x) { return x[0]; });", "x[1] !== email); }).map(function(x) { return x[0]; });", ['F2A-P1f'], 'P', 'GARDE'),
    ("M65 P2 : une propriété PRÉSENTE mais illisible est de nouveau rendue comme une ABSENCE (`not_found`)", "    if (c.erreur) return json_({status:'error', ok:false, error:c.erreur, motif:c.motif, detail:'une propriété", "    if (false) return json_({status:'error', ok:false, error:c.erreur, motif:c.motif, detail:'une propriété", ['F2A-P2g'], 'P', 'GARDE'),
    ("M66 P2 : la lecture admin n'exige plus le jeton", "function handleAdminReadAccount_(body) {\n  if (!_checkTok_('ADMIN_TOKEN', body.adminToken)) return json_(", "function handleAdminReadAccount_(body) {\n  if (false) return json_(", ['F2A-P2a'], 'P', 'GARDE'),
    ("M67 P2 : la lecture admin ne prend plus le verrou (un instantané incohérent devient possible)", "  const _hv = _nutVerrouPrendre_();\n  if (!_hv) return json_({status:'error', ok:false, error:'busy', code:'NUT_LOCK_BUSY', retryable:true});\n  try {\n    const c = _etatCompteLire_(email);", "  const _hv = {};\n  try {\n    const c = _etatCompteLire_(email);", ['F2A-P2j', 'F2A-P2k'], 'P', 'GARDE'),
    ("M68 P3 : l'état ne couvre plus `h_` (une santé modifiée sans changement de date passe)", "_sha256hex_(_sessCanon_({ u: u, h: h }, false))", "_sha256hex_(_sessCanon_({ u: u }, false))", ['F2A-P3c'], 'P', 'GARDE'),
    ("M69 P3 : l'état se réduit à `updatedAt` (le piège que l'arbitrage interdit)", "_sha256hex_(_sessCanon_({ u: u, h: h }, false))", "_sha256hex_(String(u && u.updatedAt))", ['F2A-P3c', 'F2A-P3d'], 'P', 'GARDE'),
    ("M70 P3 : `etatAttendu` n'est plus OBLIGATOIRE", "    if (typeof body.etatAttendu !== 'string' || !body.etatAttendu) return json_(", "    if (false) return json_(", ['F2A-P3a'], 'P', 'GARDE'),
    ("M71 P3 : un état périmé n'est plus refusé (une saisie récente est écrasée en silence)", "    if (body.etatAttendu !== _lu.etat) return json_(", "    if (false) return json_(", ['F2A-P3b', 'F2A-P3c', 'F2A-P3d', 'F2A-P3e'], 'P', 'GARDE'),
    ("M72 P3 : le verrou occupé n'arrête plus la restauration (la précondition n'est plus sous verrou)", "  if (!_hv) return json_({status:'error', error:'busy', ok:false, code:'NUT_LOCK_BUSY', retryable:true});", "  if (false) return json_({status:'error', error:'busy', ok:false, code:'NUT_LOCK_BUSY', retryable:true});", ['F2A-P3i'], 'P', 'GARDE'),
    ("M73 P3 : la réponse « ok » ne porte plus le nouvel état", "    etat: _etatCompteLire_(email).etat   // 🔒 P3", "    etat: 'x'   // 🔒 P3", ['F2A-P3f'], 'P', 'GARDE'),
    ("M74 P4 : une migration partielle (santé restée dans `u_`) + sansSante n'est plus refusée", "    if (nonMigres.length) return { error: 'sante_non_migree', champs: nonMigres };", "    if (false) return { error: 'sante_non_migree', champs: nonMigres };", ['F2A-P4a', 'F2A-P4b'], 'P', 'GARDE'),
    ("M75 P4 : une divergence `u_` ≠ `h_` n'est plus refusée", "  if (divergents.length) return { error: 'sante_divergente_u_h', champs: divergents };", "  if (false) return { error: 'sante_divergente_u_h', champs: divergents };", ['F2A-P4d'], 'P', 'GARDE'),
    ("M76 P4 : un champ inconnu dans `h_` n'est plus refusé", "  if (inconnus.length) return { error: 'sante_h_champ_inconnu', champs: inconnus };", "  if (false) return { error: 'sante_h_champ_inconnu', champs: inconnus };", ['F2A-P4e'], 'P', 'GARDE'),
    ("M77 P4 : une santé vivante peut de nouveau être retirée sans confirmation (suppression silencieuse)", "  if (JSON.stringify(_sansDoublonTrie_(perdue)) !== JSON.stringify(_sansDoublonTrie_(confirmee))) return", "  if (false) return", ['F2A-P4f', 'F2A-P4g', 'F2A-P4i'], 'P', 'GARDE'),
    ("M78 P4 : une confirmation EXCESSIVE est acceptée (la liste n'a plus à être exacte)", "  if (JSON.stringify(_sansDoublonTrie_(perdue)) !== JSON.stringify(_sansDoublonTrie_(confirmee))) return", "  if (_sansDoublonTrie_(perdue).some(function(c) { return _sansDoublonTrie_(confirmee).indexOf(c) < 0; })) return", ['F2A-P4g'], 'P', 'GARDE'),
    ("M79 P4 : une valeur REMPLACÉE n'est plus comptée comme une perte", "(apres[c] === undefined || _sessCanon_(apres[c], false) !== _sessCanon_(vivante[c], false))", "(apres[c] === undefined)", ['F2A-P4i'], 'P', 'GARDE'),
    ("M80 P4 : une confirmation qui n'est pas une liste n'est plus reconnue comme invalide", "  if (confirmee !== undefined && !Array.isArray(confirmee)) return { error: 'sante_confirmation_invalide', champs: [] };", "  if (false) return { error: 'sante_confirmation_invalide', champs: [] };", ['F2A-P4g'], 'P', 'GARDE'),
    ("M81 P2/P4 : `h_` illisible est de nouveau traité comme « pas de santé »", "if (!lh.ok) return { erreur: 'h_illisible' };", "if (!lh.ok) lh = { ok: true, v: null };", ['F2A-P2h', 'F2A-P4m'], 'P', 'GARDE'),
    ("M82 P2/P3 : `u_` illisible est de nouveau traité comme un compte absent", "if (!lu.ok) return { erreur: 'u_illisible' };", "if (!lu.ok) lu = { ok: true, v: null };", ['F2A-P2g', 'F2A-P2i', 'F2A-P4l'], 'P', 'GARDE'),
    ("M83 P4 : D6 — la santé migrée est comptée comme perdue avec sansSante (faux refus)", "    apres = h;", "    apres = {};", ['F2A-P4j'], 'P', 'GARDE'),
    # ── V5 (18/11/2026) : postcondition de restauration (A) et structure exploitable (B) ──
    ("M84 A : les RÉSIDUS (champ présent à la relecture alors qu'il devait disparaître) ne comptent plus — retour du faux succès « ok » avec `bloodTests` encore là", "  if (_verdict.manquants.length || _verdict.residuels.length) {\n", "  if (_verdict.manquants.length) {\n", ['F2A-Q01', 'F2A-Q02', 'F2A-Q03'], 'Q', 'GARDE'),
    ("M85 A : les VALEURS MANQUANTES ne comptent plus (seuls les résidus font échouer)", "  if (_verdict.manquants.length || _verdict.residuels.length) {\n", "  if (_verdict.residuels.length) {\n", ['F2A-Q07b'], 'Q', 'GARDE'),
    ("M86 A : D6 — `h_` réécrit n'est plus détecté (la garantie octet pour octet n'est plus vérifiée)", "    if (body.sansSante === true && _sp.getProperty(santeKey_(email)) !== _hAvant) _verdict.manquants.push('h_');", "    // M86", ['F2A-Q12b'], 'Q', 'GARDE'),
    ("M87 A : une écriture PARTIELLE est classée « aucune » (confondue avec un échec sans écriture)", "(a.etat === _lu.etat ? 'aucune' : 'partielle')", "'aucune'", ['F2A-Q03'], 'Q', 'GARDE'),
    ("M88 A : le résultat partiel n'est plus déclaré AMBIGU", "error:'restauration_incomplete', ecriture:_classe.ecriture, etat_ambigu:true,", "error:'restauration_incomplete', ecriture:_classe.ecriture, etat_ambigu:false,", ['F2A-Q03'], 'Q', 'GARDE'),
    ("M89 A : le résultat partiel n'interdit plus le nouvel essai automatique", "etat_ambigu:true, nouvel_essai_automatique:false", "etat_ambigu:true, nouvel_essai_automatique:true", ['F2A-Q03'], 'Q', 'GARDE'),
    ("M90 A : NOUVEL ESSAI AUTOMATIQUE après un résultat ambigu (le serveur réécrit)", "    if (_verdict.manquants.length || _verdict.residuels.length) _classe = _classer();", "    if (_verdict.manquants.length || _verdict.residuels.length) { _classe = _classer(); try { saveUserData_(email, data); } catch (eRe) { /* réessai automatique */ } }", ['F2A-Q05'], 'Q', 'GARDE'),
    ("M91 B : les données à restaurer ne sont plus contrôlées (profil tableau / chaîne passent)", "  if (_motifStruct) return json_(", "  if (false) return json_(", ['F2A-Q26'], 'Q', 'GARDE'),
    ("M92 B : le `u_` vivant de structure inexploitable est de nouveau lu comme un compte", "if (_m) return { erreur: 'u_structure_inexploitable', motif: _m };", "if (false) return { erreur: 'u_structure_inexploitable', motif: _m };", ['F2A-Q18', 'F2A-Q19', 'F2A-Q20', 'F2A-Q22', 'F2A-Q24'], 'Q', 'GARDE'),
    ("M93 B : un objet vide `{}` redevient un compte exploitable", "  if (!Object.keys(d).length) return 'objet_vide';\n", "", ['F2A-Q18', 'F2A-Q19'], 'Q', 'GARDE'),
    ("M94 B : un profil en tableau / chaîne / nombre redevient exploitable", "  if (d.profile !== undefined && d.profile !== null && !objet(d.profile)) return 'profile_non_objet';\n", "", ['F2A-Q20', 'F2A-Q22', 'F2A-Q24', 'F2A-Q26'], 'Q', 'GARDE'),
    ("M95 B : `sessions` en chaîne n'est plus refusé (données à restaurer)", "    if (d.sessions !== undefined && d.sessions !== null && !Array.isArray(d.sessions)) return 'sessions_non_liste';\n", "", ['F2A-Q26'], 'Q', 'GARDE'),
    ("M96 B : un ancien compte vivant SANS `profile` est refusé à tort (format légitime rejeté)", "  if (d.profile !== undefined && d.profile !== null && !objet(d.profile)) return 'profile_non_objet';\n", "  if (!objet(d.profile)) return 'profile_non_objet';\n", ['F2A-Q28'], 'Q', 'GARDE'),
    ("M97 B : `sessions` / `prs` nuls (ancien format) sont refusés à tort", "    if (d.sessions !== undefined && d.sessions !== null && !Array.isArray(d.sessions)) return 'sessions_non_liste';\n", "    if (d.sessions !== undefined && !Array.isArray(d.sessions)) return 'sessions_non_liste';\n", ['F2A-Q27'], 'Q', 'GARDE'),
    ("M98 A : un champ de SANTÉ présent mais non attendu n'est plus un résidu", "    else if (rp[c] !== undefined) residuels.push('profile.' + c);\n", "    else { /* M98 */ }\n", ['F2A-Q01', 'F2A-Q14'], 'Q', 'GARDE'),
    ("M99 A : un champ de haut niveau non attendu n'est plus un résidu", "  Object.keys(R).forEach(function(k) { if (k !== 'profile' && data[k] === undefined) residuels.push(k); });\n", "", ['F2A-Q15'], 'Q', 'GARDE'),
    ("M100 A : l'échec d'écriture (exception) n'est plus classé par l'ÉTAT RELU (toujours « aucune »)", "ecriture:_c.ecriture, etat_ambigu:(_c.ecriture !== 'aucune')", "ecriture:'aucune', etat_ambigu:false", ['F2A-Q10'], 'Q', 'GARDE'),
    ("M101 A : TAUTOLOGIE — la postcondition compare les données écrites à elles-mêmes (le vert qui ne peut pas rougir)", "_verdict = _postRestauration_(loadUserData_(email) || {}, data,", "_verdict = _postRestauration_(data, data,", ['F2A-Q01', 'F2A-Q02', 'F2A-Q07'], 'Q', 'GARDE'),
]


def syntaxe_ok(chemin):
    r = subprocess.run(['node', '-e', "new (require('vm').Script)(require('fs').readFileSync(process.argv[1],'utf8'))", chemin], capture_output=True, text=True)
    return r.returncode == 0


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_f2a_')
    for f in COPIES:
        d = os.path.join(tmp, f)
        os.makedirs(os.path.dirname(d), exist_ok=True)
        shutil.copy2(os.path.join(SRC, f), d)
    return tmp


def banc(arbre, sections):
    r = subprocess.run(['node', 'tools/banc_f2_seances_union.js'], cwd=arbre, capture_output=True, text=True, timeout=900,
                       env=dict(os.environ, TZ='Europe/Paris', F2A_SEULEMENT=sections))
    out = r.stdout + r.stderr
    rouges = []
    for l in out.split('\n'):
        if l.startswith('❌ ROUGE'):
            rouges.append((l[len('❌ ROUGE '):].strip().split(' ')[0], l.strip()[:150]))
        elif 'PLANTAGE :' in l and not l.startswith('❌'):
            rouges.append(('PLANTAGE', l.strip()[:150]))
    if r.returncode not in (0, 1) and not rouges:
        rouges = [('PLANTAGE', 'code %d' % r.returncode)]
    return rouges, out


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    av = subprocess.run(['git', 'show', SHA_AVANT + ':' + CO], cwd=SRC, capture_output=True, text=True)
    AVANT = av.stdout if av.returncode == 0 else ''
    a0 = cloner()
    rouges, out0 = banc(a0, '')
    shutil.rmtree(a0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', [r[1] for r in rouges[:3]]); return 1
    m = re.search(r'(\d+) OK / (\d+) rouge', out0)
    print('  arbre sain : 0 rouge (%s OK) — point de depart valide\n' % (m.group(1) if m else '?'))
    conformes = total = 0
    for spec in MUT:
        nom, ancre, remplace, attendus, sections, attendu = spec
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        arbre = cloner()
        chemin = os.path.join(arbre, CO)
        src = open(chemin, encoding='utf-8').read()
        if ancre == 'AVANT':
            if not AVANT or AVANT == src:
                print('  INVALIDE  %s (code d\'avant introuvable : `git show` indisponible, ou identique)' % nom); shutil.rmtree(arbre, ignore_errors=True); continue
            src = AVANT
        else:
            n = src.count(ancre)
            if n != 1:
                print('  INVALIDE  %s (ancre trouvee %d fois, 1 attendue)' % (nom, n)); shutil.rmtree(arbre, ignore_errors=True); continue
            src = src.replace(ancre, remplace, 1)
        open(chemin, 'w', encoding='utf-8').write(src)
        if not syntaxe_ok(chemin):
            print('  INVALIDE  %s (syntaxe cassee par la mutation)' % nom); shutil.rmtree(arbre, ignore_errors=True); continue
        rouges, out = banc(arbre, sections)
        shutil.rmtree(arbre, ignore_errors=True)
        vrais = [r for r in rouges if r[0] != 'PLANTAGE' and not r[0].endswith('-PLANTAGE')]
        plante = len(vrais) != len(rouges)
        touche = [a for a in attendus if any(r[0].startswith(a) for r in vrais)]
        ok = (attendu == 'GARDE' and bool(touche)) or (attendu == 'OK' and not rouges)
        conformes += 1 if ok else 0
        print('  %s %s -> %d rouge(s)%s%s' % ('CONFORME   ' if ok else 'NON CONFORME', nom, len(rouges), ' (dont un PLANTAGE : il ne prouve rien)' if plante else '',
                                           ('  [attendu parmi : %s ; rouge : %s]' % (', '.join(attendus), ', '.join(touche))) if attendu == 'GARDE' and attendus else ''))
        for r in (rouges if os.environ.get('MUT_DETAIL') else rouges[:2]):
            print('        ' + r[1])
    print('\n  ==== %d / %d mutations conformes ====' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
