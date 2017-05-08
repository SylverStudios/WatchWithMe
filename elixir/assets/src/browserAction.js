/**
 * Browser Action
 * - Has a visible html element.
 * - Runs everytime the popup is opened.
 * - Has access to the Background Page and its functions.
 */

import { ChromeMessages } from './models/Constants';

const background = chrome.extension.getBackgroundPage();


const populateHistory = function () {
  const historyPageElement = document.getElementById('history-list');

  videoHistory.queue.forEach((historyEntry) => {
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(historyEntry));
    historyPageElement.appendChild(li);
  });
};

document.addEventListener('DOMContentLoaded', function () {
  console.log('browserAction script is live');
  background.sendMessageToContentScript(ChromeMessages.POPUP_OPEN_EVENT);
  
  addEventListener('unload',() => {
    background.sendMessageToContentScript(ChromeMessages.POPUP_CLOSE_EVENT);
  }, true);
  
  populateHistory();
});
