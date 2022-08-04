'use strict';
/**
 * Class Personnage
 * ----------------
 * Gestion des personnages
 * 
 * Note : Scenario#personnages retourne une ListManager de ces
 * instances.
 * 
 */
class Personnage extends ScenarioElement {

  static get PROPS_NOT_SAVED(){
    return this._propsnotesaved || (this._propsnotesaved = ['scenario'])
  }
  
  constructor(data){
    super(data)
  }

  get key()     { return this.pseudo } // ListManager key
  get text()    { return this.pseudo } // autocompletion
  get pseudo()  { return this.data.pseudo }
  get prenom()  { return this._prenom || (this._prenom = this.data.prenom || this.splitName().prenom)}
  get nom()     { return this._nom || (this._nom = this.data.nom || this.splitName().nom ) }
  
  splitName(){
    var parts = this.pseudo.split(' ')
    this._prenom = parts.shift()
    this._nom    = parts.join(' ')
    return {prenom:this._prenom, nom:this._nom}
  }
}
