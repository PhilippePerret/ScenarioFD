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




//###################################################################



constructor(data){
  this.Klass        = 'Cadre'
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
 * @return  l'InCadre de ce cadre. Soit celui défini la disposition
 *          (donc l'utilisateur) soit celui défini par défaut.
 * 
 */
get incadre(){
  return this._incadre || (this._incadre || this.getInCadre() )
}
getInCadre(){
  this.incadreType = this.data.incadreType || this.data.defaultInCadre
  return new InCadre(this.incadreType, this)
}

/**
 * Construction du cadre
 * ----------------------
 * Il s'agit du div.cadre qui va contenir le contenu de l'inCadre
 * (preview, console, fiter, etc.)
 * 
 */
build(params){
  this.log.in('#build(params='+ JString(params) + ')')
  this.obj = DCreate('DIV', {class:'cadre', id:this.domId})
  /*
  |  On met ce cadre dans le container principal des cadres et on
  |  le positionne.
  */
  this.disposition.container.appendChild(this.obj)
  /*
  |  On positionne le cadre (par défaut ou en fonction des derniers
  |  réglages définis par l'utilisateur)
  */
  this.positionne()
  /*
  |  Construction de son contenu, donc de son incadre
  */
  this.incadre.build().observe()
  /*
  |  Pour chainage
  */
  return this
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
setIncadre(typeContent){
  this.log.in('#setIncadre(typeContent = ' + typeContent + ')')
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
  this.buildIncadre(incadre)
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
buildIncadre(incadre){
  this.log.in('#buildIncadre(incadre = ' + (incadre?incadre.inspect:'null') + ')')
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
    return px(Disposition.Width)
  }
}
get expectedHeight(){
  if ( this.isOnTheTop || this.isOnTheBottom ){
    return px(this.demiContainerHeight)
  } else {
    return px(Disposition.Height)
  }
}

get demiContainerWidth(){
  return parseInt(Disposition.Width / 2 ,10)
}
get demiContainerHeight(){
  return parseInt(Disposition.Height / 2 ,10)
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

}//class Cadre


//###################################################################


// Raccourci (pour les fonctions d'ajustement)
function cadre(key){
  return Disposition.cadre(key)
}
