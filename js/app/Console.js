'use strict';
/**
 * Gestion de la console
 * 
 */
class Console extends InCadre {

static get all(){
  return this._all || []
}
static get first(){
  return this.all[0]
}
static get current(){
  return this._current || (this._current = this.first)
}
static set current(c) {
  if ( this._current ) this._current.field.classList.remove('active')
  this._current = c
  c.field.classList.add('active')
}

static add(consol){
  if (undefined == this._all) this._all = []
  this._all.push(consol)
}


//##################################################################


constructor(cadre){
  super('console', cadre)
  Console.add(this)
}

/**
 * Pour éditer la scène +scene+
 * 
 */
edit(scene){
  /*
  |  S'il y a une scène courante, on marque qu'elle n'est plus en
  |  édition.
  */
  if ( this.scene ) {
    this.scene.isEdited = false
  }
  /*
  | Mettre la scène en édition
  */
  this.scene          = scene
  this.scene.isEdited = true
  this.field.value    = scene.content
  this.activeKeyboardObservers()
}


observe(){
  this.field.addEventListener('blur',   this.onBlur.bind(this))
  this.field.addEventListener('change', this.onChange.bind(this))
  this.field.addEventListener('focus',  this.onFocus.bind(this))
  /*
  |  Pour l'autocomplétion
  */
  this.textarea = new Textarea(this.field, {autocompleteMethod: this.onAutocomplete.bind(this)})
  // $(this.field).autocomplete({
  //   source: ['bonjour', 'au revoir', 'cadeau']
  // })

  /*
  |  Boutons de la toolsbar
  */
  this.btnRefresh.addEventListener('click', this.onClickRefreshButton.bind(this))
}

/**
 * --- MÉTHODES D'OBSERVATION ---
 * 
 */

/**
 * Méthode appelée quand on joue la touche TABULATION dans le champ
 * de texte (pour déclencher l'autocomplétion.
 * Noter que c'est en construisant this.textarea {Textarea} qu'on a
 * défini que cette méthode devait être appelée en cas de touche TAB
 * dans le champ de texte.
 * Mais il est de la responsabilité de cette méthode-ci de voir ce
 * qu'il faut proposer comme source et comme réaction pour l'auto-
 * complétion.
 * Prenons le cas d'un intitulé de texte. La méthode reconnait que 
 * c'est un INTITULÉ car il y a deux points juste avant. Comparons
 * avec un NOM où les deux points sont après.
 * 
 * 
 */
onAutocomplete(e){
  const tx = this.textarea
  console.log("-> onAutocomplete / word before = '%s' / word after = '%s'", tx.wordBeforeCursor, tx.wordAfterCursor)
  const params = {
      source:         null
    , afterInsertion: null
  }
  const dsource = {
      multi:    false
    , source:   null
    , default:  null
    , before:   null // à ajouter avant le mot choisi
    , after:    null // à ajouter après le mot choisi
  }
  /*
  |  De quelle autocomplétion s'agit-il ?
  */
  if ( tx.wordBeforeCursor == ':' ) { // => un intitulé
    /*
    |  Un intitulé impose une source "multiple", en trois temps,
    |  pour le lieu, le décor et l'effet
    */
    dsource = this.getAutocompletionSourceForSceneHeading(tx)

  } else if ( SCENE_LIEUX.includes(tx.wordBeforeCursor) ) { // => un décor après INT./EXT. etc.

    dsource.source  = Scenario.current.decors.forAutocomplete

  } else if ( tx.wordBeforeCursor == '::' || tx.wordAfterCursor == ':' ) { // => un nom de personnage
    /*
    |  Un nom de personnage
    |
    |  Noter qu'on peut déclencher cette autocomplétion soit en
    |  plaçant le curseur avant un ':' soit après un '::'
    |
    */
    dsource.source = Scenario.current.personnages.forAutocompletion
    if ( tx.wordBeforeCursor == '::' ) {
      /*
      |  Dans le cas d'un déclenchement par '::', il faut remplacer
      |  ces doubles deux-points par ':' et se placer avant le ':'
      |
      */
      const start = tx.selStart
      tx.select(start - 2, start -1).replace('')
    }
    params.afterInsertion = function(insertedText){
      log_orange("Je rentre dans la fonction")
      this.focus()
      log_orange("Je dois placer le curseur à " + this.selStart + " + " + insertedText.length + " + 1")
      this.select(this.selStart + insertedText.length + 1)
      this.setSelection("\n  ", 'end')
    }

  }
  /*
  |  Définition des paramètres à envoyer à l'autocomplétion
  */
  params.source = dsource
  this.textarea.showAutocompleteInput(params)
}

getAutocompletionSourceForSceneHeading(tx){
  const dsource = {
      multi: true
    , sources: [SCENE_LIEUX, Scenario.current.decors.forAutocompletion, SCENE_EFFETS]
    , defaults: []
  }
  const curLine = tx.currentLine
  if ( curLine.text != ':') { //=> il y a plus qu'un ':' sur la phrase
    // TODO Il faut ajouter les éléments de cette ligne en premières valeurs des sources
    // ci-dessus
    var segs = curLine.text.substring(1, curLine.length).split(' ')
    let lieu = segs.shift()
    if ( lieu ){
      lieu += ' '
      dsource.sources[0].unshift(lieu)     // lieu
      dsource.defaults.push(lieu)
    }
    let effet = segs.pop()
    if ( effet ) {
      dsource.sources[2].unshift(effet)       // effet
    }
    let decor = segs.join(' ')
    if ( decor ) {
      decor += ' '
      dsource.sources[1].unshift(decor)   // décor
      dsource.defaults.push(decor)
      if ( effet ) dsource.defaults.push(effet)
    }
    // On efface la ligne
    tx.remove({from:curLine.start + 1, to:curLine.end})
  } else {
    /*
    |  Si l'intitulé n'existe pas encore, on met en valeur par
    |  défaut les premiers choix
    */
    dsource.defaults = ['INT. ', 'BUREAU ', 'JOUR']
  }

  return dsource
}

// Quand on quitte le champ de la console en l'ayant changé
// NON : sinon c'est appelé chaque fois qu'on fait une autocomplétion
// TODO : mais il faut trouver un autre moyen de le faire
// => bouton rafraichir ou enregistrer (raccourci)
onChange(e){
  // this.scene && this.scene.update(this.value)
}
// Quand on quitte le champ de la console
onBlur(e){
  // this.desactiveKeyboardObservers()
}

// Quand on focusse dans le champ de la console
onFocus(e){
  Console.current = this
  // this.activeKeyboardObservers()
}

onKeypress(e){
  // console.log("[onKeypress] e.key = %s", e.key)
  if ( e.key == "Enter" && this.scene ) {
    this.scene.update(this.value)
  }
  return true
}
onKeyDown(e){
  // console.log("[onKeyDown] e.key = %s", e.key)
  if ( e.metaKey ) {
    /*
    | Avec touche COMMAND
    */
    switch(e.key){
    case 'u': case 'U':
      stopEvent(e)
      this.scene && this.scene.update(this.value)
      return false
    }
  } else if ( e.ctrlKey ) {
    /*
    | Avec touche CONTROL
    */
    switch(e.key){
    case 's': case 'S':
      stopEvent(e)
      Scenario.saveCurrent.call(Scenario)
      // TODO Plus tard, il faudra apprendre à sauver seulement la
      // scène.
      return false
    }
  } else {
    /*
    | Sans modifiers
    */
    switch(e.key){
    case 'Tab':
      stopEvent(e)
      // TODO Traiter l'auto complémetion
      log_orange("Je dois apprendre à traiter l'autocomplétion")
      return false
    }
  }

  return true
}

onKeyUp(e){
  return true
}

onClickRefreshButton(e){
  // En fait, il n'y a rien à faire car le blur actualise automati-
  // quement l'affichage
  // this.scene.update(this.value)
  return stopEvent(e)
}

/**
 * Activation et désactivation de la surveillance des touches
 * 
 */
activeKeyboardObservers(){
  window.onkeypress = this.onKeypress.bind(this)
  window.onkeydown  = this.onKeyDown.bind(this)
  window.onkeyup    = this.onKeyUp.bind(this)
}
desactiveKeyboardObservers(){
  window.onkeypress = App.regularOnKeypress.bind(App)
  window.onkeydown  = App.regularOnKeyDown.bind(App)
  window.onkeyup    = App.regularOnKeyUp.bind(App)
}



/**
 * La scène actuellement éditée
 * 
 */
get scene() { return this._scene }
set scene(s){ this._scene = s}

// Contenu de la console
get value(){ return this.field.value }


// --- ÉLÉMENTS D'INTERFACE ---

get btnRefresh(){
  return this._btnrefresh || (this._btnrefresh = DGet('button.btn-refresh',this.section))
}
// Le textarea contenant le texte
get field(){return this._field || (this._field = DGet('textarea', this.section))}

}// class ConsoleClass

