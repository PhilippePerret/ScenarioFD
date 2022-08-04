<style type="text/css">
xmltag {
  display: inline-block;
  clear: both;
  margin: 0;
  padding: 0;
  color: red;
  font-family:'Monospace', 'Courier New' ;
  font-weight: bold;
}
xmltag:before {content: '<'; color: lightblue;}
xmltag:after  {content: '>'; color: lightblue;}
xmlcom {
  font-family: 'Courier New';
  color: #999999;
  display: block;
}
xmlcom:before { content: '<!-- ' }
xmlcom:after  { content:  '-->'  }
/* Description de la balise */
xmldesc {
  display: inline-block;
  clear: both;
  margin: 0;
  padding: 0;
  margin-left: 2em;
}
/* Lien vers le chapitre */
xmllink {
  display: inline-block;
  clear: both;
  margin: 0;
  margin-left: 2em;
  font-family: inherit;
  font-size: inherit;
}
</style>
# Structure des fichiers FinalDraft

Ce document décrit la structure des fichiers XML Final-Draft afin de pouvoir les produire de façon efficiente à partir des fichiers XML Scenario.


<xmltag>FinalDraft DocumentType="Script" Template="no", Version="5"</xmltag>
<xmldesc>Nœud racine.</xmldesc>

Je ne sais pas à quoi correspond la propriété `Version`.

Les nœuds enfants sont :

<xmltag>Content</xmltag>
<xmldesc>Les lignes du scénario de façon séquentiel.</xmldesc>
<xmllink>[-> Description](#balise-content)</xmllink> 
<xmltag>/Content</xmltag>

<xmltag>HeaderAndFooter</xmltag>
<xmldesc>Définitition des pied et entête de page</xmldesc>
<xmllink>[-> Description](#balise-headerfooter)</xmllink>
<xmltag>/HeaderAndFooter</xmltag>

<xmltag>SpellCheckIgnoreLists</xmltag>
<xmldesc>Liste des mots à ignorer ?</xmldesc>
<xmltag>/SpellCheckIgnoreLists</xmltag>

<xmltag>PageLayout</xmltag>
<xmldesc>Format général de page (marges, couleurs, etc.)</xmldesc>
<xmllink>[-> Description](#balise-pagelayout)</xmllink>
<xmltag>/PageLayout</xmltag>

<xmltag>WindowState</xmltag>
<xmldesc>Présentation de la fenêtre (largeur, hauteur, etc.)</xmldesc>
<xmllink>[-> Description](#balise-windowstate)</xmllink>
<xmltag>/WindowState</xmltag>

<xmltag>TextState</xmltag>
<xmldesc>Présentation du texte (zoom, sélection, invisibles)</xmldesc>
<xmllink>[-> Description](#balise-textstate)</xmllink>
<xmltag>/TextState</xmltag>

<xmltag>ElementSettings Type="&lt;Type élément&gt;"</xmltag>
<xmldesc>Définition de chaque élément (intitulé, action, etc.)</xmldesc>
<xmllink>[-> Description](#balise-elementsettings)</xmllink>
<xmltag>/ElementSettings</xmltag>

<xmltag>TitlePage</xmltag>
<xmldesc>Définition de la page de titre</xmldesc>
<xmltag>/TitlePage</xmltag>

<xmltag>SmartType</xmltag>
<xmldesc>Définition de l'auto-complétion (personnages, intitulés, etc.)</xmldesc>
<xmllink>[-> Description](#balise-smarttype)</xmllink>
<xmltag>/SmartType</xmltag>

<xmltag>LockedPages</xmltag>
<xmldesc>Verrouillage des pages</xmldesc>
<xmltag>/LockedPages</xmltag>

<xmltag>Revisions</xmltag>
<xmldesc>Révisions/corrections enregistrées</xmldesc>
<xmllink>[-> Description](#balise-revisions)</xmllink>
<xmltag>/Revisions</xmltag>

<xmltag>AltCollection</xmltag>
<xmldesc>Liste des dialogues alternatifs</xmldesc>
<xmllink>[-> Description](#balise-altdialogue)</xmllink>
<xmltag>/AltCollection</xmltag>

<xmltag>TargetScriptLength</xmltag>
<xmldesc>Longueur (durée minute) du script</xmldesc>
<xmllink>[-> Description](#balise-script-length)</xmllink>
<xmltag>/TargetScriptLength</xmltag>

<xmltag>ListItems</xmltag>
<xmldesc>? (peut-être les dernières modifications pour annulation)</xmldesc>
<xmltag>/ListItems</xmltag>

<xmltag>DisplayBoards</xmltag>
<xmldesc>Définition des panneaux (DisplayBoard) de la story map et du beat board</xmldesc>
<xmllink>[-> Description](#balise-boards)</xmllink>
<xmltag>/DisplayBoards</xmltag>

<xmltag>Writers</xmltag>
<xmldesc>Auteurs du scénario</xmldesc>
<xmllink>[-> Description](#balise-writers)</xmllink>
<xmltag>/Writers</xmltag>

<xmltag>WriterMarkup</xmltag>
<xmldesc>?</xmldesc>
<xmltag>/WriterMarkup</xmltag>

<xmltag>TagData</xmltag>
<xmldesc>Données de toutes les tags</xmldesc>
<xmllink>[-> Description](#balise-tags-data)</xmllink>
<xmltag>/TagData</xmltag>

<xmltag>ScriptNotes</xmltag>
<xmldesc>Notes de script</xmldesc>
<xmllink>[-> Description](#balise-notes-script)</xmllink>
<xmltag>/ScriptNotes</xmltag>

### Tags XML à ne pas modifier

<xmltag>Watermarking</xmltag>
<xmldesc>Définit la watermark</xmldesc>
<xmllink></xmllink>
<xmltag>/Watermarking</xmltag>

<xmltag>MoresAndContinueds</xmltag>
<xmldesc>Définition de l'affichage des dialogues suivant et suite de scène</xmldesc>
<xmllink>[-> Description](#balise-)</xmllink>
<xmltag>/MoresAndContinueds</xmltag>

<xmltag>SplitState</xmltag>
<xmldesc>État du split de l'interface — Ne pas modifier</xmldesc>
<xmltag>/SplitState</xmltag>

<xmltag>Macros</xmltag>
<xmldesc>Définition des macros — Ne pas modifier</xmldesc>
<xmltag>/Macros</xmltag>

<xmltag>Actors</xmltag>
<xmldesc>Définition des acteurs (acteurs machine) — Ne pas modifier</xmldesc>
<xmltag>/Actors</xmltag>

<xmltag>Cast</xmltag>
<xmldesc>Définition du casting (acteurs réels) — Ne pas modifier</xmldesc>
<xmltag>/Cast</xmltag>

<xmltag>SceneNumberOptions</xmltag>
<xmldesc>Options pour les numéros de scène — Ne pas modifier</xmldesc>
<xmltag>/SceneNumberOptions</xmltag>

<xmltag>CastList</xmltag>
<xmldesc>Options pour l'affichage de la liste de cast — Ne pas modifier</xmldesc>
<xmltag>/CastList</xmltag>

<xmltag>CharacterHighlighting</xmltag>
<xmldesc>Définition des exergues (couleur) des personnages — Ne pas modifier</xmldesc>
<xmltag>/CharacterHighlighting</xmltag>

<xmltag>SceneNavigatorPreferences</xmltag>
<xmldesc>Préférences pour le navigateur de scènes — Ne pas modifier</xmldesc>
<xmltag>/SceneNavigatorPreferences</xmltag>

<xmltag>TagsNavigatorPreferences</xmltag>
<xmldesc>Préférences pour le navigateur de tags — Ne pas modifier</xmldesc>
<xmllink>[-> Description](#balise-)</xmllink>
<xmltag>/TagsNavigatorPreferences</xmltag>


<xmltag>Characters</xmltag>
<xmldesc>Fiches de personnages — Ne pas modifier</xmldesc>
<xmltag>/Characters</xmltag>

<xmltag>Images</xmltag>
<xmldesc>Images utilisées — Ne pas modifier</xmldesc>
<xmltag>/Images</xmltag>

<xmltag>Outlines</xmltag>
<xmldesc>Réglage de l'Outline — Ne pas modifier</xmldesc>
<xmllink>[-> Description](#balise-)</xmllink>
<xmltag>/Outlines</xmltag>


---

<a name="balise-content"></a>

### Balise *Content* — Lignes du scénario

Cette balise de premier niveau définit séquentiellement chaque ligne du scénario. Lorsqu'on passe du document ScenarioXML au document Final-Draft, on doit refaire tous les nœuds enfant de cette balise.

Les enfants sont des balises :

<xmltag>Paragraph Type="&lt;type du paragraphe&gt;"</xmltag>

La plupart des types de paragraphes sont simples et ne définissent qu'un texte. Par exemple :

~~~xml
<Content>
  <!-- ... -->
  <Paragraph Type="Action">
    <Text>On marque une action sous cette forme.</Text>
  </Paragraph>
  <!-- ... -->
</Content>
~~~

Les **types simples** sont :

* **Action** (action ou description),
* **Character** (nom du personnage qui va parler),
* **Dialog** (dialogue mais seulement lorsqu'ils n'ont pas d'alternative),
* **Outline 1, 2 ou 3** (pour décrire la structure générale)

Tous ces types *simples* ne fonctionnent qu'avec une balise `Text`.

Les **types semi-complexes** sont :

* [**Dialog**](#dialog-alternatif) avec dialogue alternatif
* [**Parenthetical**](#note-de-jeu) (note de jeu, car ils définissent aussi leur aspect)
* [**Outline Body**](#outline-body) (seulement parce qu'il définit son aspect dans sa balise…)

Ces types *semi-complexes* définissent des attributs dans leur balise `Paragraph`. Sauf le dialogue, qui ajoute une balise `Alts`.

Les **types complexes** sont :

* [**Scene Heading**](#balise-scene-heading), les intitulés de scène, avec beaucoup d'information puisqu'il rassemble les informations de toute la scène.

<a name="dialog-alternatif"></a>

#### Dialogues alternatifs

Les dialogues alternatifs se présentent sous cette forme :

~~~xml
<Paragraph Type="Dialog">
  <Text>Le dialogue principal d'index 0</Text>
  <Alts Current="0"><!-- ou autre index ci-dessous -->
    <AltId>4</AltId><!-- Id dans la liste AltCollection -->
    <AltId>9</AltId><!-- Id dans la liste AltCollection -->
  </Alts>
</Paragraph>
~~~

Voir [comment se définit le dialogue alternatif](#balise-altdialogue).

<a name="note-de-jeu"></a>

#### Notes de jeu

Les notes de jeu, dans la balise `Content`, se présentent ainsi :

~~~xml
<Content>

  <!-- ... -->

  <Paragraph Type="Parenthetical">
    <Text AdornmentStyle="0" Background="#FFFFFFFFFFFF" Color="#000000000000" Font="Geneva" RevisionID="0" Size="12" Style="">(ici la note de jeue)</Text>
  </Paragraph>

  <!-- ... -->

</Content>
~~~

<a name="outline-body"></a>

#### Le texte des outlines (Outline Body)

Dans la balise `Content`, ils se présentent après leur paragraphe de niveau d'outline, sous la forme :

~~~xml
<Content>
  
  <!-- ... -->
  
  <Paragraph Alignment="Left" FirstIndent="0.00" Leading="Regular" LeftIndent="1.38" RightIndent="7.50" SpaceBefore="0" Spacing="1" StartsNewPage="No" Type="Outline Body">
    <Text>*Le texte décrivant l'élément d'outline*</Text>
  </Paragraph>

  <!-- ... -->

</Content>
~~~

---

<a name="balise-scene-heading"></a>

### Définition des scènes 

Les scènes (intitulé) sont définies dans une balise `Paragraph` de type `Scene Heading`, dans la balise `Content`, dans un paragraphe :

~~~xml
<Content>

  <!-- ... -->

  <Paragraph Type="Scene Heading" Number="1">

  </Paragraph>

  <!-- ... -->

</Content>
~~~

Cette balise peut contenir beaucoup d'informations :

~~~xml
<Paragraph Type="Scene Heading" Number>
  <SceneProperties color Length Page Title>
    <Summary>
      <!-- Résumé de la scène -->
      <Paragraph Alignment FirstIndent Leading LeftIndent RightIndent SpaceBefore Spacing StartsNewPage>
        <Text AdornmentStyle Background Color Font RevisionID Size Style>*Résumé de la scène*</Text>
      </Paragraph>
    </Summary>
    <SceneArcBeats>
      <!-- Beats -->
      <CharacterArcBeat Name>
        <!-- Beat sur l'arc du personnage Name -->
        <Paragraph arguments>
          <Text arguments>*description optionnelle*</Text>
        </Paragraph>
      </CharacterArcBeat>
    </SceneArcBeats>
  </SceneProperties>
  <Text>*Intitulé type "INT. BUREAU - JOUR*</Text>
</Paragraph>
~~~

#### Définition de la COULEUR de la scène

Elle se définit dans l'attribut `Color` de la balise `SceneProperties`. Cf. la [note à propos des couleurs](#definition-color).

#### Définition du TITRE de la scène

Le titre de la scène se définit dans l'attribut `Title` de la balise `SceneProperties`.

#### Définition du RÉSUMÉ de la scène

Le résumé se définit dans la balise `Summary` qui contient `Paragraph > Text` de cette manière :

~~~xml
<SceneProperties>
  <Summary>
    <Paragraph Alignment="Left" FirstIndent="0.00" Leading="Regular" LeftIndent="0.00" RightIndent="1.39" SpaceBefore="0" Spacing="1" StartsNewPage="No">
      <Text AdornmentStyle="0" Background="#FFFFFFFFFFFF" Color="#000000000000" Font="Arial" RevisionID="0" Size="12" Style="">*Résumé de la scène*</Text>
    </Paragraph>

  </Summary>
</SceneProperties>
~~~


---

<a name="balise-headerfooter"></a>

### Balise *HeaderAndFooter*

Cette balise de premier niveau définit les entête et pied de page.

---

<a name="balise-pagelayout"></a>

### Balise *PageLayout*

Cette balise de premier niveau définit le format général de page.

---

<a name="balise-windowstate"></a>

### Balise *WindowState*

Cette balise de premier niveau définit l'état de la fenêtre.

---

<a name="balise-textstate"></a>

### Balise *TextState*

Aspect du texte en général, zoom, sélection et visibilité des caractères invisibles.

---

<a name="balise-elementsettings"></a>

### Balises *ElementSettings*

Séquence de balises qui vont définir chacun des types d'éléments, intitulé, action, général, etc.

C'est l'argument type qui le définit. Par exemple, pour les intitulés : 

<xmltag>ElementSettings Type="Scene Heading"</xmltag>

---

<a name="balise-smarttype"></a>

### Balise *SmartType*

Définition de l'autocomplétion.

---

<a name="balise-revisions"></a>

### Balise *Revisions*

Correction enregistrées, à valider ou rejeter.

---

<a name="balise-altdialogue"></a>

### Balise *AltCollection*

Liste des dialogues alternatifs. Cf. [Dialogues alternatifs](#dialog-alternatif).

Elle contient tous les dialogues alternatifs, par `Id`. Un dialogue se présente ainsi :

~~~xml
<AltCollection>
  <!-- ... -->
  <Alt Id="*identifiant numérique simple*">
    <Paragraph Alignment="Left" FirstIndent="0.00" Leading="Regular" LeftIndent="2.50" RightIndent="-0.88" SpaceBefore="0" Spacing="1" StartsNewPage="No">
      <Text AdornmentStyle="0" Background="#FFFFFFFFFFFF" Color="#000000000000" Font="Geneva" RevisionID="0" Size="12" Style="">Le texte du dialogue alternatif.</Text>
    </Paragraph>
  </Alt>
  <!-- ... -->
</AltCollection>
~~~

---

<a name="balise-script-length"></a>

### Balise *TargetScriptLength*

Pour définir la durée attendue pour le script.

---

<a name="balise-boards"></a>

### Balise *DisplayBoards*

Définit le contenu des deux tableaux :

* la *story map* (appelée maintenant « Outline »),
* le *tableau des beats*.

---

<a name="balise-writers"></a>

### Balise *Writers*

Définition des auteurs du scénario.

---

<a name="balise-tags-data"></a>

### Balise *TagData*

Définition de toutes les tags.

---

<a name="balise-notes-script"></a>

### Balise *ScriptNotes*

Définition des notes de script.

---

<a name="annexe"></a>

## Annexe

---

<a name="definition-color"></a>

### Définition des couleurs

Pour une raison qui m'échappe complètement, les couleurs, dans Final-Draft, sont définies par un code à 13 caractères. En fait, chaque double octet hexadécimal est répété.

Par exemple :

~~~
          #FE01AB
             |
             v
        # FE  01  AB
          --- --- ---
           |   |   |
     ------|   |   |-------
     v         v          v
     FE        01         AB
     |         |           |
     |----    -----    ----|
     v   v    v   v    v   v
     FE FE    01  01   AB AB
     ------------------------
                 |
                 v

           #FEFE0101ABAB

~~~
