'use strict';

const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };


const SCENARIO_DATA = {
    'titre_scenario': {
        text:           "Titre du scénario"
      , defaultValue:   ''
      , valueType:      'string'
      , button:         tp(BTN_EDIT,['titre_scenario'])
      , valueTest:      'checkTitre'
    }
  , 'auteurs_scenario': {
        text:           "Auteurs <span class='description'>(NOM, Prénom; NOM, Prénom)</span>"
      , defaultValue:   1
      , valueType:      'boolean'
      , button:         tp(BTN_EDIT,['auteurs_scenario'])
      , valueTest:      'checkAuteurs'
    }
  , 'version_scenario': {
        text:           'Version du scénario <span class="description">(X.y.z)</span>'
      , defaultValue:   '0.1.0'
      , valueType:      'string'
      , button:         tp(BTN_EDIT,['version_scenario'])
      , valueTest:      'checkVersion'
    }
  , 'production_scenario':{
        text:           'Production'
      , defaultValue:   'Auto-production'
      , valueType:      'string'
      , button:         tp(BTN_EDIT,['production_scenario'])
    }
  , 'duree_film': {
        text:           'Durée du film <span class="description">(en minutes)</span>'
      , defaultValue:   90
      , valueType:      'integer'
      , button:         tp(BTN_EDIT,['duree_film'])
      , valueTest:      'checkDuree'
    }
  , 'realisateur_film': {
        text:           'Réalisateur du film'
      , defaultValue:   ''
      , valueType:      'string'
      , button:         tp(BTN_EDIT,['realisateur_film'])
      , valueTest:      'checkPeople'
    }
  , 'annee_sortie_film': {
        text:           'Année de sortie du film'
      , defaultValue:   2022
      , valueType:      'integer'
      , button:         tp(BTN_EDIT,['annee_sortie_film'])
      , valueTest:      'checkAnnee'
    }
  , 'date_creation': {
        text:           'Date de création'
      , defaultValue:   new Date().toLocaleDateString('fr-FR', optionsDate)
      , valueType:      'string'
      , button:         tp(BTN_EDIT,['date_creation'])
    }
  , 'app_version': {
        text:           'Version de l’application'
      , defaultValue:   '0.1.0'
      , valueType:      'string'
      , editable:       false // on ne peut pas l'éditer
    }
}

class InfosScenario extends InCadre {

  constructor(cadre){
    super('infos', cadre)
  }

  /*
  |
  | --- MÉTHODES DE CHECK DES VALEURS ---
  |
  | Toutes ces méthodes ne doivent rien renvoyer en cas de succès
  | et, au contraire, retourner le message d'erreur en cas d'échec.
  */
  static checkTitre(value) {
    try {
      value = value.trim()
      value.length || raise("Il faut donner un titre au scénario/film.")
    } catch(err)  { return err }
  }
  static checkAuteurs(value) {
    return this.checkPeople(value)
  }
  static checkVersion(value) {
    if ( /^[0-9]+(\.[0-9]+){0,2}$/.exec(value)) {
      return null
    } else {
      return `««« ${value} »»» n'est pas un numéro de version valide (valide : « X.Y.Z »).`
    }
  }
  static checkDuree(value) {
    const REGEXP = /^[0-9]+$/
    if ( REGEXP.exec(value) && value > 0 && value < 600 ) {
      return null
    } else {
      return `La durée ${value} n'est pas valide (attendu : un nombre entre 1 et 599)`
    }
  }
  static checkAnnee(value){
    if ( /^[0-9]+$/.exec(value) && [2,4].includes(String(value).length) ){
      return null
    } else {
      return `${value} n'est pas une année conforme (XXXX ou XX)`
    }
  }
  static checkPeople(value){
    const REGEXP_PATRONYME = /^((.+),(.+))(;(.+),(.+))*$/
    if ( REGEXP_PATRONYME.exec(value) ) {
      return null
    } else {
      return value + " n'est pas une expression pour un ou des noms. Devrait être : « NOM,Prénom;NOM,Prénom, etc. »"      
    }
  }
  /*
  |
  | --- MÉTHODES D'OPÉRATION ---
  |
  */
  save(){
    console.log('-> InfosScenario#save')
    const infos = this.getValues()
    WAA.send({class:'Scenario::Document', method:'save_infos_current', data:{infos:infos}})
  }
  static onSavedInfos(result){
    console.log('-> InfosScenario::onSavedInfos')
    if ( result.ok ) {
      message("Informations enregistrées.")
    } else {
      erreur(result.error)
    }
  }

  getValues(){
    const values = {}
    Object.keys(SCENARIO_DATA).forEach( infoId => {
      const dataInfo = SCENARIO_DATA[infoId]
      const value = DGet(`span#info-${infoId}`, this.content).dataset.value
      Object.assign(values, {[infoId]: this.realValueFor(value, dataInfo)})
    })
    return values
  }

  setValues(infos){
    for(var infoId in infos){
      if ( SCENARIO_DATA[infoId] ) {
        SCENARIO_DATA[infoId].value = infos[infoId]
      }
    }
  }

  /**
   * @return l'information de clé +infoId+
   * 
   */
  static get(infoId){
    return SCENARIO_DATA[infoId].value || SCENARIO_DATA[infoId].defaultValue
  }

  afterBuild(){
    this.log.in('#afterBuild', this.inspect)
    const options = {
        container: DGet('div.panneau', this.content)
      , header: ['INFORMATIONS SUR LE SCÉNARIO/FILM', 'Valeur', '']
      , widths: ['auto', '300px', '40px']
      , aligns: ['left','center','center']
    }
    const data = []
    for(var infoId in SCENARIO_DATA) {
      const dinfo = SCENARIO_DATA[infoId]
      var value, text = null;
      if ( undefined === dinfo.value ) { value = dinfo.defaultValue }
      else { value = dinfo.value }

      if ( dinfo.values && not(dinfo.values.length) ) {
        text = dinfo.values[value].text
      }
      var spanValue = `<span id="info-${infoId}" data-infoid="${infoId}" data-value="${value}">${text||value}</span>`

      // console.log("dinfo.button: ", dinfo.button)
      data.push([dinfo.text, spanValue, dinfo.button || ''])
    }
    const table = new TableDisplay(data, options)
    table.build()
  }

  observe(){
    super.observe()
    for ( var infoId in SCENARIO_DATA ) {
      const dinfo = SCENARIO_DATA[infoId]
      if ( dinfo.editable === false ) continue;
      const btnId = `btn-${infoId}`
      const btn = DGet(`button#${btnId}`, this.content)
      if ( btn ) {      
        if ( btn.classList.contains('switch')) {
          btn.addEventListener('click', this.onClickSwitchButton.bind(this, btn, infoId))
        } else if ( btn.classList.contains('edit')){
          btn.addEventListener('click', this.onClickEditButton.bind(this, btn, infoId))
          /*
          |  On observe les span éditable des valeurs éditables 
          */
          const span = DGet(`span#info-${infoId}`,this.content)
          span.addEventListener('input', this.onSpanValueChange.bind(this, span))
        }
      } else {
        // Le bouton est introuvable alors que la propriété est
        // éditable => erreur
        console.error("ERREUR FATALE : le bouton #"+btnId+" est introuvable")
      }
    }
    
    // TODO Observer le bouton "Enregistrer"
    DGet('button.btn-save', this.toolsbar).addEventListener('click', this.save.bind(this))

  }

  onSpanValueChange(span, e){
    var value = span.innerText // contentText ne renverrait pas les retours chariot
    if ( value.endsWith("\n")){
      span.blur()
      span.contentEditable = false
      value = value.substring(0, value.length - 2)
      // console.log("value = '%s'", value)
      const curValue  = span.dataset.value
      const infoId    = span.dataset.infoid
      const dataInfo  = SCENARIO_DATA[infoId]
      if ( dataInfo.valueTest ){
        var err
        if ( err = InfosScenario[dataInfo.valueTest].call(InfosScenario, value)) {
          erreur(err)
          span.innerHTML = curValue
          return
        }
      }
      span.innerHTML = value
      span.dataset.value = value
      /*
      |   Valeur réelle mémorisée dans les préférences
      */
      let realValue = this.realValueFor(value, dataInfo)
      SCENARIO_DATA[infoId].value = realValue
      /*
      | Si une méthode de changement est définie, il faut l'invoquer
      */
      if ( dataInfo.onChange ) {
        this[dataInfo.onChange].call(this, realValue)
      }
    }
    return stopEvent(e)
  }

  /**
   * Retourne la vraie valeur de +value+ en fonction de son valueType
   * défini dans +dataIno+
   * 
   */
  realValueFor(value, dataInfo){
    let realValue
    switch( dataInfo.valueType ){
    case 'integer': return realValue = parseInt(value, 10)
    case 'float'  : return realValue = parseFloat(value)
    default:        return value
    }
  }

  onChangeZoomPreview(value){
    Preview.current && Preview.current.setZoom(value / 100)
  }

  onChangeNombreLignesPerPage(value){
    log_orange("Je dois apprendre à modifier l'affichage dans la timeline en fonction du nombre de lignes par page.")
  }

  onClickSwitchButton(btn, infoId, e){
    const data_info = SCENARIO_DATA[infoId]
    const values = data_info.values
    const spanValue = DGet(`span#info-${infoId}`,this.content)
    const curDataValue = values[spanValue.dataset.value]
    const newDataValue = values[curDataValue.next]
    spanValue.dataset.value = curDataValue.next
    spanValue.innerHTML     = newDataValue.text
    return stopEvent(e)
  }
  onClickEditButton(btn, infoId, e){
    const data_info = SCENARIO_DATA[infoId]
    const values = data_info.values
    const spanValue = DGet(`span#info-${infoId}`,this.content)
    spanValue.contentEditable = true
    spanValue.focus()
    return stopEvent(e)
  }
} // class InfosScenario



//##################################################################


// TESTS

// InfosScenario --- Les méthodes de check des valeurs
var test ;

test = new InsideTest({
    error: '%{devrait} être une chaine people valide'
  , eval:  function(sujet){ return InfosScenario.checkPeople(sujet) === null}
})
test.with('MICHEL, Marion')
test.with('MICHEL,Marion;PERRET, Philippe')
test.withNegate('Marion MiCHEL')

test = new InsideTest({
    error: '%{devrait} être considéré comme une année valide'
  , eval: function(sujet){ return InfosScenario.checkAnnee(sujet) === null }
})
test.with('2022')
test.with('22')
test.withNegate('29/05/2022')
test.withNegate('l’année du boudin')

test = new InsideTest({
    error: '%{devrait} être un numéro de version valide'
  , eval: function(sujet){return InfosScenario.checkVersion(sujet) === null}
})
test.with('1')
test.with('2.456')
test.with('2.6.456')
test.withNegate('1.2.3.4')
test.withNegate('une version')

test = new InsideTest({
    error: '%{devrait} être une durée de film valide'
  , eval:  function(sujet){return InfosScenario.checkDuree(sujet) === null}
});
[5, 10, 12, 50, 200, 599].forEach(duree => test.with(duree));
[-1, -20, 0, 600, 2000].forEach(duree => test.withNegate(duree));
