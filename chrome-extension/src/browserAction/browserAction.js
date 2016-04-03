/*CONNECT
Browser Action:
- Has a visible html element.
- Runs everytime the popup is opened.
- Has access to the Background Page and its functions.
*/

var $ = require('jquery');

document.addEventListener('DOMContentLoaded', function() {
  console.log("popup script is live.");

  var background = chrome.extension.getBackgroundPage();

  function sendMessageToBackground(message) {
    console.log('[sendMessageToBackground] Message is: ', message);
    background.handleMessageFromBrowserAction(message);
  };

  var action = {
    CONNECT : function() { sendMessageToBackground({type: 'CONNECT'}); populateHistory() },
    FIND : function() { sendMessageToBackground({type: 'FIND'}); populateHistory() }
  }

  var bindButtons = function() {
    $('#connect-btn').click(action.CONNECT);
    $('#find-btn').click(action.FIND);
  }

  // Will need to use chrome-storage to make this work in real time vs. on page load
  var populateHistory = function() {
    var history = background.videoHistory.queue;
    var historyPageElement = $('#history-list');
    $(historyPageElement).empty();

    for (var i = history.length; i >= 0; i--) {
      history[i] ? $(historyPageElement).append('<li>'+history[i]+'</li>') : '';
    }
  }

  var populateGroup = function() {
    var groupPageElement = $('#group');
    $(groupPageElement).text('Watching Solo');
  }

  var addUnloadListener = function() {
    addEventListener("unload", function (event) {
         sendMessageToBackground({type: 'POPUP_CLOSE'});
    }, true);
  }

  function listenToBackgroundWebsocket() {
    if (background.isWebsocketOpen()) {
      $('#connection-status').text('Connected');
    } else {
      $('#connection-status').text('Not Connected');
    }
    background.subscribeToWebsocketEvents(
      function onOpen() {
        console.log('onopen')
        $('#connection-status').text('Connected');
      },
      function onClose() {
        $('#connection-status').text('Not Connected');
      }
    )
  }

  var init = function() {
    bindButtons();
    populateHistory();
    populateGroup();
    addUnloadListener();
    listenToBackgroundWebsocket();
    sendMessageToBackground({type: 'POPUP_OPEN'});
  }

  init();
});
