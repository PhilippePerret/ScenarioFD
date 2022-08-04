'use strict';
class AppClass {


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
