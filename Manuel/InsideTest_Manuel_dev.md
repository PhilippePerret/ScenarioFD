# InsideTest - Manuel développement



---



## Travail complexe quand tests côté serveur

Les tests se compliquent lorsqu’on doit travailler avec le serveur avec WAA car la méthode `WAA.send` ne renvoie pas son message à `InsideTest` puisque c’est un module. Dans ce cas, au niveau mécanique, on utilise cette astuce :

~~~
Lorsqu'une méthode eval de test doit appeler WAA.send, elle prévient l'application
qu'elle le fait.
Un traitement se fait côté serveur, qu'on imagine long.

Lorsque InsideTest arrive en fin des tests, il interroge l'application pour savoir
si un travail serveur est encore en train de se faire.
Si c'est le cas, il attend avant de montrer les résultats.

Lorsque les tests côté serveur ont été effectués, le serveur prévient l'application.
Lorsque InsideTest interroge l'application, on lui dit alors que c'est fini et on
lui donne les résultats.

InsideTest peut alors clore l'opération et afficher les résultats.
~~~

Concrètement, tout ça se passe avec la classe **`IT_WAA`** qu’il faut charger par `IT_WAA.js` comme un script normal dans l’application (ça se fait automatiquement par `InsideTest.install()` qui ajoute une balise pour ce script.

Ensuite, on appelle les méthodes serveur avec : 

~~~javascript
IT_WAA.send(InsideTest.current, {data})
~~~

… où `data` contient les propriétés normales, auxquelles sont ajoutées par le programme la propriété `testId` qui devra être remonté ensuite pour savoir que le test a fini son travail.

> Cela signifie qu’il faut appeler des méthodes propres aux tests, qui seront susceptibles de retourner ce identifiant du test. Dans le cas contraire, les tests ne s’arrêteront jamais (un timeout les arrêtera cependant)

Côté serveur, on se sert de la méthode `WAA.send` normale, mais en appelant :

~~~ruby
WAA.send(class:'IT_WAA', method:'receive', data:{<data>})
~~~

> Rappel : `<data`> doit impérativement définir `testId`, l’identifiant du test. Mais cette donnée est envoyée au serveur, donc si on retourne juste les données envoyées (auxquelles on a pensé à ajouter `:result`) alors il y aura tout ce qu’il faut.

### Fonctionnement

Dans `InsideTest`, une fois que tous les tests ont été joués par **`InsideTest.runStack()`**…

… on se met en attente dans la méthode **`InsideTest.awaitForAllServerCheckDone()`**. Cette méthode interroge `IT_WAA` pour savoir si la classe est en activité. 

Dans **`IT_WAA`**, si aucun test serveur n’a été lancé, la propriété **`working`** (`IT_WAA.working`) est à `false` et l’on peut achever les tests et afficher le résultat.

En revanche, si des tests serveurs ont été lancés (rappel : depuis un inside-test normal, mais avec `IT_WAA.send`), alors la méthode **`InsideTest.checkerServerResultats`** est appelée tous les demi-secondes pour relever dans **`IT_WAA.stackServerResultats`** tous les résultats remontés par le serveur (rappel : grâce à l’appel `WAA.send(class:'IT_WAA', method:'receive', data:{testId:<test-id>, result:{ok:..., error…}, data:{<autres données}})` côté ruby.)


