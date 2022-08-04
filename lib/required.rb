# encoding: UTF-8
require 'fileutils'
require 'nokogiri'
require 'yaml'
require 'pretty_inspect'

APP_FOLDER     = File.dirname(__dir__)
CURRENT_FOLDER = Dir.pwd # File.expand_path('.')

Dir["#{__dir__}/required/**/*.rb"].each do |m| require(m) end
