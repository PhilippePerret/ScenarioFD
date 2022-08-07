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

  get log(){
    return this._log || (this._log = new LogClass('InsideTest'))
  }

  get inspect(){
    return this._inspect || (this._inspect = `ListManager «${this.name}»`)
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
    // console.log("item : ", item)
    const key_item = item.key
    if ( this.uniq && this.contains(key_item) ){ 
      this.log.debug("Élément déjà connu du listManager " + this.name + ' : ' + JString(item))
      return false
    }
    // console.log("item dans push : ", item)
    this.log.debug("Ajout d'un élément au listManager " + this.name + ' : ' + JString(item))
    this.Map.set(key_item, item)
    return true
  }
  add(item){
    this.push(item)
    return this; // chainage
  }

  contains(key_item){
    return this.Map.has(key_item)
  }

  /**
   * @return une version Array pour MultiSelect ({:name, :value})
   * (cf. le filtre par exemple)
   **/
  get itemsForMultiSelect(){
    return this.items.map( item => {
      return {
        name:   item.text||item.key||item.value||raise(ERRORS.listManager.noNameValueForItem, this.inspect)
      , value:  item.value||item.key}||raise(ERRORS.listManager.noValueForItem, this.inspect)
    })
  }

  get items(){ return Array.from(this.Map.values())}

  get count(){return this.Map.size}

  /**
   * @return {Array} Une liste des valeurs, pour l'autocomplétion
   * 
   */
  get forAutocompletion(){
    return Array.from(this.Map.values()).map(item => {return item.text}).sort()
  }

}
