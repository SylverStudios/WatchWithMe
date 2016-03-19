/*
Browser Action:
- Has a visible html element.
- Runs everytime the popup is opened.
- Has access to the Background Page and its functions.
*/

document.addEventListener('DOMContentLoaded', function() {
  console.log("popup script is live.");

  var background = chrome.extension.getBackgroundPage();

  var action = {
    CREATE : function() { background.sendCommand('CREATE'); populateHistory() },
    JOIN : function() { background.sendCommand('JOIN'); populateHistory() },
    FIND : function() { background.sendCommand('FIND'); populateHistory() },
    PLAY : function() { background.sendCommand('PLAY'); populateHistory() },
    PAUSE : function() { background.sendCommand('PAUSE'); populateHistory() },
    SKIP : function() { 
      var time = $('#skip-input').val();
      background.sendCommand('SKIP', '', time);
      populateHistory();
    }
  }

  var bindButtons = function() {
    $('#create-btn').click(action.CREATE);
    $('#join-btn').click(action.JOIN);
    $('#find-btn').click(action.FIND);
    $('#play-btn').click(action.PLAY);
    $('#pause-btn').click(action.PAUSE);
    $('#skip-btn').click(action.SKIP);
  }

  // Will need to use chrome-storage to make this work in real time vs. on page load
  var populateHistory = function() {
    var history = background.videoHistory.list;
    var historyPageElement = $('#history-list');
    $(historyPageElement).empty();

    for (i = history.length; i >= 0; i--) {
      history[i] ? $(historyPageElement).append('<li>'+history[i]+'</li>') : '';
    }
  }

  var populateGroup = function() {
    var groupPageElement = $('#group');
    $(groupPageElement).text('Watching Solo');
  }

  var addUnloadListener = function() {
    addEventListener("unload", function (event) {
         background.sendCommand('POPUP_CLOSE');
    }, true);
  }

  var init = function() {
    bindButtons();
    populateHistory();
    populateGroup();
    addUnloadListener();
    background.sendCommand('POPUP_OPEN');    
  }

  init();
});
