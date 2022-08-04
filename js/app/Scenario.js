'use strict';
class Scenario {

  static get log(){
    return this._log || (this._log = new LogClass('Scenario'))
  }

  static get appVersion(){ return '0.1' }

  /**
   * Appelé au CHARGEMENT de l'application quand un scénario est
   * remonté ou à l'ouverture d'un scénario
   * 
   */
  static onLoad(data){
    this.log.debug("Données scénario reçues : " + JString(data))
    this.resetAll()
    this.current = new Scenario(data)
    this.current.dispatchInfos()
    Preferences.setValues(data.preferences) // et les applique
    this.current.edit()
    Timeline.onLoadScenario(this.current)
    afterScenarioLoading()
  }

  /**
   * Enregistrement du scénario courant (if any)
   * 
   */
  static saveCurrent(){
    if ( this.current ) {
      this.current.save()
    } else {
      erreur("Aucun scénario n'est ouvert pour le moment.")
    }
  }

  /**
   * Exportation du scénario courant (if any) au format +format+
   * 
   */
  static exportCurrent(format){
    if ( this.current ) {
      this.current.export(format)
    } else {
      erreur("Aucun scénario n'est ouvert pour le moment.")
    }
  }
  static onExported(data){
    if (data.ok) { message("Le document a été exporté au format " + data.format + " avec succès.")}
    else { erreur(data.error) }
  }

  /**
   * Méthode appelée au chargement d'un nouveau scénario, pour 
   * repartir à neuf
   * 
   */
  static resetAll(){
    // Vider les cadres mais rester dans la position courante
    Cadre.resetAll()
    // Les contenus de cadre
    InCadre.resetAll()
    // Les/la disposition
    Disposition.resetAll()
  }

//##################################################################


  /**
   * Instanciation du scénario
   * 
   * @param {Object} data  Toutes les données du scénario
   *    data.scenes:      Liste des données des scènes
   *    data.previewer:   Le visualisateur affichant le scénario ou
   *                      le courant.
   *    data.options      Les options
   *    data.infos        Les infos du film (titre, auteurs, …)
   *    data.personnages  Données des personnages
   *    data.decors       Données des décors
   */
  constructor(data){
    data = data || {scenes:[]}
    this.data       = data
    this.scenes     = this.makeInstancesScenes(data.scenes)
    this.previewer  = data.previewer || Preview.current
    this.options    = data.options
    this.infos      = data.infos || {appVersion: Scenario.appVersion, created_at:null, updated_at:null}
  }

  get log() { return this.constructor.log }

  /**
   * Enregistrer le scénario
   * 
   */
  save(){
    WAA.send({
        class:  'Scenario::Document'
      , method: 'save_current'
      , data:   {
            options:      this.options
          , scenes:       this.dataScenes()
          , infos:        this.getInfos()
          , personnages:  this.personnages.data2save
          , decors:       this.decors.data2save
        }
    })
  }
  onSaved(data){
    if (data.ok) {
      const msg = "Scénario sauvé avec succès."
      message(msg)
      console.info(msg)
    } else {
      erreur(data.error)
    }
  }

 /**
   * Exporter le scénario au format +format+
   * avec les options choisies
   */
  export(format){
    const options = {scenes:'all'} // TODO pouvoir les définir
    WAA.send({class:'Scenario::Document',method:'export_current',data:{format:format, options:options}})
  }


  /**
   * L'édition du scénario consiste afficher ses scènes, à mettre en
   * action ses options, et à attendre la première commande.
   * 
   */
  edit(){
    /*
    | Application des options
    */
    // TODO
    /*
    |  Nettoyage du previewer
    */
    this.previewer.cleanUp()
    /*
    | Affichage (et observation) des scènes
    */
    this.forEachScene('display')
    this.forEachScene('displayInTimeline')
  }

  /**
   * Pour faire une boucle sur toutes les scènes
   * 
   * @param method  SI c'est un string, c'est la méthode de Scene
   *                qu'il faut appeler.
   *                SI c'est une méthode, c'est une fonction qui attend
   *                comme argument la scène
   * 
   */
  forEachScene(method) {
    if ( 'string' == typeof method ) {
      this.scenes.forEach( scene => scene[method].call(scene))
    } else if ( 'function' == typeof method ) {
      this.scenes.forEach( scene => method(scene))
    } else {
      const errmsg = "La méthode " + method + " est d'un type inconnu…"
      erreur(errmsg)
      console.error(errmsg)
    }
  }

  /**
   * Ajouter une scène au scénario
   * 
   * @param where  'end', 'beginning', 'after-selected' ou 'before-selected'
   */
  addScene(where, previewer){
    console.log("-> Scenario.addScene(where, previewer)", where, previewer)
    let selection, selected ;
    if ( (selection = previewer.selection.get()) ) {
      selected = selection.scene
    }

    /*
    |  L'index de la nouvelle scène
    */
    let sceneIndex ;
    switch(where){
    case 'end' : 
      sceneIndex = this.scenes.length
      break
    case 'beginning':
      sceneIndex = 0
      break
    case 'before-selected':
      sceneIndex = selected.index
      break
    case 'after-selected':
      sceneIndex = selected.index + 1
      break
    }
    // console.info("Index nouvelle scène : ", sceneIndex)

    /*
    |  Instanciation de la nouvelle scène
    */
    const newScene = new Scene({
        scenario:   this
      , index:      sceneIndex
      , sceneId:    Scene.getNewId()
      , content:    ":INT. LIEU - EFFET\nAction."
      , previewer:  previewer
    })
    
    /*
    |  Insérer la scène à l'endroit voulu dans la liste des
    |  scènes du scénario courant.
    */
    let fromIndex = null
    switch(where){
    case 'end' : 
      this.scenes.push(newScene)
      break
    case 'beginning':
      this.scenes.unshift(newScene)
      break
    case 'before-selected':
      this.scenes.splice(selected.index, 0, newScene)
      break
    case 'after-selected':
      this.scenes.splice(selected.index + 1, 0, newScene)
      break
    }
    // console.info("= Nouvelle liste de scènes : ", this.scenes)

    /*
    |  Maintenant on peut parser, afficher et éditer la scène
    */
    newScene.parse().display().displayInTimeline()
    newScene.edit()

    /*
    |  Sauf pour la place 'end', il faut renuméroter et réindexer
    |  les scènes à partir de la nouvelle
    */
    if ( where != 'end' ) {
      const scenesCount = this.scenes.length
      for(var idx = 0 ; idx < scenesCount ; ++idx) {
        const scene = this.scenes[idx]
        scene.index = parseInt(idx, 10)
        scene.renumerote()
      }
    }
  }

  /**
   * @return les données des scènes, pour enregistrement
   * 
   */
  dataScenes(){
    return this.scenes.map( scene => {
      return scene.data2save
    })
  }

  /**
   * À l'instanciation du scénario, cette méthode est appelée pour
   * définir this.scenes, la liste des scènes du scénario
   * 
   */
  makeInstancesScenes(dscenes){
    Scene._lastId = 0 ;
    var index = 0
    return dscenes.map( dscene => {
      Object.assign(dscene, {scenario:this, index:index++, previewer:this.previewer||Preview.current})
      const scene = new Scene(dscene).parse() 
      if ( scene.id > Scene._lastId ) { Scene._lastId = scene.id }
      return scene
    })
  }

  /**
   * Reclasser les scènes en fonction du numéro de page défini
   * 
   * Attention : certaines scènes peuvent ne pas avoir de numéro de
   * page défini
   * 
   */
  sortScenesPerDataPage(){
    this.scenes = this.scenes.sort(function(sc1, sc2){
      if ( !sc1.page || !sc2.page ) return 0
      return sc1.page - sc2.page
    })
    console.log("Nouveau classement des scènes : ", this.scenes)
    this.edit()
  }

  /**
   * Après un allongement ou un rétrécissement de scène, on peut
   * avoir besoin de replacer les scènes suivantes.
   * 
   */
  repositionneScenesFromIndex(index){
    const count = this.scenes.length
    for(var idx = index; idx < count; ++idx){
      this.scenes[idx].timelineScene.positionne()
    }
  }

  /**
   * À l'ouverture, on doit mettre les informations du scénario
   * dans la fenêtre des infos
   * 
   */
  dispatchInfos(){
    InCadre.get('infos').setValues(this.infos)
  }

  getInfos(){
    this.infos = InCadre.get('infos').getValues()
    return this.infos
  }


  /**
   * @return {ListManager} la liste des personnages du scénario
   * 
   */
  get personnages(){
    return this._persos || (this._persos = this.instanciePersonnages())
  }
  instanciePersonnages(){
    const lm = new ListManager({name:'personnages', uniq:true})
    if ( this.data.personnages ) {
      this.data.personnages.forEach( dperso => {
        lm.add(new Personnage(Object.assign(dperso,{scenario:this})))
      })
    }
    return lm
  }

  /**
   * @return {ListManager} Les décors du scénario
   * 
   */
  get decors(){
    return this._decors || (this._decors = this.instancieDecors())
  }
  instancieDecors(){
    const lm = new ListManager({name:'décors', uniq:true})
    ;(this.data.decors||[]).forEach( ddecor => {
      lm.add(new Decor(Object.assign(ddecor,{scenario:this})))
    })
    return lm
  }



  get LINE_HEIGHT(){
    return this._lineheight || ( this._lineheight = this.calcLineHeight() )
  }

  /**
   * Calcule la hauteur moyenne d'une ligne actuelle
   * (permettra de déterminer la longueur de la scène)
   */
  calcLineHeight(){
    /*
    |  Dans un premier temps, on récupère la hauteur d'une ligne 
    |  d'intitulé, d'action et de nom de personnage
    */
    // return 19
    var intituleH, actionH, nomH, maxLineH ;
    this.scenes.forEach( scene => {
      if (intituleH && actionH && nomH) return; // pour accélérer
      scene.lines.forEach( line => {
        if ( !line.obj) {
          return console.error("L'obj de la line n'existe pas…", line)
        }
        const lineH = line.obj.offsetHeight
        if ( not(intituleH) && line.type == 'intitule' ) {
          intituleH = lineH
          maxLineH = lineH + lineH / 2
        } else if ( not(actionH) && line.type == 'action' ) {
          if ( lineH < maxLineH ) { actionH = lineH }
        } else if ( not(nomH) && line.type == 'nom') {
          nomH = lineH
        }
      })
    })

    var ary = []
    intituleH && ary.push(intituleH)
    actionH   && ary.push(actionH)
    nomH      && ary.push(nomH)
    if ( ary.length ) {
      const LH = ary.reduce((a,b) => a + b) / ary.length
      this.log.debug("Hauteur moyenne d'une ligne : " + LH)
      return LH
    } else {
      console.error("Impossible de calculer la hauteur des lignes, pas assez de lignes.")
    }
  }

}



//########################### TESTS ##############################

var test = new InsideTest({
    error: 'new Scenario() %{doit} créer une instance Scenario'
  , eval: function(){
      const sce = new Scenario()
      return sce instanceof Scenario
    }
})
test.exec() // => true si tout se passe bien
