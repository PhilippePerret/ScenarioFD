# encoding: UTF-8
=begin

=end
module Scenario
class InsideTest
class << self

  ##
  # Test de l'importation d'un fichier Final-Draft dans Scénario
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
    # 
    scenario.import(fd_filepath)

    # 
    # VÉRIFICATION
    # 
    File.exist?(sc_filepath) || raise("Le fichier Scenario.xml aurait dû être construit.")

    # 
    # On le vérifie au niveau de son contenu
    # 
    errs = self.send("check_document_#{fd_filename}_imported".to_sym, scenario)
    errs.each do |e| result[:errors] << e end

    # 
    # On remonte pour le voir à l'affichage
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
    @errors = []
    data = scenario.data_for_client

    if data.key?(:scenes)
      sc0 = data[:scenes][0]
      err_if_not_equal(sc0['sceneId'], 1, "Mauvais ID pour la première scène")
      err_if_not_equal(sc0['FD-scenes-properties'], "", "Mauvais FD-scenes-properties pour la première scène")

      sc1 = data[:scenes][1]
      err_if_not_equal(sc1['sceneId'], 2, "Mauvais ID pour la scène 2")
      err_if_not_equal(sc1['FD-scenes-properties'], "", "Mauvais FD-scenes-properties pour la scène 2")
    else
      @errors.push("La donnée :scenes devrait exister.")
    end

    if data.key?(:personnages)
      err_if_not_equal(data[:personnages], [], "Mauvaise donnée personnages.")
    else
      @errors.push("La donnée :personnages devrait exister.")
    end

    return @errors
  end

  def err_if_not_equal(actual, expected, msg)
    if actual != expected
      err msg, expected, actual
    end
  end

  def err(msg, expected, actual)
    # msg = "#{msg}\\n    Expected: #{expected.inspect}\\n    Actual  : #{actual.inspect}"
    # puts "msg: #{msg.inspect}"
    # puts "expected: #{expected.inspect}"
    # puts "actual: #{actual.inspect}"
    msg = "#{msg} Expected: #{expected}. Actual: #{actual}"
    # msg = msg.gsub(/\\/,'\\\\')

    # msg = "Mauvais ID"
    # msg = msg.gsub(/"/,"'")

    @errors.push(epure(msg))
  end

  def epure(str)
    str = str.to_s
    str = str.gsub(/\n/, '⏎')
    str = str.gsub(/"/,"'")

    return str
  end
      
end #/<< self
end #/class InsideTest
end #/module Scenario
