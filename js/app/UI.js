'use strict';
class UIClass {

  get Width() {return window.innerWidth}
  get Height(){return window.innerHeight}
  get TimelineHeight(){return DGet('section#timelines').offsetHeight}
  get ToolsbarWidth() {return DGet('section#toolsbar').offsetWidth + 12 }

  prepare(){
    message("Préparation de l'interface…")  

    Message.position = 'bottom-right'
    
    /*
    | Construction et préparation des timelines
    */
    Timeline.init()

    message("Interface préparé.")
  }

}// class UIClass

const UI = new UIClass()
