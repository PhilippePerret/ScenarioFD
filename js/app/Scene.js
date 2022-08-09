'use strict';
/**
 * Class Scene
 * ------------
 * Gestion des scènes
 * 
 */


class Scene {

  static get log(){
    return this._log || (this._log = new LogClass('Scene'))
  }

  // Nouvel Identifiant de scène
  static getNewId(){
    if (undefined == this._lastId ) this.lastId = 0
    return ++ this._lastId
  }

  // Pour récupérer le dernier ID au chargement du scénario
  static setLastId(id){
    if ( id > this._lastId ) { this._lastId = id }    
  }

  static resetAll(){
    this._lastId = 0
  }


//##################################################################

  constructor(data){
    console.log("data scène : ", data)
    this.data       = data
    this.scenario   = data.scenario
    this.content    = data.content
    this.previewer  = data.previewer || Preview.current
    this.index      = data.index
    this.sceneData  = data.sceneData || {}
  }

  get log() { return this.constructor.log }

  get inspect(){ 
    return this._inspect || (this._inspect = `Scène n°${this.numero} (${this.f_summary.substring(0, 100)})`)
  }

  get numero(){ return this.index + 1 }

  /**
   * Affichage de la scène dans la fenêtre de preview
   * 
   */
  display(){
    this.previewer.displayScene(this)
    return this; // chainage
  }

  /**
   * Affichage de la scène dans la timeline
   * 
   */
  displayInTimeline(){
    if ( this.timelineSceneDoesNotExist ) {
      this.timelineScene.build()
    }
  }

  /**
   * Mise en édition de la scène
   * 
   * Note : toujours dans la console courante.
   */
  edit(){
    console.info("[Scene.edit] Édition de la scène #%i (%s)", this.id, this.extrait)
    Console.current.edit(this)
  }

  get data2save(){
    const d2s = Object.assign({}, this.data)
    d2s.content = this.content
    Object.assign(d2s, { sceneData: this.sceneData })
    SCENE_PROPS_NOT_SAVED.forEach(prop => delete d2s[prop])
    return d2s
  }

  /**
   * Actualisation du texte de la scène
   *
   * Note : cette méthode est appelée plusieurs fois au cours de 
   * l'édition (dès qu'un retour chariot est ajouté, par exemple)
   */
  update(newContent){
    if ( newContent != this.content ) {
      // La scène a changé de contenu
      const oldLinesCount = this.LinesCount
      this.content = newContent
      if ( this.page ) { this.page = parseFloat(this.page) }
      /*
      |  Replacement de scène si nécessaire
      */
      if ( this.page && this.oldPage != this.page ){
        Scenario.current.sortScenesPerDataPage()
      }
      this.resetLiveValues()
      this.display()
      this.timelineScene.positionne()
      /*
      |  Si la longueur de la scène a changé, il faut rectifier les
      |  scène suivantes (dans la timeline relative)
      */
      if ( oldLinesCount != this.LinesCount ) {
        Scenario.current.repositionneScenesFromIndex(this.index + 1)
      }
    }
  }

  resetLiveValues(){
    delete this._pagescount
    delete this._linescount
  }

  /**
   * Pour renuméroter la scène
   * (par exemple après une insertion avant)
   * 
   */
  renumerote(){
    DGet('span.scene-number', this.previewScene.obj).innerHTML = this.numero
  }

  get timelineSceneDoesNotExist(){
    return undefined == this.timelineScene.objAbs
  }

  get timelineScene(){
    return this._tlscene || (this._tlscene = new SceneTimeline(this))
  }
  set timelineScene(v){
    this._tlscene = v
  }

  /**
   * On parse le contenu pour établir chaque ligne
   * 
   * Cela produit this.lines qui contient une liste Array des lignes
   * sous forme d'instances {SceneLine}
   * Ça renseigne aussi les données (toutes les lignes commençant par
   * un '$')
   * 
   */
  parse(){
    let rawLines   = this.content.split("\n")
    /*
    |  Récupérer les notes dans le contenu
    |  (et en profiter pour retirer lignes vides et commentaires)
    */
    rawLines = this.parseNotesInContent(rawLines)
    /*
    |  Récupérer les données dans le contenu restant.
    */
    rawLines = this.parseDataInContent(rawLines)
    /*
    | Récupérer les lignes de script proprement dites dans le
    | contenu restant.
    */
    this.parseScriptLinesInContent(rawLines)
    /*
    |  Chercher les notes dans les lignes récupérées
    */
    this.lines = this.parseNotesInLines(this.lines)
    /*
    |  Pour le chainage
    */
    return this
  }

  /**
   * Relève des notes dans la scène
   * 
   * Cette méthode permet aussi de supprimer les lignes de 
   * commentaires
   * 
   * => this.notes
   * 
   */
  parseNotesInContent(rawLines){
    this.notes  = {}
    var newRawLines = []

    rawLines.forEach( line => {
      const firstChar = line.trim()[0]
      if ( firstChar == '#' /* => commentaire */) {
        return
      } else if ( line.trim().length == 0 /* => ligne vide */) {
        return 
      } else if ( firstChar == '['  && REG_MARK_NOTE_LINE.exec(line) ) {
        var [tout, noteId, noteText] = line.match(REG_MARK_NOTE_LINE)
        Object.assign(this.notes, {[noteId]: noteText.trim()})
      } else {
        newRawLines.push(line)        
      }
    })
    return newRawLines
  }
  /**
   * Récupère les données de scènes dans le contenu de la scène
   * 
   * => this.sceneData
   * 
   */
  parseDataInContent(rawLines){
    this.sceneData  = {}
    var newRawLines = []
    rawLines.forEach( line => {
      if ( line[0] == '$'  && line.indexOf('=') /* => Donnée de scène */) {
        // Une donnée
        var [dataName, dataValue] = line.substring(1, line.length).split('=');
        dataName  = dataName.trim()
        dataValue = dataValue.trim()
        Object.assign(this.sceneData, {[dataName]: dataValue})
      } else {
        newRawLines.push(line)
      }
    })
    return newRawLines
  }
  /**
   * Parse des lignes de scénario proprement dites
   * 
   * => this.lines
   * 
   */
  parseScriptLinesInContent(rawLines){
    this.lines = []
    var type;
    var lastCharacter; // se souvenir du dernier personnage (pour les dialogues)
    rawLines.forEach( line => {
      const firstChar = line[0]
      if ( firstChar == ' ' && line.substring(0,2) == '  ' /* => dialogue */) {
        type = 'dialogue'
        line = line.trim()
        const len = line.length
        switch(line[0]) {
        case '(':
          if ( line.substring(len - 1, len ) == ')') {
            type = 'note-jeu'
            line = line.substring(1, len - 1)
          }
          break
        case '^':
          type = 'dialogue-alt'
          line = line.substring(1, len)
          break
        }
      } else if ( line[line.length - 1] == ':' /* => nom de personnage */) {
        type = 'nom'
        line = line.substring(0, line.length - 1)
      } else if ( firstChar == ':' /* => Intitulé */) {
        type = 'intitule'
        line = line.substring(1, line.length)
      } else if ( firstChar == '>' /* => Transition */) {
        type = 'transition'
        line = line.substring(1, line.length)
      } else {
        type = 'action'
      }
      line = line.trim()
      const dataLine  = {scenario:this.scenario, type:type, rawContent:line, content:line, notes:null, scene:this}
      if ( TYPES_DIALOGUE.includes(type) ) {
        Object.assign(dataLine, {owner: lastCharacter})
        // console.log("Owner de la ligne '%s' mis à %s", dataLine.content, dataLine.owner)
      }
      const sceneLine = new SceneLine(dataLine)
      this.lines.push(sceneLine)
      /*
      |  Traitement spécial de certaines lignes
      */
      if ( sceneLine.isIntitule ) {
        this._lieu  = sceneLine.lieu
        this._effet = sceneLine.effet
        this._decor = sceneLine.decor
      } else if ( sceneLine.isCharacter ) {
        lastCharacter = sceneLine.content
      }
    })
  }
  /**
   * Appliquer les notes aux lignes qui s'en servent
   * 
   * ATTENTION : ici, les lines de +lines+ sont des instances {SceneLine}
   */
  parseNotesInLines(lines){
    lines.forEach( sline => {
      if ( not(sline.rawContent.match(REG_MARK_NOTE)) ) return
      var marks_notes = sline.rawContent.match(REG_MARK_NOTE)
      const line_notes = []
      marks_notes.forEach( mark_note => {
        const noteId = mark_note.substring(1, mark_note.length - 1)
        if ( this.notes[noteId] ) {
          line_notes.push(this.notes[noteId])
        } else {
          console.error("La note %s est inconnue dans la scène #%i", notId, this.id)
        }
      })
      /*
      | Dans tous les cas on supprime les marques de notes et on
      | définit le nouveau contenu de la ligne
      */
      sline.content = sline.rawContent.replace(REG_MARK_NOTE,'').replace(/  +/g,' ')
    })

    return lines // modifiées
  }

  // --- Méthodes d'helper ---
  get f_summary(){
    return this.summary || this.title || this.lines.slice(0,3).map(line => {return line.content}).join('<br />')
  }


  // @return la scène précédente
  get previousScene(){
    return this.scenario.scenes[this.index - 1]
  }

  // --- MÉTHODES DE DONNÉES (RACCOURCIS) ---

  get id(){ return this._id || ( this._id = this.data.sceneId || Scene.getNewId())}

  // --- Données définissables dans la scène par $page, $duree, etc.

  get page()  { 
    if ( undefined === this._page ) {
      this.scenario.calc_positionScenes()
    }
    return this._page
  }

  get title() { return this.sceneData.title }

  get duree() { 
    if ( undefined === this.sceneData.duree ) {
      return this.PagesCount
    } else if ( 'string' == typeof this.sceneData.duree ) {
      this.sceneData.duree = parseFloat(this.sceneData.duree)
    }
    return this.sceneData.duree
  }

  get summary(){ return this.sceneData.summary }

  get color() { return this.sceneData.color || this.sceneData.couleur }

  // --- DONNÉES RÉCUPÉRÉES DANS LE CONTENU ---

  /** @return l'instance {Decor} du décor de la scène */
  get idecor()    { return this._idecor }
  get decor()     { return this._decor }
  get mainDecor() { return this.idecor.mainDecor }
  get subDecor()  { return this.idecor.subDecor  }
  get lieu()      { return this._lieu  }
  get effet()     { return this._effet }

  // --- DONNÉES CALCULÉES ---
  /**
   * @return la durée relative de la scène (note : correspond à 
   * son nombre de page)
   * 
   */
  get relativeDuree(){
    this.calc_LinesAndPagesCount()
    return this.PagesCount
  }

  get PagesCount(){
    return this._pagescount || this.calc_LinesAndPagesCount().pages
  }
  get LinesCount(){
    return this._linescount || this.calc_LinesAndPagesCount().lines
  }

  /**
   * Calcule le nombre de lignes et de page dans le scénario
   * Produit :
   *  this.LinesCount   Nombre de lignes (Integer)
   *  this.PagesCount   Nombre de pages (flottant)
   */
  calc_LinesAndPagesCount(){
    var count = 0
    var hmoyline = this.scenario.LineHeight
    this.lines.forEach(sline => {
      switch(sline.type){
      case 'intitule':
        count += 2
        break
      case 'nom':
        count += 1
        break
      case 'note-jeu':
        count += 1
        break
      default:
        const nl = Math.round(sline.obj.offsetHeight / hmoyline)
        // console.log("sline.obj.offsetHeight = %i / hmoyline = %i / nombre lignes = %i", sline.obj.offsetHeight, hmoyline, nl)
        count += nl + 1
      }
    })
    this._linescount = count
    const nbLinesPerPage  = Preferences.get('nombre_lignes_per_page')
    this._pagescount      = parseFloat(Number.parseFloat(count / nbLinesPerPage).toFixed(2))
    this.log.debug('Scène n°'+this.numero+' : lines: ' + this._linescount + ' / pages: ' + this._pagescount)
    
    return { pages:this._pagescount, lines:this._linescount }
  }

}// class Scene

//##################################################################


class SceneLine {
  constructor(data){
    this.data         = data
    this.scene        = data.scene
    this.scenario     = data.scenario||this.scene.scenario
    this.type         = data.type
    this.rawContent   = data.rawContent
    this.content      = data.content
    this.notes        = data.notes || []
    this.isIntitule   = this.type == 'intitule'
    this.isDialogue   = this.type == 'dialogue' || this.type == 'dialogue-alt'
    this.isNoteJeu    = this.type == 'note-jeu'
    this.isCharacter  = this.type == 'nom' 

    if (this.isIntitule){
      this.addSceneHeadingToDecors()
    } else if ( this.isCharacter ) {
      this.addCharacterToPersonnages()
    } else if (this.isDialogue || this.isNoteJeu) { 
      this.owner = data.owner
    }
  }

  /**
   * Quand c'est un intitulé de scène, on ajoute le décor
   * à la liste éventuelle des décors
   * 
   */
  addSceneHeadingToDecors(){
    var decor = this.content.trim().split(' ')
    console.log("décor = ", decor)
    this.effet = decor.pop().trim()   // pour retirer le 'JOUR' ou autre
    this.lieu  = decor.shift().trim() // pour retirer le 'INT.' ou autre
    decor = decor.join(' ').trim()
    decor = decor.replace(/^(?:[-–—] )?([^-–—]+)[-–—]?$/g,'$1').trim()
    this.decor = decor
    const idecor = new Decor({decor:decor, scenario:this.scenario})
    this.scene._idecor = idecor
    this.scenario.decors.add(idecor)
  }

  /**
   * Quand c'est un nom de personnage (qui parle), on l'ajoute
   * à la liste des personnages (si elle ne le contient pas)
   * 
   */
  addCharacterToPersonnages(){
    this.scenario.personnages.add(new Personnage({
        scenario: this.scenario
      , pseudo:   this.content.trim()
    }))
  }

  /**
   * Retourne le code de prévisualisation de la ligne de scène
   */
  get preview(){
    var text = this.content ;
    if ( this.type == 'intitule' ) {
      text = `<span class="scene-number">${this.scene.index + 1}.</span> ${text.toUpperCase()}`
    }
    const dataParag = {class:`sline ${this.type}`, 'data-eltype':this.type, text:text}
    if ( TYPES_DIALOGUE.includes(this.type) ) {
      Object.assign(dataParag, {'data-owner': this.owner})
    }
    const p = DCreate('DIV', dataParag)
    if ( this.notes.length ) {
      this.notes = this.notes.map( note => {
        return '<span class="content">' + note + '</span>'
      })
      // console.log("Notes : ", this.notes)
      p.appendChild(DCreate('DIV', {class:'script-note', text: '<span class="spine">📝</span>' + this.notes.join('<br>')}))
    }
    this.obj = p
    return p
  }

}
