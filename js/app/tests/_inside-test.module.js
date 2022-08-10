import {InsideTest} from '../../system/InsideTest/inside-test.lib.js'
/**
 * Ce module est chargé en tant que module (mjs) par le code HTML.
 * 
 */

// Les tests
// ----------
import './ui.tests.js'
import './startup.tests.js'
// import './parsing.tests.js'
// import './filtre.tests.js'
import './import_fd.tests.js'
// import './export_fd.tests.js'


$(document).ready(async e => {

  Log.level = LOG_FATAL_ERROR|LOG_IOFUNCTION|LOG_DEBUG

  await InsideTest.install()
  InsideTest.run()

})
