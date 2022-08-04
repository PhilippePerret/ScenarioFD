'use strict';

$(document).ready(e => {
  
  // Log.level = null // normal
  Log.level = LOG_DEBUG|LOG_INFO

  UI.prepare()
  Cadre.prepare()

  Log.notice("Ready!")
  
  // Jouer les inside-tests (sauf si INSIDE_TESTS est false)
  // InsideTest.run()


  // WAA.send({class:'Scenario::Document', method:'get_current_scenario'})

})


// Méthode appelée après le chargement du scénario, pour tests et
// essais divers
function afterScenarioLoading(){


}

