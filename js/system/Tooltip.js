'use strict';
/**
 * Pour accrocher des textes contextuels
 * 
 */

const TOOLTIP_WIDTH = 200

class Tooltip {

  // Comme Ruby
  static new(data){
    return new Tooltip(data)
  }


  constructor(text){
    this.text = text
  }

  /**
   * Pour attacher le texte à l'objet DOM +obj+
   * 
   */
  attachTo(obj, options){
    options = options || {}
    const div = DCreate('DIV', {class:'tooltip', text:this.text})
    /*
    |  Position gauche du tooltip
    */
    div.style.left = px(options.left || this.calcLeft(obj))
    /*
    |  Position haute du tooltip
    */
    const top = options.top || this.calcTop(obj)
    if ( top > 0 ) {
      div.style.top  = px(top)
    } else {
      div.style.bottom = px(- top)
    }
    /*
    |  Largeur du tooltip
    */
    div.style.width = px(TOOLTIP_WIDTH)
    /*
    |  On place le tooltip
    */
    document.body.appendChild(div)
    this.div = div

    return this //chainage
  }

  /**
   * Calcul de la position left à donner au tooltip
   * 
   */
  calcLeft(obj){
    const objData = this.objetPosition(obj)
    /*
    |  Calcul du bord à laisser à droite et à gauche
    |  (noter que ça fonctionne aussi bien si l'objet est plus large
    |   que le tooltip ou l'inverse)
    */
    const marges = (TOOLTIP_WIDTH - objData.width) / 2
    /*
    | Le tooltip ne doit pas déborder
    */
    var l = parseInt(objData.x - marges, 10)
    if ( l < 0 ) l = 0
    else if ( l + TOOLTIP_WIDTH > this.UIWidth) {
      l = this.UIWidth - TOOLTIP_WIDTH
    }
    return l
  }
  /**
   * Calcul de la position top à donner au tooltip
   *
   * À partir d'une certaine hauteur, on place le tooltip au-dessus,
   * sinon au-dessous. 
   * 
   * @return un nombre positif si le tooltip doit être placé 
   * au-dessous, un nombre négatif s'il doit être placé au-dessus
   */
  calcTop(obj){
    const objData = this.objetPosition(obj)
    if ( objData.y > (2 / 3) * this.UIHeight ) {
      return - (objData.y - 4)
    } else {
      return objData.bottom + 14
    }
  }

  /**
   * Retourne un object qui contient :
   * x / left   : la position gauche en pixel, quel que soit le zoom
   * y / top    : la position top en pixel, idem
   * bottom     : le bas en pixel
   * height     : la hauteur de l'objet, en pixel
   * width      : la largeur de l'objet, en pixel
   * right      : le bord droit de l'objet, en pixel
   * 
   */
  objetPosition(obj){
    return obj.getClientRects()[0]
  }

  remove(){
    this.div.remove()
  }


  get UIWidth() {return window.innerWidth}
  get UIHeight(){return window.innerHeight}
}
