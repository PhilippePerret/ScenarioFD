'use strict';
/**
 * 
 * class TimelineClass
 * -------------------
 * Pour gérer les timelines du programme Scénario.
 * Ces timelines se présentent comme des lignes horizontales, sur une
 * règle graduée indiquant les pages/minutes.
 * 
 * Elles sont au nombre de 4
 *    1. Timeline affichant des points clés (beats)
 *    2. Timeline affichant des séquences, des grandes parties
 *    3. Timeline affichant la position absolue des scènes
 *    4. Timeline affichant la position relative des scènes (suivant
 *       leur position et leur durée dans le scénario)
 * 
 * Et en fait il y en a une cinquième, la règle graduée, qui possède
 * quelques différences (notamment la gestion du zoom)
 * 
 */

const TIMELINES = {
  'beats': {}
}

class Timeline {

  static get log(){
    return this._log || (this._log = new LogClass('Timeline'))
  }

  /**
   * Préparation des lignes de temps au démarrage de l'application
   * (mais pas au chargement d'un scénario — cf. plus bas la méthode
   *  onLoadScenario)
   * 
   */
  static init(){
    /*
    | Calcul des valeurs en fonction de :
    | - la durée de scénario définie (ou 120 minutes)
    | - la largeur de la fenêtre
    */
    this.calculateRatio(120 /* nombre de pages */)
    /*
    | Construction de la règle graduée
    */
    this.buildRegleGraduee()
    /*
    | Construction des 4 timelines
    */
    this.BeatsTimeline     .prepare(0)
    this.SequencesTimeline .prepare(20)
    this.AbsoluteTimeline  .prepare(60)
    this.RelativeTimeline  .prepare(80)
    /*
    |   Observation des outils
    */
    this.observeTools()
    /*
    |  Observation du slider
    */
    this.observeSlider()
  }

  /**
   * Méthode qui applique le zoom à la timeline
   * 
   * @param values {Array} qui contient en première valeur le début
   *                       de la portion de timeline à voir et en
   *                       seconde valeur la fin de la portion. (*)
   * 
   * (*) Par exemple, si values = [25, 50], cela signifie qu'on doit
   * voir la portion de de time ligne entre 25% (le quart) et 50%, donc
   * la moitié.
   * 
   * Imaginons que :
   *      - le rang gauche est à 0 
   *      - le rang droite est à 50
   * => left doit être à 0
   * => scale doit être de 2
   * 
   *  le rang gauche RG est de 25 (1 quart)
   *  le rang droit  RD est à  50 
   *    => zoom est 4  100 / (RD - RG)
   *    => left = Largeur Timeline / (100 / RG)
   */
  static zoomTimelines(values){
    const [pctStart, pctEnd] = values
    const pctWidth = pctEnd - pctStart

    const dureeFilm = InfosScenario.get('duree_film')
    this.log.debug("dureeFilm = " + dureeFilm)

    /*
    | Si pctWidth = 50 ça veut dire qu'on grossit par 2
    | Si pctWidth = 100 => 1
    | Si pctWidth = 25  => 4
    | => scale = 100 / pctWidth
    */
    const scale = 100 / pctWidth
    this.log.debug('scale = ' + scale)
    // const trans = realStart * this.Ratio


    let left = 0 ;
    if ( pctStart ) {
      var portion = 100 / pctStart
      left = `-${parseInt(this.AbsoluteTimeline.obj.offsetWidth / portion,10)}px`
    }

    /*
    | QUand pctStart est à 25, on doit déplacer d'un quart
    | Quand pctStart est à 50, on doit déplacer d'un 
    */

    const dZoom = {scale: scale, left: left, start:pctStart, end: pctEnd}
    this.forEachTimeline('setZoom', dZoom)

  }

  /**
   * Boucle sur TOUTES LES TIMELINES (règle graduée comprise, sauf
   * si noRuler est true)
   */
  static forEachTimeline(method, args, noRuler){
    const tls = [
        this.AbsoluteTimeline
      , this.RelativeTimeline
      , this.SequencesTimeline
      , this.BeatsTimeline
    ]
    noRuler || tls.push(this.RegleGraduee)
    if ( 'function' == typeof method ) {
      tls.forEach( tl => method(tl) )
    } else {
      tls.forEach( tl => tl[method].call(tl, args))
    }
  }

  /**
   * Méthode appelée après le chargement du scénario +scenario+
   * 
   */
  static onLoadScenario(scenario){
    this.calculateRatio(scenario.nombre_pages)
    this.buildRegleGraduee()
  }

  static calculateRatio(nombre_pages){
    this.NombrePages = nombre_pages || InfosScenario.get('duree_film') || 120
    this.log.debug("Nombre de pages = " + this.NombrePages)
    const UIWidth = UI.Width - 40 // 40 pour les outils timeline
    this.log.debug("UIWidth = " + UIWidth)
    this.Ratio  = ((UIWidth - 12) / this.NombrePages).toFixed(4) // 12 parce que le premier trait ne commence pas au bort
    this.log.debug("Ratio = " + this.Ratio)
  }

  static buildRegleGraduee(){
    if ( this.ratioRegle == this.Ratio ){
      this.log.info("Le ratio n'a pas changé, on peut garder la règle graduée.")
      return
    } else {
      this.log.info('Le ratio a changé (' + this.ratioRegle + ' -> ' + this.Ratio + ')')
    }

    this.ratioRegle = 0 + this.Ratio

    
    this.drawRegleGraduee(this.NombrePages, 0, this.Ratio)

  }

  /**
   * La méthode pour véritablement dessiner la règle
   * 
   */
  static drawRegleGraduee(nombrePages, startPage, ratio){
    var i, left, pageNum, css ;
    const regle = this.RegleGraduee
    regle.cleanUp()
    /*
    | Construction des traits et des chiffres
    */
    for (i = 0; i <= nombrePages ; ++i) {
      left = i * ratio + 6
      if ( i % 10 == 0 ) {
        css = 'per_ten'
      } else {
        css = 'per_unit'
      }
      regle.append(DCreate('SPAN', {class: css, style:`left:${left}px;`}))
      /*
      | Ajouter le chiffre si on est sur un multiple de 5
      */
      if ( i % 5 == 0 ) {
        left = parseInt(i * ratio,10)
        if ( i > (nombrePages - 5) ) { left -= 5 * (String(nombrePages).length - 1) }
        else if ( i > 99 ) left -= 4
        else if ( i < 10 ) left += 4
        pageNum = startPage + i
        regle.append(DCreate('SPAN',{class:'chiffre',text:String(pageNum),style:`left:${left}px`}))
      }
    }
  }


  static observeSlider(){
    const my = this
    my.Slider = $('div#timeline-slider')
    my.Slider.slider({
        range:  true
      , min:    0
      , max:    100
      , values: [0, 100]
      , create: function(e,ui){
          const handles = this.querySelectorAll('span.ui-slider-handle')
          handles[0].innerHTML = 0
          handles[1].innerHTML = my.NombrePages
          }
      , slide: function(e, ui){
          my.onChangeZoom(ui)
        }
      , change: function(e, ui){
          my.onChangeZoom(ui) // programmatiquement
        }
    })
  }
  static onChangeZoom(ui){
    this.zoomTimelines.call(this, ui.values)
    ui.handle.innerHTML = 1 + parseInt((this.NombrePages / 100) * ui.value, 10)
  }

  /**
   * Méthode qui permet de simuler le zoom sur la Timeline
   * 
   * Un zoom sur la timeline consiste à construire les graduations
   * nécessaire. Par exemple, si la poignée gauche du slider est à 
   * 25 (un quart), on doit commencer les graduations à un quart du
   * scénario (par exemple la 30e page pour un scénario de 2 heures).
   * Et si la poignée droite du slider est à 75, il faut afficher les
   * graduation jusqu'au 3/4 du scénrio, par exemple la page 90 pour
   * un scénario de 2 heures. On répartit ensuite les graduations 
   * entre ces deux points.
   * 
   */
  static setZoomOnRegleGraduee(dataZoom){
    const {start, end} = dataZoom
    const startPage = parseInt(this.NombrePages / (100 / start), 10)
    const nombrePages   = parseInt(this.NombrePages / (100 / end), 10) - startPage
    const zoomRatio = this.Ratio * ( 100 / (end - start) )
    this.drawRegleGraduee(nombrePages, startPage, zoomRatio)
  }

  // --- MÉTHODES D'OBSERVATION ---

  /**
   * Méthode appelée quand on clique sur un menu pour activer ou désactiver
   * une timeline
   */
  static onClickShowTypeTimeline(div, e){
    const isOn    = !(div.dataset.state == "on") // attention : on inverse l'état
    const tltype  = div.dataset.tltype
    if ( tltype == 'all' ) {
      /*
      |  Cas spécial du menu "Tout afficher/Tout masquer"
      |
      | Quand 'on' => tout a été masqué
      */
      // Boucle sur toutes les timelines
      this.forEachTimeline(tl => this.toggleTimeline(tl, isOn))
      // Visibilité du slider
      this.toggleSlider(isOn)
      // On règle le menu
      div.innerHTML = '   ' + (isOn ? 'Tout masquer' : 'Tout afficher')
      div.dataset.state = isOn ? 'on' : 'off'
    } else if (tltype == 'zoom') {
      /*
      |  La règle de ZOOM
      */
      this.toggleSlider(isOn)
    } else {
      /*
      |  Cas d'un menu unique
      */      
      this.toggleTimeline(this.getTimeline(tltype), isOn)
    }
    /*
    |  Réglage et position des timelines
    */
    this.setHeightTimelinesAndTops()
  }

  static toggleSlider(isOn){
    const slider = this.Slider[0]
    const div = DGet(`.show-tl[data-tltype="zoom"]`)
    slider.classList[isOn?'remove':'add']('hidden')
    div.dataset.state = isOn ? 'on' : 'off'
    div.innerHTML = (isOn ? '✓' : '   ') + ' Zoom'
  }

  /**
   * Réglage de la hauteur de la bande des timelines et de la 
   * position de chaque timeline (règle graduée comprise) en fonction
   * de la visibilité de chaque timeline
   * 
   */
  static setHeightTimelinesAndTops(){
    var currentTop = 0
    DGetAll('.timeline', this.DivTimeline).forEach( div => {
      if ( div.classList.contains('hidden') ) return ;
      div.style.top = px(currentTop)
      currentTop += 20
    })
    this.DivTimeline.style.height = px(currentTop)
  }

  /**
   * Affichage (si +isOn+ true) ou masquage (si +isOn+ false) de la
   * +timeline+
   * 
   */
  static toggleTimeline(timeline, isOn){
    /*
    |  Affichage ou masquage de la timeline
    */
    timeline[isOn ? 'show' : 'hide'].call(timeline)
    /*
    |  On change le nom et l'état du menu
    */
    const div = DGet(`.show-tl[data-tltype="${timeline.type}"]`)
    var menuName = div.innerHTML.split(' ')
    menuName.shift()
    menuName = menuName.join(' ')
    div.innerHTML = (isOn ? '✓' : '   ') + ' ' + menuName
    div.dataset.state = isOn ? 'on' : 'off'
  }

  /**
   * Méthode appelée quand on active un menu pour se focaliser sur 
   * une partie précise du scénario
   * 
   */
  static onClickOnFocusPartie(div, e){
    const partie = div.dataset.partie
    const [start, end] = PARTIES_PFA[partie]
    this.Slider.slider('values', [start, end])
  }

  static observeTools(){
    const divTools = DGet('div#timelines-tools')
    const divMenus = DGet('div.menus', divTools)
    DGetAll('div.show-tl', divMenus).forEach( div => {
      div.addEventListener('click', this.onClickShowTypeTimeline.bind(this, div))
    })
    DGetAll('div.tl-show-part', divMenus).forEach(div => {
      div.addEventListener('click', this.onClickOnFocusPartie.bind(this,div))
    })
  }

  static createTimeline(type){
    return new Timeline({type: type})
  }

  static getTimeline(key){
    switch(key){
    case 'beats'  : return this.BeatsTimeline
    case 'seqs'   : return this.SequencesTimeline
    case 'abs'    : return this.AbsoluteTimeline
    case 'rels'   : return this.RelativeTimeline
    case 'ruler'  : return this.RegleGraduee
    }
  }

  static get DivTimeline(){
    return this._timeline || ( this._timeline = DGet('#timelines'))
  }
  static get BeatsTimeline(){
    return this._beatstl || (this._beatstl = this.createTimeline('beats'))
  }
  static get SequencesTimeline(){
    return this._seqtl || (this._seqtl = this.createTimeline('seqs'))
  }
  static get AbsoluteTimeline(){
    return this._abstl || (this._abstl = this.createTimeline('abs'))
  }
  static get RelativeTimeline(){
    return this._reltl || (this._reltl = this.createTimeline('rels'))
  }
  static get RegleGraduee(){
    return this._ruler || (this._ruler = this.getRuler())
  }
  static getRuler(){
    const rg = this.createTimeline('ruler')
    rg.setZoom = this.setZoomOnRegleGraduee.bind(this)
    return rg
  }


//##################################################################

  constructor(data){
    this.data = data
    this.type = data.type
  }

  get log(){ return this.constructor.log }

  prepare(top){
    this.obj.style.top = px(top)
  }

  cleanUp(){
    this.obj.innerHTML = ''
  }

  show(){ this.obj.classList.remove('hidden')}
  hide(){ this.obj.classList.add('hidden')}

  append(child){
    if ( this.obj ) {
      this.obj.appendChild(child)
    } else {
      this.log.error("Impossible de trouver this.obj de la règle :")
      console.error(this)
    }
  }

  get obj(){
    return this._obj || (this._obj = DGet(`div#timeline-${this.type}`))
  }

  /**
   * Zoomer dans la Timeline
   *
   */
  setZoom(params){
    this.obj.style.transform = `scaleX(${params.scale}) translate(${params.left})`
  }



} // class Timeline



//##################################################################


class SceneTimeline {
  constructor(scene){
    this.scene = scene
  }

  get log(){
    return this._log || (this._log = new LogClass('SceneTimeline'))
  }

  positionne(){
    // Scène absolue
    this.objAbs.style.left  = px(this.leftAbs)
    this.objAbs.style.width = px(this.widthAbs)
    if ( this.scene.color ) {
      this.objAbs.style.backgroundColor   = this.scene.color
      this.objAbs.style.borderBottomColor = this.scene.color
    }
    // Scène relative
    this.objRel.style.left  = px(this.leftRel)
    this.objRel.style.width = px(this.widthRel)
    if ( this.scene.color ) {
      this.objRel.style.backgroundColor   = this.scene.color
      this.objRel.style.borderBottomColor = this.scene.color
    }
  }

  setSelected(){
    this.objAbs.classList.add('selected')
    this.objRel.classList.add('selected')
  }
  unsetSelected(){
    this.objAbs.classList.remove('selected')
    this.objRel.classList.remove('selected')
  }

  build(){
    /*
    | La scène en position absolue
    */
    this.objAbs = DCreate('DIV',{class:'tlscene', id:`tlscene-abs-${this.scene.id}`})
    Timeline.AbsoluteTimeline.append(this.objAbs)
    
    /*
    | La scène en position relative
    */
    this.objRel = DCreate('DIV', {class:'tlscene', id:`tlscene-rel-${this.scene.id}`})
    Timeline.RelativeTimeline.append(this.objRel)

    this.positionne()

    this.observe()
  
  }

  // --- MÉTHODE D'OBSERVATION ---

  observe(){
    this.objAbs.addEventListener('click', this.onClickScene.bind(this, this.objAbs))
    this.objRel.addEventListener('click', this.onClickScene.bind(this, this.objRel))
    this.objAbs.addEventListener('dblclick', this.onDblClickScene.bind(this, this.objAbs))
    this.objRel.addEventListener('dblclick', this.onDblClickScene.bind(this, this.objRel))
    this.objAbs.addEventListener('mouseover', this.onSurvoleScene.bind(this, this.objAbs))
    this.objRel.addEventListener('mouseover', this.onSurvoleScene.bind(this, this.objRel))
    this.objAbs.addEventListener('mouseout', this.onMouseOut.bind(this, this.objAbs))
    this.objRel.addEventListener('mouseout', this.onMouseOut.bind(this, this.objRel))
  }

  /**
   * Quand on clique sur la marque de la scène, on l'affiche et on 
   * la sélectionne dans le previewer courant
   * 
   */ 
  onClickScene(obj, e){
    Preview.current.showScene(this.scene, /* la sélectionner */ true)
    return stopEvent(e)
  }

  /**
   * Un double click sur la marque de la scène l'affiche et la
   * met en édition dans la console courante.
   * 
   */
  onDblClickScene(obj, e){
    Preview.current.showScene(this.scene)
    this.scene.edit()
  }

  /**
   * Quand on passe la souris sur la marque de la scène, on affiche
   * son résumé ou le début de son texte
   * 
   */
  onSurvoleScene(obj, e){
    if ( this.tooltipIsDisplayed ) return stopEvent(e)
    this.tooltipIsDisplayed = true
    this.tooltip = Tooltip.new(this.scene.f_summary).attachTo(obj)
    return stopEvent(e)
  }
  onMouseOut(obj,e){
    if (this.tooltip){
      this.tooltip.remove()
      delete this.tooltip
    }
    this.tooltipIsDisplayed = false
  }


  // --- MÉTHODES DE CALCUL ---

  get leftAbs(){
    if ( this.scene.page ) {
      // console.log("this.scene.page = %i / left = %i", this.scene.page, this.scene.page * this.Ratio + 1)
      return this.scene.page * this.Ratio + 6
    } else if ( this.scene.index == 0 ) {
      /*
      |   La toute première, si elle n'est pas pagée
      */
      return 0 + 6
    } else {
      /*
      |   Si la scène ne définit pas sa page, il faut la placer juste 
      |   après sa scène précédente (if any) 
      */
      if ( this.scene.previousScene) {
        return this.scene.previousScene.timelineScene.rightAbs
      } else {
        this.log.warn("Impossible d'obtenir la scène précédente de :")
        console.warn(this.scene)
        this.log.warn("Pour info, Scenario.current.scenes et l'index recherchés sont : ")
        console.warn(Scenario.current.scenes, this.scene.index - 1)
      }
    }
  }
  get leftRel(){
    var pagesCount = 0.0
    const sceneIndex = this.scene.index
    for (var idx = 0; idx < sceneIndex; ++idx) {
      pagesCount += parseFloat(Scenario.current.scenes[idx].PagesCount)
      // console.log("pagesCount = ", pagesCount)
    }
    // console.log("[leftRel] scène #%i, à la page %s => left = %s", this.scene.index, pagesCount, pagesCount * this.Ratio)
    return pagesCount * this.Ratio + 6
  }
  get widthAbs(){
    return (this.scene.duree || 1) * this.Ratio
  }
  get rightAbs(){
    return this.leftAbs + this.widthAbs
  }
  get widthRel(){
    // console.log("Durée relative de la scène #%i = %s / ratio = %s =>  width = %s", this.scene.index, this.scene.relativeDuree, this.Ratio, this.scene.relativeDuree * this.Ratio)
    let w = this.scene.relativeDuree * this.Ratio
    if ( w < 4 ) w = 4
    return w
  }

  get Ratio(){
    return Timeline.Ratio
  }

} // class SceneTimeline
