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
    this.current && this.resetAll()
    this.current = new Scenario(data)
    this.current.dispatchInfos()
    Preferences.setValues(data.preferences) // et les applique
    this.current.edit()
    Timeline.onLoadScenario(this.current)
    afterScenarioIsLoaded()
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
    InCadre.resetAll()
    Preview.resetAll()
    Scene.resetAll()
    delete this.current
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
    this.previewer  = data.previewer || Preview.current
    this.previewer.cleanUp()
    this.scenes     = this.makeInstancesScenes(data.scenes)
    this.options    = data.options
    this.infos      = data.infos || {appVersion: Scenario.appVersion, created_at:null, updated_at:null}
  }

  get log() { return this.constructor.log }

  get inspect(){
    return this._inspect || (this._inspect = `Scénario ${this.titre}`)
  }


  /**
   * Enregistrer le scénario
   * ------------------------
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
   * Exporter le scénario 
   * --------------------
   * au format +format+ avec les options choisies
   */
  export(format){
    const options = {scenes:'all'} // TODO pouvoir les définir
    WAA.send({class:'Scenario::Document',method:'export_current',data:{format:format, options:options}})
  }


  /**
   * Éditer le scénario
   * -------------------
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
    |  Calcul de la hauteur des lignes (pour longueur de scène)
    */
    this.calc_LineHeight()
    /*
    | Affichage (et observation) des scènes
    */
    // if (this.titre == 'Deuxième') {
    //   this.forEachScene(scene => console.log("scène", scene))
    //   return
    // }

    this.forEachScene('display')
    this.forEachScene('displayInTimeline')
  }


  // ---- MÉTHODES SUR LES SCÈNES ----


  /**
   * @return la scène d'identifiant +sceneId+
   * 
   * (pour la récupérerer par l'index, cf. la méthode suivante)
   */
  sceneById(sceneId){
    this.tableScenes || this.makeTableScenes()
    return this.tableScenes[sceneId]
  }

  /**
   * @return la scène de numéro (index) +sceneNum+
   * 
   * (pour la récupérer par Identifiant, cf. la méthode précédente)
   * 
   */
  sceneByNumero(sceneNum){
    return this.scenes[sceneNum - 1]
  }

  /**
   * @return la scène par son index
   * 
   * Attention : l'index n'est pas le numéo (numéro = index + 1)
   */
  sceneByIndex(sceneIndex){
    return this.scenes[sceneIndex]
  }

  /**
    * Faire la table des scènes par identifiant
    * 
    */
  makeTableScenes(){
    this.tableScenes = {}
    this.forEachScene(scene => {
      Object.assign(this.tableScenes, {[scene.id]: scene})
    })
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
    // console.log("this.scenes(method='%s')", method, this.scenes)
    if ( 'string' == typeof method ) {
      this.scenes.forEach( scene => scene[method].call(scene))
      /* Version debuggage
      this.scenes.forEach( scene => {
        if ( this.titre == 'Deuxième') {
          console.log("Application de %s à la scène", method, scene)
        }
        scene[method].call(scene)
      })
      //*/
    } else if ( 'function' == typeof method ) {
      this.scenes.forEach( scene => method(scene))
    } else {
      const errmsg = "La méthode " + method + " est d'un type inconnu…"
      erreur(errmsg)
      console.error(errmsg)
    }
  }

  /**
   * Pour calculer la position (en page, donc en minutes) de toutes
   * les scènes du scénario
   * La valeur est mise dans chaque <scene>.sceneData.page
   * 
   */
  calc_positionScenes(){
    var currentPage = 0.0
    this.forEachScene( scene => {
      scene._page  = currentPage
      currentPage += scene.duree
    })
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
      Object.assign(dscene, {scenario:this, index:index++, previewer:this.previewer})
      const scene = new Scene(dscene).parse()
      Scene.setLastId(scene.id)
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
   * Au chargement du scénario, on met les informations du scénario
   * dans la fenêtre (non affichée) des infos
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



  get LineHeight() { return this._lineheight }

  /**
   * Calcule la hauteur moyenne d'une ligne actuelle
   * (permettra de déterminer la longueur de la scène)
   * 
   * Pour la calculer, on écrit, avant d'écrire le scénario, des 
   * paragraphes fictifs dans la fenêtre de prévisualisation, pour
   * pouvoir mesurer la longueur.
   */
  calc_LineHeight(){
    /*
    |  Dans un premier temps, on récupère la hauteur d'une ligne 
    |  d'intitulé, d'action et de nom de personnage
    */
    // this._lineheight = 19
    // return
    /**
     |  On construit un extrait fictif de scénario pour pouvoir 
     |  mesurer les hauteurs des lignes
     */
    const linesFictives = [
        ['INT. SALON - JOUR', 'intitule']
      , ['Une action courte.', 'action']
      , ['Une action beaucoup plus longue pour qu’elle puisse '+
          'exécder la longueur de la ligne normale et passer en '+
          'dessous si possible', 'action']
      , ['JOHN', 'nom']
      , ['Je voudrais bien t’y voir !', 'dialogue']
      , ['EXT. RUE - NUIT', 'intitule']
      , ['Encore une action croute.', 'action']
      , ['Et puis une autre', 'action']
      , ['JOHN', 'nom']
      , ['Un dialogue assez long pour qu’il passe lui aussi sur '+
        'plusieurs lignes en tout cas au moins trois ça serait '+
        'vraiment pas mal', 'dialogue']
      , ['VAL', 'nom']
      , ['Non, il n’y a plus rien à faire', 'dialogue']
    ]
    const divScene = DCreate('DIV', {id:'scene-1', class:'scene ASUPPRIMER'})
    this.previewer.content.appendChild(divScene)
    var maxLineHeight, lineHeights = [];
    var iScene = 0, height, parag, span ;
    linesFictives.forEach(dline => {
      const [text, ltype] = dline
      parag = DCreate('DIV', {class:'sline ' + ltype })
      if ( ltype == 'intitule' ) {
        const num = DCreate('SPAN', {text:++iScene, class:'scene-number'})
        parag.appendChild(num)
      }
      span = DCreate('SPAN', {text: text})
      parag.appendChild(span)
      divScene.appendChild(parag)
      // Hauteur
      height = parag.offsetHeight
      maxLineHeight || (maxLineHeight = height + height / 2)
      if ( height > 2 * maxLineHeight ) {
        height = height / 3
      } else if ( height > maxLineHeight ) {
        height = height / 2
      }
      lineHeights.push(height)
    })

    const LH = parseFloat((lineHeights.reduce((a,b) => a + b) / lineHeights.length).toFixed(2))
    this.log.debug("Line Average Height: " + LH)
    this._lineheight = LH
    /*
    |  Détruire la scène fictive
    */
    divScene.remove()
  }


  get titre(){ return this.infos.titre_scenario }
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
