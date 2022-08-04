# Scenario<br>Manuel développeur



## L’interface

L’interface de l’application est composé de `cadres` (instances `{Cadre}`). On peut les disposer de différentes manières à l’intérieur des 4 quarts de la fenêtre : un unique *cadre* qui occupe les 4 quarts, 4 cadres qui occupent chacun un quart ou un cadre sur les 2 quarts à droite et deux cadres sur les 2 quarts à gauche.

Par défaut, on se trouve avec :

* la console dans les deux quarts du bas
* la prévisualisation dans les deux quarts du haut

À l’ouverture de l’application, on appelle `Cadre.prepare()` qui prépare l’interface.

### Les quarts

Ils sont chacun repérés par deux lettres : **B** pour **bottom**, **T** pour **top**, **L** pour **left** et **R** pour **right**. Donc les quarts sont, en tournant dans le sens trigonométrique : **TL** (top left), **TR** (top right), **BR** (bottom right) et **BL** (bottom left).
