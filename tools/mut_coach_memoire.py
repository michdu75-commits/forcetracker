#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF des blocs B-CCCXL et B-CCCXLI (la provenance de `coachMemory`).

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).

CE QUE CE CONTROLE DOIT PROUVER, ET POURQUOI IL EST PARTICULIEREMENT EXPOSE ICI
    La correction de cette passe est ADDITIVE : rien n'est retire, un champ est ajoute a
    cote. Or un temoin qui verifie qu'une chose EXISTE est facile a satisfaire par accident
    — et la moitie de ces temoins verifient au contraire des ABSENCES (aucun `validated`,
    aucune phrase de la personne dans la fiche, aucune provenance inventee). Une absence
    reste parfaitement verte si le parcours ne s'execute pas du tout.
    Les mutations les plus utiles sont donc de trois familles :
      1. celles qui INVENTENT une provenance (un nom de moteur plausible, une date) — c'est
         exactement l'interdit pose par Michel ;
      2. celles qui rendent le statut `validated`, c'est-a-dire qui font passer une sortie
         d'IA pour une chose que quelqu'un a validee ;
      3. celles qui cassent le CONTRAT RESEAU en faisant de `coachMemory` autre chose
         qu'une chaine — le recul que l'arbitrage interdit.

[*] QUATRE MUTATIONS DOIVENT RESTER VERTES : elles ne touchent que des COMMENTAIRES, en y
    citant mot pour mot ce que les temoins cherchent (`validated`, `legacy`, `generated`,
    `coachMemoryMeta`, `_model`). C'est la SEULE facon de prouver qu'on mesure le CODE et
    non la DOCUMENTATION — et les commentaires de cette passe citent abondamment tout ce
    qui est cherche, parce que R30 exige que la raison soit ecrite a cote du code.

Usage : python3 tools/mut_coach_memoire.py
"""
import os
import shutil
import subprocess
import sys
import tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ST, CO, SE, CJ, WK = 'state.js', 'coach.js', 'setup.js', 'Code.js', 'worker.js'
DON = 'tests/donnees/donnees-milo.json'

MUT = [
    # ══ 1. ON INVENTE UNE PROVENANCE — l'interdit central de l'arbitrage ════════════════
    ('M01  le client INVENTE le nom du moteur au lieu de lire la reponse du serveur', CO,
     "_coachMemPoserProvenance(data._model);",
     "_coachMemPoserProvenance(data._model || 'claude-haiku-4-5-20251001');", 'ROUGE'),

    ('M02  une memoire ANCIENNE recoit un moteur plausible au lieu de `null`', ST,
     "S.coachMemoryMeta={ v:COACH_MEM_SCHEMA, statut:'legacy', moteur:null, date:null, source:null };",
     "S.coachMemoryMeta={ v:COACH_MEM_SCHEMA, statut:'legacy', "
     "moteur:'claude-haiku-4-5-20251001', date:null, source:null };", 'ROUGE'),

    ('M03  une memoire ANCIENNE recoit la date du JOUR (donc une fausse anciennete)', ST,
     "S.coachMemoryMeta={ v:COACH_MEM_SCHEMA, statut:'legacy', moteur:null, date:null, source:null };",
     "S.coachMemoryMeta={ v:COACH_MEM_SCHEMA, statut:'legacy', moteur:null, "
     "date:new Date().toISOString(), source:null };", 'ROUGE'),

    ('M04  le poseur retombe sur un nom plausible quand le serveur se tait', ST,
     "moteur:(typeof moteur==='string'&&moteur)?moteur:null,",
     "moteur:(typeof moteur==='string'&&moteur)?moteur:'claude-haiku-4-5-20251001',", 'ROUGE'),

    # ══ 2. PROVENANCE != VALIDATION — la borne posee mot pour mot par Michel ════════════
    ('M05  une memoire ancienne est declaree `validated` parce qu elle existe', ST,
     "statut:'legacy', moteur:null", "statut:'validated', moteur:null", 'ROUGE'),

    ('M06  un resume NEUF est declare `validated`', ST,
     "statut:'generated',", "statut:'validated',", 'ROUGE'),

    # ══ 3. LE CONTRAT RESEAU : coachMemory RESTE UNE CHAINE ════════════════════════════
    ('M07  le Worker attend desormais un OBJET (« [object Object] » dans le prompt)', WK,
     "const memory = body.coachMemory || ''",
     "const memory = (body.coachMemory && body.coachMemory.texte) || ''", 'ROUGE'),

    ('M08  l envoi a Milo emporte la fiche au lieu du texte', CO,
     "message:instr,context:buildCoachContext(instr),history:_coachHistPayload(8),"
     "coachMemory:S.coachMemory||''",
     "message:instr,context:buildCoachContext(instr),history:_coachHistPayload(8),"
     "coachMemory:{texte:S.coachMemory||'',meta:S.coachMemoryMeta}", 'ROUGE'),

    ('M09  Apps Script traite la fiche comme une CHAINE (elle serait aplatie)', CJ,
     "profile.coachMemoryMeta = _po_(body.coachMemoryMeta, profile.coachMemoryMeta);",
     "profile.coachMemoryMeta = _ps_(body.coachMemoryMeta, profile.coachMemoryMeta);", 'ROUGE'),

    # ══ 4. LE MOTEUR N'EST PLUS DIT PAR LE SERVEUR ═════════════════════════════════════
    ('M10  le Worker ne renvoie plus le modele du resume', WK,
     "return { summary: summary || '', _model: MODELE_RESUME };",
     "return { summary: summary || '' };", 'ROUGE'),

    ('M11  le repli Apps Script ne le renvoie plus (la provenance dependrait de la route)', CJ,
     "return json_({summary, _model: 'claude-haiku-4-5-20251001'});",
     "return json_({summary});", 'ROUGE'),

    # ══ 5. LE DEFAUT REEL TROUVE EN ECRIVANT : la provenance survit au texte ════════════
    ('M12  une restauration garde l ancienne fiche sur un texte NEUF (fausse provenance)', SE,
     "if(cm && cm!==S.coachMemory){ S.coachMemory=cm; S.coachMemoryMeta=null; }",
     "if(cm && cm!==S.coachMemory){ S.coachMemory=cm; }", 'ROUGE'),

    ('M13  la regle n est plus rejouee apres une restauration (drapeau implicite)', SE,
     "  try{if(typeof _coachMemProvenance==='function')_coachMemProvenance();}catch(e){}",
     "", 'ROUGE'),

    ('M14  la sauvegarde cloud n emporte plus la provenance', SE,
     "      coachMemoryMeta:S.coachMemoryMeta||null,", "", 'ROUGE'),

    # ══ 6. R2 : UN SEUL PROPRIETAIRE DE LA REGLE ═══════════════════════════════════════
    ('M15  un SECOND site pose `legacy` (la regle perd son proprietaire unique)', SE,
     "    const mm=raw.coachMemoryMeta||d.coachMemoryMeta||null;",
     "    if(S.coachMemory && !S.coachMemoryMeta) S.coachMemoryMeta={statut:'legacy'};\n"
     "    const mm=raw.coachMemoryMeta||d.coachMemoryMeta||null;", 'ROUGE'),

    ('M16  une provenance CONNUE est retrogradee en `legacy` a chaque chargement', ST,
     "if(m && typeof m==='object' && (m.statut==='generated'||m.statut==='legacy')) return 'inchangee';",
     "if(m && typeof m==='object' && m.statut==='legacy') return 'inchangee';", 'ROUGE'),

    # ══ 7. LES ABSENCES QUE LES TEMOINS PROTEGENT ══════════════════════════════════════
    ('M17  une memoire VIDE laisse une provenance orpheline', ST,
     "if(!S.coachMemory){ S.coachMemoryMeta=null; return 'vide'; }",
     "if(!S.coachMemory){ return 'vide'; }", 'ROUGE'),

    ('M18  la cle de provenance n est plus retiree du stockage quand la memoire part', ST,
     "      else localStorage.removeItem(COACH_MEM_META_CLE);", "", 'ROUGE'),

    ('M19  une provenance ILLISIBLE fait tomber le chargement (la memoire est perdue)', ST,
     "    catch(e){ S.coachMemoryMeta=null; }", "    catch(e){ throw e; }", 'ROUGE'),

    ('M20  la fiche se met a porter une PHRASE de la personne (6e cle)', ST,
     "date:new Date().toISOString(), source:'summarizeCoach' };",
     "date:new Date().toISOString(), source:'summarizeCoach', extrait:S.coachMemory };", 'ROUGE'),

    # [!!] ANCRE ALLONGEE EXPRES : la ligne seule apparait DEUX fois (c'est tout l'objet du
    #      temoin ⑬). Une ancre a deux occurrences s'annonce « invalide » au lieu de mentir,
    #      ce qui est le bon comportement — mais elle ne mesure alors plus rien.
    ('M21  `loadProfile` ne la rend plus que d UN cote', CJ,
     "      coachMemoryMeta:(data.profile && data.profile.coachMemoryMeta) || null,\n"
     "      healthInbox:    data.healthInbox    || [],",
     "      healthInbox:    data.healthInbox    || [],", 'ROUGE'),

    ('M22  la donnee n est plus classee face a Milo (R4a)', DON,
     '"coachMemoryMeta"', '"coachMemoryMetaXX"', 'ROUGE'),

    # ══ CONTROLES NEGATIFS — DOIVENT RESTER VERTS ══════════════════════════════════════
    # [*] Ils ne touchent QUE des commentaires, en y citant les mots cherches. Sans eux, un
    #     temoin qui lirait le fichier brut resterait vert pour toujours, quoi qu'on remette
    #     dans le code — et les commentaires de cette passe les citent tous.
    ('[negatif] un COMMENTAIRE de state.js cite `validated`, `legacy` et `generated`', ST,
     "function _coachMemProvenance(){",
     "// rappel : provenance != validation. On ne pose JAMAIS statut:'validated' ici ;\n"
     "// seules statut:'legacy' et statut:'generated' existent. Voir l'arbitrage du 20/09.\n"
     "function _coachMemProvenance(){", 'VERT'),

    ('[negatif] un COMMENTAIRE de coach.js cite `_coachMemPoserProvenance(data._model)`', CO,
     "      try{ if(typeof _coachMemPoserProvenance==='function') _coachMemPoserProvenance(data._model); }catch(e2){}",
     "      // c'est ici que _coachMemPoserProvenance(data._model) lit le moteur du serveur\n"
     "      try{ if(typeof _coachMemPoserProvenance==='function') _coachMemPoserProvenance(data._model); }catch(e2){}",
     'VERT'),

    ('[negatif] un COMMENTAIRE de setup.js cite `coachMemoryMeta` et la regle rejouee', SE,
     "      coachMemoryMeta:S.coachMemoryMeta||null,",
     "      // coachMemoryMeta part avec la sauvegarde ; _coachMemProvenance() est rejouee au retour\n"
     "      coachMemoryMeta:S.coachMemoryMeta||null,", 'VERT'),

    ('[negatif] un COMMENTAIRE du Worker cite `_model: MODELE_RESUME`', WK,
     "  return { summary: summary || '', _model: MODELE_RESUME };",
     "  // on renvoie _model: MODELE_RESUME pour que le client n'invente pas le moteur\n"
     "  return { summary: summary || '', _model: MODELE_RESUME };", 'VERT'),
]


def main():
    conformes = 0
    for nom, fich, avant, apres, attendu in MUT:
        tmp = tempfile.mkdtemp(prefix='cmem_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(SRC, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        cible = os.path.join(arbre, fich)
        src = open(cible, encoding='utf-8').read()
        n = src.count(avant)
        if n != 1:
            print('  INVALIDE  %-72s (ancre %s)'
                  % (nom, 'absente' if n == 0 else '%d fois' % n))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        neuf = src.replace(avant, apres)
        if neuf == src:
            print('  INVALIDE  %-72s (mutation sans effet)' % nom)
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(neuf)

        r = subprocess.run(['node', os.path.join(SRC, 'tools/banc_coach_memoire.js'), arbre],
                           capture_output=True, text=True, cwd=arbre, timeout=600)
        sortie = (r.stdout + r.stderr)
        # [!!] UN PLANTAGE N'EST PAS UN ROUGE. Le compter comme tel validerait la mutation
        #      pour la mauvaise raison (BUGS.md §61).
        plante = ' OK / ' not in (r.stdout or '')
        obtenu = 'PLANTAGE' if plante else ('ROUGE' if r.returncode else 'VERT')
        ok = (obtenu == attendu)
        conformes += ok
        rouges = [l.split('rouge : ')[1][:46]
                  for l in sortie.split('\n') if l.strip().startswith('rouge : ')]
        print('  %s  %-72s %-9s %s'
              % ('OK ' if ok else '!! ', nom, obtenu, ' · '.join(rouges[:2])))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    sys.exit(main())
