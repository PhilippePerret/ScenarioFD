import {InsideTest, page, mouse} from '../../system/InsideTest/inside-test.lib.js'
import { ITFactory } from './utils/Factory.js'
import * as Check from './utils/Checkers.js'
import { ITAction } from './utils/Actions.js'
/**
 * EXPORT FINAL-DRAFT SCRIPT TESTS
 * --------------------------------
 * To make sure all the usefull Scenario data are exported into
 * a conform Final-Draft file.
 * 
 */
var tests = [], test ;
var erreurs = []

test = new InsideTest({
    error: 'Le scénario Scénario %{devrait} s’exporter correctement dans le fichier Final-Draft.'
  , eval: function(){
      InsideTest.error = "L'exportation n'est pas encore traitée."
      return false
    }
})
test.exec()
