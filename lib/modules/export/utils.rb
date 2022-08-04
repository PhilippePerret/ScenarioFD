# encoding: UTF-8
=begin

Méthodes utiles pour l'export

=end

##
# Produit, à partir d'une table, les attributs des balises
# XML.
# Cf. les constantes pour voir des exemples de table.
#
def define_attributes(table_attributs)
  table_attributs.map do |attr, value|
    "#{attr}=\"#{value}\""
  end.join(' ')
end
