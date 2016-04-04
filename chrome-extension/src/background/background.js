/*
Background script:
- Loaded behind the scenes.
- Exists as long as the browser is open.
- Can be accessed by other scipts in the extension.
- A middle man between the Browser Action and the Content Script.
*/

import _ from 'underscore';
import numeral from 'numeral';
import ClientMessage from '../models/ClientMessage';
import RoomState from '../models/RoomState';
import VideoState from '../models/VideoState';

import { STATE_REQUEST_MESSAGE, CONNECT_COMMAND } from '../util/constants';

// const serverIp = '52.38.66.94';
const serverIp = '127.0.0.1';

const TIME_SEEK_EPSILON = 0.1; // min time difference in room states to be considered a seek

let myUsername;
let websocket;
const websocketOnOpenCallbacks = [];
const websocketOnCloseCallbacks = [];

let tabId;

function isASeek(num1, num2) {
  return Math.abs(num1 - num2) > TIME_SEEK_EPSILON;
}

const videoHistory = {
  queue: [],

  add: function (roomState) {
    const { isPlaying, wasPlaying, time, prevTime, definedBy } = roomState;
    let historySegment;
    // TODO numeral string to handle videos longer than an hour
    const timeString = numeral(time).format('00:00');
    const seeked = isASeek(time, prevTime);
    if (isPlaying && !wasPlaying) {
      if (seeked) {
        historySegment = definedBy + ' played and seeked to ' + timeString;
      } else {
        historySegment = definedBy + ' played at ' + timeString;
      }
    } else if (!isPlaying && wasPlaying) {
      historySegment = definedBy + ' paused at ' + timeString;
    } else if (isPlaying === wasPlaying && seeked) {
      historySegment = definedBy + ' seeked to ' + timeString;
    }
    if (historySegment) {
      this.queue.push(historySegment);
    }

    this.trim();
    console.log('[videoHistory::add] Added history item: ', historySegment);
  },

  trim: function () {
    if (this.queue.length > 10) {
      this.queue.shift();
    }
  },
};

function isWebsocketOpen() {
  return websocket && websocket.readyState === websocket.OPEN;
}

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

function handleMessageFromWebsocket(entireMessage) {
  const message = entireMessage.data;
  console.log('[handleMessageFromWebsocket] Message is: ', message);
  if (_.isString(message) && message === STATE_REQUEST_MESSAGE) {
    sendMessageToContentScript(message);
  } else {
    const roomState = RoomState.fromJSON(JSON.parse(message));
    if (roomState instanceof RoomState) {
      sendMessageToContentScript(roomState);
      videoHistory.add(roomState);
    } else {
      console.log('[handleMessageFromWebsocket] Do not know how to handle message');
    }
  }
}

function connectToWebsocket() {
  if (isWebsocketOpen()) {
    websocket.close();
  }
  websocket = new WebSocket('ws://' + serverIp + ':8080/ws');
  websocket.onmessage = handleMessageFromWebsocket;
  websocket.onopen = function () {
    console.log('[handleMessageFromWebsocket] Websocket connection established successfully.');
    for (let i = 0; i < websocketOnOpenCallbacks.length; i++) {
      websocketOnOpenCallbacks[i]();
    }
  };
  websocket.onclose = function () {
    console.log('[handleMessageFromWebsocket] Websocket connection closed.');
    for (let i = 0; i < websocketOnCloseCallbacks.length; i++) {
      websocketOnCloseCallbacks[i]();
    }
  };
}

function connectTabToWebsocket() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log('[connectTabToWebsocket] Setting home tab as: ', tabs[0].id);
    console.log('[connectTabToWebsocket] Home tab url is: ', tabs[0].url);
    tabId = tabs[0].id;
  });

  connectToWebsocket();
}

function handleMessageFromBrowserAction(message) {
  console.log('[handleMessageFromBrowserAction] Message is: ', message);
  if (message === CONNECT_COMMAND) {
    connectTabToWebsocket();
  } else {
    sendMessageToContentScript(message);
  }
}

function sendMessageToWebsocket(message) {
  console.log('[sendMessageToWebsocket] Message is: ', message);
  if (websocket) {
    websocket.send(JSON.stringify(message));
  } else {
    console.log('Websock isn\'t open.');
  }
}

function handleMessageFromContentScript(message) {
  console.log('[handleMessageFromContentScript] Message is: ', message);
  const videoState = VideoState.fromJSON(message);
  if (videoState instanceof VideoState) {
    sendMessageToWebsocket(new ClientMessage(videoState.isPlaying, videoState.time, myUsername));
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

  chrome.runtime.onMessage.addListener(handleMessageFromContentScript);
};

init();

module.exports = {
  videoHistory,
  isWebsocketOpen,
  subscribeToWebsocketEvents,
  handleMessageFromBrowserAction,
};
