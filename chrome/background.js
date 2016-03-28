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
var videoHistory = {
  list : [],

  add : function(commandObject) {
    var log = commandObject.user + ' : ' + commandObject.command;
    commandObject.time ? log += ' to ' + commandObject.time + ' seconds.' : '.';

    this.list.push(log);

    this.trim();
  },

  trim : function() {
    if (this.list.length > 10) {
      this.list.shift();
    }
  }
};

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
  console.log('[handleMessageFromBrowserAction] Message is: message');
  if (message.type === 'CONNECT') {
    connectToWebsocket();
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
  } catch(exception) {
    console.log('[handleMessageFromWebsocket] Cannot parse message, exception is: ', exception);
  }
}

function sendMessageToWebsocket(message) {
  console.log('[sendMessageToWebsocket] Message is: ', message);
  websocket.send(JSON.stringify(message));
}

function handleMessageFromContentScript(message) {
  console.log('[handleMessageFromContentScript] Message is: ', message);
  if (message.type) {
    sendMessageToWebsocket(message);
  } else {
    console.log('[contentScript] ', message);
  }
};

function sendMessageToContentScript(message) {
  console.log('[sendMessageToContentScript] Message is: ', message);
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      console.log('[sendMessageToContentScript] Sending to tab: ', tabs[0]);;
      chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

var init = function() {
  console.log('[init]');
  // Set myUsername
  chrome.identity.getProfileUserInfo(function(userInfo) {
    myUsername = userInfo.email.split("@")[0];
  });

  chrome.runtime.onMessage.addListener(handleMessageFromContentScript);

  // Read other stuff out of browser storage?
}

init();
