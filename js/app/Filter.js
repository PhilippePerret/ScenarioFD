'use strict';
/**
 * Pour la gestion du panneau filtre qui permet de filtrer tout de
 * qu'on veut du scénario
 * 
 */
class ScenarioFilter extends InCadre {

  constructor(cadre){
    super('filter', cadre)
  }

  /**
   * Construction complète du filtre, en fonction des données
   * 
   */
  afterBuild(){
    this.log.in('#afterBuild', this.inspect)
    this.isBuilt = false
    this._content = null
    Object.values(FILTRE.DATA_FILTRE).forEach( dfiltre => {
      /*
      |   On construit cet élément de filtre
      */
      const builder = new FilterElementBuilder(dfiltre, this)
      builder.buildIn(this.content)
      /*
      |  Observations
      */
      // Ouverture/fermeture sur le span de titre du groupe d'options
      builder.spanTitre.addEventListener('click', this.toggleFilter.bind(this, builder.obj))
      // Réaction au clic n'importe où
      dfiltre.onChange && builder.addEventListeners(dfiltre.onChange)
    })
    this.isBuilt = true
    /*
    |  Réglage de certains éléments
    */
    // Mettre la première et la dernière scène
    DGet('input.filter_field-from_scene', this.content).value  = 1
    DGet('input.filter_field-to_scene', this.content).value    = Scenario.current.scenes.length
    /*
    |  Chainage
    */
    return this
  }

  // -------- MÉTHODE DE FILTRE -----------

  /**
   * = main =
   * 
   * Méthode principale qui filtre le scénario
   * 
   * Principes :
   *  - la méthode commence par lire les filtres qui sont activés et
   *    leurs données
   *  - elle met en invisible tous les paragraphes du scénario
   *  - elle passe en revue chaque paragraphe au travers du filtre
   *  - elle indique le résultat
   */
  filtreScenario(){
    /*
    |  On s'assure qu'il y ait bien un prévisualisateur
    */
    Preview.current || raise(ERRORS.filter.noPreviewer)
    /*
    |  On commence par relever l'état de tous les filtres à 
    |  prendre en compte
    */
    const dataFiltrage = this.getStateOfEachFiltre()

    // ===== PRÉPARATION DES FILTRES =====
    /*
    |   Préparation du filtre des PERSONNAGES
    |   --------------------------------------
    |  Si on filtre par personnage, on doit faire l'expression 
    |  régulière qui simplifiera la recherche et l'accélèrera
    */
    if ( dataFiltrage.personnagesOn ) {
      Object.assign(dataFiltrage, {regPersosOn: new RegExp(`(${dataFiltrage.personnagesOn.join('|')})`) })
    }
    /*
    |   Préparation du filtre PAR MOTS
    |   ------------------------------
    |
    */
    if ( dataFiltrage.search ) {
      const dsearch = dataFiltrage.search
      var flags = [], str, regexp ;
      if (dsearch.options.uncase) { flags.push('i')}
      str = dsearch.words
      if ( not(dsearch.options.regexp) ) {
        if ( dsearch.options.whole || dsearch.options.exact) { str = '\\b'+str+'\\b' }
      }
      regexp = new RegExp(str, flags.join(''))
      Object.assign(dataFiltrage.search, {regexp: regexp})
    }
    /*
    |   Préparation du filtre par DÉCORS, LIEUX ET EFFETS
    |   -------------------------------------------------
    */
    if ( dataFiltrage.decors ) {
      const d = dataFiltrage.decors
      if ( d.decors.length == 0 ) {delete dataFiltrage.decors.decors}
      if ( d.effets.length == 0 || d.effets.includes('x') ) {
        delete dataFiltrage.decors.effets
      }
      if ( d.lieux.length == 0 || d.lieux.includes('x') ) {
        delete dataFiltrage.decors.lieux
      }
    }


    /*
    |  === OPTIONS PRÉLIMINAIRES ===
    */
    /*
    |   Si on doit "griser" les scènes plutôt que les masquer
    */
    if ( dataFiltrage.option_grised_rather_hide) {
      FilterParagrah.HideMode = 'grised'
    }

    // console.log("dataFiltrage", dataFiltrage)
    this.log.debug("Filtrage du scénario avec :\n" + prettyInspect(dataFiltrage, 'console', 2))

    /**
     * Boucle sur tous les paragraphes pour les filtrer
     * 
     */
    var currentSceneNum = null
    var fluxOpened      = false // pour les temps par exemple
    const fromSceneNum  = dataFiltrage.fromScene
        , toSceneNum    = dataFiltrage.toScene
    Preview.current.mapParagraph( oparag => {
      /*
      |
      |  Ne prendre que les scènes qui nous intéressent
      |
      */
      const iparag = new FilterParagrah(oparag, currentSceneNum)
      currentSceneNum = iparag.sceneNum
      if ( fromSceneNum && currentSceneNum < fromSceneNum) {
        iparag.hide()
        return false
      } else if ( toSceneNum && currentSceneNum > toSceneNum ) {
        iparag.hide()
        return false
      } else {
        iparag.show()
        return iparag
      }
    }).map( iparag => {
      /*
      |
      |   Filtre par zone de structure (PFA)
      |
      */
      if ( iparag == null ) return
      if ( not(dataFiltrage.zonesOn) ) return iparag
      /*
      | Si c'est un intitulé, on vérifie que la scène soit dans une
      | zone attendue. Si oui, on ouvre le flux pour les paragraphes
      | suivant, si non, on le ferme
      */
      if ( iparag.isIntitule ) {
        fluxOpened = iparag.isInZones(dataFiltrage.zonesOn)
      }
      if ( fluxOpened ) {
        return iparag
      } else {
        iparag.hide()
        return
      }

    }).map( iparag => {
      /*
      |
      |   === Tous les autres filtrages ===
      |
      | Noter que pour la clarté, on ne teste pas ici si le filtre
      | est actif ou non. C'est dans la méthode de filtre qu'on
      | le fera, en renvoyant true si le filtre n'est pas activé
      |
      */
      if ( !iparag ) return
      /*
      | Option 'always_heading' (toujours afficher l'intitulé)
      */
      if ( iparag.isIntitule && dataFiltrage.option_always_heading) { 
        iparag.show()
        return iparag
      }
      /*
      |   Filtrage par les DÉCORS et EFFETS
      */
      if ( iparag.isNotMatchingDecorOrEffet(dataFiltrage.decors)){
        iparag.hide()
        return null
      }
      /*
      |   Filtrage par les TYPES D'ÉLÉMENT
      */
      if ( iparag.isNotElementStyleOn(dataFiltrage.styleOn) ) {
        iparag.hide()
        return null
      }
      /*
      |  Filtrage par les PERSONNAGES
      */
      if ( iparag.isNotPersonnageOn(dataFiltrage.regPersosOn) ){ 
        iparag.hide()
        return null
      }
      /*
      |  Filtrage par les MOTS
      */
      if ( iparag.isNotMatchingSearch(dataFiltrage.search) ) {
        iparag.hide()
        return null
      }
      return iparag
    }).map(iparag => { 
      // console.log("iparag restant", iparag)
    })
  }

  /**
   * @return TRUE si le paragraph +parag+ {DOM Element} passe le
   * filtre défini par dataFiltrage
   * 
   */
  passeLeFiltre(parag, dataFiltrage){
    /*
    |  Plutôt que faire la boucle ci-dessous, il faut fonctionner
    |  par ordre de clé. Par exemple, si un rang de scènes est choisi
    |  il faut commencer par le prendre
    */
    for(var propFiltre in dataFiltrage) {
      const value = dataFiltrage[propFiltre]
      switch(propFiltre){
      case 'styleOn':
        if ( not(value.includes(parag.dataset.eltype)) ) return false
      }
    }

    /*
    | Réduction par le rang de scène
    */

    return true
  }


  /**
   * Méthode qui rassemble les données en fonction de tous les 
   * filtres actifs.
   * 
   */
  getStateOfEachFiltre(){
    const dataFiltrage = {}
    this.content.querySelectorAll('button.btn-apply[data-state="on"]').forEach( btn => {
      const filtreId = btn.dataset.id
      this.getStateOfFiltre(filtreId, dataFiltrage)
    })
    return dataFiltrage
  }

  /**
   * Rassemble les données filtrage du filtre d'id +filtreId+
   * et les met dans +dataFiltrage+
   * @return dataFiltrage
   */
  getStateOfFiltre(filtreId, dataFiltrage){
    this.log.in(tp("#getStateOfFiltre(filtreId = '%s')", filtreId))
    switch(filtreId){
    case 'scenes_range':
      return this.getStateSceneRange(dataFiltrage)
    case 'personnage':
      return this.getStatePersonnage(dataFiltrage)
    case 'decor_et_effet':
      return this.getStateDecorEtEffet(dataFiltrage)
    case 'type_element':
      return this.getStateTypeElement(dataFiltrage)
    case 'words':
      return this.getStateSearch(dataFiltrage)
    case 'options':
      return this.getStateOptions(dataFiltrage)
    default:
      erreur("Le filtre #"+filtreId+" n'est pas traité…")
    }
  }

  /**
   * Relève de l'état de chaque filtre
   * 
   */
  getStateOptions(dataFiltrage) {
    this.content
      .querySelector('div.maindiv-filter-options')
      .querySelectorAll('.cb-options').forEach( cb => {
        if ( cb.checked ) { Object.assign(dataFiltrage, {[`option_${cb.dataset.value}`]: true}) }
      })
  }
  getStateSceneRange(dataFiltrage){
    const cont = DGet('div.maindiv-filter-scenes_range', this.content)
    const nombreScenes = Scenario.current.scenes.length
    /*
    |  Scène de départ et scène de fin
    */
    var fromScene = DGet('input.filter_field-from_scene', cont).value
    if ( fromScene != '' ) {
      fromScene.replace(/[0-9]/g,'') == '' || raise(tp(ERRORS.filter.badSceneNumero, 'doit être un nombre'))
      fromScene = parseInt(fromScene,10)
      fromScene < nombreScenes || raise(tp(ERRORS.filter.badSceneNumero, 'doit être inférieur à '+nombreScenes))
      dataFiltrage.fromScene = fromScene
    }
    var toScene = DGet('input.filter_field-to_scene', cont).value
    if ( toScene != '' ) {
      toScene.replace(/[0-9]/g,'') == '' || raise(tp(ERRORS.filter.badSceneNumero, 'doit être un nombre'))
      toScene = parseInt(toScene,10)
      toScene <= nombreScenes || raise(tp(ERRORS.filter.badSceneNumero, 'doit être inférieur à '+nombreScenes))
      dataFiltrage.toScene = toScene
    }
    /*
    |   Un zone particulière du film
    */
    var zonesOn = {}
    this.content.querySelectorAll('input.cb-zone').forEach(cb => {
      if ( cb.checked ) Object.assign(zonesOn, {[cb.dataset.value]:true})
    })
    if ( Object.keys(zonesOn).length ) {
      const dureeFilm = InfosScenario.get('duree_film')
      const moitieFilm = Math.ceil(dureeFilm / 2)
      const quartFilm  = Math.ceil(dureeFilm / 4)
      const zonesPages = {expo:null,deve:null,deno:null,dev1:null,dev2:null}
      zonesPages.expo = [0, quartFilm]
      zonesPages.deve = [quartFilm - 1, 3 * quartFilm]
      zonesPages.deno = [3 * quartFilm - 1, dureeFilm]
      zonesPages.dev1 = [quartFilm - 1, moitieFilm]
      zonesPages.dev2 = [moitieFilm - 1, 3 * moitieFilm]
      zonesOn = Object.keys(zonesOn).map(z => {return zonesPages[z]})
      Object.assign(dataFiltrage, {zonesOn: zonesOn})
    }
  }
  getStatePersonnage(dataFiltrage){
    Object.assign(dataFiltrage, {
      personnagesOn: this.getCheckedBoxInPanel('personnage')
    })
  }
  getStateDecorEtEffet(dataFiltrage){
    Object.assign(dataFiltrage, {
      decors: {
          decors:   this.getCheckedBoxInPanel('decor')
        , effets:   this.getCheckedBoxInPanel('effet')
        , lieux:    this.getCheckedBoxInPanel('lieu')
      }
    })
  }

  /*
  | On récupère les éléments à voir
  */
  getStateTypeElement(dataFiltrage){
    Object.assign(dataFiltrage, {
      styleOn: this.getCheckedBoxInPanel('type_element')
    })
  }
  getStateSearch(dataFiltrage){
    const search = DGet('input.filter_field-words', this.content).value.trim()
    if ( search == '' ) return
    const options = {}
    const panel   = DGet('div.panel-multi-select-words_as', this.content)
    DGetAll('input[type="checkbox"]', panel).forEach( cb => {
      Object.assign(options, {[cb.dataset.value]: cb.checked})
    })
    Object.assign(
      dataFiltrage, { search:{words:search, options:options} }
    )
  }


  /**
   * - méthode généraliste -
   * 
   * Pour récupérer toutes les cases cochées du panneau multi-select
   * (et seulement un panneau multi-select) et renvoyer leur valeur
   * @return {Array} Liste des valeurs des cb cochées
   * 
   * @param panelId {String} IDentifiant du panneau
   */  
  getCheckedBoxInPanel(panelId){
    const panel = DGet('div.panel-multi-select-'+panelId, this.content)
    var checkeds = []
    DGetAll('span.multiselect-span input[type="checkbox"]', panel).forEach(cb=>{
      cb.checked && checkeds.push(cb.dataset.value)
    })
    return checkeds
  }

  // -------- MÉTHODES D'OBSERVATION ------

  /**
   * Méthode appelée quand on clique sur un div principal (par ex. 
   * celui qui permet de choisir les décors.)
   * Cela a pour effet d'activer ou de désactiver le filtre voulu.
   * Et de le placer à la suite des filtres activés
   * 
   */
  toggleFilter(div, e){
    const currentState = div.dataset.state // 'open' ou 'closed'
    const newState = currentState == 'open' ? 'closed' : 'open'
    const isOpen = newState == 'open'
    div.dataset.state = newState
    div.classList.remove(currentState)
    div.classList.add(newState)
    /*
    |  Placer le filtre au bon endroit
    */
    if ( isOpen ) {
      try {      
        while($(div).prev() && $(div).prev()[0].classList.contains('closed')){
          div.parentNode.insertBefore(div, $(div).prev()[0])
        }      
      } catch(err){
        console.error("Problème avec ", div.previousSibling)
        console.error(err)
      }
    } else {
      while($(div).next()[0] && $(div).next()[0].classList.contains('open')){
        div.parentNode.insertBefore(div, $(div).next().next()[0])
      }      

    }
    return stopEvent(e)
  }

  /**
   * Méthode générale qui reçoit tous les click sur le bouton
   * "Appliquer" pour appliquer le sous-filtre
   * 
   */
  onToggleFilterGroup(filtre, btn, idFiltre, e){
    // console.log("Application du filtre", idFiltre)
    const newState = btn.dataset.state == 'on' ? 'off' : 'on'
    const isOn = newState == 'on'
    filtre.obj.classList[isOn?'add':'remove']('actif')
    btn.dataset.state = newState
    this.filtreScenario()
  }

  /**
   * Méthode qu'appelle tout bouton du filtre lorsque sa valeur 
   * change, pour actualiser le filtrage. 
   * Noter que cela n'a d'effet qui si le container est sur 'ON'. 
   * S'il est désactivé (OFF), ça ne produit rien.
   * 
   * @param objProp {DOM Element} L'objet dont on a changé la valeur
   * @param cont    {DOM Element} L'objet qui contient le bouton ON
   * @param e       {Event} L'évènement 'onchange'
   * 
   */
  onChangeFilterProperty(objProp, cont, e){
    if ( this.isOff(cont) ) {
      return
    } else {
      this.filtreScenario()
    }
  }
  
  /**
   * @return  TRUE si le +container+ contient un bouton 'ON' de groupe
   *          de filtre non activé.
   * 
   * @param o   {DOM Element} Un élément du DOM contenant un bouton
   *            'ON' général.
   */
  isOff(o){
    return o.querySelector('button.btn-apply[data-state="on"]') == null
  }

  /**
   * Méthode générale pour sélection tout ou déselectionner tout dans
   * un champ multi-select
   * 
   */
  onSelectOrDeselectAll(selectit, container, e){
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = selectit
    })
    return stopEvent(e)
  }

  /**
   * Observation complète du filtre, pour réactions en direct en
   * fonction des choix.
   */
  observe(){
    super.observe()
    /*
    |  Observation du bouton pour rafraichir
    */
    DGet('button.btn-refresh',this.toolsbar).addEventListener('click', this.filtreScenario.bind(this))
    /*
    |  Chainage
    */
    return this
  }
} // ScenarioFilter


/**
 * class FilterElementBuilder
 * --------------------------
 * Pour la construction des éléments du filtre
 * 
 */


class FilterElementBuilder {
  constructor(data, filter){
    this.data     = data
    this.ifilter  = filter
    this.id       = data.id
    this.name     = data.name
    this.fields   = data.fields
  }

  /**
   * = main =
   * 
   * Construction de l'élément de filtre
   * 
   */
  buildIn(container){
    const o = DCreate('DIV', {class:`maindiv-filter closed maindiv-filter-${this.id}`, 'data-data': this.id, 'data-state':'closed'})
    this.obj = o
    const label = DCreate('LABEL', {text:this.name, class:'filter-name'})
    o.appendChild(label)
    this.spanTitre = label
    this.buildFields()
    container.appendChild(o)
  }

  /**
   * Construction de tous les champs de filtre
   * 
   * Dans : this.fieldsContainer
   */
  buildFields(){
    this.fieldsContainer = DCreate('DIV', {class:'filter-fields-container'})
    this.obj.appendChild(this.fieldsContainer)
    this.fields.forEach( dfield => {
      const field = new FilterFieldBuilder(dfield, this)
      field.buildIn(this.fieldsContainer)
    })
    const btnApply = DCreate('BUTTON', {text:'ON', class:'btn-apply', 'data-id':this.id, 'data-state':'off'})
    btnApply.addEventListener('click', this.ifilter.onToggleFilterGroup.bind(this.ifilter, this, btnApply, this.id))
    this.fieldsContainer.appendChild(DCreate('DIV', {class:'buttons', inner:[btnApply]}))
  }
}


/**
 * class FilterFieldBuilder
 * -------------------------
 * Pour la construction d'un champ
 * 
 */


class FilterFieldBuilder {
  constructor(data, mainElement){
    this.data         = data
    this.id           = data.id
    this.type         = data.type
    this.css          = data.css // ajout au span du paramètre
    this.label        = data.label
    this.values       = data.values
    this.mainElement  = mainElement
    this.ifilter      = mainElement.ifilter // l'instance {Filtre} courante

    if ( 'function' == typeof this.values ) {
      this.values = this.values.call(null)
    }
  }  

  buildIn(container){
    container.appendChild(this.buildField())
    if ( this.data.explication ) { container.appendChild(this.buildExplication())}
  }
  buildField(){
    switch(this.type){
    case 'div':
      return this.buildAsDivOfFields()
    case 'input-text':
      return this.buildAsInputText()
    case 'multi-select':
      return this.buildAsMultiSelect()
    case 'select':
      return this.buildAsSelect()
    case 'checkbox':
      return this.buildAsCheckbox()
    case 'button':
      return this.buildAsButton()
    }
  }

  /**
   * Méthodes qui permettent d'actualiser le filtrage chaque fois 
   * qu'on modifiera un élément du filtre, à partir du moment où le
   * bouton 'ON' du groupe de filtre sera activé
   * 
   * @param obj   {DOM ELement} L'objet dont la valeur change (cb, 
   *              text-input, etc.)
   */
  observeChangeOn(o){
    o.addEventListener('change', this.methodOnChange(o))
  }
  methodOnChange(obj){
    return this.ifilter.onChangeFilterProperty.bind(this.ifilter, obj, this.mainElement.obj)
  }

  /**
   * Les méthodes de construction
   * 
   */
  buildAsDivOfFields(){
    const cont = DCreate('DIV', {class:'fields-container'})
    this.values.forEach( dfield => {
      const field = new FilterFieldBuilder(dfield, this.mainElement)
      field.buildIn(cont)
    })
    return cont
  }

  buildAsInputText(){
    const cont = DCreate(this.data.disp=='inline'?'SPAN':'DIV')
    if ( this.label ) {
      const label = DCreate('LABEL', {class:'field-label', text: this.label})
      cont.appendChild(label)
    }
    let css = [this.domId, this.data.css].join(' ')
    const field = DCreate('INPUT',{type:'text', class:css})
    this.observeChangeOn(field)
    cont.appendChild(field)
    return cont
  }


  buildAsMultiSelect(){
    const o = DCreate('DIV', {class:'panel-multi-select '+`panel-multi-select-${this.id}`})
    /*
    |   L'entête avec les boutons "tout sélectionné"/"tout déselectionner"
    */
    if ( not(this.data.noSelectAll) ) {    
      var header_tools, cbs_tools ;
      header_tools = DCreate('DIV', {class:'cbs-tools'})
      o.appendChild(header_tools)
      const span_tout       = DCreate('SPAN', {text: 'tout : ', class:'rfloat tiny'})
      const btn_selectAll   = DCreate('BUTTON', {class:'cbs-tool', text:'sélectionner'})
      const span_sep        = DCreate('SPAN', {text: ' | ', class:'rfloat tiny'})
      const btn_deselectAll = DCreate('BUTTON', {class:'cbs-tool', text:'désélectionner'})
      btn_selectAll.addEventListener('click', this.ifilter.onSelectOrDeselectAll.bind(this, true, o) )
      btn_deselectAll.addEventListener('click', this.ifilter.onSelectOrDeselectAll.bind(this, false, o) )
      header_tools.appendChild(btn_selectAll)
      header_tools.appendChild(span_sep)
      header_tools.appendChild(btn_deselectAll)
      header_tools.appendChild(span_tout)
      header_tools.appendChild(DCreate('LEGEND', {class:'panel-legend', text:this.label||' '}))
    }
    if ( not('function' == typeof this.values.forEach) ) {
      this.values = Object.values(this.values)
    }
    this.values.forEach( ivalue => {
      const css   = ['multiselect-span']
      if ( this.css ) { css.push(this.css) }
      const span  = DCreate('SPAN', {class:css.join(' ')})
      const value = ivalue.value || ivalue.key
      const cbid  = `cb-multiselect-${this.id}-${new Date().getTime()}-${value}`
      const cb    = DCreate('INPUT',{class:`cb-${this.id}`, id:cbid, type:'checkbox', 'data-value':value})
      this.observeChangeOn(cb)
      span.appendChild(cb)
      if ( not(this.data.notSelected) ) { cb.checked = true }
      const dataLabel = {for:cbid, text:ivalue.name}
      if ( this.id == 'decor' ) {Object.assign(dataLabel, {class:'petit'})}
      span.appendChild(DCreate('LABEL', dataLabel))
      o.appendChild(span)
    })
    return o
  }
  buildAsCheckbox(){
    const css = ['cb-container', this.data.disp]
    const span  = DCreate(this.data.disp == 'inline'?'SPAN':'DIV', {class:css.join(' ')})
    const cbid  = `cb-${this.id}-${new Date().getTime()}`
    const cb    = DCreate('INPUT',{class:`cb-${this.mainElement.id} cb-${this.id}`, id:cbid, type:'checkbox', 'data-value':this.id})
    this.observeChangeOn(cb)
    span.appendChild(cb)
    cb.checked = this.data.checked == undefined ? true : this.data.checked
    span.appendChild(DCreate('LABEL', {for:cbid, text:this.label}))
    return span
  }
  buildAsSelect(){
    const select = DCreate('SELECT', {values: this.values})
    this.values.forEach( doption => {
      const opt = DCreate('OPTION', {text: doption.label, value: doption.value})
      select.appendChild(opt)
    })
    this.observeChangeOn(select)
    const span = DCreate('SPAN', {inner:[select]})
    return span
  }
  buildAsButton(){
    return DCreate('BUTTON', {text:this.label, id:this.id})
  }

  /**
   * Construction de l'explication du champ
   * 
   */
  buildExplication(){
    return DCreate('DIV', {class:'explication', text:this.data.explication})
  }

  get domId(){
    return this._domid || (this._domid = `filter_field-${this.id}`)
  }
}


/**
 * 
 * class FilterParagraph
 * ---------------------
 * Gestion de tous les paragraphes du scénario affiché
 * 
 */
class FilterParagrah {
  /**
   * Le mode de masque, qui détermine s'il faut cacher le paragraphe
   * ou le griser.
   */
  static get HideMode(){ return this._hidemode || 'hidden'}
  static set HideMode(v){ this._hidemode = v }

  constructor(oparag, sceneNum) {
    this.obj      = oparag
    if ( this.isIntitule ) {
      this.sceneNum = (sceneNum || 0) + 1
      this.numero   = this.sceneNum
    } else {
      this.sceneNum = sceneNum
    }
  }

  /**
   * Méthodes de filtre
   * 
   */

  /** @return TRUE si le paragraphe n'est pas dans le décor ou
   *          l'effet du filtre
   * 
   * Note : on considère que si aucun décor n'est choisi, c'est que
   * l'utilisateur ne veut pas filtrer par le décor (ça pourrait au
   * contraire vouloir dire qu'il exclut tous les décors, mais ça n'a
   * pas de sens). Idem pour les effets.
   * 
   * @param decors {Table} Table de définition du filtre des
   *               décors, avec la clé .decor qui contient la liste
   *               des décors possible et .effets la liste des effets
   */
  isNotMatchingDecorOrEffet(decors){
    // console.log("this.scene = ", this.scene)
    if ( decors.decors && not(decors.decors.includes(this.scene.decor)) ) {
      return true // exclu
    }
    if ( decors.effets && not(decors.effets.includes(this.scene.effet)) ) {
      return true // exclu
    }
    if ( decors.lieux && not(decors.lieux.includes(this.scene.lieu)) ) {
      return true // exclu
    }
    return false // keep it
  }
  /**
   *  @return TRUE si le paragraphe n'est pas d'un bon style
   */
  isNotElementStyleOn(stylesOn){
    if ( not(stylesOn) ) return false
    return not(stylesOn.includes(this.eltype))
  }

  /**
   * @return TRUE si le paragraphe ne concerne pas les personnages
   * à considérer
   * 
   */
  isNotPersonnageOn(regPersosOn){
    if ( not(regPersosOn) ) return false
    return not(this.text.match(regPersosOn) || (this.owner && this.owner.match(regPersosOn)))
  }

  /**
   * @return TRUE si le paragraphe (donc sa scène) se trouve dans
   * les temps définis par les zones de +zones+.
   * 
   * @param +zones+ {Array} de paires définissant le premier et le
   *                dernier temps de chaque zone.
   */
  isInZones(zones){
    for (var zone of zones ) {
      if ( this.scene.page >= zone[0] && this.scene.page <= zone[1]){
        return true
      }
    }
    return false
  }

  isNotMatchingSearch(search){
    if ( !search ) return false
    return not(this.text.match(search.regexp))
  }
  // ---/fin des méthodes de filtre




  hide(){
    if (FilterParagrah.HideMode != 'hidden') {
      this.obj.classList.remove('hidden')
    }
    this.obj.classList.add(FilterParagrah.HideMode)
  }
  show(){
    this.obj.classList.remove('hidden')
    this.obj.classList.remove('grised')
  }

  get isIntitule(){
    if ( undefined === this._isintitule ) {
      this._isintitule = this.eltype == 'intitule'
    }
    return this._isintitule
  }

  get text(){
    return this._text || (this._text = this.obj.innerHTML)
  }
  get scene(){
    return this._scene || (this._scene = Scenario.current.sceneByNumero(this.sceneNum))
  }
  // Le propriétaire du paragraphe (pour les dialogues et note de jeu)
  get owner(){
    return this._owner || (this._owner = this.obj.dataset.owner)
  }
  get eltype(){
    return this._eltype || (this._eltype = this.obj.dataset.eltype)
  }
}
