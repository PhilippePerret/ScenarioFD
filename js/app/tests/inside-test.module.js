import {InsideTest} from '../../system/inside-test.lib.js'

// Les tests
import './ui.tests.js'
import './startup.tests.js'
import './filtre.tests.js'


$(document).ready(e => {
  InsideTest.run()
})
