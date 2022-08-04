# Manuel InsideTest

**InsideTest** permet de lancer des tests dans le module à tester lui-même, afin d’avoir une suveillance permanente en cours de développement.

[TOC]

Le fonctionnement est cependant assez différent des autres modules de test, il est spécialement pensé pour les tests répétitifs, c'est-à-dire qui testent le résultat de nombreuses valeurs. L'idée est alors que créer un test, puis de passer ces valeurs (appelées `sujets`) par ce test.
Par exemple :

~~~javascript

// Un test qui doit vérifier que les valeurs sont bien égales à 4
var test = new InsideTest({
  error: '%{devrait} être égal à 4.'
  eval: function(sujet){
    return sujet == 4
  }
})
// On fait les tests
test.with(2) // => une erreur en console "««« 2 »»» devrait être égal à 4."
test.with(3) // => idem
test.with(4) // succès (invisible par défaut)
test.with(2 + 2) // => succès

test.withNegate(4) // => Erreur "««« 4 »»» ne devrait pas être égal à 4."
test.withNegate(3) // => succès

~~~

## Définition des messages

Comme on peut le voir ci-dessus, on définit simplement les messages d'erreur à l'aide d'un texte simple qui doit pouvoir marcher (mais pas forcément) avec les tests négatifs. On utilise pour ça la valeur template `%{devrait}` ou `%{doit}` qui suivant le résultat se transformera en "devrait"/"ne devrait pas" ou "doit"/"ne doit pas".

Les tests ne produisent aucun retour en cas de succès, ils ne sont là que pour déceler les problèmes.

### Mise en forme plus complexe des messages

Pour une mise en forme plus adaptée aux circonstances, on peut utiliser les balises `%{sujet}`. Par exemple :

~~~javascript
var test = new InsideTest({
  error: 'Quand le sujet est %{sujet}, le résultat %{devrait} être bon.'
  ...
})
~~~

### Plusieurs messages

On peut envoyer plusieurs messages au cours du même test si nécessaire, ou un seul mais qui interrompt le test avant la fin. Par exemple, imaginons un test qui cherche à savoir si tous les prénoms voulus sont bien là. On pourrait avoir :

~~~javascript
var test = new InsideTest({
  	error: '%{devrait} passer.'
  , eval: function(){
    	var une_erreur = false
    	if (page.not.contains('Marion')) {
        InsideTest.current.error = "Marion devrait être dans la liste"
        // note error= est une méthode cumulative
        une_erreur = true
      }
    	if (page.not.contains('Philippe')){
        InsideTest.current.error = "Philippe devrait être dans la liste"
        une_erreur = true
      }
    	if (page.not.contains('Élie')){
        InsideTest.current.error = "Élie devrait être dans la liste"
        une_erreur = true
      }
    
	    return une_erreur
  	}
})
~~~



> **Note importante** : contrairement aux apparences, si les trois noms sont absents de la page, les 3 messages seront affichés.. La méthode `error = ` est cumulative.

## Activation des tests

* Les définir dans chaque module ou dans des modules séparés,

* mettre une constante `INSIDE_TESTS` à la valeur `true` avant l’appel de la méthode suivante,

  ~~~javascript
  const INSIDE_TESTS = true
  ~~~

* une fois le programme chargé (dans le `$(document).ready` par exemple), placer la commande : 

  ~~~javascript
  InsideTest.run()
  ~~~

  


## Les méthodes de test

Toutes ces méthodes s’appliquent à une instance `InsideTest` qui définit au moins la méthode `eval()` :

~~~javascript
var test = new InsideTest({
  eval: function(){return true}
})
~~~



<a name="method-with"></a>

### .with(sujet[, expected])

Quand on veut seulement tester un sujet.

Si `expected` est défini, la méthode se comporte comme [`.withExpected`](#method-with-expected)

Bien prendre en compte les [problèmes d'égalité](#equality-problems).

### .withNegate(sujet[, expected])

Inverse de la précédente.

<a name="method-with-expected"></a>

### .withExpected(sujet, expected)

Fournit le `sujet` à la méthode de test et espère le résultat `expected`. Bien prendre en compte les [problèmes d'égalité](#equality-problems).

Exemple : 

~~~javascript
var test = new InsideTest({
  	error: '%{devrait} correspondre.'
  , eval: function(sujet){
  		return `Bonjour, ${sujet} !`  
	  }
})

test.withExpected('John', 'Bonjour, John !') // => succès
test.withExpected('Renée', 'Bonjour, Renée !') // => succès
test.withExpected('Al', 'Au revoir, Al')
// => échec. En console : 
// ««« Al »»» devrait correspondre. 
// Attendu : "Au revoir, Al"
// Obtenu  : "Bonjour, Al !"
~~~



### .withExpectedNegate(sujet, expected)

Inverse de la précédente.

<a name="method-equal"></a>

### .equal(sujet, expected)

Teste l'égalité entre `sujet` et `expected`.

Cette méthode prend en compte les [problèmes d'égalité](#equality-problems).

<a name="method-exec"></a>

### .exec()

Pour un test sans sujet.

Par exemple :

~~~javascript
var test = new InsideTest({
  	error: '%{doit} créer une instance Scenario'
  , eval: function(){
  		const sce = new Scenario()
      return sce instanceof Scenario
	  }
})
test.exec() // => true si tout se passe bien
~~~



## Annexe

<a name="equality-problems"></a>

### Problèmes d'égalité

Avec Javascript, les égalités ne sont pas pratiques… Par exemple, `[1,2,3]` ne sera pas égal à `[1,2,3`…

Quand on veut tester une telle égalité, soit on utilise `JSON.stringify` (ou `JString(…)`) à l'intérieur de la fonction :

~~~javascript

var test = new InsideTest({
  eval: function(sujet, expected){
    // ...
    return JString(sujet) == JString(expected) 
  }
})
~~~

… Soit on utilise la [méthode de test `equal`](#method-equal).
