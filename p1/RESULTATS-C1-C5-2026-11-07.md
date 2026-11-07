# C1 / C5 réels — résultats du 07/11/2026 (branche d'essai, jamais fusionnée)

**Cible** : déploiement de TEST `@4` du projet FT-TEST-P1 (créé par Michel depuis l'interface), exécuté par le compte propriétaire, accès « tout le monde ». **Code servi** = `Code.js` du candidat `866846b0` (empreinte `f2de6eed1923`, à la seule ligne `SHEET_ID_` près, neutralisée). **Client** = le vrai client A/A2 du candidat (`setup.js` / `app.js`), piloté par Chromium depuis un runner GitHub (`ubuntu-24.04`), qui parle au VRAI Google. **Comptes fictifs** `@example.invalid` uniquement. Production, `master`, Apps Script de production `@194`, dossier de sauvegarde de production : **non touchés** (vérifié : 13/13 au contrôle d'isolement, dossier de production inchangé à 189 éléments, le plus récent créé le 2026-11-07T01:31:40 — avant et après tous les essais).

## C5 — suspension puis reprise (run 42348111865, n°162) : **PASS 19/19**
Voir `C5_run162_extraits.txt`. Avant la suspension le vrai client confirme ses envois ; pendant la suspension (10 min 02 s) : refus `NUT_SUSPENDU` compris, un seul message, 5 envois bornés, **aucune perte locale** ; le serveur enregistre séances et pesées mais pas le Nutrition ; après la reprise : le même `requestId` est appliqué (pas « déjà »), pas de doublon, une suppression ne revient pas, le vrai client converge sans geste. **Mesure à connaître** : convergence 843 s (~14 min) après la reprise — dernier palier de la rampe de relance `_NUT_RELANCES_MS=[30 s,60 s,120 s,300 s,900 s]` (setup.js L1092).

## C1 — le vrai client contre le vrai Google : **PASS 16/16 en passe complète finale (run 42357950477, n°179, 09:01-09:12 UTC)** — un rouge intermittent antérieur est dit plus bas
| Scénario | Résultat | Ce que ça prouve |
|---|---|---|
| R0 | OK | le TEST répond `online`, le 302 est suivi |
| R1 | OK (9 exécutions vertes sur 10 depuis la correction du seuil ; voir plus bas) | 5 envois, 5 réponses lisibles, 0 non confirmé, un seul envoi à la fois, un seul « Pates » des deux côtés, 0 conflit ; (A2) pas d'envoi complet de plus après un accusé |
| R2 | OK | réponse retardée de 20 s : un envoi à la fois, tout lisible, converge |
| R3 | OK | liaison lente (réponse reçue 60 s plus tard) : tout lisible, un « Pates » des deux côtés |
| R3b | OK | adresse de réponse périmée (Google ne la garde que ~15-30 s pour un POST) : le client le sait « non confirmé » (`ACCUSE_ABSENT`), renvoie, finit avec les 5 repas une fois des deux côtés |
| R4 | OK | réponse PERDUE après enregistrement : jamais présentée comme un succès, rien de perdu, pas de doublon |
| R5 | OK (résiduel connu) | après une réponse perdue, corriger le MÊME repas → faux conflit « modifié sur un autre appareil » (les deux versions gardées, **aucune perte**) ; **identique avant/après A/A2** |
| R7 | OK | envoi sans réponse : un seul en vol, libéré par la temporisation (~180 s), la demande faite pendant l'attente est rejouée |
| R8 | OK | compte de 1 000 repas (738 Ko par envoi) sur faible débit montant : tout lu, 16,7 s |

### Corrections de MON banc (pas du candidat), faites avant ces résultats
* **R1** attendait « au plus 4 envois » : 5 gestes espacés de 5 s dépassent le debounce de 4 s, donc 5 est le bon chiffre (l'ancien code en faisait 6). Éprouvé en local : candidat 5 (vert), ancien client 6 (rouge).
* **R3** modélisait une mauvaise panne (toutes les adresses d'écho tenues 60 s). Mesuré (`sonde_echo.js`) : pour un POST, l'adresse d'écho de Google reste correcte ~15 s et ne l'est plus à 30 s (« Unknown GET action ») ; pour un GET, elle tient 180 s. R3 = réponse lente ; **R3b = adresse périmée**.

### Rouge intermittent (dit sans détour)
Dans la passe complète (run 42354837873, n°170) : 15 OK / 1 ROUGE — la relecture serveur de R1 ne contenait pas « Pates » (`pates:{appareil:1,serveur:0}`) alors que les 5 envois avaient reçu une réponse lisible, sans conflit. **R1, depuis la correction du seuil : 10 exécutions, 9 vertes, 1 rouge** (le run 170, banc sans journal de la lecture ; vert dans les runs 169, 171-177 et dans la passe complète finale n°179, où la relecture réussit du premier coup : `essais:1`, HTTP 200, JSON ok). **Cause non établie** : défaut de LECTURE du banc (page d'erreur de Google, non JSON) ou retard de lecture côté serveur ; aucune preuve d'écriture perdue (acks lisibles, comptes frais, tous les scénarios suivants convergent). Le banc relit désormais le serveur jusqu'à 3 fois, garde le statut HTTP et le dit (`[lectureServeur]`) ; une lecture RÉUSSIE sans le repas reste un rouge.

## Ce qui n'est PAS prouvé
* **iPhone en 4G/5G réel** : aucun appareil ni réseau mobile ici. Couvert par ailleurs : vrai Google depuis un runner, sonde WebKit 3/3, réponse lente, adresse périmée. Procédure unique si besoin : `PROCEDURE-IPHONE-C1.md`, hors fenêtres de suspension.
* Le résiduel R5 (faux conflit) existe avant comme après A/A2.
* L'adresse du déploiement de TEST apparaît dans les entrées du workflow d'un dépôt public : à archiver une fois les essais finis (sur accord de Michel).
