# Log Manuel

La librairie `Log.js` définit la classe `LogClass` qui permet une gestion des messages plus puissante que la console en utilisant toutes les fonctionnalités de filtre et d'aspect.

## Écriture d'un message

~~~javascript

Log.notice("Mon simple message.")

~~~

### Types de message

~~~javascript
Log.notice
Log.warn
Log.error
Log.fatal_error
Log.debug
Log.test   // pour inside-test
~~~

---

## Attacher un Log à une classe

Pour savoir plus précisément d'où vient un message (sans regarder le bout de la ligne) on peut attacher un logger à une classe. De cette manière :

~~~javascript

class MaClasse {
  get log(){
    return this._log || (this._log = new LogClass('MaClasse'))
  }
  /**
   * Une fonction qui va utiliser le log
   * 
   */
  maFonction(){
    this.log.warn("Attention vous êtes surveillés !")
    // => affichera un warning en console avec "[MaClasse] Attention vous êtes surveillés !"
  }
}
~~~


---

## Définition du niveau de filtre des messages

> Noter que ce niveau affecte toutes les instances de Log (pour la consistance).

~~~javascript

Log.level = <niveau>

// Par exemple :

log.level = LOG_NOTICE|LOG_DEBUG

~~~

On peut définir ce niveau à la volée par exemple :

~~~javascript

Log.level = LOG_NONE

// Plus aucun message ne s'affiche

Log.level = LOG_DEBUG

// À partir d'ici, tous les messages de débuggage s'affichent

// ...

Log.level = LOG_NOTICE|LOG_WARNING

// À partir d'ici, on revient à un filtrage normal

~~~


## Définir le filtrage "de base"

Noter que ce flag affecte toutes les instances de log.

~~~javascript

Log.defaultLevel = <niveau>

~~~

Pour l'utiliser à partir d'un endroit :

~~~javascript

Log.level = null

~~~
