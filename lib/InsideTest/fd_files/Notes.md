# Notes sur les fichier Final-Draft

Les fichiers Final-Draft contenus dans ces dossiers permettent de faire le test de la conversion d'un fichier Final-Draft vers un fichier Scenario.xml.

Inversement, ces fichiers permettent aussi de tester l'exportation vers Final-Draft en vérifiant que le fichier `export.fdx` est bien conforme à l'original.

## Simple

`simple.fdx` est un simple scénario avec seulement quelques actions, dialogue, nom de personnage, donc quelques *elements* contenu.

## Complet

Le fichier `complet.fdx` est un fichier Final-Draft le plus complet possible, pour tester le plus de choses possibles. Ces choses sont les suites :

* tous les éléments (intitulé, action, nom de personnage, note de jeu, dialogue, transition, style original — ici le style "centré")
* les personnages dans les scènes (naturels ou ajoutés "de force")
* les notes de script
  - note sans titre, sans couleur et sans type (à la toute fin)
  - note avec titre, body et couleur
  - note avec type (au tout début)
* les couleurs données à des scènes
* les titres donnés à des scènes
* les résumés donnés à des scènes
* les synopsis donnés à des scènes

## Styles

Le fichier `styles.fdx` est un fichier Final-Draft qui permet de tester la convertion et l'export de tout ce qui concerne les styles, qu'ils soient appliqués localement ou de façon globale, aux éléments.

## Personnages

Le fichier Final-Draft `personnages.fdx` permet de tester la convertion et l'export de tout ce qui concerne les personnages (lorsqu'ils sont définis en dehors du seul scénario).

## Options

Le fichier `options.fdx` est un fichier Final-Draft qui permet de tester la convertion et l'export de tout ce qui concerne les options de Final-Draft :

* la pose des numéros de scène

## Outline

Le fichier `outline.fdx` permet de tester l'utilisation de l'outline en ajoutant des éléments manuellement.

## Revision

Le fichier `revision.fdx` doit permettre de vérifier le système de correction et de révision. 

> Note : pas encore vraiment sûr d'aller jusque-là.
