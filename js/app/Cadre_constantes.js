'use strict';
/**
 * class Cadre
 * -----------
 * Gestion complète de l'interface utilisateur
 * 
 */

const TL = 'top_left'
const TR = 'top_right'
const BL = 'bottom_left'
const BR = 'bottom_right'

const CADRE_BORDER_WIDTH  = 2;
const DOUBLE_BORDER_WIDTH = 2 * CADRE_BORDER_WIDTH

const CADRES_DISPOSITIONS = {
    1: {
        name: '1-left-1-right'
      , cadres:[
            {
                id:1
              , cadre: null // l'instance Cadre
              , defaultContent: 'preview'
              , quarts:[TL, BL]
              , handles:'e'
              , resizing:function(){
                  cadre(TL).adjustContent()
                  Cadre.alignVerticalBord(TL,TR)
                }
              // ,  contres:[TR,BR]
              // , adjust:()=>{cadre(TL).setRight(cadre(TR).left)}
            }
          , {
                id:2
              , cadre: null
              , defaultContent: 'console'
              , quarts:[TR, BR]
              , handles:null
              , resizing:function(){
                  cadre(TR).setRight(Cadre.Width)}
                }
        ]
    }
  , 2: {
        name:   '1-top-1-bottom'
      , cadres:[
            {
                id:1
              , cadre: null
              , defaultContent: 'preview'
              , quarts:[TL, TR]
              , handles:'s'
              , resizing:function(){
                  cadre(TL).adjustContent()
                  Cadre.alignHorizontalBord(TL, BL)
                  // cadre(BL).setTop(this.bottom).setBottom(Cadre.Height)
                }
              // , contres:[BL,BR], adjust: ()=>{cadre(TL).setBottom(cadre(BL).top)}
            }
          , {
                id:2
              , cadre: null
              , defaultContent: 'console'
              , quarts:[BL, BR]
              // , contres:[TL,TR]
              // , adjust: ()=>{cadre(BL).setBottom(Cadre.Height)}
            }
        ]
    }
  , 3: {
        name:   '1-top-2-bottom'
      , cadres:[
            {
                id:1
              , cadre: null
              , defaultContent: 'preview'
              , quarts:[TL, TR]
              , handles:'s'
              , resizing:function(){
                  cadre(TL).adjustContent()
                  Cadre.alignHorizontalBord(TL, BL)
                  Cadre.alignHorizontalBord(TL, BR)
                }
            }
          , {
                id:2
              , cadre: null
              , defaultContent: 'navigator'
              , quarts:[BL]
              , handles:'e'
              , resizing:function(){
                  cadre(BL).adjustContent()
                  Cadre.alignVerticalBord(BL,BR)
              }
            }
          , {
                id:3
              , cadre: null
              , defaultContent: 'console'
              , quarts:[BR]
            }
        ]
    }
  , 4: {
        name: '2-top-1-bottom'
      , cadres:[
            {
                id:1
              , cadre: null
              , defaultContent: 'preview'
              , quarts:[TL]
              , handles:'e'
              , resizing:function(){
                  cadre(TL).adjustContent()
                  Cadre.alignVerticalBord(TL, TR)
                }
            }
          , {
                id:2
              , cadre: null
              , defaultContent: 'console'
              , handles:null
              , quarts:[TR]
            }
          , {
                id:3
              , cadre: null
              , defaultContent: 'navigator'
              , quarts:[BL, BR]
              , handles:'n'
              , resizing:function(){
                  cadre(BL).adjustContent()
                  cadre(TL).setBottom(this.top)
                  cadre(TR).setBottom(this.top)
                }
            }
        ]
    }
  , 5: {
        name:'2-top-2-bottom'
      , cadres:[
            {
                id:1
              , quarts:[TL]
              , cadre: null
              , defaultContent: 'preview'
              , handles:'s,e'
              , resizing:function(){
                  cadre(TL).adjustContent()
                  Cadre.alignVerticalBord(TL, TR)
                  cadre(TR).setBottom(this.bottom)
                  Cadre.alignHorizontalBord(TL,BL)
                  Cadre.alignHorizontalBord(TL,BR)
                }
            }
          , {
                id:2
              , quarts:[TR]
              , cadre: null
              , defaultContent: 'console'
              , handles:'s'
              , resizing:function(){
                  cadre(TR).adjustContent()
                  cadre(TL).setBottom(this.bottom)
                  Cadre.alignHorizontalBord(TR,BR)
                  Cadre.alignHorizontalBord(TR,BL)
                }
            }
          , {
                id:3
              , quarts:[BL]
              , cadre: null
              , defaultContent: 'infos'
              , handles:'e'
              , resizing:function(){
                  cadre(BL).adjustContent()
                  Cadre.alignVerticalBord(BL, BR)
                }
            }
          , {
                id:4
              , quarts:[BR]
              , cadre: null
              , defaultContent: 'navigator'
              , handles:null
            }
        ]
    }
  , 6: {
        name: '1-left-2-right'
      , cadres: [
          {
              id:1
            , quarts:[TL,BL]
            , defaultContent:'preview'
            , handles:'e'
            , resizing:function(){
                cadre(TL).adjustContent()
                Cadre.alignVerticalBord(TL,TR)
                Cadre.alignVerticalBord(TL,BR)
              }
          }
        , {
              id:2
            , quarts:[TR]
            , defaultContent:'navigator'
            , handles:'s'
            , resizing:function(){
                cadre(TR).adjustContent()
                Cadre.alignHorizontalBord(TR,BR)
              }
          }
        , {
              id:3
            , quarts:[BR]
            , defaultContent:'console'
            , handles:null
          }
        ]

    }
  , 7: {
        name: '2-left-1-right'
      , cadres: [
          {
              id:1
            , quarts:[TL]
            , defaultContent:'navigator'
            , handles: 'e,s'
            , resizing: function(){
                cadre(TL).adjustContent()
                Cadre.alignHorizontalBord(TL,BL)
                Cadre.alignVerticalBord(TL,TR)
            }
          }
        , {
              id:2
            , quarts:[BL]
            , defaultContent:'filter'
            , handles: 'e'
            , resizing: function(){
                cadre(BL).adjustContent()
                Cadre.alignVerticalBord(BL,TR)              
            }
          }
        , {
              id:3
            , quarts:[TR,BR]
            , defaultContent:'preview'
          }
      ] 
    }
  , 8: {
        name: '1-only'
      , cadres: [
          {
              id:1
            , quarts:[TL,TR,BL,BR]
            , cadre: null
            , defaultContent: 'preview'
            , handles:null
          }
        ]
    }
}
// Dernier index possible (calculé dynamiquement donc toujours à jour)
const MAX_DISPO_INDEX = Math.max(Object.keys(CADRES_DISPOSITIONS))
