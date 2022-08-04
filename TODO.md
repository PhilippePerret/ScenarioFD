## EN COURS

* Implémenter la méthode destroy (de InCadre je pense)
* Implémenter Log pour les messages (système)
* CORRIGER LES BUGS
* Faire des tests
  - importation FinalDraft -> Scenario
  - exportation Scenario -> FinalDraft
* Poursuivre l'étude du fichier Final-Draft, afin de parvenir à un export vers FD le plus performant possible.

## BUGS

* [bug] Les dialogues (lignes commençant par deux espaces) ne sont pas identifiés par le parsing de la scène
* [bug] Le bouton de la disposition courante n'est pas celui affiché
* [bug] Quand on construit le panneau de filtre, les labels se mettent au bout de la fenêtre de preview (c'est la fenêtre preview qui est le this.content dans le panneau Filter). Normalement, ça a dû être corrigé
* [bug] Certaines scènes contiennent en résumé leur $page… (ou alors c'est par que l'extrait se sert des premières lignes et qu'on a ça dedans ? — ça m'étonnerait)
* [bug] La donnée 'FD-scene-properties' contient des retours chariot inutiles

## PROCHAINES ÉTAPES 

* CONVERSION FINAL-DRAFT -> SCENARIO
  - Ajouter les données dollar dans le content (couleur->color, résumé->summary, titre-> ?)

* À la création d'une scène, il faut éditer son intitulé (autocompletion)
* Enregistrer l'état des timesline, disposition, etc. régulièrement pour pouvoir les remettre au démarrage
  - Bien penser à le faire APRÈS avoir appliquer les préférences
  - Une préférence qui permet de ne pas appliquer ces dernières dispositions (c'est alors les préférences qui l'emportent)
* Trouver le moyen de retourner l'erreur à l'UI (méthode erreur()) quand une erreur se produit en console (suffit-il d'enrouler le code dans un try ?). Non, car il n'y a pas de "code général". Il faut enrouler toutes les méthodes
* Pouvoir déplacer une scène (jQuery, axe 'y')
  - pouvoir le faire à la souris et au clavier (CMD+CTRL+flèche H/B)
* Possibilité d'aggrandir verticalement la timeline (par transform:scale)
* Récupérer les styles du scénario de Forain pour l'application au template qui sert à exporter.
* Mettre en place la gestion de la préférence 'last_config_over_prefs'
* Panneau FILTRE pour filtrer le scénario suivant des conditions sur n'importe quoi (par exemple pour afficher toutes les scènes d'un personnage, tous ses dialogues)
  Deux paramètres à définir :
  1. le filtre à utiliser (sur un personnage, une action, un mot, etc.)
  2. l'affichage à rendre avec une sélection des choses à voir
    - affichage au choix des types de texte (intitulé, résumé, action, dialogue, etc.)
    - toutes les données (pages, résumé, etc.) peuvent être affichées

## MANUEL

* Documenter le fait qu'on peut taper '::[TAB]' dans la console pour mettre un nom de personnage (au lieu de '[TAB]:' qui oblige à revenir en arrière)
* Faire le titre "Définir les beats" #define-beats
* Faire le titre "Définir les séquences" #define-sequences
* Faire "Définir la position absolue des scènes" (#define-position-abs-scene)
* Faire "Définir la durée absolue des scènes" (#define-duree-abs-scene)
* Faire "Information du film" (#film-infos)
* Documenter la préférence 'last_config_over_prefs'
* Documenter l'utilisation des notes dans les scènes.

## AMÉLIORATION

* Comment définir toutes les données des script-notes qui ne sont pas consignées ici (title, color, updated_at, created_at — cf. fichier export/ScriptNote.rb)
* Poursuivre les tests (inside-tests)
* Quand on CMD-click droit sur la scène de la timeline, ça la met aussi en édition
* Le déplacement des paragraphes dans la console par CMD-CTRL-ARROW ne fonctionne que pour un unique paragraphe. Ça ne fonctionne pas pour plusieurs paragraphes
  - quand on arrive en bas ou en haut, il ne faut pas faire le tour.
* Lorsque l'on aggrandit la fenêtre (window.resize) et qu'une preview est affichée, on modifie son zoom pour s'adapter à l'écran (est-ce qu'on ne peut pas le faire de façon automatique ?)

## FONCTIONNALITÉS À IMPLÉMENTER

* Les "repères de scène". Des signets qu'on place sur les lignes de scène et qui permettent de placer des repères à atteindre facilement. Est-ce que ça pourrait être des "objets commentables", une classe d'objets sur lesquels on retrouve les mêmes fonctionnalités (titre, description, commentaires)
* Possibillité d'exporter au format que l'on veut les résultats du filtre (pour faire des rapports) et peut-être même d'imprimer ou de sortir en PDF
* Application intelligente de la couleur (par exemple pour donner deux couleurs aux scènes de l'exposition — par les pages - qui seront utilisées alternativement si la couleur de la scène n'est pas définie)
* Parvenir à faire fonctionner l'application Scenario.app (dans le dossier Application) - pour le moment je n'arrive même pas à écrire un fichier log pour savoir ce qui se passe…
* Possibilité de définir des CONSTANTES DE COULEUR pour les utiliser avec $color
* Commande "scenario create <nom>" pour créer un nouveau scénario.srps dans le dossier courant
* Pouvoir mémoriser des "zone de timeline" (timelineZone) sur lesquels on peut focusser avec le menu des timelines (comme sur l'exposition, le développement, etc.)
* Faire la liste des personnages
* Pouvoir n'afficher que les choses d'un personnage (action, dialogue, scènes)
* Lorsqu'une scène dépasse sa longueur prévue, mettre le bord inférieur en rouge
* Possibilité de bloquer le numérotage des scènes
* Quand on déplace une scène absolue dans la timeline, ça modifie son $time
* quand on allonge une scène absolue dans la timeline, ça modifie sa $duree
* Listing des notes (comme le navigateur de FD) => panneau
* rapport pour montrer les décalages de position et de longueur entre le scénario relatif et absolu
* Au window.resize, actualiser les timelines.
* Voir comment introduire les données (infos) du scénario dans le fichier FinalDraft
