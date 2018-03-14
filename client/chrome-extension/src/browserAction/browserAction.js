/**
 * Browser Action
 * - Has a visible html element.
 * - Runs everytime the popup is opened.
 * - Has access to the Background Page and its functions.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import { ChromeMessages } from '../models/Constants';
import PopupContent from './PopupContent';

import './browserAction.scss';

let backgroundWindow;
let videoHistory;
let sendMessageToContentScript;

// state
let connected = false;
let invalidPage = false;

const populateHistory = function () {
  const historyPageElement = document.getElementById('history-list');

  videoHistory.queue.forEach((historyEntry) => {
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(historyEntry));
    historyPageElement.appendChild(li);
  });
};

document.addEventListener('DOMContentLoaded', function () {

  backgroundWindow = chrome.extension.getBackgroundPage();
  console.log(backgroundWindow);

  videoHistory = backgroundWindow.videoHistory;
  sendMessageToContentScript = backgroundWindow.sendMessageToContentScript;

  sendMessageToContentScript(ChromeMessages.POPUP_OPEN_EVENT);

  addEventListener('unload',() => {
    sendMessageToContentScript(ChromeMessages.POPUP_CLOSE_EVENT);
  }, true);

  const mountApp = () => {
    const popupContent = (
      <PopupContent
        {...{ connected, invalidPage }}
        onConnectClick={() => {
          console.log('sending connect message');
          sendMessageToContentScript(ChromeMessages.FIND_NEW_VIDEO_COMMAND);
        }}
      />
    )
    ReactDOM.render(popupContent, document.getElementById('app-mount'));
  };
  mountApp();

  chrome.runtime.onMessage.addListener(function (message) {
    if (message === 'NOT_EXACTLY_ONE_VIDEO') {
      invalidPage = true;
      mountApp();
    }
  });

  console.log('browserAction script is live');
});
