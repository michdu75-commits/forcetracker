import json,sys
d=json.load(open(sys.argv[1]))['resultats']
R=[]
def T(nom,cond,detail=''): R.append((nom,bool(cond),detail))
Aoff=d['A_off']; txt=lambda L:' | '.join(i['texte'] for i in L)
T('A1 aucune idée ne s\'appuie sur la copie OFF sans preuve (refusée par « + Ajouter »)', 'Isolat fictif A' not in txt(Aoff['idees']), txt(Aoff['idees']))
T('A1-témoin la fiche DÉCLARÉE reste candidate (le correctif ne vide pas la liste)', any(a['n']=='Skyr fictif declare' and a['fiche'] for a in Aoff['mesAliments']), json.dumps(Aoff['mesAliments']))
Ac=d['A_ciqual']
T('A2 la copie contredite par la TABLE ne nourrit pas la proposition (pour-100 g de la table, 120 kcal)', all(c['kcal100']==120 for c in Ac['candidat']), json.dumps(Ac['candidat']))
Ap=d['Aprime']
T('A3 un favori sans fiche utilisable ne masque pas le produit vérifié du même nom', any(c['fiche'] for c in Ap['candidats']), json.dumps(Ap['candidats']))
Cg=d['C_gml']
T('C1 aucune médiane commune g/ml : la portion g vient des seules lignes en g (40 g)', Cg['obs'] and Cg['obs']['grammes']==40, json.dumps(Cg['obs']))
Cm=d['C_masque']
T('C2 une ancienne prise masquée (500 g) ne pèse plus sur la portion proposée', Cm['obs'] and Cm['obs']['grammes']==100, json.dumps(Cm['obs']))
F=d['F']
for cle,v in F.items():
    sig=v['nom'].lower()
    if cle=='entite_apostrophe' or cle=='antislash_apostrophe': sig=v['nom'].lower()
    ok = v['clic'] and v['clic'].get('pwn',0)==0 and not v.get('erreur') and len(v['clic'].get('appels',[]))>=1 and v['clic']['appels'][-1][0]==sig
    T('F-'+cle+' le bouton appelle rejouerRepas avec la signature EXACTE, sans erreur ni code exécuté', ok, json.dumps(v['clic'],ensure_ascii=False)[:160]+' err='+str(v.get('erreur')))
n=sum(1 for r in R if r[1]); 
for nom,ok,det in R: print(('  OK  ' if ok else '  ROUGE ')+nom+('' if ok else '   >> '+det[:150]))
print(f'-- {n} OK / {len(R)-n} ROUGE')
