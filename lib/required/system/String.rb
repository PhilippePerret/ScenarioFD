# encoding: UTF-8
require 'date'

UI_TEXTS  = {} if not defined?(UI_TEXTS)
MESSAGES  = {} if not defined?(MESSAGES)
ERRORS    = {} if not defined?(ERRORS)

class String

  # Fonctionne comme #ljust, mais réduit la chaine (par le milieu)
  # quand elle est trop longue
  def ljust_max(len, remp = ' ')
    tomax(len).ljust(len, remp)
  end
  # Fonctionne comme #rjust, mais réduit la chaine (par le milieu)
  # quand elle est trop longue
  def rjust_max(len, remp = ' ')
    tomax(len).rjust(len, remp)
  end

  def tomax(len)
    str = self.dup
    if str.length > len
      demi = len / 2
      str = str[0..(demi - 3)] + '…[…]…' + str[-(demi - 3)..-1]
    end
    return str
  end

  def collapse
    self.gsub(/([ \t])[ \t]+/,'\1')
  end

  def deguillemize
    self.gsub(/^["']/,'').gsub(/["']$/,'')
  end

  REG_STRIPTAG_FULL = /<(.*?)>/m.freeze
  REG_STRIPTAG_SOFT = /<\/?(p|br)(.*?)>/.freeze
  def strip_tags(soft = false)
    reg = soft ? REG_STRIPTAG_SOFT : REG_STRIPTAG_FULL
    str = self.gsub(reg,'').gsub(/  +/,' ').gsub(/#{RC} ?#{RC}+/,RC).gsub(/#{RC} ?#{RC}+/,RC).strip
    # Quand c'est un segment qui a été tronçonné, il peut rester des '</' ou des '<' à la
    # fin qui peuvent être gênant
    unless soft
      str = str.gsub(/<\/?/,'')
    end
    return str
  end

  def strip_returns
    str = self
    str.gsub(/#{RC}/, ' ').gsub(/  +/,' ')
  end

  def strip_comments(lang)
    start_tag, end_tag, multiline = case lang
                                    when :html, :htm
                                      ['<\!\-\-', '\-\->', true].freeze
                                    when :ruby, :rb
                                      ['#', nil, false].freeze
                                    end
    # L'expression régulière à utiliser
    reg = if multiline
            /#{start_tag}(.*?)#{end_tag}/m
          else
            /#{start_tag}(.*?)$/
          end
    # On transforme
    self.gsub(reg,'')
  end

  # Quand le string est une horloge, retourne le nombre de secondes
  def h2s
    pms = self.split(':').reverse
    pms[0].to_i + (pms[1]||0) * 60 + (pms[2]||0) * 3660
  end

  def self.levenshtein_beween(s, t)
    m = s.length
    n = t.length
    return m if n == 0
    return n if m == 0
    d = Array.new(m+1) {Array.new(n+1)}

    (0..m).each {|i| d[i][0] = i}
    (0..n).each {|j| d[0][j] = j}
    (1..n).each do |j|
      (1..m).each do |i|
        d[i][j] = if s[i-1] == t[j-1]  # adjust index into string
                    d[i-1][j-1]       # no operation required
                  else
                    [ d[i-1][j]+1,    # deletion
                      d[i][j-1]+1,    # insertion
                      d[i-1][j-1]+1,  # substitution
                    ].min
                  end
      end
    end
    d[m][n]
  end

  # Prend une liste de chiffres séparés par des espaces, p.e. "1 2 65 6"
  # et retourne une liste d'entier (p.e. [1, 2, 65, 6])
  def as_id_list delimitor = ' '
    if self.nil_if_empty.nil?
      []
    else
      self.split(delimitor).collect{|n| n.strip.to_i }
    end
  end


  # Changer un bit dans le texte, en l'allongeant si
  # nécessaire
  #
  # +ibit+ Indice du bit à modifier
  # +valbit+ Valeur à donner au bit +ibit+ (0-start)
  #
  # @param {Integer} dec
  #                 Index dans le string (0-start)
  # @param {Integer} val
  #                 Nouvelle valeur à lui donner, en base 10
  # @param {Integer} base
  #                 Base dans laquelle écrire le bit (10 par défaut)
  #
  # @return {String}
  #         Le nouveau string forgé, à la longueur minimum voulue.
  #
  def set_bit dec, val, base = nil
    str = self.ljust(dec + 1, '0')
    str[dec] = val.to_s(base || 10)
    return str
  end

  # Retourne le "bit" à +dec+ dans self
  # @param {Integer} dec
  #                 Offset dans la chaine
  # @param {Integer} base
  #                 Optionnellement, la base du bit (de 2 à 36)
  #
  # @return {Integer} bit
  #                  La valeur du bit dans la base donnée ou 10
  def get_bit dec, base = nil
    self[dec].to_i(base||10)
  end

  # Par exemple, lorsqu'un argument de fonction peut être
  # un array ou un string, cette méthode permet de ne pas
  # avoir à tester si l'élément est un array ou non.
  def in_array
    [self]
  end

  def titleize
    t = self.dup.downcase
    t[0] = t[0].upcase
    return t
  end

  # ---------------------------------------------------------------------

  # Pour "épurer" le string, c'est-à-dire :
  #   - le striper
  #   - remplacer les apostrophes double par des ' “ ' (courbe double)
  def purified
    str = self
    str = str.strip
    str = str.gsub(/\r/, '') if str.match(/\n/)
    str.gsub(/"(.*?)"/, '“\1”')
  end

  # Met le texte +searched+ en exergue dans le self.
  # C'est-à-dire que tous les textes sont mis dans des
  # span de class `motex` (mot-exergue)
  #
  # La méthode met également le nombre d'itérations
  # remplacées dans @iterations_motex qu'on peut obtenir
  # à l'aide de String#instance_variable_get('@iterations_motex')
  #
  # +searched+
  #     {String}  L'expression exacte à chercher
  #     {Regexp}  L'expression régulière à évaluer sur self
  #     {Hash}    Hash définissant la recherche.
  #               {:content, :exact, :whole_word, :not_regular}
  #
  # Voir le fichier ./__Dev__/__RefBook_Utilisation__/Vues/Textes.md
  # pour le détail.
  #
  def with_exergue searched
    if searched.instance_of?( Hash )

      is_exact        = searched[:exact]        || false
      is_whole_word   = searched[:whole_word]   || false
      is_not_regular  = searched[:not_regular]  || false
      is_regular      = !is_not_regular

      reg = "#{searched[:content]}"
      reg = Regexp::escape( reg ) if is_not_regular

      searched = case true
      when !(is_exact || is_regular || is_whole_word) then /(#{reg})/
      when !is_exact && !is_whole_word  then /(#{reg})/i
      when !is_exact && is_whole_word   then /\b(#{reg})\b/i
      when is_whole_word                then /\b(#{reg})\b/
      else /(#{reg})/
      end
    else
      searched = /(#{searched})/
    end
    str = self.gsub(searched, "<span class='motex'>\\1</span>")
    str.instance_variable_set('@iterations_motex', self.scan(searched).count)
    return str
  end

  # {Integer} Quand le string est une horloge, la transforme en
  # secondes
  def h2s
    str = self.split(':').reverse
    str[0].to_i + str[1].to_i * 60 + str[2].to_i * 3600
  end

  def nil_if_empty strip = true
    checked = strip ? self.strip : self
    checked == "" ? nil : checked
  end
  def nil_or_empty?
    self.strip == ""
  end
  def nil_if_zero
    checked = self.strip
    checked.to_i == 0 ? nil : checked
  end

  ##
  # Transforme une path absolue en path relative
  #
  # NOTE
  #
  #   * Si la classe App existe et définit la méthode
  #     de classe `relative_path_of', on l'utilise, sinon, on
  #     calcul la "base" de l'application.
  #
  def as_relative_path
    if defined?(App) && App.respond_to?( :relative_path_of)
      App::relative_path_of self
    else
      rel_path = self.gsub(String::reg_base_application, '')
      rel_path.prepend(".") unless rel_path.start_with?('.') || (rel_path == self)
      return rel_path
    end
  end


  # Ruby version < 2
  unless "".respond_to?(:prepend)
    def prepend str
      self.replace "#{str}#{self}"
    end
  end

  unless "".respond_to?(:capitalize)
    def capitalize
      s = self
      s[0..0].upcase + s[1..-1].downcase
    end
  end

  def numeric?
    Float(self) != nil rescue false
  end

  # Chamelise ('mon_nom_tiret' => 'MonNomTiret')
  def camelize
    self.split('_').collect{|mot| mot.capitalize}.join("")
  end

  def decamelize
    self.gsub(/(.)([A-Z])/, '\1_\2').downcase
  end

  # Pour transformer n'importe quel caractère de majuscule vers
  # minuscule, ou l'inverse.
  DATA_UPCASE = {
    :maj => "ÀÁÂÃÄÅĀĂĄÇĆĈĊČÐĎÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĸĺļľŀÑŃŅŇŊÒÓÔÕÖØŌŎŐŔŖŘŚŜŞŠÙÚÛÜŨŪŬŮŰŲŴÝŹŻŽ",
    :min => "àáâãäåāăąçćĉċčðďèéêëēĕėęěĝğġģĥħìíîïĩīĭįıĵķĹĻĽĿŁñńņňŋòóôõöøōŏőŕŗřśŝşšùúûüũūŭůűųŵýźżž"
  }
  def my_upcase
    self.tr(DATA_UPCASE[:min], DATA_UPCASE[:maj]).upcase
  end
  def my_downcase
    self.tr(DATA_UPCASE[:maj], DATA_UPCASE[:min]).downcase
  end

  # Transformer les caractères diacritiques et autres en ASCII
  # simples
  unless defined? DATA_NORMALIZE
    DATA_NORMALIZE = {
      :from => "ÀÁÂÃÄÅàáâãäåĀāĂăĄąÇçĆćĈĉĊċČčÐðĎďĐđÈÉÊËèéêëĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħÌÍÎÏìíîïĨĩĪīĬĭĮįİıĴĵĶķĸĹĺĻļĽľĿŀŁłÑñŃńŅņŇňŉŊŋÒÓÔÕÖØòóôõöøŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšſŢţŤťŦŧÙÚÛÜùúûüŨũŪūŬŭŮůŰűŲųŴŵÝýÿŶŷŸŹźŻżŽž",
      :to   => "AAAAAAaaaaaaAaAaAaCcCcCcCcCcDdDdDdEEEEeeeeEeEeEeEeEeGgGgGgGgHhHhIIIIiiiiIiIiIiIiIiJjKkkLlLlLlLlLlNnNnNnNnnNnOOOOOOooooooOoOoOoRrRrRrSsSsSsSssTtTtTtUUUUuuuuUuUuUuUuUuUuWwYyyYyYZzZzZz"
    }
  end
  # ou def normalized
  def normalize
    self.dup.force_encoding('utf-8').tr(DATA_NORMALIZE[:from], DATA_NORMALIZE[:to])
  end
  alias :normalized :normalize

  # Pour un nom de fichier sans problème
  def as_normalized_filename
    self.normalize.gsub(/ +/, '_').gsub(/[^a-zA-Z0-9\._\-]/, '').gsub(/_+/, '_').gsub(/^_/,'').gsub(/_$/,'')
  end

  # Transforme la chaine en “id normalizé”, c'est-à-dire un
  # identifiant de type String, ne contenant que des lettres et
  # des chiffres, avec capitalisation de la première lettre de
  # chaque mot.
  # Par exemple :
  #     "Ça c'est l'été et mon titre" => "CaCestLeteEtMonTitre"
  def as_normalized_id separateur = nil
    separateur ||= ""
    self.normalize.gsub(/[^a-zA-Z0-9 ]/, separateur).downcase.split.collect{|m|m.capitalize}.join(separateur)
  end

  # Retire les slashes
  #
  def strip_slashes
    self.gsub(/\\(['"])/, '\\1')
  end

end #/String
