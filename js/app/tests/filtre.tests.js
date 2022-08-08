import { InsideTest, page, mouse } from '../../system/inside-test.lib.js'
import { ITFactory } from './utils/Factory.js'
import * as Check from './utils/Checkers.js'
import { ITAction } from './utils/Actions.js'

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

      // 
      // Un scénario est déjà courant, normalement. On prend le
      // nouveau pour cette partie.
      // 
      ITFactory.makeCurrentScenario(DataScenarioForFiltre)
      
      // 
      // Afficher le contenu 'filtre'
      // 
      ITAction.chooseInCadreIn('filter', Console.current)

      try {
        
        /*
        | On trouve tous les sélecteurs de filtre attendus
        |
        */
        const selectors = {
            'section.filter': 'une section.filter'
          , 'div.maindiv-filter-scenes_range'     : 'le div pour le filtre des scènes par numéro'
          , 'div.maindiv-filter-personnage'       : 'le div pour le filtre des personnages'
          , 'div.maindiv-filter-decor_et_effet'   : 'le div pour le filtre des décors et effets'
          , 'div.maindiv-filter-type_element'     : 'le div pour le filtre par type d’élément'
          , 'div.maindiv-filter-words'            : 'le div pour la recherche par mots'
        }
        for(var selector in selectors) {
          page.contains(selector) || raise("Le page devrait contenir " + selectors[selector])
        }

        return true
      } catch(err) {
        InsideTest.error = err
        return false
      }
    }
})
tests.push(test)
test.exec()

// TODO : vérifier que la disposition a été actualisée (elle doit être mémorisée avec le nouveau contenu)
