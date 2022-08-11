'use strict';
/**
 * Pour faire attendre la fin des InsideTest quand il y a des 
 * tests côté serveur et réceptionner les résultats pour les 
 * envoyer à InsideTest
 * 
 */
const IT_ERRORS = {
    requireCurrentTest  : "Il faut impérativement un test courant pour appeler IT_WAA.send."
  , testIdRequired      : "IT_WAA.receive attend impérativement data.testId."
  , resultServerRequired: 'IT_WAA.receive attend impérativement le résultat du test serveur ({:ok, :errors}).'

}
class IT_WAA {
  static get working(){
    if ( undefined === this.workers ) return false
    // Nombre de workers en activité
    const workersCount = Object.keys(this.workers).length
    // Nombre de retours de résultats non traités
    const ResultatCount = this.stackServerResultats.length
    // S'il reste des choses à faire, on retourne false
    return not(workersCount == 0 && ResultatCount == 0)

  }

  static send(test, data){
    test || raise(IT_ERRORS.requireCurrentTest)
    if ( undefined === this.stackServerResultats ) {
      this.workers = {}
      this.stackServerResultats = []
    }
    /*
    | On consigne ce "worker" (ça donnera aussi la valeur true à
    | this.working)
    */
    Object.assign(this.workers, { [test.id]: test })
    /*
    |  On peut envoyer la requête serveur en ajoutant aux données
    |  l'identifiant du test.
    */
    Object.assign(data.data, { testId:test.id });
    /*
    |  Transmission de la requête au serveur
    */
    WAA.send(data)
  }

  /**
   * Méthode qui reçoit la réponse des tests côté serveur
   * 
   * @param data  {Object} Table des résultat
   *              note : elle doit contenir :testId, l'identifiant 
   *              du test.
   */
  static receive(data){
    // console.log("Données reçues par IT_WAA.receive", data)
    data.testId || raise(IT_ERRORS.testIdRequired)
    data.result || raise(IT_ERRORS.resultServerRequired)
    /*
    |  On passe les résultats au test
    */
    this.stackServerResultats.push(data)
    /*
    |  On détruit ce worker
    */
    delete this.workers[data.testId]
  }



}
