# encoding: UTF-8
=begin

  Class FdScene
  --------------
  Pour "Final-Draft-Scene"

  On lui donne le code Scenario au départ et il en tire
  le code XML pour le fichier FinalDraft

=end
module Scenario


class Document
class FdScene # pour "Final-draft Scene"

  attr_reader :data

  # 
  # Contenu brut de la scène
  # 
  attr_reader :raw_content

  #
  # Décalage de la scène dans le scénario
  # 
  attr_reader :offset

  #
  # Les paragraphes du scénario. Attention, ce ne sont
  # pas des instances ScLine, mais des instances
  # FdParagraph. Pour obtenir l'instance ScLine, utiliser
  # <FdParagraph>#scline
  # 
  attr_reader :fd_paragraphs

  #
  # Les script-notes
  # 
  attr_reader :script_notes

  def initialize(data)
    @data = data
    @raw_content  = @data['content'] || @data[:content] || raise("La scène n'a aucun contenu… (#{data.pretty_inspect})")
    @offset       = @data['offset']  || @data[:offset]
  end

  ##
  # On parse la scène Scenario, qui peut contenir
  # de nombreuses informations, dont :
  #   - les paragraphes du scénario
  #   - les données méta (résumé, page, etc.)
  #   - les notes (script-notes)
  #   - les signets (bookmark)
  # 
  def parse
    #
    # Pour connaitre le décalage de chaque ligne
    # 
    current_offset = 0

    #
    # Pour mettre les paragraphes de scénario
    # 
    @fd_paragraphs = []

    #
    # Pour mettre les script-notes
    # 
    @script_notes = []

    # 
    # Boucle sur chaque ligne du contenu brut de la 
    # scène
    # 
    raw_content.split("\n").map do |rawline|
      stripped = rawline.strip
      next if stripped.empty? || stripped.start_with?('#')
      #
      # Instance ScLine de la ligne
      # 
      line = ScLine.new(fdscene:self, rawline:rawline, offset:current_offset)
      #
      # Traitement de la ligne en fonction de son
      # type
      #
      case line.nature
      when :fd_paragraph
        @fd_paragraphs << FdParagraph.new(fdscene:self, scline: line)
        current_offset += line.length
      when :script_note
        @script_notes << ScriptNote.new(fdscene:self, scline:line)
      when :data
        @data << line
      else
        puts "Je ne sais pas encore traiter les lignes de nature #{line.nature.inspect}.".orange
      end
    end
  end

  # @return longueur de la scène
  def length
    @length ||= begin
      fd_paragraphs.sum { |fdparag| fdparag.length }
    end
  end

end #/class FdScene
end #/class Document
end #/module Scenario
