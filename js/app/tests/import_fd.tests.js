import {InsideTest, page, mouse} from '../../system/InsideTest/inside-test.lib.js'
import { ITFactory } from './utils/Factory.js'
import * as Check from './utils/Checkers.js'
import { ITAction } from './utils/Actions.js'

/**
 * IMPORT FINAL-DRAFT SCRIPT TESTS
 * --------------------------------
 * To make sure all the usefull final-draft data are loaded in
 * the Scenario app and saved in the Scneario file.
 * 
 */
try {


const ERRS = {
    badTitre        : 'Le titre est mauvais. Devrait être «%s». Est «%s».'
  , baSynopis       : 'Le synopsis n’est pas bon.'
}


var test ;
var erreurs = []

test = new InsideTest({
    error: 'Juste pour mettre l’index à 1'
  , eval: (sujet, index)=>{
      console.log("Pour le sujet '%s', l'index est %i", sujet, index)
      return true
    }
})
test.with("Ce sujet")


test = new InsideTest({
    error: 'Le scénario Final-Draft %{devrait} s’IMPORTER correctement.'
  , eval: function(){
      /*
      |  On invoque la méthode de test qui va simuler l'import
      |  du document final draft
      */
      IT_WAA.send(InsideTest.current, {class:'Scenario::InsideTest', method:'test_import' ,data:{fd_file:'simple'}})
      return true
    }
  , afterServerEval: function(data){
      /*
      |  Noter qu'on passe ici même si les tests côté serveur ont
      |  échoué.
      */
      const script  = Scenario.current
      const err     = InsideTest.addError.bind(InsideTest)
      var expected ;


      if ( not(data.result.ok) ) {
        data.result.errors.forEach(error => err(error))
        return false
      }
      console.log("Données remontée du serveur : ", data)
      /*
      |  On peut charger le scénario et vérifier
      */
      ITFactory.makeCurrentScenario(data.script)


      expected = 'Mon scénario'
      script.titre == expected || err(ERRS.badTitre, [expected, script.titre])
      script.synopsis == ''    || err(ERRS.baSynopis, ['', script.synopsis])

      return InsideTest.current.errors.length == 0
    }
})
test.exec()


}catch(err){
  console.error(err)
}
