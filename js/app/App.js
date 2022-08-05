'use strict';
class AppClass {

  JStringEpure(foo){
    if ( foo.scenario ) {
      var dupfoo = Object.assign({}, foo)
      delete dupfoo.scenario
      return dupfoo
    } else {
      return foo
    }
  }

  /**
   * Les méthodes gérant le clavier, hors contexte comme la console
   * ou les panneaux
   */
  regularOnKeypress(e) {
    return true
  }
  regularOnKeyDown(e) {
    return true
  }
  regularOnKeyUp(e){
    return true
  }
}
const App = new AppClass()
