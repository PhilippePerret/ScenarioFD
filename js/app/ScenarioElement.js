'use strict';
/**
 * Classe abstraite pour les éléments du scénario (décors, personnages, etc.)
 * ----------------
 * Ajoute des méthodes récurrentes
 */
class ScenarioElement {

  // Doit être surclassé par la classe fille
  static get PROPS_NOT_SAVED(){return []}


  constructor(data){
    this.data = data
    this.scenario = data.scenario    
  }

  get data2save(){
    const d2s = Object.assign({}, this.data)
    this.constructor.PROPS_NOT_SAVED.forEach(prop => delete d2s[prop])
    return d2s
  }
 
  get key()  { throw 'Il faut absolument définir la clé (propriété key) qui doit être utilisée pour enregistrer l’objet dans la Map.'}
  get text() { return 'Vous devez définir la valeur à utiliser pour l’affichage avec @text.' } // autocompletion

}
