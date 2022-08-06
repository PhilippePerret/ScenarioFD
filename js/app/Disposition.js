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
    this.affineContainerSize()


    /*
    |  On prend la disposition créée ou on en crée une nouvelle.
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
    this.container.style.height = `${UI.Height - UI.TimelineHeight}px`
    this.container.style.width  = `${UI.Width  - UI.ToolsbarWidth - 12}px`    
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

  static get container(){
    return this._cont || (this._cont = DGet('section#cadres_container'))
  }

  // ------------ VOLATILES PROPERTIES ----------------

  static get Height() {return UI.Height - UI.TimelineHeight - DOUBLE_BORDER_WIDTH}
  static get Width()  {return UI.Width  - UI.ToolsbarWidth - DOUBLE_BORDER_WIDTH}
  static get height() {return this.container.offsetHeight}
  static get width()  {return this.container.offsetWidth}

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

  // ------ MÉTHODES DE CONSTRUCTION ------

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
    this.dispoKey = dispoKey
    this.data     = DATA_DISPOSITIONS[dispoKey]
  }

  get log(){ return this.constructor.log }

  build(){
    /*
    |  Le container principal de la disposition
    */
    this.container = DCreate('DIV', {class:'disposition', id:this.domId})
    Disposition.container.appendChild(this.container)

    this.buildCadres()

    this.isBuilt = true
  }

  buildCadres(){
    this.data.cadres.map( dcadre => {
      const cadre = new Cadre(Object.assign(dcadre, {disposition: this}))
      cadre.build_and_observe()
      const incadre = cadre.content
      /*
      |  On mémorise le contenu de chaque cadre
      */
      dcadre.quarts.forEach( quart => {
        Object.assign(this.quarts[quart], {cadre:cadre, content:incadre})
      })
      /*
      |  On mémorise les instances de contenus (instance de preview
      |  ou de console, etc.) pour pouvoir les remettre en cas de
      |  changement de disposition.
      */
      Object.assign(this.contents, {[incadre.type]: incadre})
    })
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
   * Pour appliquer à chaque contenu défini
   * (note : donc passe les contenus non définis)
   * 
   * @param method  {String} La méthode InCadre à appeler sur chaque contenu
   *                {Function} La fonction à laquelle il faut envoyer le contenu {InCadre}
   */
  forEachContent(method){
    Object.values(this.contents).forEach(incadre => {
      if ( !incadre ) return
      if ( 'string' == typeof method ) {
        incadre[method].call(incadre)
      } else /* une fonction */ { 
        method.call(incadre)        
      }
    })
  }

  /**
   * Retourne le cadre {Cadre} qui se trouve sur le quart +quart+ de
   * la disposition.
   */
  cadre(quart){
    return this.quarts[quart].cadre
  }

  /**
   * @return le contenu {InCadre} qui se trouve sur le quart +quart+
   * de la disposition.
   */
  content(quart){
    return this.quarts[quart].content
  }

  get quarts(){
    return this._quarts || (this._quarts = {
        [TL]: {cadre:null, content:null}
      , [TR]: {cadre:null, content:null}
      , [BL]: {cadre:null, content:null}
      , [BR]: {cadre:null, content:null}
    })
  }

  get contents(){
    return this._contents || (this._contents = {
        'preview':    null
      , 'console':    null
      , 'navigator':  null
      , 'panneau':    null
    })
  }


  get domId(){
    return this._domId || (this._domId = `disposition-${this.dispoKey}`)
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
    this.dispoId = dispoData.dispoId
  }


  get domId(){
    return this._domId || (this._domId = `disposition-${this.dispoKey}-${this.dispoId}`)
  }

}
