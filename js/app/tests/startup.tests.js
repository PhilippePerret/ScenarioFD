import { InsideTest, page, mouse } from '../../system/inside-test.lib.js'

/**
 * Test du démarrage de l'application
 *
 */

var tests = [], test ;


test = new InsideTest({
    error: 'Le cadre %{sujet} %{doit} posséder le bon contenu.'
  , eval:function(quart, expected){
      // Log.test("Le cadre '" + quart + "' est le " + Cadre.cadre(quart).inspect )
      // Log.test("Son contenu est " + Cadre.cadre(quart).content.inspect )
      // console.log("Cadre.cadre(quart).content.type = '%s':%s / expected = '%s':%s", Cadre.cadre(quart).content.type, typeof Cadre.cadre(quart).content.type,  expected, typeof expected)
      return cadre(quart).content.type
    }
})
tests.push(test)
test.withExpected('top_left'      , 'preview')
test.withExpected('top_right'     , 'console')
test.withExpected('bottom_left'   , 'preview')
test.withExpected('bottom_right'  , 'console')

/*
|  On simule le chargement d'un scénario et on vérifie qu'il s'affiche
|  correctement.
*/
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
        page.contains('div#cadre-1 > section.preview > div.content > div#scene-2') || raise(
          "La scène #2 n'est pas affichée dans le bon cadre."
        )
        page.contains('div#scene-2.scene div.sline.intitule', 'INT. SALON - JOUR') || raise(
          "L'intitulé de la scène #2 est mauvais"
        )
        page.contains('div#scene-1.scene') || raise("La scène #1 est introuvable")
        page.contains('div#cadre-1 > section.preview > div.content > div#scene-1') || raise(
          "La scène #1 n'est pas affichée dans le bon cadre."
        )
        page.contains('div#scene-1.scene div.sline.intitule', 'EXT. RUE - JOUR') || raise(
          "L'intitulé de la scène #1 est introuvable ou mauvais"
        )

        // Il doit y avoir un décor
        // TODO
        scenario.decors.contains('SALON') || raise("Le scénario devrait posséder le décor 'SALON'")
        scenario.decors.contains('RUE') || raise("Le scénario devrait posséder le décor 'RUE'")

      } catch(err) {
        InsideTest.current.error = err
        return false
      }


      return true
    }
})
tests.push(test)
test.exec()
