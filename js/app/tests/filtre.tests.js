import { InsideTest, page, mouse } from '../../system/inside-test.lib.js'
import { ITFactory } from './Factory.js'
import * as Check from './Checkers.js'

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
      , {sceneId:'1', content:":EXT. CHAMBRE - JOUR\nVALENTINE cherche dans la chambre.\nVALENTINE:\n  Mais si je vais te trouver."}
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

      // Un scénario est déjà courant, normalement. On prend le
      // nouveau pour cette partie.
      ITFactory.makeCurrentScenario(DataScenarioForFiltre)

      const consoleCourante = Console.current
      // console.log("Console courante : ", consoleCourante)

      // Faire apparaitre les types
      consoleCourante.btnTypeContent.classList.remove('hidden')

      // On choisit l'incadre 'filtre' dans le cadre qui contient 
      // pour le moment la console.
      mouse.clickOn(DGet('div[data-content="filter"]', consoleCourante.btnTypeContent))

      page.contains('section.filter')

      return false
    }
})
tests.push(test)
test.exec()
