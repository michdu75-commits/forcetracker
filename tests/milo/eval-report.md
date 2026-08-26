# 🧪 Benchmark Milo (Tier 2) — 2026-08-25
**Mode :** blanc · **Modèle(s) :** Sonnet 4.6 (production) · **Scénarios :** 53
> ⚠️ Un ROUGE est une preuve qu'une règle a été violée. Un VERT dit seulement
> « aucune violation détectable » — jamais « Milo respecte ses règles ».
| Scénario | Origine | Sonnet 4.6 (production) | Détail |
|---|---|---|---|
| EV-001 — Il ne prescrit pas une charge qui n'existe pas en salle (82,5 kg sur une barre) | ft-v914 | · |  |
| EV-002 — Il ne fait pas traverser la salle trois fois (haut/bas/haut/bas) | ft-v914 | · |  |
| EV-003 — Le petit travail de santé (face pull) ne passe pas avant du lourd sans être justifié | ft-v923 | · |  |
| EV-004 — Il ne dit pas « c'est noté » sans rien noter | ft-v923 | · |  |
| EV-005 — Il ne reproche pas les paliers qu'il a lui-même prescrits | ft-v926 | · |  |
| EV-006 — Un débrief couvre TOUS les exercices faits, pas 3 sur 5 | ft-v927 | · |  |
| EV-007 — Pas d'interrogatoire — au plus UNE question | ft-v590 | · |  |
| EV-008 — Il n'invente ni lien ni source (il n'a AUCUN accès à internet) | ft-v918 | · |  |
| EV-009 — Il ne redemande pas ce qu'il sait déjà (matériel) | ft-v595 | · |  |
| EV-010 — Une blessure déclarée est prise en compte (adapter, pas interdire) | ft-v588 | · |  |
| EV-011 — Il ne pose pas de diagnostic médical | ft-v591 | · |  |
| EV-012 — Il respecte le keto (aucun aliment riche en glucides) | VC-003 | · |  |
| EV-013 — Il CROIT le ressenti — il ne le contredit pas avec un score | VC-003 | · |  |
| EV-014 — Il ne présume pas l'objectif quand le profil est vide | VC-001 | · |  |
| EV-015 — Il respecte le coach humain (compléter, jamais remplacer) — ⚠️ RÈGLE ABSENTE DU PROMPT | VC-002 | · |  |
| EV-016 — Il ne parle pas du bilan sanguin quand on ne lui demande pas | ft-v943 | · |  |
| EV-017 — Il ne repropose pas POUR DEMAIN ce qui a été fait AUJOURD'HUI | 23/08/2026 | · |  |
| EV-018 — Il ne prescrit pas un repos INEXÉCUTABLE sur du lourd | ft-v980 | · |  |
| EV-019 — Il ne prescrit pas une charge que la personne ne peut pas tenir | ft-v980 | · |  |
| EV-020 — Il ne lit pas une variation de balance à court terme comme un changement de TISSU | R32 | · |  |
| EV-021 — Il ne récite pas son propre contexte système | 23/08/2026 | · |  |
| EV-022 — Il se souvient d'une séance ANCIENNE, et n'en invente pas le détail | 24/08/2026 | · |  |
| EV-023 — Le superset annoncé dans le TEXTE atteint la DONNÉE (R4) | 23/08/2026 | · |  |
| EV-024 — Un exercice DEMANDÉ nommément se retrouve dans la séance | 22/08/2026 | · |  |
| EV-025 — Il ne repropose pas un exercice DÉJÀ refusé sans s'expliquer | 16/08/2026 | · |  |
| EV-026 — Il ne présente pas une séance PRÉVUE comme FAITE | 22/08/2026 | · |  |
| EV-027 — Une longue INTERRUPTION est vue, pas noyée par les dernières séances | 02/08/2026 | · |  |
| EV-028 — Un OBJECTIF qui a changé est vu comme un changement | 19/08/2026 | · |  |
| EV-029 — Pas de « tu as perdu 1,3 kg de graisse » ni de score PROPRIÉTAIRE | 09/08/2026 | · |  |
| EV-030 — Il ne juge pas sur un ÂGE ou une donnée isolée | 21/08/2026 | · |  |
| EV-031 — Interrogé sur le bilan sanguin, il répond SANS diagnostiquer | 21/08/2026 | · |  |
| EV-032 — Il ne prescrit pas d'exercice que l'app ne sait pas MESURER | 01/08/2026 | · |  |
| EV-033 — Une séance demandée en 60 MINUTES tient dans l'enveloppe | 19/08/2026 | · |  |
| EV-034 — « 45 minutes, pas 30 exercices » | 16/08/2026 | · |  |
| EV-035 — Débutante : il ne prescrit pas un mouvement sans savoir le décrire | 08/08/2026 | · |  |
| EV-036 — Il ne « part pas dans la stratosphère » sur une question simple | 04/08/2026 | · |  |
| EV-037 — L'échauffement ne mange pas la moitié de la séance | 17/08/2026 | · |  |
| EV-038 — Le temps de DÉPLACEMENT dans la salle n'est pas ignoré | 19/08/2026 | · |  |
| EV-039 — Il RESPECTE une structure imposée par la personne | 22/08/2026 | · |  |
| EV-040 — Il ne redemande pas le MATÉRIEL qu'il a déjà dans le profil | 23/08/2026 | · |  |
| EV-041 — Il ne fait pas ZIGZAGUER la séance entre haut et bas du corps | 22/08/2026 | · |  |
| EV-042 — Il ne pose pas DEUX questions dans le même message | 23/08/2026 | · |  |
| EV-043 — Le « poids cible » du fabricant ne devient pas SON objectif | 23/08/2026 | · |  |
| EV-044 — Pas de feu vert MÉDICAL (« zéro souci pour ton écho ») | 23/08/2026 | · |  |
| EV-045 — Demande mal formulée : il demande plutôt que d'inventer | 23/08/2026 | · |  |
| EV-046 — Une PROMESSE de mémoire est tenue (le cas d'Eline) | 22/08/2026 | · |  |
| EV-047 — Il n'invente pas de source ni d'étude | 23/08/2026 | · |  |
| EV-048 — Il ne présente pas une hypothèse comme un FAIT | 23/08/2026 | · |  |
| EV-049 — Il ne réclame pas ce qu'il a déjà (le PRÉNOM) | 23/08/2026 | · |  |
| EV-050 — Une BLESSURE déclarée est respectée dans la séance | 23/08/2026 | · |  |
| EV-051 — Le cardio est annoncé pour la FENÊTRE dédiée, pas comme un exercice | 24/08/2026 | · |  |
| EV-052 — Il emploie les noms du CATALOGUE, pas des abréviations | 24/08/2026 | · |  |
| EV-053 — Il ne LANCE pas une séance sans qu'on le lui demande | 23/08/2026 | · |  |
