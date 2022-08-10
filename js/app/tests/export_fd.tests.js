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
    error: 'Le scénario Scénario %{doit} doit s’exporter correctement dans le fichier Final-Draft.'
  , eval: function(){

    }
})
test.exec()
