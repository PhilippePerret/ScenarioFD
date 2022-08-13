# encoding: UTF-8
=begin

=end
module Scenario


class InsideTest
class << self

  ##
  # Test de l'importation d'un fichier Final-Draft dans Scénario
  # (note : on parle de "conversion" d'un fichier FD vers Scenario)
  # 
  # Synopsis 
  # --------
  # - Le test javascript envoie le nom du fichier .fdx à utiliser
  #   (dans data['fd_file'])
  # - Ici, en ruby, on invoque la méthode d'importation, pour produire
  #   le fichier Scenario.xml
  # - On fait quelques tests sur ce fichier pour vérifier que le 
  #   fichier est conforme.
  # - On renvoie les données du scénario telles que récoltées ici par
  #   la méthode normale
  # - Côté client, on affiche le scénario et on procède à quelques 
  #   vérification.
  # 
  def exec_tests_import(data)
    result = {ok:true, errors:[]}
    fd_filename = data['fd_file']
    folder = File.join(fd_files_folder, fd_filename)
    File.exist?(folder) || raise("Le dossier #{folder.inspect} est introuvable… Impossible de faire ce test.")
    fd_filepath = File.join(folder,"#{fd_filename}.fdx")
    File.exist?(fd_filepath) || raise("Le fichier FinalDraft #{fd_filepath.inspect} est introuvable… Impossible de faire ce test.")
    sc_filepath = File.join(folder,"Scenario.xml")
    File.delete(sc_filepath) if File.exist?(sc_filepath)

    puts "Je dois apprendre à tester l'import de #{fd_filename}.".jaune

    # 
    # Instance du document
    # 
    scenario = Document.new(folder)

    # 
    # Opération : IMPORTATION
    # -----------------------
    # (i.e. on prend le scénario Final-Draft et on en fait un 
    #  scénario Scenario)
    # 
    scenario.import(fd_filepath)

    # 
    # VÉRIFICATION
    # 
    File.exist?(sc_filepath) || raise("Le fichier Scenario.xml aurait dû être construit.")

    # 
    # VÉRIFICATION DU CONTENU
    # -----------------------
    # On le vérifie au niveau de son contenu
    # 
    errs = self.send("check_document_#{fd_filename.downcase}_imported".to_sym, scenario)
    errs.each do |e| result[:errors] << e end
    puts "Result = #{result.pretty_inspect}"

    # 
    # On remonte pour le voir à l'affichage (afin de pouvoir le 
    # tester aussi sur le client)
    # 
    scenario.reset
    data.merge!(script: scenario.data_for_client)
    puts "\n\n\ndata[:script] = #{data[:script].pretty_inspect}\n\n"

    result[:ok] = result[:errors].empty?
    result[:ok] || result.merge!(errors: result.delete(:errors))
  rescue Exception => e
    puts e.message.rouge
    puts e.backtrace.join("\n").rouge
    result.merge!(ok: false, error: e.message)
  ensure
    data.merge!(result: result)
    WAA.send(class:'IT_WAA', method:'receive', data:data)
  end


  ##
  # Méthode qui vérifie la conformité du document Scenario.xml par 
  # rapport au document Final-Draft et retourne les erreurs et
  # approximation.
  # 
  # Pour : simple.fdx
  #
  # @param scenarion  {Scenario::Document} L'instance du document
  #                   scénario.
  # 
  def check_document_simple_imported(scenario)
    
    reset_errors

    data = scenario.data_for_client

    # puts "\n\n\n+++ Données à envoyer au client (pour check):\n#{data.pretty_inspect}"

    if not data.key?(:scenes)

      @errors.push("La donnée :scenes devrait exister.")

    else
      
      ITScene.new(data[:scenes][0]) do |sc|
        sc.id_must_be(1)
        sc.scene_properties.must_be("")
      end

      ITScene.new(data[:scenes][1]) do |sc|
        sc.id_must_be(2)
        sc.scene_properties.must_be("")
      end

    end

    if data.key?(:personnages)
      must_be_equal(data[:personnages], [], "Mauvaise donnée personnages.")
    else
      @errors.push("La donnée :personnages devrait exister.")
    end

    return @errors
  end

  ##
  # Vérification du document "Complet/complet.fdx"
  # 
  def check_document_complet_imported(scenario)
    
    reset_errors

    data = scenario.data_for_client

    # 
    # Vérification des scènes
    # 
    # On utilise la classe {ITScene} pour faciliter le travail
    # 
    if not data.key?(:scenes)
      @errors.push("La donnée :scenes devrait impérativement exister.")
    elsif data[:scenes].count != 3
      @errors.push("Il devrait y avoir impérativement 3 scènes")
    else
      ITScene.new(data[:scenes][0]).tap do |sc|
        sc.id_must_be(1)
        sc.color_must_be('#EB627B')
        sc.title_must_be('')
        @errors += sc.errors
      end
      ITScene.new(data[:scenes][1]).tap do |sc|
        sc.id_must_be(2)
        sc.color_must_be('#8FC36A')
        sc.title_must_be('Titre de la scène de garage')
        sc.must_have_personnage('ALEX')
        @errors += sc.errors
      end
      ITScene.new(data[:scenes][2]).tap do |sc|
        sc.id_must_be(3)
        sc.title_must_be('Titre de la scène dans le magasin')
        sc.summary_must_be("C'est le résumé de la scène dans le magasin.\nIl est sur plusieurs lignes.\nIl y en a meme trois.")
        @errors += sc.errors
      end
    end

    # 
    # Vérification des MÉTADONNÉES
    # 
    if not data.key?(:metadata)
      @errors << "Les :metadata devrait être définies."
    else
      md = data[:metadata]
      must_be_equal(md['final_draft_filename'], 'Complet.fdx', "Métadonnée 'final_draft_filename")
      must_be_equal(md['scenario_version'], APP_VERSION, "Metada 'scenario_version'")
    end

    #
    # Vérification des DÉFINITIONS ÉLÉMENTS
    # 
    # Il y a deux choses à vérifier ici :
    #   - que le style "Centré" a bien été pris en compte comme 
    #     nouveau type d'élément.
    #   - que les styles prennent bien en compte la nouvelle police
    # 
    if not data.key?(:elements)
      errors << "Les :elements devrait être définis"
    else
      dels = data[:elements]
      table_elements = {}
      dels.each do |del|
        table_elements.merge!(del[:name] => del)
      end
      # 
      # On doit trouver tous les types d'éléments
      # 
      [
        'General', 'Scene Heading', 'Action', 'Character', 
        'Parenthetical', 'Dialogue', 'Transition', 'Shot', 
        'Cast List', 'Outline Body', 'Outline 1', 'Outline 2', 
        'Outline 3', 'Outline 4', 
        'Centré' # le nouveau style
      ].each do |type|
        table_elements.key?(type) || errors << "Le style d'élément #{type.inspect} devrait exister."
      end
      # 
      # On vérifie le nouveau style
      # (si ses valeurs sont bonnes, les valeurs des autres éléments
      #  doivent être bonnes aussi)
      # 
      dele = table_elements['Centré']
      must_be_equal(dele['font_family']   , 'Geneva'  , 'font-family du style Centré')
      must_be_equal(dele['font_size']     , '12'      , 'font-size du style Centré')
      must_be_equal(dele['font_color']    , '#FF2600' , 'font-color du style Centré')
      must_be_equal(dele['background']    , '#FFFFFF' , 'font-color du style Centré')
      must_be_equal(dele['align']         , 'Center'  , 'font-color du style Centré')
      must_be_equal(dele['first_indent']  , '0.00'    , 'font-color du style Centré')
      must_be_equal(dele['left_indent']   , '2.50'    , 'font-color du style Centré')
      must_be_equal(dele['right_indent']  , '5.50'    , 'font-color du style Centré')
      must_be_equal(dele['space_before']  , '12'      , 'font-color du style Centré')
      must_be_equal(dele['spacing']       , '1'       , 'font-color du style Centré')


      # puts "\n\n\ntable_elements: #{table_elements.pretty_inspect}".bleu
    end

    return errors
  end


  # class ITScene
  # -------------
  # Pour gérer plus facilement les données des scènes dans les
  # données du scénario remontées au client.
  # 
  class ITScene

    include ITClass

    attr_reader :data
    attr_reader :errors
    def initialize(data)
      @data = data
      @errors = []
    end

    def inspect
      @inspect ||= "Scène ##{data['sceneId']}"
    end

    # --- Méthodes publiques de test ---

    def id_must_be(value)
      must_be_equal(data['sceneId'].to_i, value, "Mauvais ID pour #{inspect}")
    end
    def scene_properties(value)
      must_be_equal(data['FD-scene-properties'], value, "Mauvais FD-scene-properties pour #{inspect}")
    end
    def color_must_be(value)
      content_must_contains("$color = #{value}", "la balise $color")
    end
    def title_must_be(value)
      must_be_equal(scene_properties['title'], value, "Mauvais Title dans les propriétés de #{inspect}")
      unless value.nil?
        content_must_contains("$title = #{value}", "la balise $title")
      end
    end
    def summary_must_be(value)
      must_be_equal(scene_properties['summary'], value, "Mauvais Summary dans les propriétés de #{inspect}")
      content_must_contains(value.gsub(/\n/,'_RET_'), "la balise $summary")
    end
    def must_have_personnage(name)
      ok = scene_properties['personnages'].is_a?(Array) && scene_properties['personnages'].include?(name)
      if not ok
        @errors.push(epure "#{inspect} devrait contenir le personnage #{name.inspect}")
      end
    end

    def content_must_contains(value, what)
      # puts "Recherché : #{value.inspect} dans content :"
      # puts "#{content.inspect}"
      # puts "content.match?(value) = #{content.match?(Regexp.escape(value)).inspect}"
      if not content.match?(Regexp.escape(value))
        @errors.push(epure "Le contenu devrait définir correctement #{what} dans #{inspect}.")
      end
    end

    # --- Méthodes de données ----

    def scene_properties
      @scene_properties ||= data['FD-scene-properties']
    end

    def content
      @content ||= data['content']
    end

  end #/class ITScene
end #/<< self
end #/class InsideTest
end #/module Scenario
