'use strict';
/**
 * Class ScenePreview
 * -------------------
 * Gestion de la prévisualisation d'une scène dans un Preview
 * 
 */
class ScenePreview {
  constructor(scene){
    this.scene = scene
    this.scene.previewScene = this
  }

  edit(e){
    if ( not(this.scene.isEdited) ) {
      this.scene.edit(e)
      this.select()
    } else {
      this.previewer.selection.toggle(this, e.shiftKey)
    }
    return stopEvent(e)
  }

  /**
   * Pour sélectionner la scène
   */
  select(){
    this.previewer.selection.set(this)
  }

  // Raccourci
  get previewer(){ return this.scene.previewer }

  setSelected(){
    this.obj.classList.add('selected')
    this.scene.timelineScene.setSelected()
    $('.num-scene-selected').text(this.scene.numero)
    this.showButtonsAddScene()
  }
  unsetSelected(){
    this.obj.classList.remove('selected')
    this.scene.timelineScene.unsetSelected()
    $('.num-scene-selected').text('')
    this.hideButtonsAddScene()
  }

  showButtonsAddScene(){ // dans tous les visualisateurs
    this.toggleButtonsAddScene(true)  
  }
  hideButtonsAddScene(){ // dans tous les visualisateurs
    this.toggleButtonsAddScene(false)  
  }
  toggleButtonsAddScene(showThem){
    const selector = 'section.preview div.btn-add-scene-selected'
    const method = showThem ? 'remove' : 'add'
    DGetAll(selector).forEach(div => div.classList[method]('hidden'))

  }
  update(){
    this.obj = null
  }

  get obj(){ return this._obj || ( this._obj = this.build() ) }
  
  build(){
    const o = DCreate('DIV', {
        id:`scene-${this.scene.id}`
      , class:'scene'
    })
    this.scene.lines.forEach( line => {
      o.appendChild(line.preview) 
    })
    return o
  }

  observe(){
    this.obj.addEventListener('click', this.edit.bind(this))
  }



}//class ScenePreview
