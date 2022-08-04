<style type="text/css">div.res { color: #a00ecf;} div.res:before{content:'=> ';}
bouton{border:1px solid #CCC;padding:0px 8px;text-align:center;background-color:#EEE;}
</style>


# Scénario

**Scénario** est une application browser (WAA) d'édition de scénario, type Final Draft, en mieux…

## Création d'un nouveau scénario

Chaque scénario doit posséder son propre dossier et il ne peut y avoir qu'un seul scénario dans un dossier. Donc :

* créer le dossier où devra se trouver le scénario,
* ouvrir un Terminal à ce dossier,
* jouer la [commande `scenario`](#commande-scenario) dans la fenêtre de Terminal,

<div class='res'>Un nouveau scénario est initié.</div>

<a name="edit-scenario"></a>

## Édition d'un scénario

Pour éditer un scénario existant :

* ouvrir une fenêtre de Terminal au dossier contenant le fichier `scenario.xml`,
* jouer la [commande `scenario`](#commande-scenario).

<div class="res">Le scénario est ouvert en édition.</div>

### Écriture des scènes

~~~
# Un commentaire se met après un dièse

# Un Intitulé commence par ':'
:INT - BUREAU - JOUR

# Une action se met simplement à la ligne
La première action

# Le nom du personnage qui parle se termine par ":"
NOM PERSONNAGE:

# Le dialogue se met après deux espaces
  C'est le dialogue
  
# La note de jeu se met comme le dialogue, mais commence et se termine
# par des parenthèses
  (note de jeu)
  
# Une note se définit par :
[1] Ma première note
# Et dans le texte :
Une action avec [1] une note
# Mais noter que la note sera toujours associée à la phrase complète (pour le moment)

# Une donnée est toujours précédée d'un dollar :
$time = 50.5
# Ci-dessus on définit que la scène devrait se trouver à la 50e page et
# demi, donc la 50e minutes et demi.
# Voir plus loin les données possibles/utiles.
~~~

<a name="scene-data"></a>

### Données de la scène

Les données de la scène s’indiquent par :

~~~
$<name> = <valeur>
~~~

On peut utiliser n’importe quel nom de donnée pour s’en servir programmatiquement ensuite grâce à un patch. Mais certaines données sont prédéfinies :

| Donnée      | Valeur                                   | Note                                                         |
| ----------- | ---------------------------------------- | ------------------------------------------------------------ |
| `$page`     | Position temporelle de la scène, en page | nombre flottant (p.e. 23.5 signifie que la scène commence à la moitié de la 23e page) |
| `$summary`   | Résumé de la scène                       | String                                                       |
| `$fonction` | Fonction de la scène                     | String parmi, “Incident perturbateur”,  “Incident déclencheur”, “Pivot 1”, “Pivot 2”, “Clé de voûte”, “Crise”, “Sortie de crise”, “Climax” |
| `$duree`    | Durée attendue de la scène               | Nombre flottant, en minutes/pages                            |
| `$state`    | État de la scène                         | {String} par exemple “Brouillon”, “version finale”, etc.     |
| $color      | Couleur de la scène                      | {String} commençant par ‘#’                                  |

---

<a name="timelines"></a>

## Les Timelines (lignes temporelles)

Les **Lignes de temps** ou *timelines*  permettent de visualiser les éléments du film/scénario. Il y a quatre types de ligne de temps :

* La ligne des **Beats** : affiche les temps forts du film (définis manuellements par l’auteur — cf [Définir un beat](#define-beats)),
* La ligne des**Séquences** : affiche les séquences du scénario (définies manuellement par l’auteur — cf. [Définir les séquences](#define-sequences)),
* La ligne des **positions absolues des scènes** : affiche les scènes dans leur position absolue, définie par leur donnée `$page` avec leur durée définie par leur donnée `$duree` (cf. [Définir la position absolue des scènes](#define-position-abs-scene) et [définir la durée absolue des scènes](#define-duree-abs-scene)),
* La ligne des **positions relatives des scènes** : affiche les scènes en position relative, c’est-à-dire comme elles se présentent dans le scénario.

Une **règle graduée** permet de se repérer par rapport à la longueur du film (nombre de pages défini dans les [informations du film](#film-infos)).

Une **règle de zoom** permet de grossir ou de diminuer le rang d’affichage en jouant sur les deux poignées. Cette règle représente toujours la longueur totale du film et les deux poignées permettent de définir la zone à grossir. Sur chaque poignée s’affiche le numéro de page de début et de fin de la zone.

### Afficher/masquer les lignes de temps

Le petit menu ⚙️ à côté des timelines permet de définir les *lignes de temps* à afficher ou masquer.

---

<a name="shortcuts"></a>

### Raccourcis

| Opération               | raccourci | Note                             |
| ----------------------- | --------- | -------------------------------- |
| Actualiser l’affichage  | ⌘ u       | Le u majuscule fonctionne aussi. |
| Enregistrer le scénario | ⌃ s       | Le s majuscule fonctionne aussi  |
|                         |           |                                  |
|                         |           |                                  |
|                         |           |                                  |
|                         |           |                                  |
|                         |           |                                  |
|                         |           |                                  |
|                         |           |                                  |



## Export du scénario au format Final Draft

Pour exporter un scénario Scenario en document Final Draft :

* ouvrir le scénario dans Scenario,
* cliquer sur le bouton <bouton>-> FD</bouton>

<div class="res">Le scénario est converti en fichier Final Draft.</div>

Vous pouvez l'ouvrir dans l'application Final Draft.


## Import d'un scénario Final Draft

Pour importer et convertir un scénario Final Draft :

* placer le scénario Final Draft dans un dossier dédié (sans fichier scénario),
* ouvrir une fenêtre de Terminal à ce dossier,
* jouer la [commande `scenario`](#commande-scenario),
* le Terminal demande si le fichier Final Draft doit être converti,
* approuver.

<div class="res">Le scénario Final Draft est transformé en `scenario.xml`</div>

---

<a name="annexe"></a>

## Annexe

---

<a name="preparation-application"></a>

### Préparation de l’application

Pour être pleine fonctionnelle, l’application doit être préparée.

#### Aspect de Firefox

Nous allons supprimer les barres inutiles de Firefox (barre d’adresse et barre d’onglets)

* créer un profil de nom ‘aScenario’, dans un dossier de nom `Scenario`,
* créer le dossier `chrome` dans ce dossier,
* créer le fichier `userChrome.css` dans ce dossier
* dans ce fichier, nous allons placer le code :
	~~~
	#urlbar {
		visibility: hidden!important;
	}
	#TabsToolbar {
		display: none!important;
  }
	~~~

---

<a name="load-webdriver-brower"></a>

#### Pour charger un driver (Firefox)

[Site Selenium](https://www.selenium.dev/documentation/webdriver/getting_started/install_drivers/).

---

<a name="commande-scenario"></a>

#### Commande `« scenario »`

Pour créer la commande `scenario` qui permettra de lancer l’application dans le Terminal, créer un alias dans le fichier `~/.zshrc` ou le fichier profil de bash :

~~~
alias scenario="$HOME/path/to/script/Scenario/scenario.rb"
~~~

> ci-dessus, remplacer `path/to/script/` par le chemin vers le dossier de l’application, par exemple : `$HOME/Programmes/Scenario/scenario.rb`.

Penser à ouvrir une nouvelle fenêtre de Terminal pour prendre en compte du changement.

