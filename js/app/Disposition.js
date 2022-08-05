'use strict';
/**
 * class Disposition
 * ------------------
 * Gère la disposition courante des cadres
 * 
 * Une instance {Disposition}, instanciée par son index (et donc ses
 * données dans CADRES_DISPOSITIONS) permet de gérer la disposition
 * courante des cadres à l'écran
 */

class Disposition {

  static get log(){
    return this._log || (this._log = new LogClass('InsideTest'))
  }

  /**
   * Destruction de tous les contenus des cadres (*)
   * 
   * (*) Attention, cette méthode n'est pas encore utilisée et elle
   *     fait planter l'app au chargement du scénario si elle est 
   *     utilisée.
   */
  static resetAll(){
    Cadre.Dispo.forEachContent('destroy')
  }

  constructor(params){
    this.index = params.index
    this.previousDispo = params.previousDispo
    this.log.debug('previousDispo = ' + this.previousDispo)
    this.data  = CADRES_DISPOSITIONS[this.index]
  }

  get log(){ return this.constructor.log }

  build(){
    this.buildCadres()
  }

  buildCadres(){
    this.data.cadres.map( dcadre => {
      const cadre = new Cadre(dcadre)
      cadre.build_and_observe({previousContent: (this.previousDispo && this.previousDispo.contents[dcadre.defaultContent])||this.contents[dcadre.defaultContent]})
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
   * Au changement de disposition, on doit masquer les contenus de la
   * disposition précédente, c'est avec cette méthode qu'on le fait.
   * 
   */
  hideContents(){
    this.forEachContent('hide')
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

}//class Disposition
