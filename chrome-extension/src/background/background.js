/*
Background script:
- Loaded behind the scenes.
- Exists as long as the browser is open.
- Can be accessed by other scipts in the extension.
- A middle man between the Browser Action and the Content Script.
*/

var serverIp = '52.38.66.94';

var myUsername;
var websocket;
var websocketOnOpenCallbacks = [];
var websocketOnCloseCallbacks = [];

var tabId;

var videoHistory = {
  queue : [],

  add : function(message) {
    var type = message.type;
    var user = message.user ? message.user : 'Foreign';
    var time = message.time;

    var log =  user + ' : ' + type;
    log += time ? ' to/at ' + Math.round(time) + ' seconds.' : '.';

    this.queue.push(log);

    this.trim();
    console.log('[videoHistory::add] Added history item: ', log);
  },

  trim : function() {
    if (this.queue.length > 10) {
      this.queue.shift();
    }
  }
};

function connectTabToWebsocket() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    console.log('[connectTabToWebsocket] Setting home tab as: ', tabs[0].id);
    console.log('[connectTabToWebsocket] Home tab url is: ', tabs[0].url);
    tabId = tabs[0].id;
  });

  connectToWebsocket();
}

function isWebsocketOpen() {
  return websocket && websocket.readyState === websocket.OPEN;
}

function connectToWebsocket() {
  if (isWebsocketOpen()) {
    websocket.close();
  }
  websocket = new WebSocket('ws://' + serverIp + ':8080/ws');
  websocket.onmessage = handleMessageFromWebsocket;
  websocket.onopen = function(e) {
    console.log('[handleMessageFromWebsocket] Websocket connection established successfully.');
    for (var i = 0; i < websocketOnOpenCallbacks.length; i++) {
      websocketOnOpenCallbacks[i]();
    }
  };
  websocket.onclose = function(e) {
    console.log('[handleMessageFromWebsocket] Websocket connection closed.');
    for (var i = 0; i < websocketOnCloseCallbacks.length; i++) {
      websocketOnCloseCallbacks[i]();
    }
  };
}

function subscribeToWebsocketEvents(onOpenCallback, onCloseCallback) {
  if (websocketOnOpenCallbacks.indexOf(onOpenCallback) === -1) {
    websocketOnOpenCallbacks.push(onOpenCallback);
  }
  if (websocketOnCloseCallbacks.indexOf(onCloseCallback) === -1) {
    websocketOnCloseCallbacks.push(onCloseCallback);
  }
};

function handleMessageFromBrowserAction(message) {
  console.log('[handleMessageFromBrowserAction] Message is: ', message);
  if (message.type === 'CONNECT') {
    connectTabToWebsocket();
  } else {
    sendMessageToContentScript(message);
  }
}

function handleMessageFromWebsocket(event) {
  console.log('[handleMessageFromWebsocket] Event is: ', event);
  var message;
  try {
    message = JSON.parse(event.data);
    sendMessageToContentScript(message);
    videoHistory.add(message);
  } catch(exception) {
    console.log('[handleMessageFromWebsocket] Cannot parse message, exception is: ', exception);
  }
}

function sendMessageToWebsocket(message) {
  console.log('[sendMessageToWebsocket] Message is: ', message);
  websocket ? websocket.send(JSON.stringify(message)) : console.log('Websock isn\'t open.');
}

function handleMessageFromContentScript(message) {
  console.log('[handleMessageFromContentScript] Message is: ', message);
  if (message.type) {
    sendMessageToWebsocket(message);

    message.user = myUsername;
    videoHistory.add(message);
  } else {
    console.log('[contentScript] ', message);
  }
};

function sendMessageToContentScript(message) {
  console.log('[sendMessageToContentScript] Message is: ', message);
  if (tabId) {
    console.log('[sendMessageToContentScript] Sending message to home tab: ', tabId);
    chrome.tabs.sendMessage(tabId, message);
  } else {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      tabs[0] ? chrome.tabs.sendMessage(tabs[0].id, message) : console.log('No active tab or set home tab.');
    });
  }
}

function handleTabChange(activeInfoEvent) {
  if (tabId && activeInfoEvent.tabId == tabId) {
    sendMessageToContentScript({type: 'TAB_HOME_ACTIVE'});
  }

}

var init = function() {
  console.log('[init]');
  // Set myUsername
  chrome.identity.getProfileUserInfo(function(userInfo) {
    myUsername = userInfo.email.split("@")[0];
  });

  chrome.runtime.onMessage.addListener(handleMessageFromContentScript);

  chrome.tabs.onActivated.addListener(handleTabChange);

  // Read other stuff out of browser storage?
}

init();

module.exports = {
  videoHistory,
  isWebsocketOpen,
  subscribeToWebsocketEvents,
  handleMessageFromBrowserAction
}
