'use strict';
/**
 * 
 * Class PreviewClass -> Preview
 * ----------------------
 * Gestion de la Preview
 * 
 * class ScenePreview
 * ------------------
 * Gestion de l'affichage d'une scène
 * 
 */
class Preview extends InCadre {

static get all(){
  return this._all || []
}
static get first(){
  return this.all[0]
}
static get current(){
  return this._current || this.first
}
static set current(p){
  this._current = p
}

static add(previewer){
  // console.log("Ajout du previewer ", previewer)
  if (undefined == this._all) this._all = []
  this._all.push(previewer)
}


//###################################################################



constructor(cadre){
  super('preview', cadre)
  this.scenes = {} ; // table des {ScenePreview}
  Preview.add(this)
}

cleanUp(){
  this.content.innerHTML = ''
}

get selection(){
  return this._selection || (this._selection = new SelectionManager(this))
}


/**
 * Affichage à l'écran de la scène +scene+ {Scene}
 * 
 * Note : à ne pas confondre avec la méthode showScene (plus bas),
 * qui elle permet de scroller à la scène voulue
 * 
 */
displayScene(scene){
  console.log("-> Preview#displayScene(scene)", scene)
  if ( undefined == this.scenes[scene.id] ) {
    Object.assign(this.scenes, {[scene.id]: new ScenePreview(scene) })
  }
  // La {PreviewScene}
  const pscene = this.scenes[scene.id]
  scene.previewScene  = pscene
  const curObjetScene = DGet(`#scene-${scene.id}`, this.content)
  if ( curObjetScene ) {
    // On doit la remplacer (actualisation)
    pscene.update()
    this.content.replaceChild(pscene.objet, curObjetScene)
  } else {
    // On doit la construire
    // console.log("this.content.children", this.content.children, typeof this.content.children)
    // console.log("scene.index et child", scene.index, this.content.children[scene.index])
    const childBefore = this.content.children[scene.index]
    if ( childBefore ) {
      this.content.insertBefore(pscene.objet, childBefore)
    } else {
      this.content.appendChild(pscene.objet)
    }
  }
  pscene.observe()
}

/**
 * Scroll jusqu'à la scène dans le previewer
 * 
 */
showScene(scene, selectIt){
  scene.previewScene.obj.scrollIntoView({behavior:'smooth', block:'start'})
  selectIt && scene.previewScene.select()
}

/**
 * Calcul de l'équivalence entre millimètre et pixel
 * 
 */
calculateMillimeterEquivalence(){
  this.content.style.width = '210mm'
  let pixels = this.content.offsetWidth
  this._ratiomm = pixels / 210
  console.log("Ratio des millimètres : ", this.RatioMM)
  return this._ratiomm
}

observe(){
  console.log("-> Preview#observe")
  super.observe()
  // --- Observation de la toolbar ---
  this.btnZoomIn.addEventListener('click', this.onClickZoomIn.bind(this))
  this.btnZoomOut.addEventListener('click', this.onClickZoomOut.bind(this))

  /*
  |  Observer les boutons d'ajout de scène
  */
  DGetAll('div.menus > div', this.btnAddScene).forEach( div => {
    div.addEventListener('click', this.onClickAddScene.bind(this, div))
  })

}

// --- MÉTHODES D'OBSERVATION ---

/**
 * Quand on clique sur le bouton "+ scène" pour ajouter une scène
 * 
 */
onClickAddScene(div, e){
  const place = div.dataset.place
  Scenario.current.addScene.call(Scenario.current, place, this)
  return stopEvent(e)
}

onClickZoomIn(e){
  if ( undefined == this.zoom ) this.zoom = 1.0
  this.setZoom(this.zoom + 0.1)
  return stopEvent(e)
}
onClickZoomOut(e){
  if ( undefined == this.zoom ) this.zoom = 1.0
  this.setZoom(this.zoom - 0.1)
  return stopEvent(e)
}

setZoom(scaleValue){
  this.zoom = scaleValue
  this.content.style.transform = `scale(${scaleValue})`  
}

get RatioMM(){
  return this._ratiomm || this.calculateMillimeterEquivalence()
}

// --- ÉLÉMENTS D'INTERFACE ---

get btnZoomIn(){
  return DGet('button.btn-zoom-in', this.toolsbar)
}
get btnZoomOut(){
  return  DGet('button.btn-zoom-out', this.toolsbar)
}
get btnAddScene(){
  return DGet('button.btn-add-scene',this.toolsbar)
}

}// class Preview



//###################################################################



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

  get objet(){ return this.obj || this.build() }
  
  build(){
    // console.log("-> ScenePreview.build()")
    this.obj = DCreate('DIV', {
        id:`scene-${this.scene.id}`
      , class:'scene'
    })
    this.scene.lines.forEach( line => {
      // console.log("Construction de la ligne", line)
      this.obj.appendChild(line.preview) 
    })

    return this.obj
  }

  observe(){
    this.obj.addEventListener('click', this.edit.bind(this))
  }



}//class ScenePreview
