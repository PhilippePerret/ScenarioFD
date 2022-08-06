'use strict';
/**
 * Constantes pour les dispositions et les cadres
 * 
 */

const TL = 'top_left'
const TR = 'top_right'
const BL = 'bottom_left'
const BR = 'bottom_right'

const CADRE_BORDER_WIDTH  = 2;
const DOUBLE_BORDER_WIDTH = 2 * CADRE_BORDER_WIDTH

const DATA_DISPOSITIONS = {
    1: {
        name: '1-left-1-right'
      , cadres:[
            {
                id:       TL
              , quarts:   [TL, BL]
              , handles:  'e'
              , cadre:    undefined
              , defaultContent: 'preview'
              , resizing:function(){
                  cadre(TL).adjustContent()
                  Cadre.alignVerticalBord(TL,TR)
                }
            }
          , {
                id:       TR
              , quarts:   [TR, BR]
              , handles:  null
              , cadre:    undefined
              , defaultContent: 'console'
              , resizing:function(){
                  cadre(TR).setRight(Cadre.Width)}
                }
        ]
    }
  , 2: {
        name:   '1-top-1-bottom'
      , cadres:[
            {
                id:       TL
              , quarts:   [TL, TR]
              , handles:  's'
              , cadre:    undefined
              , defaultContent: 'preview'
              , resizing:function(){
                  cadre(TL).adjustContent()
                  Cadre.alignHorizontalBord(TL, BL)
                }
            }
          , {
                id:       BL
              , quarts:   [BL, BR]
              , cadre:    undefined
              , defaultContent: 'console'
            }
        ]
    }
  , 3: {
        name:   '1-top-2-bottom'
      , cadres:[
            {
                id:       TL
              , quarts:   [TL, TR]
              , cadre:    undefined
              , handles:  's'
              , defaultContent: 'preview'
              , resizing:function(){
                  cadre(TL).adjustContent()
                  Cadre.alignHorizontalBord(TL, BL)
                  Cadre.alignHorizontalBord(TL, BR)
                }
            }
          , {
                id:       BL
              , quarts:   [BL]
              , handles:  'e'
              , cadre:    undefined
              , defaultContent: 'navigator'
              , resizing:function(){
                  cadre(BL).adjustContent()
                  Cadre.alignVerticalBord(BL,BR)
              }
            }
          , {
                id:       BR
              , quarts:   [BR]
              , cadre:    undefined
              , defaultContent: 'console'
            }
        ]
    }
  , 4: {
        name: '2-top-1-bottom'
      , cadres:[
            {
                id:       TL
              , quarts:   [TL]
              , handles:  'e'
              , cadre:    undefined
              , defaultContent: 'preview'
              , resizing:function(){
                  cadre(TL).adjustContent()
                  Cadre.alignVerticalBord(TL, TR)
                }
            }
          , {
                id:       TR
              , quarts:   [TR]
              , handles:  null
              , cadre:    undefined
              , defaultContent: 'console'
            }
          , {
                id:       BL
              , quarts:   [BL, BR]
              , handles:  'n'
              , cadre:    undefined
              , defaultContent: 'navigator'
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
                id:       TL
              , quarts:   [TL]
              , handles:  's,e'
              , cadre:    undefined
              , defaultContent: 'preview'
              , resizing:function(){
                  cadre(TL).adjustContent()
                  Cadre.alignVerticalBord(TL, TR)
                  cadre(TR).setBottom(this.bottom)
                  Cadre.alignHorizontalBord(TL,BL)
                  Cadre.alignHorizontalBord(TL,BR)
                }
            }
          , {
                id:       TR
              , quarts:   [TR]
              , handles:  's'
              , cadre:    undefined
              , defaultContent: 'console'
              , resizing:function(){
                  cadre(TR).adjustContent()
                  cadre(TL).setBottom(this.bottom)
                  Cadre.alignHorizontalBord(TR,BR)
                  Cadre.alignHorizontalBord(TR,BL)
                }
            }
          , {
                id:       BL
              , quarts:   [BL]
              , handles:  'e'
              , cadre:    undefined
              , defaultContent: 'infos'
              , resizing:function(){
                  cadre(BL).adjustContent()
                  Cadre.alignVerticalBord(BL, BR)
                }
            }
          , {
                id:       BR
              , quarts:   [BR]
              , handles:  null
              , cadre:    undefined
              , defaultContent: 'navigator'
            }
        ]
    }
  , 6: {
        name: '1-left-2-right'
      , cadres: [
          {
              id:       TL
            , quarts:   [TL,BL]
            , handles:  'e'
            , cadre:    undefined
            , defaultContent:'preview'
            , resizing:function(){
                cadre(TL).adjustContent()
                Cadre.alignVerticalBord(TL,TR)
                Cadre.alignVerticalBord(TL,BR)
              }
          }
        , {
              id:       TR
            , quarts:   [TR]
            , handles:  's'
            , cadre:    undefined
            , defaultContent:'navigator'
            , resizing:function(){
                cadre(TR).adjustContent()
                Cadre.alignHorizontalBord(TR,BR)
              }
          }
        , {
              id:       BR
            , quarts:   [BR]
            , handles:  null
            , cadre:    undefined
            , defaultContent:'console'
          }
        ]

    }
  , 7: {
        name: '2-left-1-right'
      , cadres: [
          {
              id:       TL
            , quarts:   [TL]
            , handles:  'e,s'
            , cadre:    undefined
            , defaultContent:'navigator'
            , resizing: function(){
                cadre(TL).adjustContent()
                Cadre.alignHorizontalBord(TL,BL)
                Cadre.alignVerticalBord(TL,TR)
            }
          }
        , {
              id:       BL
            , quarts:   [BL]
            , handles:  'e'
            , cadre:    undefined
            , defaultContent:'filter'
            , resizing: function(){
                cadre(BL).adjustContent()
                Cadre.alignVerticalBord(BL,TR)              
            }
          }
        , {
              id:       TR
            , quarts:   [TR,BR]
            , handles:  null
            , cadre:    undefined
            , defaultContent:'preview'
          }
      ] 
    }
  , 8: {
        name: '1-only'
      , cadres: [
          {
              id:       TL
            , quarts:   [TL,TR,BL,BR]
            , handles:  null
            , cadre:    undefined
            , defaultContent: 'preview'
          }
        ]
    }
}
// Dernier index possible (calculé dynamiquement donc toujours à jour)
const MAX_DISPO_INDEX = Math.max(Object.keys(DATA_DISPOSITIONS))
