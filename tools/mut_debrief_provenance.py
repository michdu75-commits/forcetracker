#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les témoins de la provenance du débrief peuvent-ils RÉELLEMENT rougir ?

⛔⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60).
⭐ Chaque mutation retire UNE information structurante (lien superset, RIR d'un exercice, type
   échauffement/travail, phase du cardio, ordre des séries…) ou remet le code d'AVANT. Les témoins
   doivent rougir. ⛔ Deux mutations de COMMENTAIRE doivent rester vertes.
⛔ M00 : le clone non muté doit être vert, sinon le contrôle ne prouve rien.

Usage : python3 tools/mut_debrief_provenance.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutdbf'
LG, CO = 'log.js', 'coach.js'

MUT = [
    ('M01', LG, "  const suite = paliers.concat([(_P > 0 && _P <= T) ? _P : T]);",
     "  const suite = paliers.concat([T]);", 'rouge', 'LE CODE D AVANT : la chaîne se ferme sur la charge MAX'),
    ('M02', CO, "      const d = _monteeDefauts(ech, kgT, (travail.find(x=>+x.kg>0)||{}).kg);",
     "      const d = _monteeDefauts(ech, kgT);", 'rouge', 'la ligne de Milo reprend la charge max'),
    ('M03', LG, "_monteeDefauts(ech,kgMax,+trav[0].kg)", "_monteeDefauts(ech,kgMax)",
     'rouge', 'le débrief local reprend la charge max'),
    ('M04', CO, "    return avec.length ? ` [superset avec ${avec.join(' + ')} — enchaînés sans repos]` : '';",
     "    return '';", 'rouge', 'LE CODE D AVANT : le superset n atteint plus Milo'),
    ('M05', CO, "    if(!e || !e.group || (e.groupType||'super')!=='super') return '';",
     "    if(!e || !e.group) return '';", 'rouge', 'DÉGUISÉE : un dropset devient un « superset »'),
    ('M06', LG, "    _rirPending=(_enSS&&Array.isArray(_rirPending)",
     "    _rirPending=(false&&Array.isArray(_rirPending)", 'rouge', 'LE CODE D AVANT : l Oiseau perd sa question RIR'),
    ('M07', LG, "  const avecNom=cibles.length>1;", "  const avecNom=false;", 'rouge', 'les questions ne disent plus de quel exercice'),
    ('M08', LG, "  const avecNom=cibles.length>1;", "  const avecNom=true;", 'rouge', 'hors superset, un nom s ajoute (affichage changé)'),
    ('M09', LG, "      ? _rirPending.filter(p=>!(p.ei===ei&&p.si===si)&&S.wkt.exs[p.ei]&&S.wkt.exs[p.ei].group===_grpR)",
     "      ? _rirPending.filter(p=>!(p.ei===ei&&p.si===si))", 'rouge', 'DÉGUISÉE : une série hors groupe hérite des questions'),
    ('M10', LG, "  _rirCible=Array.isArray(_rirPending)?(_rirPending.length>1?_rirPending:(_rirPending[0]||null)):_rirPending;",
     "  _rirCible=Array.isArray(_rirPending)?(_rirPending[_rirPending.length-1]||null):_rirPending;",
     'rouge', 'le repos ne garde que la dernière série'),
    ('M11', CO, "            const rir = (_r===null) ? '' : (' RIR'+_r);",
     "            const rir = (_r===null||e.group) ? '' : (' RIR'+_r);", 'rouge', 'le RIR d un exercice de superset disparaît'),
    ('M12', CO, "            const ech = (x.type==='É' || x.type==='W');\n            const num",
     "            const ech = false;\n            const num", 'rouge', 'le type échauffement / travail est perdu'),
    ('M13', CO, "      const ds = (e.sets||[]).filter(x => x.done);",
     "      const ds = (e.sets||[]).filter(x => x.done).reverse();", 'rouge', 'l ordre des séries est inversé'),
    ('M14', LG, "    return [av?'échauffement '+av:'', ap?'après séance '+ap:''].filter(Boolean).join(' + ');",
     "    return [av?'après séance '+av:'', ap?'échauffement '+ap:''].filter(Boolean).join(' + ');",
     'rouge', 'la consigne inverse la phase du cardio'),
    ('M15', CO, "    const cardioStr=[_cav?'échauffement '+_cav:'', _cap?'après séance '+_cap:''].filter(Boolean).join(' + ');",
     "    const cardioStr=[_cav||'', _cap||''].filter(Boolean).join(' + ');", 'rouge', 'la ligne perd la phase du cardio'),
    ('M16', LG, "function _rirQuestionHtml(c,avecNom){",
     "/* _rirCible avecNom superset avec setRir(0,0, */\nfunction _rirQuestionHtml(c,avecNom){", 'vert', 'un commentaire ne change rien'),
    ('M17', CO, "function _supersetTxt(e, exs){",
     "/* superset avec enchaînés sans repos _supersetTxt */\nfunction _supersetTxt(e, exs){", 'vert', 'idem côté Milo'),
]

def lancer():
    p = subprocess.run(['node', 'tools/banc_debrief_provenance.js'],  # noqa
                       capture_output=True, text=True, cwd=R,
                       env=dict(os.environ, TZ='Europe/Paris'))
    return p.returncode, (p.stdout + p.stderr)


def main():
    rc, out = lancer()
    if rc != 0:
        der = [l for l in out.strip().split('\n') if l.strip()][-1:] or ['']
        print('M00 le clone NON muté n est pas vert (%d) — contrôle refusé >> %s' % (rc, der[0][:120]))
        return 1
    print('M00 vert     attendu=vert  OK   — le clone non muté est vert (point de départ sain)')
    ok = nc = anc = 0
    for mid, fic, avant, apres, att, quoi in MUT:
        chemin = os.path.join(R, fic)
        src = open(chemin, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('%s ANCRE invalide (%d occurrences) dans %s — %s'
                  % (mid, src.count(avant), fic, quoi))
            anc += 1
            continue
        open(chemin, 'w', encoding='utf-8').write(src.replace(avant, apres, 1))
        rc, out = lancer()
        open(chemin, 'w', encoding='utf-8').write(src)
        obt = 'vert' if rc == 0 else ('rouge' if rc == 1 else 'PLANTAGE')
        if obt == att:
            ok += 1
            print('%s %-8s attendu=%-5s OK   — %s' % (mid, obt, att, quoi))
        else:
            nc += 1
            der = [l for l in out.strip().split('\n') if l.strip()][-1:] or ['']
            print('%s %-8s attendu=%-5s NON CONFORME — %s >> %s'
                  % (mid, obt, att, quoi, der[0][:90]))
    rc, out = lancer()
    fin = 'vert' if rc == 0 else 'NON VERT'
    print('M99 %s après restauration de toutes les mutations' % fin)
    print('=== conformes=%d nonconformes=%d ancres=%d ===' % (ok, nc, anc))
    return 1 if (nc or anc or rc) else 0


if __name__ == '__main__':
    sys.exit(main())
