'use strict';
/**
 * Pour des tests directement dans les fichiers (ou pas, d'ailleurs)
 * 
 * Consulter le manuel "InsideTest_Manuel" qui doit se trouver dans
 * tout dossier Manuel d'une application utilisant cette librairie
 * 
 * @require JString  (common.js)
 * @require INSIDE_TESTS {Boolean}
 * 
 */

class HTMLPageClass {
  contains(selector, innerText){
    const element = document.querySelector(selector)
    var regexp
    if ( innerText ) {
      regexp = new RegExp(innerText)
    }
    return (element instanceof HTMLElement) && (
      not(innerText) || element.innerHTML.match(regexp)
    )
  }
}
export const page = new HTMLPageClass()

class MouseClass {
  clickOn(selector){
    document.querySelector(selector).click()
  }
}
export const mouse = new MouseClass()



export class InsideTest {

  static get log(){
    return this._log || (this._log = new LogClass('InsideTest'))
  }
  /**
   * Test courant
   */
  static get current()  { return this._current }
  static set current(t) { this._current = t    }

  static set error(err){
    this.current.error = err
  }

  /**
   * Pour jouer tous les tests
   * 
   */
  static run() {
    if ( INSIDE_TESTS ){ 
      this.resetCounters()
      this.runStack()
      this.stopCounters()
      this.report()
    }
  }

  static resetCounters(){
    this.nombreTests    = 0
    this.nombreFailures = 0
    Log.test('=== DÉBUT DES TESTS ===')
    this.startTime = new Date().getMilliseconds()
  }
  static stopCounters(){
    this.endTime = new Date().getMilliseconds()
  }
  static report(){
    const nombreSucces = this.nombreTests - this.nombreFailures
    const hasFailures = this.nombreFailures > 0
    const duration = String(this.endTime - this.startTime) + ' ms';
    let style = 'display:block;width:100%;border-top:1px solid;color:'+(hasFailures?'red':'green')+';'
    console.log('%c' + `Durée: ${duration}` + '%c' + `INSIDE-TESTS\nTests: ${this.nombreTests} - Succès: ${nombreSucces} - Échecs: ${this.nombreFailures}`, 'float:right;font-style:italic;font-size:0.85em;padding-right:8em;', style)
  }

  static addToStack(test){
    if (undefined == this.stack) { this.stack = [] }
    this.stack.push(test)
  }

  /**
   * Une fois que tout est prêt, on peut appeler les tests
   * 
   */
  static runStack(){
    const my = this
    if ( undefined == this.stack || this.stack.length == 0) {
      return console.warn("Aucun inside-test n'est à jouer.")
    } else {
      this.log.debug("Nombre d'inside-tests à jouer : " + this.stack.length)
    }
    // Sinon, on joue les piles de chaque test
    this.stack.forEach( test => {
      my.current = test
      test.runStack() 
    })
  }

  static get Factory(){
    return this._factory || (this._factoy = new ITFactory() )
  }

  static get FAKE_EVENT(){
    return {stopPropagation:function(){}, preventDefault:function(){}}
  }

  //################################################################


  constructor(data){
    this.data   = data
    this.sujet  = data.sujet
    this.error  = data.error
    this.eval   = data.eval
    // Pour les tests de InsideTest seulement (cf. en bas de page)
    this.noconsole = data.noconsole 
    this.stack = []
    if ( INSIDE_TESTS ) { this.constructor.addToStack(this) }
  }

  runStack(){
    this.stack.forEach( dtest => {
      try {      
        const [test, args] = dtest
        if ( args ) {
          test.call(null, ...args)
        } else {
          test.call(null)
        }
        this.constructor.nombreTests += 1
      } catch (err) {
        console.error("ERREUR SYSTÈME : ", err)
        this.throwError("ERREUR SYSTÈME")
      }
    })
  }

  addStack(test, args){
    this.stack.push([test, args])
  }  

  reset(){
    this.errorMsg = null
  }

  /**
   * Exécution du test avec le sujet +sujet+
   */
  with(sujet, expected){
    if ( undefined === expected ) {    
      this.addStack(function(sujet){
        this.reset()
        this.eval.call(this, sujet) || this.throwError(false, sujet)
      }.bind(this), [sujet])
    } else {
      this.withExpected(sujet, expected)
    }      
    return this; // chainage
  }
  /**
   * Compare l'égalité
   */
  equal(sujet, expected){
    this.addStack(function(){
      const actual = JString(this.eval.call(null, sujet))
      expected = JString(expected)
      actual == expected || this.throwError(false, JString(sujet), expected, actual)
    }.bind(this), [sujet, expected])
    return this // chainage
  }

  /**
   * Exécution négative avec le sujet +sujet+
   */
  withNegate(sujet, expected){
    if ( undefined === expected) {
      this.addStack(function(){
        this.reset()
        this.eval.call(null, sujet) && this.throwError(true, sujet)
      }.bind(this), [sujet])
    } else {
      return this.withExpectedNegate(sujet,expected)
    }
    return this; // chainage
  }
  /**
   * Exécution sur le sujet +sujet+ avec la valeur attendu +expected+
   * 
   */
  withExpected(sujet, expected){
    this.addStack(function(){
      this.reset()
      const resultat = this.eval.call(null, sujet, expected)
      const value    = this.eval.value
      resultat == expected || this.throwError(false, sujet, expected, value)
    }.bind(this), [sujet, expected])
    return this; // chainage
  }
  /**
   * Inverse de la précédente
   * 
   */
  withExpectedNegate(sujet, expected){
    this.addStack(function(){
      this.reset()
      const resultat = this.eval.call(null, sujet, expected)
      const value    = this.eval.value
      resultat != expected && this.throwError(true, sujet, expected, value)    
    }.bind(this), [sujet, expected])
    return this; // chainage
  }
  /**
   * Exécution du test sans sujet
   * 
   */
  exec(){
    this.addStack(function(){
      this.reset()
      this.eval.call() || this.throwError(false)
    }.bind(this))
    return this; // chainage
  }
  execNegate(){
    this.addStack(function(){
      this.reset()
      this.eval.call() && this.throwError(true)
    }.bind(this))
    return this; // chainage
  }

  set error(err) { 
    if ( undefined == this._error ) { this._error = []}
    this._error.push(err)
  }
  get error() { 
    if ( undefined == this._error ) return null ;
    return this._error.join("\n")
  }

  throwError(negate, sujet, expected, actual){
    this.constructor.nombreFailures ++
    const prefix = "[INSIDE_TEST] "
    let msg = this.error;
    if ( sujet && not(msg.match('%{sujet}')) ) {
      msg = '««« %{sujet} »»» ' + msg
    }
    var table_remp = negate ? TABLES_SHOULDNT : TABLES_SHOULD
    Object.assign(table_remp, {sujet: JString(sujet)})
    msg = tp(msg, table_remp)
    if ( expected ) {
      msg += "\n" + 'Attendu : ' + JSON.stringify(expected)
      if ( actual ) msg += "\n" + 'Obtenu  : ' + JSON.stringify(actual)
    }
    msg = prefix + msg
    // Sorti du message en console
    this.noconsole || console.error(msg)
    this.errorMsg = msg // pour les tests d'InsideTest (cf. ci-dessous)
  }

}
const TABLES_SHOULD = {
    'devrait':  'devrait'
  , 'doit':     'doit'
}
const TABLES_SHOULDNT = {
    'devrait':  'ne devrait pas'
  , 'doit':     'ne doit pas'
}
