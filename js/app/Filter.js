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
      // Ouverture/fermeture sur le span de titre
      builder.spanTitre.addEventListener('click', this.toggleFilter.bind(this, builder.obj))
      // Réaction au clic n'importe où
      dfiltre.onChange && builder.addEventListeners(dfiltre.onChange)
    })
    this.isBuilt = true
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
    const dataFiltrage = this.getStateOfEachFiltre()
    Preview.current || raise(ERRORS.filter.noPreviewer)

    if ( dataFiltrage.personnagesOn ) {
      Object.assign(dataFiltrage, {regPersosOn: new RegExp(`(${dataFiltrage.personnagesOn.join('|')})`) })
    }

    console.log("On va filtrer le scénario avec ", dataFiltrage)

    /*
    |  Traitement d'option préliminaires
    */
    if ( dataFiltrage.option_grised_rather_hide) {
      // Quand il faut grisé plutôt que de masquer les paragraphes
      // exclus.
      console.log("Le mode de cacher est mis à 'grised'")
      FilterParagrah.HideMode = 'grised'
    }

    /**
     * Boucle sur tous les paragraphes pour les filtrer
     * 
     */
    var currentSceneNum = null
    const fromSceneNum  = null // à régler
        , toSceneNum    = null // à régler
    Preview.current.mapParagraph( oparag => {
      /*
      |  Ne prendre que les scènes qui nous intéressent
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
      |   === Tous les autres filtrages ===
      |
      */

      /*
      | Option 'always_heading' (toujours afficher l'intitulé)
      */
      if ( iparag.isIntitule && dataFiltrage.option_always_heading) { return iparag }
      if ( iparag.isNotElementStyleOn(dataFiltrage.styleOn) ) {
        iparag.hide()
        return null
      }
      if ( iparag.isNotPersonnageOn(dataFiltrage.regPersosOn) ){ 
        iparag.hide()
        return null
      }
      return iparag
    }).map(iparag => { 
      console.log("iparag restant", iparag)
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
    console.log("-> getStateOfFiltre")
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
    return dataFiltrage
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
    return dataFiltrage
  }
  getStateSceneRange(dataFiltrage){
    console.log("Changement du rang de scène")
    return dataFiltrage
  }
  getStatePersonnage(dataFiltrage){
    const personnagesOn = []
    this.content.querySelectorAll('.cb-personnage').forEach(cb => {
      cb.checked && personnagesOn.push(cb.dataset.value)
    })
    Object.assign(dataFiltrage, {personnagesOn: personnagesOn})
    return dataFiltrage
  }
  getStateDecorEtEffet(dataFiltrage){
    console.warn("Je dois apprendre à filtrer par décor et effet")
    return dataFiltrage
  }
  getStateTypeElement(dataFiltrage){
    console.log("Récupération des types d'élément")
    /*
    | On récupère les éléments à voir
    */
    const stylesOn = [] // les styles de paragraphes à voir
    this.content.querySelectorAll('.cb-type_element').forEach(cb => {
      cb.checked && stylesOn.push(cb.dataset.value)
    })
    this.log.debug("Styles à filtrer (voir) : " + JString(stylesOn))
    Object.assign(dataFiltrage, {styleOn: stylesOn})
    return dataFiltrage
  }
  getStateSearch(dataFiltrage){
    console.warn("Je dois apprendre à filtrer par recherche de mot")
    return dataFiltrage
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
        console.log("Problème avec ", div.previousSibling)
        console.log(err)
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
  onApplyFilterOn(btn, idFiltre, e){
    // console.log("Application du filtre", idFiltre)
    const newState = btn.dataset.state == 'on' ? 'off' : 'on'
    btn.dataset.state = newState
    this.filtreScenario()
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
    btnApply.addEventListener('click', this.ifilter.onApplyFilterOn.bind(this.ifilter, btnApply, this.id))
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
    cont.appendChild(field)
    return cont
  }
  buildAsMultiSelect(){
    const o = DCreate('DIV', {class:'panel-multi-select'})
    var header_tools, cbs_tools ;
    header_tools = DCreate('DIV', {class:'cbs-tools'})
    o.appendChild(header_tools)
    const btn_selectAll = DCreate('BUTTON', {class:'cbs-tool', text:'tout sélectionner'})
    const btn_deselectAll = DCreate('BUTTON', {class:'cbs-tool', text:'tout désélectionner'})
    btn_selectAll.addEventListener('click', this.ifilter.onSelectOrDeselectAll.bind(this, true, o) )
    btn_deselectAll.addEventListener('click', this.ifilter.onSelectOrDeselectAll.bind(this, false, o) )
    header_tools.appendChild(btn_selectAll)
    header_tools.appendChild(btn_deselectAll)
    header_tools.appendChild(DCreate('LEGEND', {class:'panel-legend', text:this.label||' '}))


    if ( not('function' == typeof this.values.forEach) ) {
      this.values = Object.values(this.values)
    }
    this.values.forEach( ivalue => {
      const span  = DCreate('SPAN', {class:'multiselect-span'})
      const value = ivalue.value || ivalue.key
      const cbid  = `cb-multiselect-${this.id}-${new Date().getTime()}-${value}`
      const cb    = DCreate('INPUT',{class:`cb-${this.id}`, id:cbid, type:'checkbox', 'data-value':value})
      span.appendChild(cb)
      cb.checked = true
      span.appendChild(DCreate('LABEL', {for:cbid, text:ivalue.name}))
      o.appendChild(span)
    })
    return o
  }
  buildAsCheckbox(){
    const css = ['cb-container', this.data.disp]
    const span  = DCreate(this.data.disp == 'inline'?'SPAN':'DIV', {class:css.join(' ')})
    const cbid  = `cb-${this.id}-${new Date().getTime()}`
    const cb    = DCreate('INPUT',{class:`cb-${this.mainElement.id} cb-${this.id}`, id:cbid, type:'checkbox', 'data-value':this.id})
    span.appendChild(cb)
    cb.checked = this.data.checked == undefined ? true : this.data.checked
    span.appendChild(DCreate('LABEL', {for:cbid, text:this.label}))
    return span
  }
  buildAsSelect(){
    return DCreate('SELECT', {values: this.values})
  }
  buildAsButton(){
    return DCreate('BUTTON', {text:this.label, id:this.id})
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


   // ---/fin des méthodes de filtre

  hide(){this.obj.classList.add(FilterParagrah.HideMode)}
  show(){
    this.obj.classList.remove(FilterParagrah.HideMode)
    if (FilterParagrah.HideMode != 'hidden') {this.obj.classList.remove('hidden')}
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
  // Le propriétaire du paragraphe (pour les dialogues et note de jeu)
  get owner(){
    return this._owner || (this._owner = this.obj.dataset.owner)
  }
  get eltype(){
    return this._eltype || (this._eltype = this.obj.dataset.eltype)
  }
}
