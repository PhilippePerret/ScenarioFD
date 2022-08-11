# encoding: UTF-8
=begin

  class Scenario::InsideTest
  --------------------------
  Pour la gestion des "inside-tests".

=end
module Scenario
class InsideTest
class << self

  def test_import(data)
    fd_filename = data['fd_file']
    fd_filepath = File.join(fd_files_folder,"#{fd_filename}.fdx")
    puts "Je dois apprendre à tester l'import de #{fd_filename}.".jaune
    result = {ok:true, errors:[]}
    if File.exist?(fd_filepath)
      # 
      # On l'importe
      # 
      # TODO
      # 
      # On le vérifie au niveau de son contenu
      # 
      # TODO
      # 
      # On le remonte pour le voir à l'affichage
      # 
      sleep 1
      # result[:errors] << "Rien n'est encore traité…"
    else
      result[:errors] << "Le fichier #{fd_filepath} est introuvable"
    end
    result[:ok] = result[:errors].empty?
    result[:ok] || result.merge!(error: result.delete(:errors).join("\n"))
    data.merge!(result: result)
    WAA.send(class:'IT_WAA', method:'receive', data:data)
  end

  def fd_files_folder
    @fd_files_folder ||= mkdir(File.join(insidetest_folder,'fd_files'))
  end
  def insidetest_folder
    @insidetest_folder ||= mkdir(File.join(APP_FOLDER,'lib','InsideTest'))
  end
end #/<< self
end #/class InsideTest
end #/module Scenario
