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

* La **Disposition** est l’instance qui contient la configuration actuelle des cadres. On peut créer une infinité de dispositions (instances `DefinedDisposition < Disposition`) à partir des dispositions de base (instances `Disposition`).
  * Caractéristiques :
    * `id` : identifiant, pour récupérer la disposition définie (`dispoId` dans le programme)
    * `key` : la clé dans `DATA_DISPOSITION`, qui permet de savoir comment les cadres sont organisés dans la disposition. (`dispoKey` dans le programme).
    * les contenus de cadre (`{InCadre}`) propres à cette disposition particulière.
  * Données fixes (définies dans `DATA_DISPOSITIONS`)
    * la position des cadres et leurs interactions lors du redimensionnement.
  * Données variables (enregistrées dans la donnée `dispositions` du scénario) : 
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

## Principe de fonctionnement des contenus

~~~
La *DISPOSITION* définit des zones dans la fenêtre, suivant ses 4 quarts

Dans chaque *QUART* défini, on met un CADRE qui peut être redimensionné.
Le CADRE est définitivement associé à la disposition choisie.
Ce CADRE peut-être obtenu par 'Disposition.current.cadre(quart)' ou avec
la méthode générale 'cadre(quart)' qui va chercher dans la disposition 
courante.

Dans chaque *CADRE* on met un INCADRE, c'est-à-dire un contenu qui peut
avoir le type 'preview', 'console', 'navigator', etc.
Ce contenu INCADRE peut être changé à la volée.

Ce *INCADRE* possède un type de contenu, dans div CONTENT (this.content) pour
son contenu et un div TOOLSBAR (this toolsbar) pour ses boutons propres.
La toolsbar contient toujours un bouton pour changer le type de contenu du 
cadre. Noter que lorsqu'on change le contenu, c'est l'INCADRE courant qui 
change, pas seulement son contenu.
Chaque INCADRE instancié est conservé [où ?] pour pouvoir être réutilisé au
besoin.
~~~

