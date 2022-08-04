# encoding: UTF-8
=begin

  Class FdScene::ScLine
  ------------
  Gestion des lignes d'une scène de Scenario

  Permet de définir sa nature, son texte, sa longueur,
  son type Scenario, etc.

=end
module Scenario
class Document
class FdScene
class ScLine

  REG_MARK_NOTE = /\[([0-9]+)\]/

  attr_reader :scene
  attr_reader :raw_line
  attr_reader :offset

  # Le texte à utiliser (par exemple pour un paragraphe de scénario)
  # attr_reader :text

  # Le type Scenario (type de paragraphe) si c'est un paragraphe
  # de scénario.
  attr_reader :sctype

  # Le texte brut (avec les marques de script-note)
  attr_reader :raw_text

  #
  # --- PROPRIÉTÉS PARTICULIÈRES ---
  #

  # Liste des numéros de script-notes
  attr_reader :notes

  # Nom de la data (pour une $data)
  attr_reader :name

  # Value de la data (pour une $data)
  attr_reader :value

  # Donnée pour une script-note
  attr_reader :script_note


  # INSTANCIATION

  def initialize(
    fdscene:,     # La scène FdScene contenant la ligne
    rawline:,     # Le texte brut (comme dans Scenario)
    offset:       # Le décalage du premier paragraphe
  )
    @scene    = fdscene
    @raw_line = rawline.freeze
    @offset   = offset.freeze
  end

  # Le texte, tel qu'il apparaitra dans le scénario
  def text
    @text ||= begin
      @text = @raw_text.dup
      @notes = []
      @text = @text.gsub(REG_MARK_NOTE){
        @notes << $1.to_i.freeze
      }.gsub(/  +/,' ').strip
      @text.freeze
    end
  end

  # Longueur, si c'est un texte de paragraphe
  def length
    @length ||= text.length.freeze
  end

  #
  # Le NATURE de la ligne, pour savoir si c'est une ligne de
  # paragraphe de scénario, une note, une donnée, etc.
  # 
  def nature
    @nature ||= begin
      firstchar = raw_line[0]
      lastchar  = raw_line[-1]
      if firstchar == ':' # => un intitulé
        @sctype   = 'intitule'
        @raw_text = raw_line[1..-1].freeze
        :fd_paragraph
      elsif firstchar == '$'
        treate_as_data
        :data
      elsif lastchar == ':'
        @sctype   = 'nom'
        @raw_text = raw_line[0..-2].freeze
        :fd_paragraph
      elsif firstchar == '[' && raw_line.match?(/^\[(0-9)+\]/)
        traite_as_script_note
        :script_note
      elsif firstchar == ' ' && raw_line[0..1] == '  '
        if raw_line[2] == '(' && raw_line[-1] == ')'
          traite_as_note_jeu
        else
          traite_as_dialogue
        end
        :fd_paragraph
      else
        @sctype   = 'action'
        @raw_text = raw_line.strip.freeze
        :fd_paragraph
      end
    end
  end

  #
  # Traitement de la ligne comme la définition d'une donnée
  # 
  def treate_as_data
    segs = raw_line[1..-1].split('=').map{|n|n.strip}
    @name  = segs.shift
    @value = segs.join('=') # la valeur peut contenir des '='
  end

  #
  # Traitement d'une ligne de script-note
  # 
  def traite_as_script_note
    tout, note_id, text = raw_line.match(/^\[([0-9]+)\](.*)$/).to_a
    rg = scene.offset + offset
    @script_note = {id:note_id, text:text.strip, range: "#{rg}, #{rg}" }
  end

  #
  # Traitement de la ligne comme un dialogue
  # 
  def traite_as_dialogue
    @raw_text   = raw_line.strip.freeze
    @sctype = 'dialogue'
  end

  #
  # Traitement de la ligne comme une note de jeu
  #
  def traite_as_note_jeu
    @raw_text   = raw_line.strip.freeze
    @sctype = 'note-jeu'
  end

end #/class ScLine
end #/class FdScene
end #/class Document
end #/module Scenario
