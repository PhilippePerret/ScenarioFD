'use strict';

class ITFactoryClass {

  /**
   * Méthode pour instancier un scénario courant pour les tests
   * à partir des +data+
   */
  makeCurrentScenario(data){
    data = data || {}
    const scenario_data = {
        scenes: data.scenes || [
          {sceneId:'1', content:":INT. BUREAU - JOUR\nUne belle action."}
        ]
      , preferences: data.preferences || {}
      , personnages: data.personnages || []
      , decors:      data.decors || []
      , infos: data.infos || {
            titre_scenario:'Scénario pour les tests'
          , duree_film: data.duree || 90
        }
      , options: data.options
    }
    /* Simulation du chargement du scénario, qui le met en courant */
    Scenario.onLoad(scenario_data)

  }

  /**
   * Retourne un bouton qui permet de choisir le type de contenu
   * de cadre voulu.
   * Ce bouton peut être utilisé pour simuler un click souris sur
   * un type de contenu pour le mettre dans le cadre voulu :
   * 
   *    const incadre = Cadre.cadre(quart).content
   *    const div = TFactory.typeContenuButton(<type>)
   *    incadre.onClickButtonTypeContent(div, InsideTest.FAKE_EVENT)
   * 
   */
   typeContentButton(type){
      return DCreate('DIV',{'data-content':type})
   }

}
export const ITFactory = new ITFactoryClass()
