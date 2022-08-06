

/**
 * @return TRUE si le bouton disposition affiché est bien celui
 * d'identifiant +dispoId+
 * 
 */
export function buttonDispositionIs(dispoId, dispoKey){
  const btnId = `button#cadres-disposition > div#btn-mini-cadre-${dispoId}`
  const btn   = DGet(btnId)
  return not( btn.classList.contains('hidden') )
}
