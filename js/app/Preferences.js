'use strict';

const data_dispo_at_startup = {1:{text:'1 left - 1 right',next:2}, 2:{text:'1 top - 1 bottom',next:3}, 3:{text:'1 top - 2 bottom',next:4}, 4:{text:'2 top - 1 bottom',next:5}, 5:{text:'4 cadres',next:6}, 6:{text:'only 1',next:1}}

const PREFERENCES_DATA = {
    'disposition_at_startup': {
        text:           "Disposition au démarrage"
      , defaultValue:   1
      , typeValue:      'integer'
      , button:         tp(BTN_SWITCH,['disposition_at_startup'])
      , values:         data_dispo_at_startup
    }
  , 'show_timeline_at_startup': {
        text:           "Afficher la timeline au démarrage"
      , defaultValue:   true
      , typeValue:      'boolean'
      , button:         tp(BTN_SWITCH,['show_timeline_at_startup'])
      , values:         DATA_SWITCH_BOOLEAN
    }
  , 'show_timeline_beats':{
        text:           "Afficher la ligne des beats"
      , defaultValue:   true
      , typeValue:      'boolean'
      , button:         tp(BTN_SWITCH,['show_timeline_beats'])
      , values:         DATA_SWITCH_BOOLEAN
      , onChange:       'onToggleTimelineBeats'
    }
  , 'show_timeline_sequences':{
        text:           "Afficher la ligne des séquences"
      , defaultValue:   true
      , typeValue:      'boolean'
      , button:         tp(BTN_SWITCH,['show_timeline_sequences'])
      , values:         DATA_SWITCH_BOOLEAN
      , onChange:       'onToggleTimelineSeqs'
    }
  , 'show_timeline_absolue':{
        text:           "Afficher la ligne des positions absolues"
      , defaultValue:   true
      , typeValue:      'boolean'
      , button:         tp(BTN_SWITCH,['show_timeline_absolue'])
      , values:         DATA_SWITCH_BOOLEAN
      , onChange:       'onToggleTimelineAbs'
    }
  , 'show_timeline_relative':{
        text:           "Afficher la ligne des positions relatives"
      , defaultValue:   true
      , typeValue:      'boolean'
      , button:         tp(BTN_SWITCH,['show_timeline_relative'])
      , values:         DATA_SWITCH_BOOLEAN
      , onChange:       'onToggleTimelineRels'
    }
  , 'show_timeline_ruler':{
        text:           'Afficher la règle graduée de la timeline'
      , defaultValue:   true
      , typeValue:      'boolean'
      , button:         tp(BTN_SWITCH,['show_timeline_ruler'])
      , values:         DATA_SWITCH_BOOLEAN
      , onChange:       'onToggleTimelineRuler'
    }
  , 'slider_zoom_color':{
        text:           "Couleur du slider de zoom <span class=description>(portion visible)</span>"
      , defaultValue:   '#9efa9e'
      , typeValue:      'string'
      , button:         tp(BTN_EDIT,['slider_zoom_color'])
      , valueTest:      'checkColor'
      , onChange:       'onChangeSliderZoomColor'
    }
  , 'last_config_over_prefs':{
        text:           'Appliquer la configuration précédente'
      , defaultValue:   true
      , typeValue:      'boolean'
      , button:         tp(BTN_SWITCH,['last_config_over_prefs'])
      , values:         DATA_SWITCH_BOOLEAN
    }
  , 'nombre_pages_default': {
        text:           'Nombre de pages par défaut'
      , defaultValue:   120
      , typeValue:      'integer'
      , button:         tp(BTN_EDIT,['nombre_pages_default'])
    }
  , 'nombre_lignes_per_page':{
        text:           'Nombre de lignes dans une page'
      , defaultValue:   55
      , typeValue:      'integer'
      , button:         tp(BTN_EDIT,['nombre_lignes_per_page'])
      , onChange:       'onChangeNombreLignesPerPage'
    }
  , 'zoom_preview': {
        text:           'Zoom du visualisateur'
      , defaultValue:   100
      , typeValue:      'float'
      , button:         tp(BTN_EDIT,['zoom_preview'])
      , valueTest:      function(n){if(not(n.replace(/[0-9\.]/g,'') == '') )return false;n = parseFloat(n,10);return n >= 10 && n <= 400}
      , error:          'Doit être un nombre de 10.0 à 400'
      , onChange:       'onChangeZoomPreview'
    }
}

class Preferences extends InCadre {

  constructor(cadre){
    super('preferences', cadre)
  }

  /**
   * @return la préférence de clé +prefId+
   * 
   */
  static get(prefId){
    return PREFERENCES_DATA[prefId].value || PREFERENCES_DATA[prefId].defaultValue
  }

  /**
   * Enregistrement des préférences
   * 
   */
  static save(){
    message("Enregistrement des préférences, merci de patienter…")
    const prefs = this.getValues()
    console.info("= Préférences enregistrées : ", prefs)
    WAA.send({class:'Scenario::Document',method:'save_preferences', data:{preferences:prefs}})
  }
  static afterSaved(data){
    if (data.ok){
      message("Préférences enregistrées.")
    } else {
      erreur(data.error)
    }
  }

  static getValues(){
    const values = {}
    for(var prefId in PREFERENCES_DATA){
      if ( not (undefined == PREFERENCES_DATA[prefId].value) ) {
        Object.assign(values, {[prefId]: PREFERENCES_DATA[prefId].value})
      }
    }
    return values
  }

  static setValues(values){
    console.info("Valeurs à appliquer aux préférences : ", values)
    for(var prefId in values){
      PREFERENCES_DATA[prefId].value = values[prefId]
    }
    this.apply()
  }

  /**
   * Pour appliquer les préférences au démarrage
   * 
   */
  static apply(){
    console.log("-> Preferences::apply")
    for (var prefId in PREFERENCES_DATA) {    
      const dPref = PREFERENCES_DATA[prefId]
      const value = PREFERENCES_DATA[prefId].value
      if ( dPref.onChange && undefined != value && value != dPref.defaultValue ) {
        console.log("   - Traitement de key '%s' méthode %s(%s)", prefId, dPref.onChange, value)
        this[dPref.onChange](value)
      }
    }
    console.log("<- Preferences::apply")
  }

  // --- MÉTHODES D'APPLICATION DES CHOIX ---


  static onToggleTimeline(tlId, value){
    // console.log("-> onToggleTimeline", tlId, value)
    Timeline.toggleTimeline(Timeline.getTimeline(tlId), value === true || value == 'true')
    Timeline.setHeightTimelinesAndTops()
  }

  static onToggleTimelineBeats(value){ this.onToggleTimeline('beats', value) }
  static onToggleTimelineSeqs(value) { this.onToggleTimeline('seqs', value) }
  static onToggleTimelineAbs(value)  { this.onToggleTimeline('abs', value) }
  static onToggleTimelineRels(value) { this.onToggleTimeline('rels', value) }
  static onToggleTimelineRuler(value) { this.onToggleTimeline('ruler', value) }

  static onChangeSliderZoomColor(value){
    DGet('div#timeline-slider div.ui-slider-range').style.backgroundColor = value
  }

  static onChangeZoomPreview(value){
    Preview.current && Preview.current.setZoom(value / 100)
  }

  static onChangeNombreLignesPerPage(value){
    log_orange("Je dois apprendre à modifier l'affichage dans la timeline en fonction du nombre de lignes par page.")
  }

  // --- MÉTHODES DE CHECK ---


  checkColor(value, curValue){
    try {
      value[0] == '#' || raise("La couleur doit impérativement commencer par '#'.")
      value.length == 7 || raise("La couleur doit impérativement être au format '#XXXXXX'.")
      value.match(/^\#[a-fA-F0-9]{6,6}$/) || raise("La couleur comporte des caractères interdits…")
      return value
    } catch(err) {
      erreur(err)
      return curValue
    }
  }

  // --- FIN DES MÉTHODES DE CHECK ---


  onBuilding(){
    console.log("-> Preferences#onBuilding")
    const options = {
        container: DGet('div.panneau', this.content)
      , header: ['Préférence', 'Valeur', '']
      , widths: ['50%', '300px', 'auto']
      , aligns: ['left','center','center']
    }
    const data = []
    for(var prefId in PREFERENCES_DATA) {
      const dpref = PREFERENCES_DATA[prefId]
      var value, text = null;
      if ( undefined === dpref.value ) { value = dpref.defaultValue }
      else { value = dpref.value }

      if ( dpref.values && not(dpref.values.length) ) {
        text = dpref.values[String(value)].text
      }
      var spanValue = `<span id="pref-${prefId}" data-prefid="${prefId}" data-value="${value}">${text||value}</span>`

      // console.log("dpref.button: ", dpref.button)
      data.push([dpref.text, spanValue, dpref.button])

    }
    const table = new TableDisplay(data, options)
    table.build()
  }

  observe(){
    super.observe()
    for ( var prefId in PREFERENCES_DATA ) {
      const dpref = PREFERENCES_DATA[prefId]
      const btnId = `btn-${prefId}`
      const btn = DGet(`button#${btnId}`, this.content)
      if ( btn ) {      
        if ( btn.classList.contains('switch')) {
          btn.addEventListener('click', this.onClickSwitchButton.bind(this, btn, prefId))
        } else if ( btn.classList.contains('edit')){
          btn.addEventListener('click', this.onClickEditButton.bind(this, btn, prefId))
          /*
          |  On observe les span éditable des valeurs éditables 
          */
          const span = DGet(`span#pref-${prefId}`,this.content)
          span.addEventListener('input', this.onSpanValueChange.bind(this, span))
        }
      } else {
        console.error("ERREUR FATALE : le bouton #"+btnId+" est introuvable")
      }
    }
    /*
    |  Observation du bouton "Enregistrer"
    */
    DGet('button.btn-save',this.toolsbar).addEventListener('click', this.onClickSaveButton.bind(this))
  }


  onSpanValueChange(span, e){
    var value = span.innerText // contentText ne renverrait pas les retours chariot
    if ( value.endsWith("\n")){
      span.blur()
      span.contentEditable = false
      value = value.substring(0, value.length - 2)
      // console.log("value = '%s'", value)
      const curValue  = span.dataset.value
      const prefId    = span.dataset.prefid
      const dataPref  = PREFERENCES_DATA[prefId]
      if ( 'string' == typeof dataPref.valueTest ) {
        value = this[dataPref.valueTest](value, curValue)
      } else {
        if ( dataPref.valueTest ){
          if ( not(dataPref.valueTest(value)) ) {
            erreur(dataPref.error)
            value = curValue
          }
        }
      }
      span.innerHTML = value
      /*
      |   Valeur réelle mémorisée dans les préférences
      */
      realValue = this.getRealValueOf(value, dataPref.typeValue)

      console.log("Je mets la préférence '%s' à %s", prefId, realValue)
      PREFERENCES_DATA[prefId].value = realValue
      /*
      | Si une méthode de changement est définie, il faut l'invoquer
      */
      if ( dataPref.onChange ) {
        Preferences[dataPref.onChange].call(Preferences, realValue)
      }
    }
    return stopEvent(e)
  }

  onClickSaveButton(e){
    Preferences.save()
    return stopEvent(e)
  }

  onClickSwitchButton(btn, prefId, e){
    const dataPref = PREFERENCES_DATA[prefId]
    const values = dataPref.values
    const spanValue = DGet(`span#pref-${prefId}`,this.content)
    const curDataValue = values[spanValue.dataset.value]
    const newDataValue = values[curDataValue.next]
    spanValue.dataset.value = curDataValue.next
    spanValue.innerHTML     = newDataValue.text
    const realValue = this.getRealValueOf(newDataValue.text, dataPref.typeValue)
    if ( dataPref.defaultValue != realValue){
      PREFERENCES_DATA[prefId].value = realValue
    }
    if ( dataPref.onChange ) {
      Preferences[dataPref.onChange].call(Preferences, realValue)
    }

    return stopEvent(e)
  }

  getRealValueOf(value, typeValue){
    switch(typeValue){
    case 'integer': 
      return parseInt(value, 10)
    case 'float'  : 
      return parseFloat(value)
    case 'boolean':
      if ( value == 1 || value == 0) return value == 1
      else return value == 'true' || value === true
    default: 
      return value
    }

  }

  onClickEditButton(btn, prefId, e){
    const dataPref = PREFERENCES_DATA[prefId]
    const values = dataPref.values
    const spanValue = DGet(`span#pref-${prefId}`,this.content)
    spanValue.contentEditable = true
    spanValue.focus()
    return stopEvent(e)
  }

} // class Preference
