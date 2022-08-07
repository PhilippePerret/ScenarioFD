'use strict';

const FILTRE = {}

FILTRE.EFFETS = {
    'e':  {name:'Extérieur', value:'EXT.'}
  , 'i':  {name:'Intérieur', value:'INT.'}
  , 'n':  {name:'Noir',      value:'NOIR'}
  , 'ei': {name:'Int./ext.', value:'INT./EXT.'}
}

FILTRE.TYPES_ELEMENTS = {
    'intitule':   {name:'Intitulé', value:'intitule'}
  , 'action':     {name:'Action/descript°', value:'action'}
  , 'nom':        {name:'Nom qui parle', value:'nom'}
  , 'dialogue':   {name:'Dialogue', value:'dialogue'}
  , 'note-jeu':   {name:'Note de jeu', value:'note-jeu'}
  , 'transition': {name:'Transition', value:'transition'}
}

FILTRE.ZONES = {
    'expo':   {name:'Exposition'      ,value:'expo'}
  , 'dev':    {name:'Développement'   ,value:'deve'}
  , 'dev1':   {name:'Part 1 de Dév.'  ,value:'dev1'}
  , 'dev2':   {name:'Part 2 de Dév.'  ,value:'dev2'}
  , 'deno':   {name:'Dénouement'      ,value:'deno'}
}


FILTRE.DATA_FILTRE = {
  // --- De scène x avec scène y ---
  'options': {
      name: 'Options'
    , id:   'options'
    , fields: [
          {id:'always_heading', label:'Toujours afficher les intitulés de scène', type:'checkbox', disp:'block'}
      ]
  }
, 'scenes_range': {
      name: 'Rang de scènes'
    , id:   'scenes_range'
    , fields:[
          {type:'div', values: [
              {id:'from_scene', label:'De scène', type:'input-text', disp:'inline', css:'short center'}
            , {id:'to_scene',   label:'à scène',  type:'input-text', disp:'inline', css:'short center'}
            ]}
        , {id:'zone',       label:'Zones',    type:'multi-select', values: FILTRE.ZONES }
      ]
  }
, 'personnages': {
      name: 'Les personnages'
    , id:   'personnage'
    , fields: [
          {id:'personnage', type:'multi-select', values: function(){return Scenario.current.personnages.items}}
      ]
  }
, 'decors': {
      name: 'Les décors'
    , id:   'decor_et_effet'
    , fields: [
          {id:'decor', type:'multi-select', label: 'Lieux', values: function(){return Scenario.current.decors.items}}
        , {id:'effet', type:'multi-select', label: 'Effet', values: FILTRE.EFFETS}
      ]
  }
, 'types_element':{
      name: 'Les éléments'
    , id:   'type_element'
    , fields: [
        {id:'type_element', type:'multi-select', values: FILTRE.TYPES_ELEMENTS}
      ] 
  }
, 'words': {
      name: 'Recherche par mots'
    , id:   'words'
    , fields: [
          {id:'words',  label:'Rechercher', type:'input-text', disp:'block'}
        , {id:'words_as', label:'comme…', type:'select', values:[{label:'Expression régulière', value:'regexp'}, {label:'Littéral',value:'exact'}, {label:'Insensible à la casse', value:'uncase'}]}
      ]
  }
} // DATA_FILTRE

