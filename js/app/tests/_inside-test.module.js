import {InsideTest} from '../../system/inside-test.lib.js'

// Les tests
// import './ui.tests.js'
// import './startup.tests.js'
import './parsing.tests.js'
// import './filtre.tests.js'


$(document).ready(e => {

  Log.level = LOG_FATAL_ERROR|LOG_IOFUNCTION|LOG_DEBUG

  InsideTest.run()
})
