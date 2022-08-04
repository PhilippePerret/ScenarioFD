'use strict';
/**
 * Class ListManager
 * -----------------
 * Pour gérer les listes d'éléments, extension de Array
 * 
 * 
 */

class ListManager {

  /**
   * 
   * @param data
   * 
   *  data.name     {String} Nom humain de la liste
   *  data.items    {Array}  Liste optionnelle initiale des items
   *  data.uniq     Si true, les données doivent être uniques
   * 
   */
  constructor(data){
    this.data   = data
    this.name   = data.name
    this.uniq   = data.uniq || false
    this.Map    = new Map()

    if (data.items) {
      data.items.forEach(item => this.push(item))      
    }
  }

  /**
   * @return La liste Array des données à sauvegarder
   * 
   */
  get data2save(){
    return this.Map.map(item => {
      if ( item.data ) {
        return item.data2save || item.data
      } else {
        return item
      }
    })
  }

  push(item){
    const key_item = item.key
    if ( this.uniq && this.Map.has(key_item) ){ 
      console.log("Élément déjà connu du listManager %s", this.name, item)
      return false
    }
    console.log("Ajout d'un élément au listManager %s", this.name, item)
    this.Map.set(key_item, item)
    return true
  }
  add(item){
    this.push(item)
    return this; // chainage
  }

  get count(){return this.Map.size}

  /**
   * @return {Array} Une liste des valeurs, pour l'autocomplétion
   * 
   */
  get forAutocompletion(){
    return Array.from(this.Map.values()).map(item => {return item.text}).sort()
  }

}
