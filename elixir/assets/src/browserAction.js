/**
 * Browser Action
 * - Has a visible html element.
 * - Runs everytime the popup is opened.
 * - Has access to the Background Page and its functions.
 */

import { ChromeMessages } from './models/Constants';

let backgroundWindow;
let videoHistory;
let sendMessageToContentScript;

const populateHistory = function () {
  const historyPageElement = document.getElementById('history-list');

  videoHistory.queue.forEach((historyEntry) => {
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(historyEntry));
    historyPageElement.appendChild(li);
  });
};

function test() {
  console.log('yes you hit the test fxn');
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('browserAction script is live');

  backgroundWindow = chrome.extension.getBackgroundPage();
  console.log(backgroundWindow);

  videoHistory = backgroundWindow.videoHistory;
  sendMessageToContentScript = backgroundWindow.sendMessageToContentScript;

  sendMessageToContentScript(ChromeMessages.POPUP_OPEN_EVENT);
  
  addEventListener('unload',() => {
    sendMessageToContentScript(ChromeMessages.POPUP_CLOSE_EVENT);
  }, true);
  

  document.querySelector("#connect-btn").addEventListener("click", () => {
    console.log('sending connect message');
    sendMessageToContentScript(ChromeMessages.FIND_NEW_VIDEO_COMMAND);
  });

  populateHistory();
});

