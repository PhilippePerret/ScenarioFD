'use strict';

class Cadre {

  static get log(){
    return this._log || (this._log = new LogClass('Cadre'))
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


//###################################################################



constructor(data){
  this.data         = data
  this.disposition  = data.disposition
  this.dispoId      = this.disposition.dispoId || this.disposition.dispoKey
  this.quarts       = data.quarts  // cf. DATA_DISPOSITIONS
}

get log(){ return this.constructor.log }

/**
 * Pour connaitre le cadre
 */
get inspect(){
  return this._inspect || (this._inspect = `Cadre #${this.id} de Dispo #${this.dispoId}`)
}

get domId(){
  return this._domId || (this._domId = `cadre-${this.dispoId}-${this.id}`)
}

/**
 * Construction du cadre
 */
build(params){
  this.log.in('#build(params='+ JString(params) + ')')
  this.obj = DCreate('DIV', {class:'cadre', id:this.domId})
  // console.log("Fenêtre %s width = %s height = %s", this.content, this.width, this.height)
  /*
  |  On met ce cadre dans le container principal des cadres et on
  |  le positionne.
  */
  this.disposition.container.appendChild(this.obj)
  this.positionne()
  this.buildInCadre()
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
setInCadre(typeContent){
  this.log.in('#setInCadre(typeContent = ' + typeContent + ')')
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
  this.buildInCadre(incadre)
  /*
  |  Observation (notamment pour changer la taille)
  */
  this.observe()

}

cleanUp(){
  // this.unobserve()
  this.obj.innerHTML = ''
  this.incadre.cadre = null // dissocier le contenu InCadre du Cadre
}

/**
 * 
 * Construire le contenu du cadre (à partir d'un contenu existant
 * ou un nouveau contenu)
 * 
 */
buildInCadre(incadre){
  this.log.in('#buildInCadre(incadre = ' + (incadre?incadre.inspect:'null') + ')')
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
function cadre(key){
  return Disposition.current.cadre(key)
}

window.onresize = Cadre.onResizeWindow.bind(Cadre)
