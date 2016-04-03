/* CONNECT
Browser Action:
- Has a visible html element.
- Runs everytime the popup is opened.
- Has access to the Background Page and its functions.
*/

import $ from 'jquery';

document.addEventListener('DOMContentLoaded', function () {
  console.log('popup script is live.');

  const background = chrome.extension.getBackgroundPage();

  function sendMessageToBackground(message) {
    console.log('[sendMessageToBackground] Message is: ', message);
    background.handleMessageFromBrowserAction(message);
  }

  // Will need to use chrome-storage to make this work in real time vs. on page load
  const populateHistory = function () {
    const history = background.videoHistory.queue;
    const historyPageElement = $('#history-list');
    $(historyPageElement).empty();

    for (let i = history.length; i >= 0; i--) {
      if (history[i]) {
        $(historyPageElement).append('<li>' + history[i] + '</li>');
      }
    }
  };

  const action = {
    CONNECT: function () { sendMessageToBackground({ type: 'CONNECT' }); populateHistory(); },
    FIND: function () { sendMessageToBackground({ type: 'FIND' }); populateHistory(); },
  };

  const bindButtons = function () {
    $('#connect-btn').click(action.CONNECT);
    $('#find-btn').click(action.FIND);
  };

  const populateGroup = function () {
    const groupPageElement = $('#group');
    $(groupPageElement).text('Watching Solo');
  };

  const addUnloadListener = function () {
    addEventListener('unload', function () {
      sendMessageToBackground({ type: 'POPUP_CLOSE' });
    }, true);
  };

  function listenToBackgroundWebsocket() {
    if (background.isWebsocketOpen()) {
      $('#connection-status').text('Connected');
    } else {
      $('#connection-status').text('Not Connected');
    }
    background.subscribeToWebsocketEvents(
      function onOpen() {
        console.log('onopen');
        $('#connection-status').text('Connected');
      },
      function onClose() {
        $('#connection-status').text('Not Connected');
      }
    );
  }

  const init = function () {
    bindButtons();
    populateHistory();
    populateGroup();
    addUnloadListener();
    listenToBackgroundWebsocket();
    sendMessageToBackground({ type: 'POPUP_OPEN' });
  };

  init();
});
