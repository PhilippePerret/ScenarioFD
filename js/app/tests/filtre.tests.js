import { InsideTest, page, mouse } from '../../system/inside-test.lib.js'

/**
 * Tests de l'affichage et du fonctionnement correct de la page
 * filtre.
 * 
 * L'idée est d'afficher au départ un scénario avec pas mal de choses
 * à chercher, puis de filtrer l'affichage.
 * 
 */

const DataScenarioForFiltre = {

    scenes: [
        {sceneId:'3', content:":INT. VALISE - JOUR\nJOHN est caché dans sa valise.\nJOHN:\n  Tu ne me trouveras pas."}
      , {sceneId:'1', content:":EXT. CHAMBRE - JOUR\nVALENTINE cherche dans la chambre.\nVALENTINE:\n  Mais si je vais te trouverai."}
      , {sceneId:'2', content:":INT. CUISINE - JOUR\nLa MÈRE prépare des cookies avec soin.\nElle cherche un accessoire dans ses tiroirs."}
    ]
  , infos: {
      titre_scenario:'Deuxième'
    , duree_film: 60
  }
}

var tests = [], test ;

test = new InsideTest({
    error: 'La page devrait bien afficher le filtre.'
  , eval: function(){
      ITFactory.makeCurrentScenario(DataScenarioForFiltre)
      return false
    }
})
tests.push(test)
test.exec()
