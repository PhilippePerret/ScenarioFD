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
var test ;
var erreurs = []

test = new InsideTest({
    error: 'Le scénario Final-Draft %{doit} s’importer correctement.'
  , eval: (index) => {
      console.log("index : ", index)
      /*
      |  On invoque la méthode de test qui va simuler l'import
      |  du document final draft
      */
      IT_WAA.send(InsideTest.current, index, {class:'Scenario::InsideTest',method:'test_import',data:{fd_file:'simple'}})
      return true
    }
})
test.exec()