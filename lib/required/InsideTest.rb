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
    require File.join(tests_folder, 'import.tests')
    exec_tests_import(data)
  end

  def fd_files_folder
    @fd_files_folder ||= mkdir(File.join(insidetest_folder,'fd_files'))
  end

  # Dossier contenant tous les tests ruby
  def tests_folder
    @tests_folder ||= mkdir(File.join(insidetest_folder,'tests'))
  end

  # Dossier principal des inside-tests, version ruby
  def insidetest_folder
    @insidetest_folder ||= mkdir(File.join(APP_FOLDER,'lib','InsideTest'))
  end

end #/<< self
end #/class InsideTest
end #/module Scenario
