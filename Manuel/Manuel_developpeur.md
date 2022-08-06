# Scenario<br>Manuel développeur



## L’interface

L’interface de l’application est composé de `cadres` (instances `{Cadre}`). On peut les disposer de différentes manières à l’intérieur des 4 quarts de la fenêtre : un unique *cadre* qui occupe les 4 quarts, 4 cadres qui occupent chacun un quart ou un cadre sur les 2 quarts à droite et deux cadres sur les 2 quarts à gauche.

Par défaut, on se trouve avec :

* la console dans les deux quarts du bas
* la prévisualisation dans les deux quarts du haut

À l’ouverture de l’application, on appelle `Cadre.prepare()` qui prépare l’interface.

### Les quarts

Ils sont chacun repérés par deux lettres : **B** pour **bottom**, **T** pour **top**, **L** pour **left** et **R** pour **right**. Donc les quarts sont, en tournant dans le sens horaire : **TL** (top left), **TR** (top right), **BR** (bottom right) et **BL** (bottom left).

### Hiérarchie

* La **Disposition** est l’instance qui contient la configuration actuelle des cadres. On peut créer une infinité de dispositions.
  * Caractéristiques :
    * `id` : identifiant, pour récupérer la disposition
    * `key` : la clé dans `DATA_DISPOSITION`, qui permet de savoir comment les cadres sont organisés dans la disposition.
    * les contenus de cadre (`{InCadre}`) propres à cette disposition particulière.
  * Données fixes (définies dans `DATA_DISPOSITIONS`)
    * la position des cadres et leurs interactions.
  * Données variables : 
    * les contenus de ses cadres,
    * les dimensions de ses cadres.
  * Enfants directs : les Cadres (instances `{Cadre}`.
  * Container : **`section#cadres_container`**
  * Chaque disposition est construite dans un **`div.disposition`** dans le container. On y fait référence par `<<<Disposition>>>@container`.
  * Note : à la base, on part avec une disposition par disposition. C’est-à-dire que pour la disposition #1 (1 left 1 right), il n’existe qu’une instance disposition, avec un contenu. Mais ensuite, on peut avoir plusieurs dispositions sur la base de la disposition #1, avec des contenus différents (qui sont caractérisés par un nom défini par l’utilisateur ou par leur contenu particulier (par exemple “Preview - Navigator - Filter” (dans le sens horaire).
* Les **Cadres** sont les enfants directs des *Dispositions*. 
  * Classe : `Cadre`
  * Instance : chaque cadre de disposition possède sa propre instance, unique.
  * Caractéristiques (propriétés)
    * `id` : son identifiant fixe, déterminé dans `DATA_DISPOSITIONS`. Cet identifiant identique la position haute-gauche du cadre. Si le cadre, par exemple, occupe toute la moitié supérieure de la disposition, son premier quart haut-gauche est donc `top_left` et il portera cet identifiant.
    * `domId`: son identifiant dans la page est caractérisé par son `id` de disposition (la Disposition à laquelle le cadre appartient) et son `id` fixe (ci-dessus). Par exemple : `cadre-12-bottom_left`.
  * Caractéristique principale : leur position dans la disposition, appelée *quart*. Les cadres peuvent occuper un ou plusieurs quarts (2 pour le moment). 
  * Enfants directs : les *InCadres* (instances `{InCadre}`)
  * Note : bien comprendre qu’un même cadre (par exemple celui qui occupe les quarts ‘top-left’ et ‘top-right’) possède des instances différentes dans les différentes dispositions.
* Les Cadres contiennent des **InCadres** (instances `Incadre`).

~~~html
<section id="cadres_container">

</section>
~~~

