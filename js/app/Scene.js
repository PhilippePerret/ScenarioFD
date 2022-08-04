'use strict';
/**
 * Class Scene
 * ------------
 * Gestion des scènes
 * 
 */


class Scene {
  
  // Nouvel Identifiant de scène
  static getNewId(){
    if (undefined == this._lastId ) this.lastId = 0
    return ++ this._lastId
  }


//##################################################################

  constructor(data){
    this.data       = data
    this.scenario   = data.scenario
    this.content    = data.content
    this.previewer  = data.previewer || Preview.current
    this.index      = data.index
    this.sceneData  = data.sceneData || {}
  }


  get numero(){ return this.index + 1 }

  /**
   * Affichage de la scène dans la fenêtre de preview
   * 
   * Note : auparavant, on demandait aussi l'affichage dans la 
   * timeline ici, mais ça génère une erreur car pour afficher dans
   * la timeline, il faut pouvoir calculer la hauteur moyenne d'une
   * ligne et cette hauteur moyenne ne peut se calculer qu'après 
   * avoir affiché toutes les scènes.
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
      const oldPage   = this.page 
      this.content = newContent
      this.parse()
      /*
      |  Replacement de scène si nécessaire
      */
      if ( this.page && this.oldPage != this.page ){
        Scenario.current.sortScenesPerDataPage()
      }
      this.resetLiveValues()
      this.display()
      this.timelineScene.positionne()
      if ( oldLinesCount != this.LinesCount ) {
        // console.log("La longueur de la scène a changé, il faut rectifier les scènes suivantes.")
        Scenario.current.repositionneScenesFromIndex(this.index + 1)
        // Rectification des scènes suivantes dans la timeline relative.
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
    rawLines.forEach( line => {
      const firstChar = line.trim()[0]
      if ( firstChar == ' ' && line.substring(0,2) == '  ' /* => dialogue */) {
        type = 'dialog'
        line = line.trim()
        if ( line[0] == '^' ) {
          type = 'dialog-alt'
          line = line.substring(1, line.length)
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
      this.lines.push(new SceneLine({scenario:this.scenario, type:type, rawContent:line, content:line, notes:null, scene:this}))      
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
    return Scenario.current.scenes[this.index - 1]
  }

  // --- MÉTHODES DE DONNÉES (RACCOURCIS) ---

  get id(){ return this._id || ( this._id = this.data.sceneId || Scene.getNewId())}

  // --- Données définissables dans la scène par $page, $duree, etc.

  get page()  { return this.sceneData.page }

  get title() { return this.sceneData.page }

  get duree() { return this.sceneData.duree }

  get summary(){ return this.sceneData.summary }

  get color() { return this.sceneData.color || this.sceneData.couleur }

  /**
   * @return la durée relative de la scène (note : correspond à 
   * son nombre de page)
   * 
   */
  get relativeDuree(){
    this.calcLinesAndPagesCount()
    return this.PagesCount
  }

  get PagesCount(){
    return this._pagescount || this.calcLinesAndPagesCount().pages
  }
  get LinesCount(){
    return this._linescount || this.calcLinesAndPagesCount().lines
  }

  /**
   * Calcule le nombre de lignes et de page dans le scénario
   * Produit :
   *  this.LinesCount   Nombre de lignes (Integer)
   *  this.PagesCount   Nombre de pages (flottant)
   */
  calcLinesAndPagesCount(){
    var count = 0
    var hmoyline = Scenario.current.LINE_HEIGHT
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
        const nl = Math.ceil(sline.obj.offsetHeight / hmoyline)
        count += nl + 1
      }
    })
    this._linescount = count
    const nbLinesPerPage = Preferences.get('nombre_lignes_per_page')
    this._pagescount = Number.parseFloat(count / nbLinesPerPage).toFixed(2)
    // console.log("Scène %i, lines = %i, pages = %s", this.index + 1, this.LinesCount, this.PagesCount)
    
    return {pages:this._pagescount, lines:this._linescount}
  }

}// class Scene

//##################################################################


class SceneLine {
  constructor(data){
    this.data       = data
    this.scenario   = data.scenario || Scenario.current
    this.scene      = data.scene
    this.type       = data.type
    this.rawContent = data.rawContent
    this.content    = data.content
    this.notes      = data.notes || []

    if (this.type == 'intitule'){
      this.addSceneHeadingToDecors()
    } else if ( this.type == 'nom') {
      this.addCharacterToPersonnages()
    }
  }

  /**
   * Quand c'est un intitulé de scène, on ajoute le décor
   * à la liste éventuelle des décors
   * 
   */
  addSceneHeadingToDecors(){
    var decor = this.content.split(' ')
    decor.pop()   // pour retirer le 'JOUR' ou autre
    decor.shift() // pour retirer le 'INT.' ou autre
    decor = decor.join(' ').trim()
    decor = decor.replace(/^([-–—] )?(.*)([-–—] )?$/g,'')
    this.scenario.decors.add(new Decor({decor:decor, scenario:this.scenario}))
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
    const p = DCreate('DIV', {class:`sline ${this.type}`, text:text})
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
