'use strict';

class Cadre {

  static get log(){
    return this._log || (this._log = new LogClass('Cadre'))
  }

  /**
   * Appelé au démarrage
   * 
   */
  static prepare(){
    this.log.in('prepare')
    /*
    |  Construction des boutons
    */
    this.buildButtonsDispositions()
    /*
    | Disposition des "cadres" dans l'interface
    */
    this.dispose(CONFIG.disposition.index)
    /*
    |  Observation des boutons pour changer de disposition
    */
    DGetAll('.mini-cadres', this.btnDispo).forEach( picto => {
      picto.addEventListener('click', this.onClickPictoDisposition.bind(this, picto))
    })

    this.log.out('prepare')
  } // prepare


  /**
   * Méthode qui fabrique les boutons pour les dispositions
   * 
   */
  static buildButtonsDispositions(){
    const mainBtn = DGet('button#cadres-disposition')
    const modele = DGet('#modele-mini-cadre.mini-cadres')
    for (var idispo in CADRES_DISPOSITIONS ) {
      const dDispo = CADRES_DISPOSITIONS[idispo]
      const name   = dDispo.name
      const btn = modele.cloneNode(true)
      btn.id = `btn-mini-cadre-${idispo}`
      btn.dataset.index = idispo
      mainBtn.appendChild(btn)

      dDispo.cadres.forEach( dCadre => {
        const VT = DGet('div.cross-VT', btn)
        const VB = DGet('div.cross-VB', btn)
        const HL = DGet('div.cross-HL', btn)
        const HR = DGet('div.cross-HR', btn)

        switch(dCadre.quarts.join('')) {
        case TL:
          this.showCross([VT, HL])
          break
        case TL+TR:
          this.showCross([HL, HR])
          break
        case TR:
          this.showCross(HR)
          break
        case TL + BL:
          this.showCross([VT, VB])
          break
        case BL:
          this.showCross(VB)
          break
        }
      })
    }
  }

  static showCross(liste){
    if ( not(liste.length) ) liste = [liste]
    liste.forEach(cross => cross.classList.remove('hidden'))
  }

  /**
   * Méthode qui applique la disposition choisie (dispositionIndex)
   * 
   */
  static dispose(dispositionIndex){
    this.log.in('::dispose(dispositionIndex = '+dispositionIndex+')')
    
    this.reset()
    this.container.innerHTML = ''
    this.affineContainerSize()

    /*
    |  On crée une nouvelle disposition
    */
    this.Dispo = new Disposition({index:dispositionIndex, previousDispo:this.Dispo})
    this.Dispo.build()

    /*
    |   Affichage du bouton de la disposition courante
    */
    this.activePictoDispo(dispositionIndex)
    this.log.debug("= Disposition des cadres effectuée : ", this.Dispo)
  }

  static reset(){
    // Masquer tous les contenus éventuels
    this.Dispo && this.Dispo.hideContents()
  }

  static affineContainerSize(){
    this.container.style.height = `${UI.Height - UI.TimelineHeight}px`
    this.container.style.width  = `${UI.Width  - UI.ToolsbarWidth - 12}px`    
  }
  /**
   * Méthode appelée après un redimensionnement pour affiner le
   * positionnement des cadres
   * 
   * Chaque cadre de chaque disposition définit dans sa propriété
   * :adjust la fonction à appeler pour ajuster les positions.
   */
  static affineDisposition(){
    let other, cadre, diff ;
    this.affineContainerSize()

    this.currentDispositionData.cadres.forEach(cadreData => {
      cadreData.adjust.call()
    })
  }

  /**
   * Deux méthodes qui servent au resizing des cadres
   * 
   */
  static alignVerticalBord(ref, dst){
    this.cadre(dst).setLeft(this.cadre(ref).right).setRight(this.Width)
  }
  static alignHorizontalBord(ref, dst){
    this.cadre(dst).setTop(this.cadre(ref).bottom).setBottom(this.Height)
  }

  /**
   * Quand on clique sur un bouton de disposition pour la choisir
   * 
   */
  static onClickPictoDisposition(picto, e){
    this.dispose(picto.dataset.index)
    return stopEvent(e)
  }


  /**
   * Méthode appelée quand on redimensionne la fenêtre
   * 
   */
  static onResizeWindow(e){
    if ( !this.Dispo ) return stopEvent(e)
    let cadreTR = this.Dispo.cadre(TR)
    let cadreBL = this.Dispo.cadre(BL)
    let cadreBR = this.Dispo.cadre(BR)
    // if ( cadreBL == cadreBR ) cadreBR = null ;

    if ( undefined == this.initWidth) {
      this.initWidth  = UI.Width
      this.initHeight = UI.Height
      this.cadreTRInitWidth   = cadreTR.width
      this.cadreBLInitHeight  = cadreBL.height
      this.cadreBRInitHeight  = cadreBR.height
      this.cadreBRInitWidth   = cadreBR.width
    }

    const diffWidth  = UI.Width - this.initWidth
    const diffHeight = UI.Height - this.initHeight

    if ( diffWidth ) {
      cadreTR.setWidth(this.cadreTRInitWidth + diffWidth)
      cadreBR.setWidth(this.cadreBRInitWidth + diffWidth)
    }
    if ( diffHeight ) {
      cadreBL.setHeight(this.cadreBLInitHeight + diffHeight)
      cadreBR.setHeight(this.cadreBRInitHeight + diffHeight)
    }

  }

  static activePictoDispo(dispoIndex){
    DGetAll('.picto-dispo',this.btnDispo).forEach(s => s.classList.add('hidden'))
    DGet(`div[data-index="${dispoIndex}"]`, this.btnDispo).classList.remove('hidden')
  }

  // Bouton pour changer la disposition des cadres
  static get btnDispo(){
    return this._btndispo || (this._btndispo = DGet('button#cadres-disposition'))
  }

  // Retourne le cadre voulu.
  // Par exemple this.cadre(BR) pour retourner le cadre bottom-right
  static cadre(quart)   { return this.Dispo.cadre(quart)   }

  // Retourne le contenu d'un cadre (console, preview, etc.)
  // Par exemple this.content(BL) pour le contenu du bottom-left
  static content(quart) { return this.Dispo.content(quart) }
  
  static get container(){
    return this._cont || (this._cont = DGet('section#cadres_container'))
  }
  static get Height() {return UI.Height - UI.TimelineHeight - DOUBLE_BORDER_WIDTH}
  static get Width()  {return UI.Width  - UI.ToolsbarWidth - DOUBLE_BORDER_WIDTH}
  static get height() {return this.container.offsetHeight}
  static get width()  {return this.container.offsetWidth}



//###################################################################



constructor(data){
  this.data     = data
  this.quarts   = data.quarts  // cf. DATA_DISPOSITIONS
}

get log(){ return this.constructor.log }

/**
 * Pour connaitre le cadre
 */
get inspect(){
  return this._inspect || (this._inspect = `Cadre #${this.id}`)
}

/**
 * Construction du cadre
 */
build(params){
  this.log.in('#build(params='+ JString(params) + ')')
  this.obj = DCreate('DIV', {class:'cadre', id:`cadre-${this.id}`})
  // console.log("Fenêtre %s width = %s height = %s", this.content, this.width, this.height)
  Cadre.container.appendChild(this.obj)
  this.positionne()
  this.buildContent(params.previousContent)
}

/**
 * 
 * Définir le contenu du cadre (appelée par les boutons de type
 * de contenu dans la barre d'outil de chaque contenu (*))
 * (*) Pas très logique/sémantique, mais bon… Plus tard, ces 
 * boutons pourront être plutôt attachés au cadre qu'au contenu
 * 
 * Principes
 * ---------
 * - si le type de contenu n'ex
 * 
 */
setContent(typeContent){
  this.log.in('#setContent(typeContent = ' + typeContent + ')')
  /*
  |  On efface le contenu courant
  */
  this.cleanUp()
  /*
  |  Existe-t-il un content de ce type non utilisé par un cadre ?
  */
  var incadre ;
  ;(InCadre.allByType[typeContent]||[]).forEach(content => {
    if ( incadre /* on l'a trouvé */) return 
    if ( ! content.cadre ) { incadre = content }
  })

  /*
  |  S'il n'existe pas de contenu non utilisé de ce type, j'en
  |  instancie un nouveau
  */
  if ( !incadre ) {
    incadre = InCadre.get(typeContent, this)
  }
  console.log("incadre =", incadre)
  /*
  |  On peut mettre ce contenu dans le cadre et le régler
  */
  this.buildContent(incadre)
  /*
  |  Observation (notamment pour changer la taille)
  */
  this.observe()

}

cleanUp(){
  // this.unobserve()
  this.obj.innerHTML = ''
  this.content.cadre = null // dissocier le contenu InCadre du Cadre
}

/**
 * 
 * Construire le contenu du cadre (à partir d'un contenu existant
 * ou un nouveau contenu)
 * 
 */
buildContent(incadre){
  this.log.in('#buildContent(incadre = ' + (incadre?incadre.inspect:'null') + ')')
  if ( incadre ) {
    incadre.cadre = this
  } else {
    incadre = InCadre.get(this.data.defaultContent, this)
  }
  if ( incadre.section ) {
    console.log("Section ajoutée au cadre (incadre.section) : ", incadre.section)
    this.obj.appendChild(incadre.section)
  } else {
    incadre.buildIn(this.obj)
  }

  incadre.show()
  incadre.adjustSize()

  this.content  = incadre
}

adjustContent(){
  this.content && this.content.adjustSize()
}

observe(){
  if ( this.data.resizing ) {  
    $(this.obj).resizable({
        resize:   this.data.resizing.bind(this)
      , handles:  this.data.handles
    })
  }
}
// unobserve(){
//   if ( this.data.resizing ) {
//     this.obj && $(this.obj).resizable( "option", "disabled", true );
//   }
// }

positionne(){
  this.log.debug('Position du cadre N°' + this.id + ' ' + JString({
      left:this.left, top:this.top, width:this.width, height:this.height
    }))
  this.obj.style.left   = this.expectedLeft
  this.obj.style.top    = this.expectedTop
  this.obj.style.width  = this.expectedWidth
  this.obj.style.height = this.expectedHeight
}

setWidth(v)  { 
  this.obj.style.width  = px(v)
  this.content && this.content.setWidth(v)
  return this
}
setHeight(v) { 
  this.obj.style.height = px(v)
  this.content && this.content.setHeight(v)
  return this
}
setTop(v)    { 
  this.obj.style.top = px(v)
  this.content && this.content.setTop(v) // normalement inutile
  return this
}
setLeft(v)   { 
  this.obj.style.left = px(v)
  this.content && this.content.setLeft(v) // normalement inutile
  return this
}
setRight(v)  { 
  this.setWidth( v - this.left)
  this.content && this.content.setWidth(v - this.left)
  return this
}
setBottom(v) { 
  this.setHeight( v - this.top)
  this.content && this.content.setHeight(v - this.top)
  return this
}

/**
 * Les 4 dimensions left, top, width et height au départ
 * 
 */
get expectedLeft(){
  return px(this.isStartingAtLeft ? 0 : this.demiContainerWidth)
}
get expectedTop(){
  return px(this.isStartingAtTop ? 0 : this.demiContainerHeight)
}
get expectedWidth(){
  if ( this.isOnTheLeft || this.isOnTheRight ) {
    return px(this.demiContainerWidth)
  } else {
    return px(Cadre.Width)
  }
}
get expectedHeight(){
  if ( this.isOnTheTop || this.isOnTheBottom ){
    return px(this.demiContainerHeight)
  } else {
    return px(Cadre.Height)
  }
}

get demiContainerWidth(){
  return parseInt(Cadre.Width / 2 ,10)
}
get demiContainerHeight(){
  return parseInt(Cadre.Height / 2 ,10)
}

get left(){ return this.obj.offsetLeft }
get top(){ return this.obj.offsetTop }
get right(){return this.left + this.width}
get bottom(){return this.top + this.height}
get width(){return this.obj.offsetWidth }
get height(){return this.obj.offsetHeight}


/* --- States méthodes --- */

get isStartingAtTop()   { 
  if (undefined == this.isstarttop){
    this.isstarttop = [TL,TR].includes(this.quarts[0])
  }
  return this.isstarttop
}
get isStartingAtLeft()  { 
  if (undefined == this._isstartleft) {
    this._isstartleft =  [TL,BL].includes(this.quarts[0])
  }
  return this._isstartleft
}

get isOnTheLeft(){
  if (undefined == this._isonleft) {
    this._isonleft = [TL,BL].includes(this.lastQuart)
  }
  return this._isonleft
}
get isOnTheRight()    {
  if (undefined == this._isonright) {
    this._isonright = [TR,BR].includes(this.firstQuart)
  }
  return this._isonright
}
get isOnTheTop()      { 
  if (undefined == this._isontop) {
    this._isontop = [TL,TR].includes(this.lastQuart)
  }
  return this._isontop
}
get isOnTheBottom()   { 
  if (undefined == this._isonbot) {
    this._isonbot = [BL,BR].includes(this.firstQuart)
  }
  return this._isonbot
}


// -- Méthodes de données --

get id() { return this.data.id }

get firstQuart(){
  return this._firstq || (this._firstq = this.quarts[0])
}
get lastQuart(){
  return this._lastq || (this._lastq = this.quarts[this.quarts.length-1])
}

build_and_observe(params){this.build(params);this.observe()}

}//class Cadre


//###################################################################


// Raccourci (pour les fonctions d'ajustement)
function cadre(key){return Cadre.cadre(key)}

window.onresize = Cadre.onResizeWindow.bind(Cadre)
