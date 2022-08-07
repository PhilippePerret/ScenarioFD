import { InsideTest, page, mouse } from '../../system/inside-test.lib.js'
import { ITFactory } from './utils/Factory.js'
import * as Check from './utils/Checkers.js'

/**
 * Test du démarrage de l'application
 *
 */

var tests = [], test ;

//* 
test = new InsideTest({
    error: 'Au lance (avant scénario) l’UI se présente conformément aux attentes.'
  , eval:function(){
      try {
        const conts = ['section#cadres_container']
        page.contains(conts.join(' > ')) || raise("On devrait trouver le container disposition général")
        conts.push('div#disposition-1')
        page.contains(conts.join(' > ')) || raise("On devrait trouver le div de la disposition #1")
        // --- Cadre 1 ---
        let sconts = Array.from(conts)
        sconts.push('div#cadre-1-top_left')
        page.contains(sconts.join(' > ')) || raise("On devrait trouver le div du cadre gauche")
        sconts.push('section.preview')
        page.contains(sconts.join(' > ')) || raise("On devrait trouver l'incadre preview dans le cadre gauche")
        // --- Cadre 2 ---
        sconts = Array.from(conts)
        sconts.push('div#cadre-1-top_right')
        page.contains(sconts.join(' > ')) || raise("On devrait trouver le div du cadre droite")
        sconts.push('section.console')
        page.contains(sconts.join(' > ')) || raise("On devrait trouver l'incadre console dans le cadre droit")
        
        // Boutons
        Check.buttonDispositionIs('1') || raise("Le bouton des dispositions devrait afficher le bon bouton (1).")

        return true
      } catch(err) {
        InsideTest.error = err
        return false
      }
    }
})
tests.push(test)
test.exec()
//*/


//* 
test = new InsideTest({
    error: 'La disposition (#1) par défaut %{devrait} être appliquée au lancement de l’application.'
  , eval:function(){
      try {
        Disposition.current.dispoKey == 1 || raise("La clé dispoKey de la disposition courante devrait être la 1, c'est la " + Disposition.current.dispoKey)
        const cadreLeft = Disposition.current.cadre('top_left')
        cadreLeft instanceof Cadre || raise("Le cadre gauche devrait être une instance Cadre.")
        cadreLeft.incadre.type == 'preview' || raise("L'incadre du cadre gauche devrait être un prévisualiseur (type 'preview') hors son type est '%s'", [cadreLeft.incadre.type])
        const cadreRight = Disposition.current.cadre('top_right')
        cadreRight instanceof Cadre || raise("Le cadre droit devrait être une instance Cadre.")
        cadreRight.incadre.type == 'console' || raise("L'incadre du cadre droit devrait être une console (type = 'console') hors son type est '%s'…", [cadreRight.incadre.type])
        return true
      } catch(err) {
        InsideTest.error = err
        return false
      }
    }
})
tests.push(test)
test.exec()
//*/

//*
test = new InsideTest({
    error: 'Le cadre %{sujet} %{doit} posséder le bon contenu.'
  , eval:function(quart){
      return cadre(quart).incadre.type
    }
})
tests.push(test)
test.withExpected('top_left'      , 'preview')
test.withExpected('top_right'     , 'console')
//*/

/*
|  On simule le chargement d'un scénario et on vérifie qu'il s'affiche
|  correctement.
*/
//*
test = new InsideTest({
    error: 'Le scénario %{devrait} s’afficher correctement.'
  , eval:function(){
      // On charge un scénario courant
      ITFactory.makeCurrentScenario({scenes: [
          {sceneId:'2', content:":INT. SALON - JOUR\nUne première action du premier scénario dans le salon."}
        , {sceneId:'1', content:":EXT. RUE - JOUR\nDans le premier scénario, JOHN marche tout seul dans la rue."}
      ]})

      const scenario = Scenario.current

      try {      
        // Les scènes doivent être affichées
        page.contains('div#scene-2.scene') || raise("La scène d'identifiant 2 est introuvable")
        page.contains('div#cadre-1-top_left > section.preview > div.content > div#scene-2') || raise(
          "La scène #2 n'est pas affichée dans le bon cadre."
        )
        page.contains('div#scene-2.scene div.sline.intitule', 'INT. SALON - JOUR') || raise(
          "L'intitulé de la scène #2 est mauvais"
        )
        page.contains('div#scene-1.scene') || raise("La scène #1 est introuvable")
        page.contains('div#cadre-1-top_left > section.preview > div.content > div#scene-1') || raise(
          "La scène #1 n'est pas affichée dans le bon cadre."
        )
        page.contains('div#scene-1.scene div.sline.intitule', 'EXT. RUE - JOUR') || raise(
          "L'intitulé de la scène #1 est introuvable ou mauvais"
        )

        // Il doit y avoir un décor
        // TODO
        scenario.decors.contains('SALON') || raise("Le scénario devrait posséder le décor 'SALON'")
        scenario.decors.contains('RUE') || raise("Le scénario devrait posséder le décor 'RUE'")

        return true

      } catch(err) {
  
        InsideTest.current.error = err
        return false
  
      }


    }
})
tests.push(test)
test.exec()
//*/
