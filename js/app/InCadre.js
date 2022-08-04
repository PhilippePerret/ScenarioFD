'use strict';


class InCadre {

  static get(key, cadre) {
    let panneau ;
    switch(key){
    case 'console':
      return new Console(cadre)
    case 'preview':
      return new Preview(cadre)
    case 'navigator':
      return new Navigator(cadre)
    case 'todo':
      return new Panneau('todo', cadre)
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
    console.log("Instantiation de InCadre avec (type,cadre) =", type, cadre)
    this.type   = type
    this.cadre  = cadre
    this.id     = `${this.type}-${new Date().getTime()}`
    InCadre.add(this)
  }

  buildIn(container){
    container.innerHTML = ''
    this.section  = DGet(`section.${this.type}.in-cadre`).cloneNode(true)
    this.section.id = this.id
    if ( 'function' == typeof this.onBuilding ) this.onBuilding.call(this)
    container.appendChild(this.section)
    this.buildTypeContentButton()
    this.observe()
  }

  get section() { return this._section || (this._section = DGet(`section#${this.id}`))}
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
    console.log("Bouton de type de contenu : ", this.btnTypeContent)
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
    console.log('-> InCadre#adjustSize')
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
    this.cadre.setContent(div.dataset.content)
    return stopEvent(e)
  }

  observe(){

  }
  observeButtonTypeContent(){
    console.log("-> observeButtonTypeContent")
    DGetAll('div.type-content', this.btnTypeContent).forEach(div => {
      div.addEventListener('click', this.onClickButtonTypeContent.bind(this, div))
    })
  }

}


//#######################   TESTS   ################################
var test, result ;

/**
 * Un test pour voir si le panneau filtre se met bien (suite à un
 * bug qui l'empêche de se construire au bon endroit)
 * 
 */
test = new InsideTest({
    error: 'Le filtre %{devrait} se construire au bon endroit (avec la disposition %{sujet})'
  , eval: function(dispoId){
        if ( ! Scenario.current ){ 
          ITFactory.makeCurrentScenario()
        }
        // Cadre.dispose(dispoId)
        /*
          Voyons ce qu'il y a dans les différents quarts
        */
        [TL, TR, BL, BR].forEach(quart => {
          console.log("quart = %s", quart)
          console.log("INCADRE dans le quart %s", quart, Cadre.cadre(quart))
        })

        const incadre   = Cadre.cadre('top_right').content
        // On simule un choix du panneau filtre
        incadre.onClickButtonTypeContent(
            ITFactory.typeContentButton('filter')
          , InsideTest.FAKE_EVENT
        )
        // Le contenu doit être bien placé
        const newIncadre = Cadre.cadre('top_right').content
        const cadre2 = DGet('#cadre-2.cadre')
        const sectionTR = DGet('section.filter', cadre2)
        // Check : les divs des filtres sont bien placés
        const divs = DGetAll('div.div-filtre', cadre2)
        if ( Array.from(divs).length > 3 ) {
          // Il y a bien les div de filtre
        } else {
          InsideTest.current.error = "Ne contient pas les divs"
          return false
        }
        return true
      }
})

test.with(1 /* disposition 1 left - 1 right */)
/*
test.with(2) // 1 top 1 bottom
test.with(3) // 1 top 2 bottom
test.with(6) // 1 left 2 right
//*/
