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

  static get(key, cadre) {
    this.log.in('::get(key = '+key+', cadre='+(cadre && cadre.inspect)+')')
    let panneau ;
    switch(key){
    case 'console':
      return new Console(cadre)
    case 'preview':
      return new Preview(cadre)
    case 'navigator':
      return new Navigator(cadre)
    case 'todo':
      return this.getPanneau('todo', TodoScenario, cadre)
    case 'filter':
      return new ScenarioFilter(cadre)
    case 'infos':
      // Un seul panneau infos, qu'on mémorise, contrairement
      // aux autres
      return this.getPanneau('infos', InfosScenario, cadre)
    case 'preferences':
      // Un seul panneau préférences, qu'on mémorise
      return this.getPanneau('prefs', Preferences, cadre)
    case 'report':
      return new Panneau('report', cadre)
    case 'console_dev':
      return new ConsoleDev(cadre)
    }    
  }

  static getPanneau(panokey, Classe, cadre) {
    const kthis = `_panneau_${panokey}`
    const panneau = this[kthis] || ( this[kthis] = new Classe(cadre) )
    if ( cadre ) { panneau.cadre = cadre }
    return panneau
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
    this.log.in('#constructor avec (type = ' + type + ', cadre = ' + (cadre?cadre.inspect:null) + ')')
    this.type   = type
    this.cadre  = cadre
    this.id     = `${this.type}-${new Date().getTime()}`
    InCadre.add(this)
  }

  get log(){ return this.constructor.log }

  get inspect(){
    return this._inspect || ( this._inspect = `InCadre #${this.id} type:${this.type}` )
  }

  buildIn(container){
    container.innerHTML = ''
    this.section  = DGet(`section.${this.type}.incadre`).cloneNode(true)
    this.section.id = this.id
    if ( 'function' == typeof this.onBuilding ) this.onBuilding.call(this)
    container.appendChild(this.section)
    this.buildTypeContentButton()
    if ( 'function' == typeof this.afterBuildIn ) {
      this.afterBuildIn.call(this)
    }
    this.observe()
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
    this.observeButtonTypeContent()
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

  observe(){

  }
  observeButtonTypeContent(){
    DGetAll('div.type-content', this.btnTypeContent).forEach(div => {
      div.addEventListener('click', this.onClickButtonTypeContent.bind(this, div))
    })
  }

}
