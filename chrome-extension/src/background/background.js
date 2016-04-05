/*
Background script:
- Loaded behind the scenes.
- Exists as long as the browser is open.
- Can be accessed by other scipts in the extension.
- A middle man between the Browser Action and the Content Script.
*/

import funcLog from '../util/funcLog';

import VideoHistory from './VideoHistory';
import WebsocketClient from './WebsocketClient';
import ClientMessage from '../models/ClientMessage';
import VideoState from '../models/VideoState';

import { STATE_REQUEST_MESSAGE, CONNECT_COMMAND } from '../util/constants';

let myUsername;
let websocketClient;
const websocketOnOpenCallbacks = [];
const websocketOnCloseCallbacks = [];

let tabId;

const videoHistory = new VideoHistory();

function subscribeToWebsocketEvents(onOpenCallback, onCloseCallback) {
  if (websocketOnOpenCallbacks.indexOf(onOpenCallback) === -1) {
    websocketOnOpenCallbacks.push(onOpenCallback);
  }
  if (websocketOnCloseCallbacks.indexOf(onCloseCallback) === -1) {
    websocketOnCloseCallbacks.push(onCloseCallback);
  }
}

function sendMessageToContentScript(message) {
  console.log('[sendMessageToContentScript] Message is: ', message);
  if (tabId) {
    console.log('[sendMessageToContentScript] Sending message to home tab: ', tabId);
    chrome.tabs.sendMessage(tabId, message);
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      } else {
        console.log('No active tab or set home tab.');
      }
    });
  }
}

function onWebsocketOpen() {
  funcLog();
  for (let i = 0; i < websocketOnOpenCallbacks.length; i++) {
    websocketOnOpenCallbacks[i]();
  }
}
function onWebsocketClose() {
  funcLog();
  for (let i = 0; i < websocketOnCloseCallbacks.length; i++) {
    websocketOnCloseCallbacks[i]();
  }
}
function onStateRequest() {
  sendMessageToContentScript(STATE_REQUEST_MESSAGE);
}
function onStateUpdate(roomState) {
  sendMessageToContentScript(roomState);
  videoHistory.add(roomState);
}

function setHomeTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log('[connectTabToWebsocket] Setting home tab as: ', tabs[0].id);
    console.log('[connectTabToWebsocket] Home tab url is: ', tabs[0].url);
    tabId = tabs[0].id;
  });
}

function handleMessageFromBrowserAction(message) {
  console.log('[handleMessageFromBrowserAction] Message is: ', message);
  if (message === CONNECT_COMMAND) {
    setHomeTab();
    websocketClient.connect();
  } else {
    sendMessageToContentScript(message);
  }
}

function handleMessageFromContentScript(message) {
  console.log('[handleMessageFromContentScript] Message is: ', message);
  const videoState = VideoState.fromJSON(message);
  if (videoState instanceof VideoState) {
    websocketClient.send(new ClientMessage(videoState.isPlaying, videoState.time, myUsername));
  } else {
    console.log('[handleMessageFromContentScript] Do not know how to handle message');
  }
}

const init = function () {
  console.log('[init]');
  // Set myUsername
  chrome.identity.getProfileUserInfo(function (userInfo) {
    myUsername = userInfo.email.split('@')[0];
  });
  websocketClient = new WebsocketClient()
    .onOpen(onWebsocketOpen)
    .onClose(onWebsocketClose)
    .onStateRequest(onStateRequest)
    .onStateUpdate(onStateUpdate);

  chrome.runtime.onMessage.addListener(handleMessageFromContentScript);
};

init();

function isWebsocketOpen() {
  return websocketClient.isConnected();
}

module.exports = {
  videoHistory,
  isWebsocketOpen,
  subscribeToWebsocketEvents,
  handleMessageFromBrowserAction,
};
