# Scenario

L'idée est de faire un programme, dans un browser, pour écrire un scénario.

L'écran serait composé de deux partie : 

* au-dessus, la visualisation du script formaté
* en dessous, une "console" dans laquelle on tape le texte du scénario, de façon la plus simple possible.

## Lancement d'un fichier SRPS

Pour le moment, tant que l'application Scenario.app ne fonctionne pas, il faut Ouvrir un Terminal au dossier du fichier .srps (c'est un bundle, pas un fichier) et lancer la commande 'scenario' (note : ce n'est plus le .zshrc qui définit l'alias, il est enregistré dans `/usr/local/bin` ).


## Fonctionnalités

* snippets pour ré-écrire facilement un nom, un décor, etc. Par exemple, si on a utilisé "JOHN" comme nom de personnage, lorsque l'on tape "J[TAB]", le programme remplace le texte par "JOHN"

## Principes

* Pour ne pas surcharger l'éditeur (la console), on édite toujours une seule scène (dès qu'on clique dessus, ça l'édite — sauver toujours la scène courante).

## Code pour le script

* les actions sont de simples lignes :

  ```
  > Ceci est une action
  ```

* les noms de personnages qui parlent sont des lignes terminant par ":" :
  
  ```
  > NOM DU PERSONNAGE:
  ```

* les dialogues se trouvent à une tabulation du bord :

  ```
  > NOM DU PERSONNAGE:
  > \t Ce qu'il dit est comme ça
  ```

* les dialogues alternatifs sont amorcés par '^' :

  ```
  > NOM DU PERSONNAGE:
  >   Ce qu'il dit
  >   ^Ce qu'il pourrait dire aussi
  >   ^Ou dire ça aussi
  ```
* les intitulés commencent par ":" :

  ```
  > :INT. MAISON - JOUR
  ```

* les notes commencent par "$N" (note : peut-être que toutes les balises qui ne sont pas à écrire sont précédées du signe '$')

  ```
  > Une belle action ou une description.
  > $N Une note sur cette action ou cette description.
  > $N Une autre note sur cette action description.
  ```
