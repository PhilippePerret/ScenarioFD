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
    Object.values(this.DATA_FILTRE).forEach( dfiltre => {
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
    console.log("On va filtrer le scénario avec ", dataFiltrage)
  }

  /**
   * Méthode qui rassemble les données en fonction de tous les 
   * filtres actifs.
   * 
   */
  getStateOfEachFiltre(){
    const dataFiltrage = []
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
    default:
      erreur("Le filtre #"+idFiltre+" n'est pas traité…")
    }
    return dataFiltrage
  }

  /**
   * Relève de l'état de chaque filtre
   * 
   */
  getStateSceneRange(dataFiltrage){
    console.log("Changement du rang de scène")
    return dataFiltrage
  }
  getStatePersonnage(dataFiltrage){
    console.warn("Je dois apprendre à filtrer par personnage")
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
    dataFiltrage.push({styleOn: stylesOn})
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
   * Observation complète du filtre, pour réactions en direct en
   * fonction des choix.
   */
  observe(){
    super.observe()

    /*
    |  Chainage
    */
    return this
  }


  get DATA_FILTRE(){
      return {
      // --- De scène x avec scène y ---
      'scenes_range': {
          name: 'Rang de scènes'
        , id:   'scenes_range'
        , fields:[
              {type:'div', values: [
                  {id:'from_scene', label:'De scène', type:'input-text', disp:'inline', css:'short center'}
                , {id:'to_scene',   label:'à scène',  type:'input-text', disp:'inline', css:'short center'}
                ]}
            , {id:'zone',       label:'Zones',    type:'multi-select', values: this.ZONES }
          ]
      }
    , 'personnages': {
          name: 'Les personnages'
        , id:   'personnage'
        , fields: [
              {id:'personnage', type:'multi-select', values: Scenario.current.personnages.items}
          ]
      }
    , 'decors': {
          name: 'Les décors'
        , id:   'decor_et_effet'
        , fields: [
              {id:'decor', type:'multi-select', label: 'Lieux', values: Scenario.current.decors.items}
            , {id:'effet', type:'multi-select', label: 'Effet', values: this.EFFETS}
          ]
      }
    , 'types_element':{
          name: 'Les éléments'
        , id:   'type_element'
        , fields: [
            {id:'type_element', type:'multi-select', values: this.TYPES_ELEMENTS}
          ] 
      }
    , 'words': {
          name: 'Recherche par mots'
        , id:   'words'
        , fields: [
              {id:'words',  label:'Rechercher', type:'input-text', disp:'block'}
            , {id:'words_as', label:'comme…', type:'select', values:[{label:'Expression régulière', value:'regexp'}, {label:'Littéral',value:'exact'}, {label:'Insensible à la casse', value:'uncase'}]}
          ]
      }
    }
  } // DATA_FILTRE

  get EFFETS(){
    return {
        'e':  {name:'Extérieur', value:'EXT.'}
      , 'i':  {name:'Intérieur', value:'INT.'}
      , 'n':  {name:'Noir',      value:'NOIR'}
      , 'ei': {name:'Int./ext.', value:'INT./EXT.'}
    }
  }

  get TYPES_ELEMENTS(){
    return {
        'intitule':   {name:'Intitulé', value:'intitule'}
      , 'action':     {name:'Action/descript°', value:'action'}
      , 'nom':        {name:'Nom qui parle', value:'nom'}
      , 'dialogue':   {name:'Dialogue', value:'dialogue'}
      , 'note-jeu':   {name:'Note de jeu', value:'note-jeu'}
      , 'transition': {name:'Transition', value:'transition'}
    }
  }

  get ZONES(){
    return {
        'expo':   {name:'Exposition'      ,value:'expo'}
      , 'dev':    {name:'Développement'   ,value:'deve'}
      , 'dev1':   {name:'Part 1 de Dév.'  ,value:'dev1'}
      , 'dev2':   {name:'Part 2 de Dév.'  ,value:'dev2'}
      , 'deno':   {name:'Dénouement'      ,value:'deno'}
      }
  }
} // classe ScenarioFilter < InCadre


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
      const field = new FilterFieldBuilder(dfield)
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
  constructor(data){
    this.data   = data
    this.id     = data.id
    this.type   = data.type
    this.label  = data.label
    this.values = data.values
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
      const field = new FilterFieldBuilder(dfield)
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
    if ( this.label ) {
      o.appendChild(DCreate('LEGEND', {class:'panel-legend', text:this.label}))
    }
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
