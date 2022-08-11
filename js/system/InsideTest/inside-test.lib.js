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

const ITERRORS = {
  itWaa:{
      dataRequiredInServerResultat: "Côté serveur, dans l'appel à WAA.send(class:'IT_WAA', method:'receive', data:{}), les :data doivent contenir {:testId, :result et :data}"
    , testIdRequiredInServerResultat: "La donnée :testId est requise dans le retour côté serveur vers IT_WAA.receive pour retrouver le test."
    , resultRequiredInServerResultat: "La donnée :result est requise dans le retour côté serveur vers IT_WAA.receive pour connaitre le résultat et savoir quoi faire ensuite."
  }
}
const CONSOLE_STYLE_ERROR = 'font-family:"Arial Narrow";color:red;'
// Pour l'affichage final du lieu de la définition du test
const CONSOLE_STYLE_FILENAME = 'font-style:italic;margin-left:10em;font-size:0.85em;color:#999;'

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
  /**
   * Simuler un click sur +selector+
   * 
   * @param {String|DOM Element} Le string du selector ou l'élément
   * 
   */
  clickOn(selector){
    if ( 'string' == typeof selector ) {
      selector = document.querySelector(selector)
    }
    selector.click()
  }
}
export const mouse = new MouseClass()



export class InsideTest {

  static get log(){
    return this._log || (this._log = new LogClass('InsideTest'))
  }

  /**
   * Méthode appelée au chargement du module principal (dans le
   * ready, plus exactement)
   * 
   */
  static install(){
    return new Promise((ok,ko) => {
      /*
      |  Insertion de la balise chargeant InsideTestServer (qui permet
      |  de faire des checks server — cf. le manuel)
      */
      const scp = DCreate('SCRIPT', {type:'text/javascript'})
      scp.src = './js/system/InsideTest/IT_WAA.js'
      document.head.appendChild(scp)
      scp.addEventListener('load', ok)
    })
  }

  static reset(){
    this.lastTestIndex = -1
  }

  /**
   * Test courant
   */
  static get current()  { return this._current }
  static set current(t) { this._current = t    }

  /**
   * Pour ajouter des messages d'erreur depuis les tests
   * 
   */
  static set error(err){
    this.current.error = err
  }
  /**
   * Ajoute un message d'erreur.
   * ----------------------------
   * Si +remp+ est nullish, on ajoute simplement le message +err_msg+
   * Si +remp+ est défini et que +err_msg+ contient des '%s', ces
   * %s sont remplacées par les valeurs de +remp+
   * Si le message ne contient pas de %s, +remp+ doit contenir dans
   * l'ordre la valeur attendue et la valeur reçue.
   * 
   * @param err_msg {String} Le message d'erreur, ou le template.
   * @param remp    {Null|Array} Les valeurs de remplacement.
   * 
   */
  static addError(err_msg, remp){
    if ( remp ) {
      if ( err_msg.match('%s') ) {
        err_msg = tp(err_msg, remp)
      } else {
        err_msg += `\n    Expected: ${remp[0]}\n    Actual   : ${remp[1]}`
      }
    }
    this.error = err_msg
  }

  /**
   * Pour jouer tous les tests
   * 
   */
  static async run() {
    if ( INSIDE_TESTS ){ 
      this.resetCounters()
      this.runStack()
      await this.awaitForAllServerChecksDone()
      this.stopCounters()
      this.report()
    }
  }

  /**
   * Puisque personne ne peut joindre ce module (du fait que ce soit
   * justement un module), on passe par la classe globale IT_WAA,
   * aussi bien pour le serveur (par WAA.send) que par ce module.
   * On s'en sert donc pour passer les données et l'état serveur.
   * 
   * Cf. le fonctionnement dans le manuel développeur.
   */
  static awaitForAllServerChecksDone(){
    if ( not(IT_WAA.working) ) return true
    const my = this
    return new Promise((ok,ko)=>{
      my.intervaler = setInterval(my.checkerServerResultats.bind(my, ok), 500)
    })
  }
  static checkerServerResultats(ok){
    const my = this
    if (IT_WAA.working === false ){
      clearInterval(this.intervaler)
      delete this.intervaler
      ok()
    } else if ( IT_WAA.stackServerResultats.length ) {
      /*
      |  Arrêt provisoire de la boucle
      */
      clearInterval(this.intervaler)
      delete this.intervaler
      /*
      |   Boucle sur tous les résultats renvoyés par le serveur
      */
      this.treateServerResultats()
      /*
      |  On peut relancer la boucle d'attente
      */
      my.intervaler = setInterval(my.checkerServerResultats.bind(my, ok), 500)
    } else {
      return true // working
    }
  }
  /**
   * En cas de tests côté serveur, cette méthode traite les retours
   * que le serveur a donné (plusieurs tests peuvent avoir remonté
   * des résultats)
   */
  static treateServerResultats(){
    let newServerResultat ;
    /*
    | On boucle tant qu'il y a des retours du serveur
    */
    while ( (newServerResultat = IT_WAA.stackServerResultats.pop()) ) {

      /*
      |  On prend les données de ce retour serveur
      */
      const testId = newServerResultat.testId
      testId || raise(ITERRORS.itWaa.testIdRequiredInServerResultat)
      const result = newServerResultat.result
      result || raise(ITERRORS.itWaa.resultRequiredInServerResultat)
      
      /*
      |  Le test javascript {InsideTest}
      */
      const test = this.table[testId]
      // console.log("Je dois rejouer le test ", test)

      /*
      |  Dans tous les cas — que le résultat côté serveur ait été 
      |  positif ou non —, si une méthode d'évaluation du résultat
      |  serveur existe dans le test, c'est cette méthode qu'on doit
      |  appeler pour traiter le résultat.
      */
      if ( 'function' == typeof test.data.afterServerEval ) {
        this.current = test
        test.data.afterServerEval.call(null, result) || test.throwError()
      } else if ( not(result.ok) ) {
        /*
        |  Sinon, en cas d'erreur sur le serveur, on enregistre
        |  l'erreur.
        */
        test.error = result.errors.join("\n")
        test.throwError()          
      }
    }
  }

  static resetCounters(){
    this.nombreTests    = 0
    this.nombreFailures = 0
    this.Failures = []
    console.log('%c=== DÉBUT DES TESTS ===', 'color:green;font-weight:bold;font-size:14pt;')
    this.startTime = new Date().getMilliseconds()
  }
  static stopCounters(){
    this.endTime = new Date().getMilliseconds()
  }

  /**
   * Rapport final des tests 
   * 
   */
  static report(){
    const nombreSucces = this.nombreTests - this.nombreFailures
    const hasFailures = this.nombreFailures > 0
    const duration = String(this.endTime - this.startTime) + ' ms';
    if ( hasFailures ) {
      var indexFailure = 0
      this.Failures.forEach(test => {
        indexFailure ++ 
        // console.log("test : ",test)
        console.log('%cError #' + indexFailure + '%c['+ test.fileName + ':' + test.lineNumber + ']' + "\n%c⛔️ " + test.errorMsg, CONSOLE_STYLE_ERROR + 'text-decoration:underline;', CONSOLE_STYLE_FILENAME, CONSOLE_STYLE_ERROR)
      })
    }
    let style = 'display:block;width:100%;border-top:1px solid;color:'+(hasFailures?'red':'green')+';'
    console.log('%c' + `Durée: ${duration}` + '%c' + `INSIDE-TESTS\nTests: ${this.nombreTests} - Succès: ${nombreSucces} - Échecs: ${this.nombreFailures}`, 'float:right;font-style:italic;font-size:0.85em;padding-right:8em;', style)
  }

  static addToStack(test){
    this.add(test)
    if (undefined == this.stack) { this.stack = [] }
    this.stack.push(test)
  }

  /**
   * Pour consigner le test. On en aura besoin si on fait des
   * test serveur
   */
  static add(test){
    if (undefined === this.table ) { this.table = {} }
    Object.assign(this.table, {[test.id]: test})
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

  /**
   * @return  Un Identifiant pour les tests 
   * 
   */
  static getNewTestId(){
    if ( undefined === this.lastTestId) { this.lastTestId = 0 }
    return `test-${++this.lastTestId}`
  }

  //################################################################


  constructor(data){
    this.data   = data
    this.sujet  = data.sujet
    this.error  = data.error
    this.eval   = data.eval
    // Pour les tests de InsideTest seulement (cf. en bas de page)
    this.noconsole = data.noconsole 
    this.id     = this.constructor.getNewTestId()
    this.stack = []
    if ( INSIDE_TESTS ) { this.constructor.addToStack(this) }
    /*
    | Pour connaitre la localité du test
    */
    try{throw new Error("Origine test")}catch(err){
      // console.log("Trace", err.stack, typeof err.stack)
      const stack = err.stack.trim().split("\n")
      let fileLine = stack.pop()
      fileLine = fileLine.split('/').pop()
      const [fileName, lineNumber, columnNumber] = fileLine.split(':')
      console.info(fileName, lineNumber, columnNumber)
      this.fileName   = fileName
      this.lineNumber = lineNumber
    }
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
        console.error("ERREUR APPLICATION : ", err)
        this.throwError("ERREUR APPLICATION")
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
      }.bind(this), [ sujet ])
    } else {
      this.withExpected(sujet, expected)
    }      
    return this; // chainage
  }
  /**
   * Compare l'égalité
   */
  equal(sujet, expected){
    const my = this
    this.addStack(function(sujet, expected){
      my.actual = JString(my.eval.call(null, sujet))
      expected = JString(expected)
      my.expected = expected
      my.actual == expected || my.throwError(false, JString(sujet), expected, my.actual)
    }.bind(my), [ sujet, expected ])
    return this // chainage
  }

  /**
   * Exécution négative avec le sujet +sujet+
   */
  withNegate(sujet, expected){
    if ( undefined === expected) {
      this.addStack(function(sujet){
        this.reset()
        this.negate = true
        this.eval.call(null, sujet) && this.throwError(true, sujet)
      }.bind(this), [ sujet ])
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
    this.addStack(function(sujet, expected){
      this.reset()
      const resultat  = this.eval.call(null, sujet, expected)
      const value     = this.eval.value
      this.expected   = expected
      this.actual     = value
      resultat == expected || this.throwError(false, sujet, expected, value)
    }.bind(this), [ sujet, expected ])
    return this; // chainage
  }
  /**
   * Inverse de la précédente
   * 
   */
  withExpectedNegate(sujet, expected){
    this.addStack(function(sujet, expected){
      this.reset()
      this.negate = true
      const resultat  = this.eval.call(null, sujet, expected)
      const value     = this.eval.value
      this.expected   = expected
      this.actual     = value
      resultat != expected && this.throwError(true, sujet, expected, value)    
    }.bind(this), [ sujet, expected ])
    return this; // chainage
  }
  /**
   * Exécution du test sans sujet
   * 
   */
  exec(){
    this.addStack(function(){
      this.reset()
      this.eval.call(this) || this.throwError(false)
    }.bind(this, null ))
    return this; // chainage
  }
  execNegate(){
    this.addStack(function(){
      this.negate = true
      this.reset()
      this.eval.call(this) && this.throwError(true)
    }.bind(this, null ))
    return this; // chainage
  }

  set error(err) { 
    if ( undefined == this._error ) { this._error = []}
    this._error.push(err)
  }
  get error() { 
    if ( undefined == this._error ) return null ;
    return this._error.join("\n# ☠️ # ")
  }

  throwError(negate, sujet, expected, actual){
    this.constructor.nombreFailures ++
    this.constructor.Failures.push(this)
    if (undefined === negate   ) { negate   = this.negate == true }
    if (undefined === expected ) { expected = this.expected }
    if (undefined === actual   ) { actual   = this.actual   }
    if (undefined === sujet   )  { sujet    = this.sujet    }
    const prefix = "[IT] " // non utilisé
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
    // msg = prefix + msg
    // Sorti du message en console
    this.noconsole || console.error(msg)
    this.errorMsg = msg // Pour auto test et rapport final
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
