'use strict';

/**
 * Gestion de sélection
 * 
 * 
 * Un élément sélectionnable doit toujours répondre aux méthodes :
 *  - setSelected
 *  - unsetSelected
 */

class SelectionManager {

  constructor(owner, data){
    this.owner  = owner
    this.data   = data

    this.liste = []
  }

  get(){
    return this.liste[this.index]
  }

  set(newListe){
    this.deselectAll()
    if ( not(newListe.length) ){ newListe = [newListe] }
    newListe.forEach( sel => this.add(sel) )
    this.index = 0
  }

  toggle(sel, keep){
    if ( sel.isSelected ) { 
      this.remove(sel) 
    } else if ( keep ) { 
      this.add(sel)
    } else {
      this.set(sel)
    }
  }

  add(sel){
    this.liste.push(sel)
    sel.setSelected()
    sel.isSelected = true
    this.index = this.liste.length - 1
  }

  remove(sel){
    this.unSelect(sel)
    var newListe = []
    this.liste.forEach( selchecked => {
      if ( sel == selchecked ) return
      newListe.push(selchecked)
    })
    this.liste = newListe
    this.index = this.liste.length - 1
  }

  deselectAll(){
    this.liste.forEach( sel => this.unSelect(sel) )
    this.liste = []
  }

  unSelect(sel){
    sel.unsetSelected()
    sel.isSelected = false
  }

}
