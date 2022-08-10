import { InsideTest, page, mouse } from '../../system/InsideTest/inside-test.lib.js'

var tests = [] ;
var test ;

test = new InsideTest({
    error: 'La page %{devrait} contenir %{sujet}.'
  , eval: function(sujet){
      return page.contains(sujet)
    }
})
tests.push(test)

// Les éléments constants que la page doit contenir
test.with('section#timelines')
test.with('section#cadres_container')

