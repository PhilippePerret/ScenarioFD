'use strict';

$(document).ready(e => {

  UI.prepare()
  Cadre.prepare()
  console.log("Ready!")
  
  // Jouer les inside-tests (sauf si INSIDE_TESTS est false)
  InsideTest.run()


  // WAA.send({class:'Scenario::Document', method:'get_current_scenario'})

})


// Méthode appelée après le chargement du scénario, pour tests et
// essais divers
function afterScenarioLoading(){


}

