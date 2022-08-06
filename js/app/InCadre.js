'use strict';


class InCadre {

  static get log(){
    return this._log || (this._log = new LogClass('InCadre'))
  }

  /**
   * Méthode appelée au chargement d'un nouveau scénario, avant 
   * que ses données ne soient dispatchées
   * 
   */
  static resetAll(){
    this.log.in('::resetAll')

    this.log.out('::resetAll')
  }

  /**
   * Méthode principale appelée par {Cadre} pour obtenir une instance
   * ou l'instance de son contenu (incadre).
   * Il y a deux types de InCadre :
   *    - les incadres qui doivent être chaque fois une nouvelle
   *      instance vierge. Il peut y avoir plusieurs preview indépen-
   *      dantes par exemple, pour afficher différentes choses.
   *      cf. ci-dessous types "instances autonomes"
   *    - les incadres qui sont uniques et ne doivent être instanciés
   *      qu'une seule fois. C'est le cas par exemple des infos du
   *      scénario, qui doivent être semblables partout.
   *      cf. ci-dessous types "instances uniques"
   * 
   */
  static get(key, cadre) {
    this.log.in('::get(key = '+key+', cadre='+(cadre && cadre.inspect)+')')
    let panneau ;
    switch(key){
    // --- Les types "instances autonomes" ---
    case 'console':
      return new Console(cadre)
    case 'preview':
      return new Preview(cadre)
    case 'navigator':
      return new Navigator(cadre)
    case 'filter':
      return new ScenarioFilter(cadre)
    case 'report':
      return new Panneau('report', cadre)
    case 'console_dev':
      return new ConsoleDev(cadre)
    // --- Les types "instances uniques" ---
    case 'todo':
      return this.getInCadreUnique(key, TodoScenario, cadre)
    case 'infos':
      return this.getInCadreUnique(key, InfosScenario, cadre)
    case 'preferences':
      // Un seul panneau préférences, qu'on mémorise
      return this.getInCadreUnique(key, Preferences, cadre)
    }    
  }

  /**
   * @return l'instance {InCadre} unique de clé +incadreKey+
   *          en l'instanciant si nécessaire.
   * 
   */
  static getInCadreUnique(incadreKey, Classe, cadre) {
    if ( undefined == this.InCadreUniques) { this.InCadreUniques = {} }
    if ( undefined == this.InCadreUniques[incadreKey] ) {
      Object.assign(this.InCadreUniques, {[incadreKey]: new Classe(cadre)})
    }
    this.InCadreUniques[incadreKey].cadre = cadre
    return this.InCadreUniques[incadreKey]
  }

  /**
   * @return un clone du Node InCadre de type +incadreType+
   * 
   * @param {String} incadreType  Le type ('preview', 'console', etc.)
   * 
   */
  static clone(incadreType){
    return DGet(`section.${incadreType}.incadre`).cloneNode(true)
  }

  /**
   * Pour consigner tous les InCadre (par type)
   * 
   */
  static add(incadre){
    if (undefined == this._allbytype) this._allbytype = {}
    if (undefined == this._allbytype[incadre.type]) { 
      Object.assign(this._allbytype, {[incadre.type]: []})
    }
    this._allbytype[incadre.type].push(incadre)
  }

  static get allByType(){ return this._allbytype || {}}


//###################################################################


  constructor(type, cadre){
    this.Klass  = 'InCadre'
    // this.log.in('#constructor avec (type = ' + type + ', cadre = ' + (cadre?cadre.inspect:null) + ')')
    this.type   = type
    this.cadre  = cadre
    this.id     = `${this.type}-${new Date().getTime()}`
    InCadre.add(this)
  }

  get log(){ return this.constructor.log }

  get inspect(){
    return this._inspect || ( this._inspect = `InCadre #${this.id} type:${this.type}` )
  }

  build(){
    const container = this.cadre.obj
    /*
    |   S'il existe une méthode à appeler avant la construction, on
    |   l'appelle.
    */
    this.beforeBuild && this.beforeBuild.call(this)
    container.innerHTML = ''
    /*
    |   Clonage du modèle de section
    */
    this.section  = InCadre.clone(this.type)
    this.section.id = this.id
    container.appendChild(this.section)
    /*
    |   Construction du bouton de type de contenu
    |   (note: ce bouton pourrait être dans le cadre plutôt, mais
    |    c'est plus pratique comme ça)
    */
    this.buildTypeContentButton()
    /*
    |   S'il existe une méthode à appeler après la construction, on
    |   l'appelle.
    */
    this.afterBuild && this.afterBuild.call(this)
    /*
    |  Chainage
    */
    return this
  }

  observe(){
    /*
    |   Observation du (des) bouton de changement de type de 
    |   contenu
    */
    this.observeButtonTypeContent()
    /*
    |   Chainage
    */
    return this
  }

  /**
   * Pour détruire l'inCadre
   * 
   */
  destroy(){
    this.section.remove()
  }

  get section() { return this._section /*|| (this._section = DGet(`section#${this.id}`))*/}
  set section(v){ this._section = v }
  get content() { return this._content   || (this._content  = DGet('div.content', this.section))}
  get toolsbar(){ return this._toolsbar || (this._toolsbar = DGet('div.toolsbar', this.section))}

  /**
   * Construit le bouton de type de contenu et, en même temps, met
   * le type courant en type sélectionné
   * 
   */
  buildTypeContentButton(){
    this.btnTypeContent = DGet('button.btn-type-content').cloneNode(true)
    this.toolsbar.appendChild(this.btnTypeContent)
    DGetAll('div.type-content', this.btnTypeContent).forEach(div =>{
      div.classList[div.dataset.content == this.type?'remove':'add']('hidden')
    })
    this.btnTypeContent.classList.remove('hidden')
  }

  show(){
    this.section.classList.remove('hidden')
  }
  hide(){
    this.section.classList.add('hidden')
  }

  /**
   * Méthode appelée quand on place ce contenu dans un cadre, pour
   * adapter sa taille.
   * 
   */
  adjustSize(){
    this.setWidth(this.cadre.width - 4)
    this.setHeight(this.cadre.height - 4)
  }

  setWidth(v) {
    this.section.style.width = px(v)
    let w ;
    if ( this.isTypePlain ){
      w = px(v - 4)
    } else {
      w = `calc(${px(v)} - 2em)`
    }
    this.content.style.width = w
  }
  setHeight(v){
    this.section.style.height = px(v)
    let h ;
    if ( this.isTypePlain ) {
      h = px(v - this.toolsbar.offsetHeight - 8)
    } else {
      h = `calc(${px(v - this.toolsbar.offsetHeight - 8)} - 2em)`
    }
    this.content.style.height = h
  }
  setTop(v){
    // this.section.style.top = v 
  }
  setLeft(v){
    // this.section.style.left   = px(v)
  }

  get isTypePlain(){
    if ( undefined == this._istypeplain ) {
      this._istypeplain = PLAIN_INCADRE.includes(this.type)
    }
    return this._istypeplain
  }
  
  // --- MÉTHODES D'ÉVÈNEMENT ---

  /**
   * Quand on choisit un type de contenu pour le cadre
   * 
   */
  onClickButtonTypeContent(div, e) {
    this.cadre.setIncadre(div.dataset.content)
    return stopEvent(e)
  }

  observeButtonTypeContent(){
    DGetAll('div.type-content', this.btnTypeContent).forEach(div => {
      div.addEventListener('click', this.onClickButtonTypeContent.bind(this, div))
    })
  }

}
