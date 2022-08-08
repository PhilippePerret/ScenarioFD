import { InsideTest, page, mouse } from '../../system/inside-test.lib.js'
import { ITFactory } from './utils/Factory.js'
import * as Check from './utils/Checkers.js'
import { ITAction } from './utils/Actions.js'
import {DataScenarioComplet} from './utils/Data_Scenarios.js'

/**
 * Tests pour voir si le texte du scénario est bien parsé
 * 
 */

var tests = [], test ;
var erreurs = []
const ITERRORS = {
    badLinesCount   : 'Le nombre de ligne de la scène #%s devrait être %s. Il est de %s.'
  , badDecor        : 'Le décor de la scène #%s devrait être «%s». C’est «%s».'
  , badScene        : "La propriété :%s de la scène #%s est mauvaise.\n    Expected: «%s»\n    Actual: «%s»"
  , badSpec         : "La propriété :%s de la ligne %s de la scène #%s est mauvaise.\n    Expected: «%s».\n    Actual: «%s»"
}

/**
 * Méthode de check pour vérifier les caractéristiques d'une scène
 * 
 * @param scene {Scene} La scène à contrôler
 * @param specs {Hash} Les spécificités attendues
 * 
 */
function SceneSpecsEqual(scene, specs) {
  for ( var spec in specs ) {
    scene[spec] == specs[spec] || erreurs.push(tp(ITERRORS.badScene, [spec, scene.numero, specs[spec], scene[spec]]))
  }
}
/**
 * Méthode de check pour vérifier les caractéristiques d'une ligne
 * de scène
 * @param scene {Scene} La scène contenant la ligne
 * @param indexLine {Integer} L'index de la ligne (contenu seulement)
 * @param specs {Hash} Les spécificités de la scène, à commencer par
 *                      :type et :content
 */
function LineSpecsEqual(scene, indexLine, specs){
  const line = scene.lines[indexLine]
  // console.log("line = ", line)
  for(var spec in specs){
    line[spec] == specs[spec] || erreurs.push(tp(ITERRORS.badSpec, [spec, indexLine, scene.numero, specs[spec], line[spec]]))
  }
}


test = new InsideTest({
    error: 'Le parsing des scènes %{devrait} être correct.'
  , eval: function(){

      /*
      |  On simule l'ouverture du scénario avec les données ci-dessus
      */
      ITFactory.makeCurrentScenario(DataScenarioComplet)

      /*
      |  On teste tout
      |
      | On met dans un try pour les erreurs systèmes, mais en fait,
      | tout le texte sera considéré pour relever toutes les erreurs
      | à chaque fois.
      */

      var scene ;
      erreurs = []
      const scenario = Scenario.current
      
      try {

        scene = scenario.sceneById(3)
        // console.log("scene: ", scene)
        SceneSpecsEqual(scene, {LinesCount:4, index:0, numero:1, decor:'SALON'})
        LineSpecsEqual(scene, 0, {type:'intitule', content:'INT. SALON - JOUR', effet:'JOUR', lieu:'INT.', decor:'SALON'})

        scene = scenario.sceneById(5)
        SceneSpecsEqual(scene, {LinesCount:7, index:1, numero:2, decor:'RANCH'})
        LineSpecsEqual(scene,0,{type:'intitule'})
        LineSpecsEqual(scene,1,{type:'action', content:'Marion va parler.'})
        LineSpecsEqual(scene,2,{type:'nom', content:'MARION'})
        LineSpecsEqual(scene,3,{type:'dialogue', content:'Je m’appelle Marion.'})

        // Dialogue et note de jeu
        scene = scenario.sceneByNumero(3)
        SceneSpecsEqual(scene, {index:2, numero:3, decor:'PLACARD', lieu:'INT.', effet:'NUIT'})
        LineSpecsEqual(scene, 0, {type:'intitule', content:'INT. PLACARD - NUIT'})
        LineSpecsEqual(scene, 1, {type:'nom', content:'BERNARD'})
        LineSpecsEqual(scene, 2, {type:'note-jeu', content:'apeuré', owner:'BERNARD'})
        LineSpecsEqual(scene, 3, {type:'dialogue', content:'Même pas peur.'})

        // Dialogue alternatif et propriétaire du dialogue
        scene = scenario.sceneByNumero(4)
        LineSpecsEqual(scene, 2, {type:'dialogue', owner:'SAM'})
        LineSpecsEqual(scene, 3, {type:'dialogue-alt', owner:'SAM'})

        // Transition
        scene = scenario.sceneById(7)
        LineSpecsEqual(scene, 2, {type:'transition', content:'CUT'})

      } catch (err) {

        InsideTest.error = err
        return false

      }

      if ( erreurs.length ) {
        InsideTest.error = erreurs.join("\n")
        return false
      } else {
        return true
      }
    }
})
tests.push(test)
test.exec()
