#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-SYNC-02 PHASE A, CORRECTIONS DE SECURITE (02/11/2026) : le banc `tools/banc_nut_phasea02.js` sait-il ROUGIR, et au BON endroit ?

[!!] SUR UNE COPIE JETABLE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation retire UN morceau d'une des deux protections (la porte PAR COMPTE avec son marqueur, la SUSPENSION) ou d'un de leurs voisins (verrou unique,
restauration admin, message du client) dans un clone ; le depot n'est jamais ecrit.
Point de depart : 0 rouge sur l'arbre sain (banc ENTIER). Une mutation est TUEE si le banc rougit (code 1) ET si CHACUN des temoins attendus fait partie des rouges.
Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout. L'extrait ORIGINAL et l'extrait MUTE sont imprimes.
Chaque mutation ne rejoue que ce dont elle a besoin : `PA02_SEULEMENT` (sections S serveur en memoire · D vrais processus · C vrais clients) et `PA02_BLOCS` (blocs PCxx / PDxx).
Le VRAI ancien client de production (section C) est extrait UNE fois du depot (`git`) puis passe a chaque clone par `FT_ANCIEN_CLIENT_DIR` — un clone n'a pas de `.git`.
Les mutations 'EQ' sont EQUIVALENTES (le comportement observable ne change pas) : elles doivent rester VERTES.
Les gros dossiers (images, bibliotheques, docs) sont LIES et non copies : seuls les fichiers .js de la racine sont mutes — une copie complete coute 8 s par mutation.
Usage : python3 tools/mut_nut_phasea02.py [M01|M02,M05|M10+]   (« M10+ » = de M10 jusqu'a la fin)    ·    python3 tools/mut_nut_phasea02.py --ancres   (verifie seulement les ancres, sans lancer le banc)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SU, CO = 'setup.js', 'Code.js'
G = lambda *c: ['B-PA02 ' + x + ' ' for x in c]
FAKE = "({ v: { releaseLock: function() {} }, t0: 0, rendu: false, ms: 0 })"      # un « verrou » qui ne verrouille rien
MARQ = "    if (nutMarque) existing.nutProto = Math.max(_nutProtoDe_(existing), Math.min(99, Math.floor(compat.version)));"
CONF = "        nutMarque = compat.volet && compat.ok && !nutSortie.refus;"

# (nom, [(fichier, ancre, remplacement)], temoins attendus, sections, blocs, genre)
MUT = [
    # ── la porte PAR COMPTE : le marqueur ──
    ('M01 le marqueur n est jamais pose (un compte a jour qui n a rien change redevient indiscernable d un compte d avant)',
     [(CO, CONF, "        nutMarque = false;")], G('PB02', 'PB03', 'PB03b', 'PB06b', 'PB07b', 'PB08'), 'S', '', 'GARDE'),
    ('M02 le marqueur est pose AUSSI par un envoi suspendu, refuse ou tombe en erreur confinee (une transition annoncee avant d etre appliquee)',
     [(CO, MARQ, "    if (compat.volet && compat.ok) existing.nutProto = Math.max(_nutProtoDe_(existing), Math.min(99, Math.floor(compat.version)));")], G('PB07'), 'S', '', 'GARDE'),
    ('M03 un ancien client toleré pose lui aussi le marqueur (il ferait refuser son propre appareil des l envoi suivant)',
     [(CO, CONF, "        nutMarque = compat.volet && !nutSortie.refus;"),
      (CO, MARQ, "    if (nutMarque) existing.nutProto = Math.max(_nutProtoDe_(existing), NUT_PROTOCOLE_MIN_);")], G('PB01', 'PB07'), 'S', '', 'GARDE'),
    ('M04 le marqueur est pose dans une SECONDE ecriture du compte, apres la principale (la donnee et la transition ne sont plus durables ensemble)',
     [(CO, MARQ, ""),
      (CO, "    saveUserData_(email, existing);\n    // ⚙️ NUT-SYNC-01 FINAL : l'écriture durable est faite", "    saveUserData_(email, existing);\n    if (nutMarque) { existing.nutProto = Math.max(_nutProtoDe_(existing), Math.min(99, Math.floor(compat.version))); saveUserData_(email, existing); }\n    // ⚙️ NUT-SYNC-01 FINAL : l'écriture durable est faite")], G('PB06b'), 'S', '', 'GARDE'),
    ('M05 le marqueur peut RECULER (un client plus ancien le ramene a sa version)',
     [(CO, MARQ, "    if (nutMarque) existing.nutProto = Math.min(99, Math.floor(compat.version));")], G('PB08'), 'S', '', 'GARDE'),
    ('M06 le marqueur n est plus borne (une version absurde est ecrite telle quelle)',
     [(CO, MARQ, "    if (nutMarque) existing.nutProto = Math.max(_nutProtoDe_(existing), Math.floor(compat.version));")], G('PB08'), 'S', '', 'GARDE'),
    # ── la porte PAR COMPTE : les preuves ──
    ('M07 la preuve « marqueur » est ignoree (un compte a jour sans trace dans ses donnees est de nouveau indiscernable)',
     [(CO, "  if (isFinite(m) && m >= NUT_PROTOCOLE_MIN_) return Math.floor(m);\n", "")], G('PB03b', 'PB05'), 'S', '', 'GARDE'),
    ('M08 les preuves « registre » et « memoire des operations » sont ignorees',
     [(CO, "  if ((Array.isArray(p.foodSupprimes) && p.foodSupprimes.length) || (Array.isArray(p.nutOps) && p.nutOps.length)) return NUT_PROTOCOLE_MIN_;\n", "")], G('PB05'), 'S', '', 'GARDE'),
    ('M09 la preuve « ligne deja revisee » est ignoree',
     [(CO, "  for (var i = 0; i < l.length; i++) { if (_nutRevisionDe_(l[i]) > 0) return NUT_PROTOCOLE_MIN_; }\n", "")], G('PB05'), 'S', '', 'GARDE'),
    ('M10 la revision du compte (nutRev) compte comme preuve (une ecriture ancienne la fait monter : l ancien client se ferait refuser par son propre passe)',
     [(CO, "  var l = Array.isArray(p.foodLog) ? p.foodLog : [];\n  for (var i", "  if (Number(p.nutRev) > 0) return NUT_PROTOCOLE_MIN_;\n  var l = Array.isArray(p.foodLog) ? p.foodLog : [];\n  for (var i")], G('PB05', 'PB01'), 'S', '', 'GARDE'),
    ('M11 la zone de recuperation compte comme preuve (la voie ancienne en ecrit aussi)',
     [(CO, "  var p = (c && c.profile) || {};\n  if ((Array.isArray(p.foodSupprimes)", "  var p = (c && c.profile) || {};\n  if (c && c.recupNut) return NUT_PROTOCOLE_MIN_;\n  if ((Array.isArray(p.foodSupprimes)")], G('PB05'), 'S', '', 'GARDE'),
    ('M12 le marqueur est accepte sous le minimum dans _nutProtoDe_ (EQUIVALENTE : tous les appelants comparent encore a NUT_PROTOCOLE_MIN_ — porte, marqueur, restauration — le comportement observable ne change pas)',
     [(CO, "  if (isFinite(m) && m >= NUT_PROTOCOLE_MIN_) return Math.floor(m);", "  if (isFinite(m) && m >= 1) return Math.floor(m);")], G('PB05b'), 'S', '', 'EQ'),
    # ── la porte PAR COMPTE : la decision ──
    ('M13 la porte ne refuse plus jamais un ancien client sur un compte a etat v3 (resurrection, ecrasement, perte silencieuse)',
     [(CO, "  return _nutProtoDe_(existing) >= NUT_PROTOCOLE_MIN_;\n}", "  return false;\n}")], G('PB02b', 'PB02d', 'PB03b', 'PB05', 'PB15'), 'S', '', 'GARDE'),
    ('M14 la porte refuse TOUS les anciens clients, partout (la premiere version : un compte sans appareil a jour perdrait sa sauvegarde serveur sans le savoir)',
     [(CO, "  return _nutProtoDe_(existing) >= NUT_PROTOCOLE_MIN_;\n}", "  return true;\n}")], G('PB01', 'PB03c', 'PB04b', 'PB05'), 'S', '', 'GARDE'),
    ('M15 un envoi qui se dit a jour SANS requestId valide est accepte (il ne peut pas lire d accuse)',
     [(CO, "  return { ok: !!requestId && version >= NUT_PROTOCOLE_MIN_, version: version, volet: true };", "  return { ok: version >= NUT_PROTOCOLE_MIN_, version: version, volet: true };")], G('PB04', 'PB07'), 'S', '', 'GARDE'),
    ('M16 un envoi « a jour » sans accuse possible n est refuse que sur un compte a etat v3 (sur un compte neuf il passerait)',
     [(CO, "  if (compat.version >= NUT_PROTOCOLE_MIN_) return true;\n", "")], G('PB04'), 'S', '', 'GARDE'),
    ('M17 la version minimale du protocole est abaissee a 2',
     [(CO, "var NUT_PROTOCOLE_MIN_ = 3;", "var NUT_PROTOCOLE_MIN_ = 2;")], G('PB04b', 'PB14'), 'S', '', 'GARDE'),
    ('M18 le refus d un ancien client est annonce « reessayable » (l appareil bouclerait sur une impossibilite)',
     [(CO, "retryable:(nutEchec.code === 'NUT_INTERNE' || nutEchec.code === 'NUT_SUSPENDU')", "retryable:true")], G('PB02b'), 'S', '', 'GARDE'),
    ('M19 le refus d un ancien client n est plus journalise comme toléré (le journal ne dit plus ce que la tolerance laisse passer)',
     [(CO, "      if (compat.volet && !compat.ok) Logger.log('[FT COMPAT] ancien client toléré : version ' + compat.version + ', compte sans état v3 — chemin d\\'avant (remplacement avec copie de sécurité)');\n", "")], G('PB01b'), 'S', '', 'GARDE'),
    # ── la suspension ──
    ('M20 la suspension ne s applique jamais (la propriete est lue mais sans effet)',
     [(CO, "    if (compat.volet && _nutSuspendu_()) {", "    if (false) {")], G('PB09', 'PB09c', 'PB09e', 'PB10', 'PB11'), 'S', '', 'GARDE'),
    ('M21 la suspension ne couvre pas les anciens clients (un ancien contourne la suspension sur un compte sans etat v3)',
     [(CO, "    if (compat.volet && _nutSuspendu_()) {", "    if (compat.volet && compat.ok && _nutSuspendu_()) {")], G('PB09c', 'PB09d'), 'S', '', 'GARDE'),
    ('M22 en cas de doute (lecture de la propriete impossible) la suspension tombe ACTIVE (le sens dangereux)',
     [(CO, "  } catch (e) { return true; }                                                     // en cas de doute : SUSPENDU", "  } catch (e) { return false; }                                                     // en cas de doute : SUSPENDU")], G('PB10b'), 'S', '', 'GARDE'),
    ('M23 la valeur « 0 » compte comme suspendu',
     [(CO, "['0', 'false', 'non', 'off', 'no'].indexOf(v) < 0", "['false', 'non', 'off', 'no'].indexOf(v) < 0")], G('PB10'), 'S', '', 'GARDE'),
    ('M24 la casse compte (« FALSE », « Off » suspendent)',
     [(CO, "getProperty(NUT_SUSPENSION_PROP_) || '').trim().toLowerCase();", "getProperty(NUT_SUSPENSION_PROP_) || '').trim();")], G('PB10'), 'S', '', 'GARDE'),
    ('M25 la suspension est annoncee « non reessayable » (l appareil abandonnerait ses operations en attente)',
     [(CO, "retryable:(nutEchec.code === 'NUT_INTERNE' || nutEchec.code === 'NUT_SUSPENDU')", "retryable:(nutEchec.code === 'NUT_INTERNE')")], G('PB09', 'PB09d', 'PB10b'), 'S', '', 'GARDE'),
    ('M26 la suspension n est plus journalisee',
     [(CO, "      Logger.log('[FT SUSPENSION] Nutrition suspendue (propriété ' + NUT_SUSPENSION_PROP_ + ') — rien de Nutrition n\\'est lu ni écrit, le reste du profil est enregistré');\n", "")], G('PB09b'), 'S', '', 'GARDE'),
    ('M27 une suspension laisse passer les envois sans changement apparent (le volet « vide » n est pas suspendu)',
     [(CO, "  var volet = !!body && (body.foodLog !== undefined || body.savedFoods !== undefined || body.foodSupprimes !== undefined || body.hiddenFoods !== undefined);", "  var volet = !!body && ((Array.isArray(body.foodLog) && body.foodLog.length > 0) || body.savedFoods !== undefined || body.foodSupprimes !== undefined || body.hiddenFoods !== undefined);")], G('PB09e'), 'S', '', 'GARDE'),
    # ── la restauration admin ──
    ('M28 une restauration admin ne conserve plus le marqueur (le compte redevient « sans etat v3 » : un ancien appareil reecrit)',
     [(CO, "    if (_proto >= NUT_PROTOCOLE_MIN_ && !(Number(data.nutProto) >= _proto)) data.nutProto = _proto;\n", "")], G('PB12'), 'S', '', 'GARDE'),
    ('M29 une restauration admin ECRASE un marqueur plus eleve que celui du compte',
     [(CO, "!(Number(data.nutProto) >= _proto)) data.nutProto = _proto;", "true) data.nutProto = _proto;")], G('PB12b'), 'S', '', 'GARDE'),
    ('M30 une restauration admin invente un marqueur sur un compte sans etat v3',
     [(CO, "    if (_proto >= NUT_PROTOCOLE_MIN_ && !(Number(data.nutProto) >= _proto)) data.nutProto = _proto;", "    if (!(Number(data.nutProto) >= _proto)) data.nutProto = NUT_PROTOCOLE_MIN_;")], G('PB12c'), 'S', '', 'GARDE'),
    # ── un seul verrou pour tous les ecrivains ──
    ('M31 la sante de la montre ne prend plus le verrou commun (verification STATIQUE du banc)',
     [(CO, "    _hv = _nutVerrouPrendre_();\n    if (!_hv) return json_({status:'error', ok:false, code:'NUT_LOCK_BUSY', retryable:true});\n    var data = loadUserData_(email);", "    _hv = " + FAKE + ";\n    if (!_hv) return json_({status:'error', ok:false, code:'NUT_LOCK_BUSY', retryable:true});\n    var data = loadUserData_(email);")], G('PB13'), 'S', '', 'GARDE'),
    ('M32 la restauration admin ne prend plus le verrou commun (verification STATIQUE du banc)',
     [(CO, "  const _hv = _nutVerrouPrendre_();\n  if (!_hv) return json_({status:'error', error:'busy', ok:false, code:'NUT_LOCK_BUSY', retryable:true});", "  const _hv = " + FAKE + ";\n  if (!_hv) return json_({status:'error', error:'busy', ok:false, code:'NUT_LOCK_BUSY', retryable:true});")], G('PB13'), 'S', '', 'GARDE'),
    ('M33 un ecrivain est AJOUTE sans verrou (un second ecriveur du compte apparait : le test statique doit le voir)',
     [(CO, "function userKey_(email) {", "function _ecrivainSansVerrou_(email, d) { saveUserData_(email, d); }\nfunction userKey_(email) {")], G('PB13'), 'S', '', 'GARDE'),
    ('M34 saveProfile ne prend plus le verrou (la course « ancien contre nouveau » et « suppression contre envoi refuse » perdent des donnees)',
     [(CO, "    verrou = _nutVerrouPrendre_();\n    if (!verrou) return json_({status:'error', ok:false, code:'NUT_LOCK_BUSY'", "    verrou = " + FAKE + ";\n    if (!verrou) return json_({status:'error', ok:false, code:'NUT_LOCK_BUSY'")], G('PD10', 'PD11'), 'D', 'PD10,PD11', 'GARDE'),
    # ── le retrait de la porte globale (R30) ──
    ('M35 le levier global NUT_COMPAT_STRICT_ est RETABLI (son contraire rouvrait la resurrection : le retrait doit rester fige)',
     [(CO, "var NUT_PROTOCOLE_MIN_ = 3;", "var NUT_PROTOCOLE_MIN_ = 3;\nvar NUT_COMPAT_STRICT_ = true;")], G('PB14'), 'S', '', 'GARDE'),
    # ── les vrais processus : la suspension ──
    ('M36 la suspension ne couvre plus qu un seul chemin dans les vrais processus (envoi a jour seulement)',
     [(CO, "    if (compat.volet && _nutSuspendu_()) {", "    if (compat.volet && compat.ok && !!body.requestId && _nutSuspendu_()) {")], G('PD20'), 'D', 'PD20', 'GARDE'),
    # ── le client courant : la suspension ──
    ('M37 le client ne dit plus rien a la personne quand le serveur est suspendu',
     [(SU, "      if(code==='NUT_SUSPENDU') _nutAvertir(code,_N_MSG_SYNC_SUSPENDUE,10800000);", "")], G('PC10b'), 'C', 'PC10', 'GARDE'),
    ('M38 le message de suspension se repete a chaque synchronisation',
     [(SU, "_nutAvertir(code,_N_MSG_SYNC_SUSPENDUE,10800000);", "_nutAvertir(code,_N_MSG_SYNC_SUSPENDUE,1);")], G('PC10b'), 'C', 'PC10', 'GARDE'),
    ('M39 le client CONFIRME ce qu il a envoye quand le serveur est suspendu (une suppression jamais inscrite serait donnee pour faite)',
     [(SU, "      _nutAConfirmer=true;\n      if(code==='NUT_ZONE_DRIVE')", "      _nutAConfirmer=true;\n      S.foodSupprimes=_foodSupprimesNormaliser(S.foodSupprimes).map(e=>(sup.has(e.i)&&!e.c)?Object.assign({},e,{c:Date.now()}):e); _ecrireSuppressionsLocal();\n      if(code==='NUT_ZONE_DRIVE')")], G('PC10', 'PC10c'), 'C', 'PC10', 'GARDE'),
    ('M40 le client rejette (marque « rejetee ») ce qu il a envoye quand le serveur est suspendu (la suppression sortirait de la file)',
     [(SU, "      _nutAConfirmer=true;\n      if(code==='NUT_ZONE_DRIVE')", "      _nutAConfirmer=true;\n      S.foodSupprimes=_foodSupprimesNormaliser(S.foodSupprimes).map(e=>(sup.has(e.i)&&!e.c)?Object.assign({},e,{x:code}):e); _ecrireSuppressionsLocal();\n      if(code==='NUT_ZONE_DRIVE')")], G('PC10', 'PC10c'), 'C', 'PC10', 'GARDE'),
    # ── finalisation (02/11/2026) : « seul le Nutrition est refuse » et les exceptions du verrou ──
    ('M41 le refus d un ancien client repond AVANT d ecrire le reste (seances, records, pesees perdus : la regression bloquante que le test manquant doit voir)',
     [(CO, "    } else if (compat.volet && !compat.ok && _nutAncienRefuse_(existing, compat)) {", "    } else if (compat.volet && !compat.ok && _nutAncienRefuse_(existing, compat)) {\n      return json_({status:'nut_refuse', ok:false, code:'NUT_CLIENT_INCOMPATIBLE', retryable:false, requestId:_requestId, profilEnregistre:true, details:{}, lockMs:0});")], G('PB02b', 'PB18', 'PD11', 'PC20e'), 'S,D,C', 'PD11,PC20', 'GARDE'),
    ('M42 la suspension repond AVANT d ecrire le reste (seances, records, pesees perdus pendant la suspension)',
     [(CO, "    if (compat.volet && _nutSuspendu_()) {", "    if (compat.volet && _nutSuspendu_()) {\n      return json_({status:'nut_refuse', ok:false, code:'NUT_SUSPENDU', retryable:true, requestId:_requestId, profilEnregistre:true, details:{}, lockMs:0});")], G('PB09b', 'PB09c', 'PB18', 'PD20', 'PC20d'), 'S,D,C', 'PD20,PC10,PC20', 'GARDE'),
    ('M43 une exception a la PRISE du verrou n est plus journalisee (avalee en silence, comme avant la finalisation)',
     [(CO, "  } catch (e) { _nutVerrouException_('prise du verrou', e); return null; }", "  } catch (e) { return null; }")], G('PB16'), 'S', '', 'GARDE'),
    ('M44 une exception a la LIBERATION du verrou n est plus journalisee',
     [(CO, "catch (relErr) { _nutVerrouException_(origine + ' : libération du verrou', relErr); }", "catch (relErr) {}")], G('PB17'), 'S', '', 'GARDE'),
    ('M45 le message d exception du verrou n est plus nettoye des adresses (une adresse du message partirait dans le journal)',
     [(CO, r"exception du service — ' + String(e && e.message || e).replace(/[^\s@]+@[^\s@]+/g, '[adresse]').slice(0, 160));", r"exception du service — ' + String(e && e.message || e).slice(0, 160));")], G('PB16', 'PB17'), 'S', '', 'GARDE'),
    ('M46 le message d exception du verrou n est plus borne a 160 caracteres',
     [(CO, r"exception du service — ' + String(e && e.message || e).replace(/[^\s@]+@[^\s@]+/g, '[adresse]').slice(0, 160));", r"exception du service — ' + String(e && e.message || e).replace(/[^\s@]+@[^\s@]+/g, '[adresse]'));")], G('PB16', 'PB17'), 'S', '', 'GARDE'),
    ('M47 une exception a la prise du verrou est RELANCEE (le comportement change : SERVER_ERROR au lieu de NUT_LOCK_BUSY)',
     [(CO, "  } catch (e) { _nutVerrouException_('prise du verrou', e); return null; }", "  } catch (e) { _nutVerrouException_('prise du verrou', e); throw e; }")], G('PB16'), 'S', '', 'GARDE'),
    ('M48 le journal d exception n est plus protege (un journal en panne ferait echouer le verrou)',
     [(CO, "  } catch (journalErr) { /* sans effet sur le verrou */ }", "  } finally { }")], G('PB16'), 'S', '', 'GARDE'),
]


def extraire_ancien():
    """Les fichiers de la RACINE du depot a la revision publiee, dans un dossier temporaire (un clone n'a pas de .git). None si introuvable."""
    ref = os.environ.get('FT_ANCIEN_CLIENT_REF', 'origin/master')
    try:
        lst = subprocess.run(['git', 'ls-tree', ref], cwd=SRC, capture_output=True, text=True, check=True).stdout.split('\n')
        noms = [m.group(1) for m in (re.match(r'^\d+ blob [0-9a-f]+\t(.+)$', l) for l in lst) if m and re.search(r'\.(html|js|css|json)$', m.group(1))]
        if 'index.html' not in noms: return None
        d = tempfile.mkdtemp(prefix='mut_pa02_ancien_')
        for n in noms:
            open(os.path.join(d, n), 'wb').write(subprocess.run(['git', 'show', ref + ':' + n], cwd=SRC, capture_output=True, check=True).stdout)
        return d
    except Exception as e:
        print('  (ancien client introuvable : %s)' % str(e)[:120]); return None


ANCIEN = None


def banc(arbre, sections, blocs):
    env = dict(os.environ)
    if sections != '*': env['PA02_SEULEMENT'] = sections
    else: env.pop('PA02_SEULEMENT', None)
    if blocs: env['PA02_BLOCS'] = blocs
    else: env.pop('PA02_BLOCS', None)
    if ANCIEN: env['FT_ANCIEN_CLIENT_DIR'] = ANCIEN
    r = subprocess.run(['node', 'tools/banc_nut_phasea02.js'], cwd=arbre, capture_output=True, text=True, timeout=1500, env=env)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-200:]), rouges


LOURDS = ('exercises', 'anatomy', 'muscles', 'lib', 'docs', 'data', 'clone', 'guide', 'audits', 'worktrees')


def cloner():
    """Une copie jetable : les .js, .html et tests sont COPIES (donc mutables sans toucher le depot) ; les gros dossiers d images et de bibliotheques sont LIES (jamais modifies)."""
    tmp = tempfile.mkdtemp(prefix='mut_pa02_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', *LOURDS))
    for d in LOURDS:
        s = os.path.join(SRC, d)
        if os.path.isdir(s): os.symlink(s, os.path.join(a, d))
    return tmp, a


def verifier_ancres():
    mal = 0
    for nom, rempl, _, _, _, _ in MUT:
        for f, old, new in rempl:
            s = open(os.path.join(SRC, f), encoding='utf-8').read()
            n = s.count(old)
            if n != 1:
                print('  !! ANCRE %s (%d) : %s [%s]' % ('INTROUVABLE' if n == 0 else 'MULTIPLE', n, nom[:70], f)); mal += 1
            elif old == new:
                print('  !! MUTATION SANS EFFET : %s' % nom[:70]); mal += 1
    print('%d mutations, %d ancres en defaut' % (len(MUT), mal))
    return 1 if mal else 0


def main():
    global ANCIEN
    if '--ancres' in sys.argv: return verifier_ancres()
    seul = sys.argv[1] if len(sys.argv) > 1 else None
    ANCIEN = extraire_ancien()
    tmp0, a0 = cloner()
    rc, res, _ = banc(a0, '*', '')
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE — controle refuse :', res); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes, total = 0, 0
    depuis = bool(seul and seul.endswith('+'))
    if depuis: seul = seul[:-1]
    actif = not depuis
    for nom, rempl, attendus, sections, blocs, genre in MUT:
        if depuis and nom.startswith(seul + ' '): actif = True
        if seul and not depuis and not any(nom.startswith(x + ' ') for x in seul.split(',')): continue
        if depuis and not actif: continue
        total += 1
        tmp, arbre = cloner()
        print('--- %s   [sections %s%s]' % (nom, sections, (' · blocs ' + blocs) if blocs else ''))
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
            print('     [%s] ORIGINAL : %s' % (f, old.strip().replace('\n', ' ⏎ ')[:200]))
            print('     [%s] MUTE     : %s' % (f, new.strip().replace('\n', ' ⏎ ')[:200]))
        for f in sorted(set(x[0] for x in rempl)):
            chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync('%s','utf8'))" % f], cwd=arbre, capture_output=True)
            if chk.returncode != 0:
                print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res, rouges = banc(arbre, sections, blocs)
        shutil.rmtree(tmp, ignore_errors=True)
        manquants = [w for w in attendus if not any(r.startswith(w) for r in rouges)]
        if genre == 'EQ':
            ok = rc == 0
            print('  %s %s -> %s  [code %d]' % ('CONFORME(EQ)' if ok else 'NON CONFORME', nom[:60], res, rc))
        else:
            ok = rc == 1 and not manquants
            print('  %s %s -> %s  [code %d]' % ('TUEE      ' if ok else 'SURVIVANTE', nom[:60], res, rc))
            if manquants: print('       temoin(s) attendu(s) reste(s) VERT(S) : %s' % ' · '.join(manquants))
            if rc == 2: print('       PLANTAGE : ce n\'est pas un verdict')
            print('       rouges : %s\n' % (' · '.join(r.split(' ')[1] if len(r.split(' ')) > 1 else r[:14] for r in rouges) or 'aucun'))
        conformes += ok
    if ANCIEN: shutil.rmtree(ANCIEN, ignore_errors=True)
    print('\n%d/%d conformes (tuees, ou equivalentes restees vertes)' % (conformes, total))
    return 0 if conformes == total and total > 0 else 1


if __name__ == '__main__':
    sys.exit(main())
