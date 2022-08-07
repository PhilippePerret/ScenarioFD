'use strict';
/**
 * Gestion de la todo liste
 * 
 */
class TodoScenario {
  static get log(){
    return this._log || (this._log = new LogClass('InsideTest'))
  }
  get log() { return this.constructor.log }

  afterBuild(){
    this.log.in('#afterBuild', this.inspect)
  }
  
  observe(){
    super.observe()
  }
}
