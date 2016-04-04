/* CONNECT
Browser Action:
- Has a visible html element.
- Runs everytime the popup is opened.
- Has access to the Background Page and its functions.
*/

import $ from 'jquery';

import { POPUP_OPEN_EVENT, POPUP_CLOSE_EVENT, CONNECT_COMMAND, FIND_NEW_VIDEO_COMMAND, }
  from '../util/constants';

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
    CONNECT: function () { sendMessageToBackground(CONNECT_COMMAND); populateHistory(); },
    FIND: function () { sendMessageToBackground(FIND_NEW_VIDEO_COMMAND); populateHistory(); },
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
      sendMessageToBackground(POPUP_CLOSE_EVENT);
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
    sendMessageToBackground(POPUP_OPEN_EVENT);
  };

  init();
});
