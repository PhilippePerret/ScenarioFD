'use strict';

$(document).ready(e => {
  
  // Log.level = null // normal
  if ( INSIDE_TESTS ) {
    // Log.level = LOG_INSIDE_TEST|LOG_FATAL_ERROR|LOG_ERROR
    // Log.level = LOG_ALL
    Log.level = LOG_FATAL_ERROR
  } else {
    Log.level = LOG_DEBUG|LOG_INFO|LOG_IOFUNCTION
  }

  /*
  |  Préparation générale de l'UI
  */
  UI.prepare()
  /*
  | Préparation de la disposition de l'écran
   */
  Disposition.prepare()

  Log.notice("Ready!")
  
  // Jouer les inside-tests (sauf si INSIDE_TESTS est false)
  // InsideTest.run()


  // WAA.send({class:'Scenario::Document', method:'get_current_scenario'})

})


// Méthode appelée après le chargement du scénario, pour tests et
// essais divers
function afterScenarioLoading(){


}

