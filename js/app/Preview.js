'use strict';
/**
 * 
 * Class PreviewClass -> Preview
 * ----------------------
 * Gestion de la Preview, pour visualiser l'affichage d'une scène.
 * 
 * 
 */
class Preview extends InCadre {

static get log(){
  return this._log || (this._log = new LogClass('Preview'))
}

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
  this.log.in('::add(previewer='+previewer.inspect+')')
  if (undefined == this._all) this._all = []
  this._all.push(previewer)
}

static resetAll(){
  this.log.in('::resetAll')
  this.all.forEach(pre => pre.cleanUp())
  this.log.out('::resetAll')
}


//###################################################################



constructor(cadre){
  super('preview', cadre)
  this.scenes = {} ; // table des {ScenePreview}
  Preview.add(this)
}

get log(){ return this.constructor.log }

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
    this.content.replaceChild(pscene.obj, curObjetScene)
  } else {
    // On doit la construire
    // console.log("this.content.children", this.content.children, typeof this.content.children)
    // console.log("scene.index et child", scene.index, this.content.children[scene.index])
    const childBefore = this.content.children[scene.index]
    if ( childBefore ) {
      this.content.insertBefore(pscene.obj, childBefore)
    } else {
      this.content.appendChild(pscene.obj)
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
