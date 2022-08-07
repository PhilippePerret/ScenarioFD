'use strict';
/**
 * Class Decor
 * ------------------
 * Gestion des decors
 * 
 * Note : Scenario#decors retourne une ListManager de ces
 * instances.
 * 
 */
class Decor extends ScenarioElement {

  static get PROPS_NOT_SAVED(){
    return this._propsnotesaved || (this._propsnotesaved = ['scenario'])
  }
  
  constructor(data){
    super(data)
    // console.log("Initialisation du décor avec : ", data)
  }

  get inspect() {
    return this._inspect || (this._inspect = `Décor '${this.text}'`)
  }  

  get key()  { return this.decor } // ListManager key et valeur filtre
  get name() { return this.decor } // affichage filtre
  get text() { return this.decor } // autocomplétion
  get decor(){ return this._decor || ( this._decor = this.data.decor )}
  get mainDecor() {
    if ( undefined === this._maindecor) {
      this._maindecor = this.data.mainDecor || this.splitDecor().main
    }
    return this._maindecor
  }
  get subDecor() {
    if ( undefined === this._subdecor) {
      this._subdecor = this.data.subDecor || this.splitDecor().sub
    }
    return this._subdecor
  }

  splitDecor(){
    if ( this.decor.match(':') ){
      let [main,sub] = this.decor.split(':')
      this._maindecor = main.trim().replace(/  +/g,' ')
      this._subdecor  = sub.trim().replace(/  +/g,' ')
    }
    return {main:this._maindecor||null, sub: this._subdecor||null}
  }

}


//###########################  TESTS   ##############################

var test, resultat

test = new InsideTest({
    noconsole: false
  , error: '%{devrait} bien découper le décor.'
  , eval:  function compare(sujet){ 
      const dec = new Decor({decor:sujet})
      return [dec.mainDecor, dec.subDecor]
    }
})

test.equal('Décor : sous-décor', ['Décor', 'sous-décor'])
test.equal('Décor:sous-Décor', ['Décor','sous-Décor'])
test.equal('   Décor     :      Sous   décor   plus long', ['Décor','Sous décor plus long'])


test = new InsideTest({
    error: '%{devrait} retourner les bonnes données à enregistrer'
  , eval:  function(sujet){
      const dec = new Decor({decor: sujet, scenario:'Mon scénario'})
      return dec.data2save
    }
})
test.equal("Mon décor", {decor: 'Mon décor'})
test.equal("Mon décor: Mon sous-décor", {decor: "Mon décor: Mon sous-décor"})
