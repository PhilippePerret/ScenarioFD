'use strict';

const BTN_SWITCH = '<button id="btn-%s" class="switch">♺</button>'
const BTN_EDIT   = '<button id="btn-%s" class="edit">✎</button>'
const DATA_SWITCH_BOOLEAN = {'false':{text:'false',next:'true'}, 'true':{text:'true',next:'false'}}

const TYPES_ELEMENTS = {
    'intitule': {label: 'Intitulé'     ,value:'intitule'}
  , 'action'  : {label: 'Action'       ,value:'action'}
  , 'dialogue': {label: 'Dialogue'     ,value:'dialogue'}
  , 'nom'     : {label: 'Personnage'   ,value:'nom'} 
  , 'note-jeu': {label: 'Note de jeu'  ,value:'not-jeu'}
}
/**
 * Les contenu de cadre "plain", c'est-à-dire sans padding dans leur
 * cadre 
 */
const PLAIN_INCADRE = ['console','preferences','navigator','infos']

/**
 * Les parties du Paradigme de Fieds, principalement pour focus
 * par les menus de la Timeline
 * 
 */
const PARTIES_PFA = {
    whole:  [0,100]
  , expo:   [0,25]
  , dev:    [25,75]
  , part1:  [25,50]
  , part2:  [50,75]
  , denou:  [75,100]
  , tiers1: [0,34]
  , tiers2: [33,67]
  , tiers3: [66,100]
}

// Les propriétés de Scene à ne pas sauver
const SCENE_PROPS_NOT_SAVED = ['console','previewer','scenario']

// Pour les marques de notes dans les scènes
const REG_MARK_NOTE = /\[([0-9]+)\]/g
const REG_MARK_NOTE_LINE = /^\[([0-9]+)\](.+)$/

const SCENE_LIEUX = ['INT. ', 'EXT. ', 'INT./EXT. ', 'NOIR ']
const SCENE_EFFETS = ['JOUR', 'NUIT', 'MATIN', 'SOIR']
