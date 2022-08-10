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

class InsideTest {

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
    if ( INSIDE_TESTS ){ this.runStack() }
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
      console.info("Nombre d'inside-tests à jouer : %i", this.stack.length)
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
      const [test, args] = dtest
      if ( args ) {
        test.call(null, ...args)
      } else {
        test.call(null)
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
      this.addStack(function(sujet, expected){
        this.reset()
        this.eval.call(null, sujet) || this.throwError(false, sujet)
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


//##################################################################
var test, resultat

// Soit un test simple (sans sujet)

if ( INSIDE_TESTS ) {

// Soit un test avec un sujet
test = new InsideTest({
    noconsole:  true
  , error:      '%{devrait} être égal à 4'
  , eval:       function(sujet){ return sujet == 4 }
})
// try {
//   resultat = test.with(4).errorMsg
//   if ( resultat != null ) throw "devrait être OK avec #with (retourne : " + resultat + ")"
//   resultat = test.with(5).errorMsg
//   if ( resultat != '««« 5 »»» devrait être égal à 4') throw "mauvais message avec with : " + resultat
//   resultat = test.withNegate(4).errorMsg
//   if ( resultat != '««« 4 »»» ne devrait pas être égal à 4') throw "mauvais message avec withNegate : " + resultat
//   resultat = test.withNegate(5).errorMsg
//   if ( resultat != null) throw "devrait être OK avec withNegate"
// } catch(err) {
//   console.error("Le test InsideTest#with retourne une mauvaise valeur ("+err+")")
// }

// // Un test avec un sujet et une valeur attendu
// test = new InsideTest({
//     noconsole:  true
//   , error:      '%{devrait} être égal à' 
//   , eval:       function(sujet, expected){ return sujet == expected}
// })

} // Si les tests sont en cours
