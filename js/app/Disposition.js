'use strict';
/**
 * class Disposition
 * ------------------
 * Gère la disposition courante des cadres
 * 
 * Une instance {Disposition}, instanciée par son index (et donc ses
 * données dans DATA_DISPOSITIONS) permet de gérer la disposition
 * courante des cadres à l'écran
 */

class Disposition {

  static get log(){
    return this._log || (this._log = new LogClass('InsideTest'))
  }

  static get items(){return this._items || (this._items = {})}


  /**
   * Raccourci pour obtenir le cadre courant d'un quart
   * 
   * "Raccourci" dans le sens où on prend le cadre dans la disposition
   * courante.
   */
  static cadre(quart){
    return this.current.cadre(quart)
  }

  /**
   * Appelée au tout démarrage de l'application, avant même qu'un
   * scénario soit chargé.
   *
   */
  static prepare(){
    this.log.in('::prepare')
    /*
    |   Construction des boutons qui vont permettre de choisir une
    |   disposition.
    */
    this.buildButtonsDispositions()
    /*
    |   On observe les boutons de changement de disposition
    */
    this.observeButtonsDispositions()
    /*
    |   Disposition des "cadres" dans l'interface. Au démarrage,
    |   c'est toujours la disposition #0 qui est appliquée, c'est-à-
    |   dire la disposition par défaut.
    */
    this.dispositionApply(1 /* dispoKey */)
    /*
    |   Confirmation de la préparation réussie
    */
    this.isPrepared = true

    this.log.out('::prepare')
    return this // chainage
  }

  /**
   * Méthode qui applique la disposition choisie
   * 
   * Cette disposition peut être définie par une clé seulement (lors-
   * qu'elle est choisie la première fois) et/ou par un identifiant
   * unique de disposition.
   * 
   * @param dispoKey {Integer}  Index-clé dans DATA_DISPOSITIONS
   * @param dispoId  {Integer}  Index dans les disposition propres au
   *                            scénario courant.
   *                            NULL si c'est la définition d'une 
   *                            nouvelle définition.
   */
  static dispositionApply(dispoKey, dispoId){
    this.log.in('::dispositionApply(dispoKey = '+dispoKey+', dispoId = '+dispoId+')')
    
    this.current && this.current.hide()

    /*
    |  On affine toujours les dimensions du container principal
    |  en fonction de la taille de l'interface (fenêtre)
    */
    this.affineContainerSize()

    /*
    |  On prend la disposition créée ou on en crée une nouvelle.
    |
    |  Si cette disposition existe déjà, on la prend (par 'get')
    |  sinon on l'instancie.
    */
    if ( this.get(dispoId, dispoKey) ) {
      this.current = this.get(dispoId, dispoKey)
    } else {
      const dispoData = Scenario.current.dispositions[dispoId]
      this.current = new DefinedDisposition(dispoData)
    }
    this.current.isBuilt || this.current.build()

    /*
    |   Affichage du bouton de la disposition courante
    */
    this.activePictoDispo(dispoKey)

  }

  /**
   * Affinement de la dimension du conteneur de cadre (disposition) 
   * en fonction de la taille de la fenêtre de l'application.
   * 
   */
  static affineContainerSize(){
    this.mainContainer.style.height = `${UI.Height - UI.TimelineHeight}px`
    this.mainContainer.style.width  = `${UI.Width  - UI.ToolsbarWidth - 12}px`    
  }

  /**
   * Activation du picto de la disposition de clé dispoKey
   * 
   * Cela consiste à masquer tous les autres
   */
  static activePictoDispo(dispoKey){
    DGetAll('.picto-dispo',this.btnDispo).forEach(s => s.classList.add('hidden'))
    DGet(`div[data-dispo-key="${dispoKey}"]`, this.btnDispo).classList.remove('hidden')
  }

  /**
   * @return la Disposition d'identifiant +dispoId+
   * 
   * Une disposition est caractérisée par : 
   *  - une clé (clé dans la table DATA_DISPOSITIONS)
   *  - des {Cadre}s (fixes, en fonction de la disposition)
   *  - des {InCadre}s qui définissent le contenu de la disposition. 
   * 
   */
  static get(dispoId, dispoKey){
    if ( dispoId ) {
      return this.items[dispoId]
    } else {
      DATA_DISPOSITIONS[dispoKey] || raise(tp(ERRORS.disposition.unknown, [dispoKey]))
      return new Disposition(dispoKey)
    }
  }

  /**
   * Destruction de tous les contenus des cadres (1)
   * 
   * (1)  Attention, cette méthode n'est pas encore utilisée. Normale-
   *      ment elle est inutile puisque les dispositions contiennent
   *      seulement des informations générales.
   */
  static resetAll(){
  }


  // ---------- DOM OBJECTS ----------

  // Bouton pour changer la disposition des cadres
  static get btnDispo(){
    return this._btndispo || (this._btndispo = DGet('button#cadres-disposition'))
  }

  static get mainContainer(){
    return this._maincont || (this._maincont = DGet('section#cadres_container'))
  }

  // ------------ VOLATILES PROPERTIES ----------------

  static get Height() {return UI.Height - UI.TimelineHeight - DOUBLE_BORDER_WIDTH}
  static get Width()  {return UI.Width  - UI.ToolsbarWidth - DOUBLE_BORDER_WIDTH}
  static get height() {return this.mainContainer.offsetHeight}
  static get width()  {return this.mainContainer.offsetWidth}

  // ------- MÉTHODES D'OBSERVATION --------

  /**
   * Observation des boutons de changement de disposition
   * 
   * Note : il y a deux types de boutons : ceux qui initient une
   * nouvelle configuration générale et ceux qui applique une confi-
   * guration déjà définie.
   * 
   */
  static observeButtonsDispositions(){
    DGetAll('.mini-cadres', this.btnDispo).forEach( picto => {
      picto.addEventListener('click', this.onClickPictoDisposition.bind(this, picto))
    })
  }

  /**
   * Quand on clique sur un bouton de disposition pour la choisir
   * 
   */
  static onClickPictoDisposition(picto, e){
    const dispoKey = picto.dataset.dispoKey
    const dispoId  = picto.dataset.dispoId // vide si général
    this.dispositionApply(dispoKey, dispoId)
    return stopEvent(e)
  }

  // ------ MÉTHODES DE DOM ------


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

  /**
   * Fabrication des boutons pour les dispositions
   * 
   */
  static buildButtonsDispositions(){
    const mainBtn = DGet('button#cadres-disposition')
    const modele = DGet('#modele-mini-cadre.mini-cadres')
    for (var dispoKey in DATA_DISPOSITIONS ) {
      const dDispo = DATA_DISPOSITIONS[dispoKey]
      const name   = dDispo.name
      const btn = modele.cloneNode(true)
      btn.id = `btn-mini-cadre-${dispoKey}`
      btn.dataset.dispoKey = dispoKey
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



//###################################################################



  constructor(dispoKey){
    this.Klass    = 'Disposition'
    this.dispoKey = dispoKey
    this.data     = DATA_DISPOSITIONS[dispoKey]
  }

  get log(){ return this.constructor.log }

  build(){
    /*
    |   Instantiation des cadres
    */
    this._cadres || this.instancieCadres()
    /*
    |  Le container principal de la disposition
    */
    this.container = DCreate('DIV', {class:'disposition', id:this.domId})
    Disposition.mainContainer.appendChild(this.container)
    /*
    |  Construction de ses cadres (see below)
    */
    this.buildCadres()
    /*
    |  Building is done
    */
    this.isBuilt = true
  }

  buildCadres(){
    this.forEachCadre( cadre => cadre.build().observe() )
  }

  /**
   * Masquer la disposition 
   */
  hide(){
    this.container.classList.add('hidden')
  }
  /**
   * Afficher la disposition
   */
  show(){
    this.container.classList.remove('hidden')
  }

  /**
   * Pour appliquer à chaque cadre de la disposition
   * 
   * @param method  {String} La méthode InCadre à appeler sur chaque contenu
   *                {Function} La fonction à laquelle il faut envoyer le contenu {InCadre}
   */
  forEachCadre(method){
    Object.values(this.cadres).forEach( cadre => {
      if ( 'string' == typeof method ) {
        cadre[method].call(cadre)
      } else /* une fonction */ { 
        method.call(null, cadre)
      }
    })
  }

  /**
   * Retourne le cadre {Cadre} qui se trouve sur le quart +quart+ de
   * la disposition.
   */
  cadre(quart){ return this.cadres[quart] }

  /**
   * @return le contenu {InCadre} qui se trouve sur le quart +quart+
   * de la disposition.
   */
  incadre(quart){
    return this.cadres[quart].incadre
  }

  get cadres(){ return this._cadres }

  get domId(){
    return this._domId || (this._domId = `disposition-${this.dispoKey}`)
  }

  instancieCadres(){
    this._cadres = {}
    this.data.cadres.map( dcadre => {
      const cadre = new Cadre(Object.assign(dcadre, {disposition: this}))
      Object.assign(this._cadres, {[dcadre.id]: cadre})
    })
  }

}//class Disposition


/**
 * #################################################################
 * 
 * Class DefinedDisposition < Disposition
 * 
 * Deal with defined dispositions (properties of Scenario).
 * 
 */
class DefinedDisposition extends Disposition {

  /**
   * Instantiation de la disposition définie
   * 
   */
  constructor(dispoData){
    super(dispoData.dispoKey)
    this.Klass = 'DefinedDisposition'
    this.dispoId = dispoData.dispoId
  }


  get domId(){
    return this._domId || (this._domId = `disposition-${this.dispoKey}-${this.dispoId}`)
  }

}

window.onresize = Disposition.onResizeWindow.bind(Cadre)

// Raccourci (pour les fonctions d'ajustement des dimensions)
function cadre(key){
  return Disposition.cadre(key)
}
