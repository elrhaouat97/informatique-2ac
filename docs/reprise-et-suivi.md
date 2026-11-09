# Reprise du travail et suivi pédagogique

Le site reste exporté pour GitHub Pages. La base et les fonctions de sauvegarde restent dans le projet Supabase existant ; le mot de passe professeur est inchangé.

## Reprise élève

- L’identité, la séance, l’onglet, l’exercice en cours, les réponses, les manipulations Windows et les étapes d’évaluation sont conservés sur le navigateur immédiatement après chaque changement.
- À la réouverture, l’élève confirme « C’est moi, je reprends mon travail ». Le bouton « autre élève » change de dossier sans effacer les sauvegardes des autres utilisateurs du poste.
- Les exercices réussis restent validés. À 24 réussites sur 25, l’exercice 25 reprend avec son état enregistré.
- Les sauvegardes serveur sont liées à un jeton signé et à un appareil. Un autre appareil retrouve les réussites vérifiées, mais ne reçoit pas les brouillons du premier appareil. La reprise intégrale suppose de conserver les données du navigateur utilisé.
- En cas de coupure, l’indicateur signale la conservation locale et l’envoi en attente. Le retour en ligne relance la synchronisation. Une révision empêche un ancien onglet d’écraser silencieusement une sauvegarde récente.
- Les brouillons ne produisent ni note ni réussite dans le tableau de bord. Seules les tentatives rendues alimentent le suivi.

## Listes de classe

Les anciens noms sont repris avec l’origine « À vérifier ». Ils ne constituent pas une liste officielle. L’enseignant peut ajouter et valider les fiches, les archiver sans effacer leur historique, et importer des fichiers Excel ou CSV avec aperçu.

Colonnes : `Nom complet`, `Classe`, `Groupe`, `Massar` (facultatif), `ID` (facultatif). L’export contient les ID ; les conserver permet d’enrichir les fiches existantes. Le rapprochement automatique utilise Massar ou ID. Les noms seuls ne sont pas fusionnés automatiquement ; une association explicite est possible dans l’aperçu. L’import est atomique et limité à 1 000 lignes par envoi.

L’identification propose uniquement le nom et un identifiant opaque, pour la classe et le groupe choisis. Les codes Massar et les résultats restent dans l’espace professeur.

## Archivage rapide des comptes créés par erreur

Dans « Listes de classe », filtrer la classe ou activer « Saisies invalides ». Cocher les comptes concernés, ou utiliser « Tout sélectionner » pour les comptes affichés uniquement, puis « Archiver la sélection ». L’action est immédiate, sans confirmation supplémentaire, car elle est réversible. Le bouton « Annuler l’archivage » rétablit la dernière sélection. Le mode « Voir les archives » permet aussi une réactivation individuelle ou en lot.

La sélection est réinitialisée lorsqu’un filtre change. Les noms, identifiants, origines, réponses et notes sont conservés. L’archivage en lot est réservé au professeur et utilise une seule opération atomique, limitée à 1 000 comptes par demande. Aucun compte n’est sélectionné ni archivé automatiquement par le filtre de saisies invalides.

## Lecture du suivi

Une ligne représente une fiche d’apprenant. Ses dossiers historiques sont regroupés par identifiant de fiche ; les résultats en binôme sont signalés comme partagés. Une activité répétée ne compte qu’une fois dans la progression.

- **Acquis** : tous les exercices associés sont réussis.
- **En cours d’acquisition** : activité partielle ou réussites à consolider.
- **Non acquis** : tous les exercices sont abordés et moins de la moitié sont réussis.
- **Non évalué** : aucune tentative enregistrée.

Le détail affiche les objectifs, les exercices, les tentatives et la dernière activité. La note d’évaluation reste distincte de la progression de l’atelier. Les absences de copie ne deviennent pas des zéros. La séance 2 combine les points des trois étapes remises. La séance 3 utilise le bilan actuel sur 20, avec les sous-scores sur 6, 4 et 10. Les anciennes réponses restent accessibles dans « Réponses & rapports ».

Les graphiques présentent l’acquisition, la répartition des notes et le cumul des exercices réussis. Les comparaisons de classes et les exports Excel respectent les filtres indiqués. L’actualisation automatique intervient chaque minute.

## Validation

`pnpm run test:learning` vérifie la fermeture d’une session après 24 exercices, la conservation des réponses, les conflits de révision, l’isolation des appareils, les règles d’acquisition, les notes, l’import et la compatibilité des évaluations existantes. `pnpm exec tsc --noEmit` et la compilation GitHub Pages complètent ces contrôles. Les données fictives des tests restent isolées de la base de production.
