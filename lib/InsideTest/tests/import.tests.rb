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
    # On l'importe
    # 
    scenario.import
    # 
    # On le vérifie au niveau de son contenu
    # 
    # TODO
    # 
    # On le remonte pour le voir à l'affichage
    # 
    sleep 1
    # result[:errors] << "Rien n'est encore traité…"

    result[:ok] = result[:errors].empty?
    result[:ok] || result.merge!(error: result.delete(:errors).join("\n"))
  rescue Exception => e
    result.merge!(ok: false, error: e.message)
  ensure
    data.merge!(result: result)
    WAA.send(class:'IT_WAA', method:'receive', data:data)
  end
      
end #/<< self
end #/class InsideTest
end #/module Scenario
