'use strict';

const FILTRE = {}

FILTRE.EFFETS = {
    'j':  {name:'Jour'  , value:'JOUR'}
  , 'n':  {name:'Nuit'  , value:'NUIT'}
  , 's':  {name:'Soir'  , value:'SOIR'}
  , 'm':  {name:'Matin' , value:'MATIN'}
  , 'x':  {name:'Autre' , value:'x'}
}
FILTRE.LIEUX = {
    'e':  {name:'Extérieur' , value:'EXT.'}
  , 'i':  {name:'Intérieur' , value:'INT.'}
  , 'n':  {name:'Noir'      , value:'NOIR'}
  , 'ei': {name:'Int./ext.' , value:'INT./EXT.'}
  , 'x':  {name:'Autre'     , value:'x'}
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
  , 'dev':    {name:'Dévelopmnt'      ,value:'deve'}
  , 'deno':   {name:'Dénouement'      ,value:'deno'}
  , 'dev1':   {name:'Part 1 de Dév.'  ,value:'dev1'}
  , 'dev2':   {name:'Part 2 de Dév.'  ,value:'dev2'}
}

FILTRE.TYPES_SEARCH = [
    {name:'Expr. rationnelle'     , value:'regexp'}
  , {name:'Littéral'              , value:'exact' }
  , {name:'Insensible à la casse' , value:'uncase'}
  , {name:'Mot entier'            , value:'whole' }
]

FILTRE.DATA_FILTRE = {
  // --- De scène x avec scène y ---
  'options': {
      name: 'Options'
    , id:   'options'
    , fields: [
          {id:'always_heading', label:'Toujours afficher les intitulés de scène', type:'checkbox', disp:'block'}
        , {id:'grised_rather_hide', label:'Griser plutôt que cacher le texte exclus', type:'checkbox', disp:'block', checked:false}
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
, 'words': {
      name: 'Recherche par mots'
    , id:   'words'
    , fields: [
          {id:'words',  label:'Rechercher', type:'input-text', css: 'long', disp:'block',
            explication:'Séparer les différents mots par des doubles guillemets (« mot M1 "" mot M2 "" motM3 »)'}
        , {id:'words_as', type:'multi-select', css:'no-background', values: FILTRE.TYPES_SEARCH, noSelectAll:true, notSelected:true}
      ]
  }
, 'personnages': {
      name: 'Les personnages'
    , id:   'personnage'
    , fields: [
          {id:'personnage', type:'multi-select', values: function(){return Scenario.current.personnages.items}}
      ]
  }
, 'types_element':{
      name: 'Les éléments'
    , id:   'type_element'
    , fields: [
        {id:'type_element', type:'multi-select', values: FILTRE.TYPES_ELEMENTS}
      ] 
  }
, 'decors': {
      name: 'Les décors'
    , id:   'decor_et_effet'
    , fields: [
          {id:'decor', type:'multi-select', css:'large', label: 'Décors', values: function(){return Scenario.current.decors.items}}
        , {id:'effet', type:'multi-select', label: 'Effet', values: FILTRE.EFFETS}
        , {id:'lieu', type:'multi-select', label: 'Lieux', values: FILTRE.LIEUX}
      ]
  }
} // DATA_FILTRE

