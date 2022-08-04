# 🎥 ScenarioFFD

*-- experimental --*

“Final Draft sucks (\*)… *ScenarioFFD* comes to import from and export to FinalDraft Format without using Final-Draft.”

"FFD" stands for "Fuck Final Draft" 🤣 (\*).

(\*) expansive, a lot of bugs, a lot of limitations, poor tools, no configuration, hegemony.


## Technology

**ScenarioFFD** uses **WAA technology** (Without Ajax Application) who let you make a server-less but server-client application using Webdriver using only `WAA.send` (server side) and `WAA.send` (client side) to communicate as with Ajax.

**ScenarioFFD** uses **InsideTests** to test in real-time and make sure the app is up-and-running.


## Getting started

1. Ruby should be installed on your machine,
2. clone repository in a `Programms` folder (for instance only),
3. make command alias: 
  ~~~bash
  ln -s ~/Programs/ScenarioFD/scenario.rb /usr/local/bin/scenario
  ~~~
4. make the program executable:
  ~~~bash
  cd ~/Programs/ScenarioFD
  sudo chmod +x scenario.rb
  ~~~
5. create a folder for your first script:
  ~~~bash
  mkdir -p ~/Documents/Scripts/ScenarioFD
  cd ~/Documents/Scripts/ScenarioFD
  mkdir firstScenario
  ~~~
6. open a Terminal at script folder: in Finder right-click on folder and choose "New Terminal at Folder" or:
  ~~~bash
  cd firstScenario
  ~~~
7. run command line:
  ~~~bash
  scenario
  ~~~

Next times you just have to:

1. open a Terminal at script folder (right-click on folder > "New Terminal at Folder"),
2. run `scenario`.


## Where can I find help?

In manuals (only french right now).
