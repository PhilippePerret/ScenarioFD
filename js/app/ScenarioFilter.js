'use strict';
/**
 * Pour la gestion du panneau filtre qui permet de filtrer tout de
 * qu'on veut du scénario
 * 
 */
class ScenarioFilter extends InCadre {

  constructor(cadre){
    super('filter', cadre)
  }

  /**
   * Construction complète du filtre, en fonction des données
   * 
   */
  afterBuild(){
    this.log.in('#afterBuild', this.inspect)
    this.isBuilt = false
    this._content = null
    const o = this.content
    Object.values(this.DATA_FILTRE).forEach( dfiltre => {
      const divfiltre = DCreate('DIV', {id:`div-filtre-${dfiltre.id}`, class:'div-filtre'})
      const label = DCreate('LABEL', {text:dfiltre.name, class:'fitre-name'})
      divfiltre.appendChild(label)
      o.appendChild(divfiltre)
    })
    this.isBuilt = true
    return this // chainage
  }

  /**
   * Observation complète du filtre, pour réactions en direct en
   * fonction des choix.
   */
  observe(){
    super.observe()
    return this // chainage
  }

  get DATA_FILTRE(){
      return {
    // --- De scène x avec scène y ---
    'scenes_range': {
        name: 'Filtre de scène X à scène Y'
      , id:   'scenes_range'
      , fields:[
            {id:'from_scene', label:'De scène', type:'input-text', disp:'inline'}
          , {id:'to_scene',   label:'à scène',  type:'input-text', disp:'inline'}
        ]
      , checked: false
      , value:   null
    }
  , 'personnages': {
        name: 'Avec les personnages'
      , id:   'personnages'
      , fields: [
            {id:'personnages', type:'multi-select', values: Scenario.current.personnages}
        ]
      , checked: false
      , value:   null
    }
  , 'decors': {
        name: 'Dans les décors'
      , id:   'decors'
      , fields: [
          {id:'decors', type:'multi-select', values: Scenario.current.decors}
        ]
      , checked: false
      , value:   null
    }
  , 'types_element':{
        name: 'Seulement les styles…'
      , id:   'types_element'
      , fields: [
          {id:'types_elements', type:'multi-select', values: TYPES_ELEMENTS}
        ] 
    }
  , 'words': {
        name: 'Rechercher les mots'
      , id:   'words'
      , fields: [
            {id:'words',  label:'Rechercher', type:'input-text', disp:'block'}
          , {id:'words_as', label:'comme…', type:'select', values:[{label:'Expression régulière', value:'regexp'}, {label:'Littéral',value:'exact'}, {label:'Insensible à la casse', value:'uncase'}]}
        ]
    }
  }

  }
} // classe ScenarioFilter < InCadre

