var serverIp = '52.38.66.94';

var websocket;
var websocketOnOpenCallbacks = [];
var websocketOnCloseCallbacks = [];

var username = 'Fake McClientson'
var video = $('video')[0];

$('#connect-btn').click(connectToWebsocket);
addListeners();


// Video stuff
function addListeners() {
  $(video).on('play pause seeking', handleVideoEvent);
}

function removeListeners() {
  $(video).off('play pause seeking', handleVideoEvent);
}

function handleVideoEvent(event) {
  var message = {user: username, type: event.type, time: event.target.currentTime};
  console.log(message);

  var messageInOldSocketFormat = {type: event.type, time: event.target.currentTime};

  sendMessageToWebsocket(messageInOldSocketFormat);
}

// Socket Stuff
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

function sendMessageToWebsocket(message) {
  console.log('[sendMessageToWebsocket] Message is: ', message);
  websocket ? websocket.send(JSON.stringify(message)) : console.log('Websock isn\'t open.');
}

function handleMessageFromWebsocket(event) {
  var message;
  try {
    message = JSON.parse(event.data);

    console.log(message);

    doWebsocketCommand(message);

  } catch(exception) {
    console.log('[handleMessageFromWebsocket] Cannot parse message, exception is: ', exception);
  }
}

function doWebsocketCommand(message) {
  var type = message['type'];
  removeListeners();

  switch(type) {
    case 'PLAY':
      video.play();
      break;
    case 'PAUSE':
      video.pause();
      if (message['time'] !== undefined) {
        video.currentTime = message['time'];
      }
      break;
    case 'SKIP':
      video.currentTime = message['time'];
      break;
    default:
      console.log('AAAAA WTF IS HAPPENING!!! I DON\'T UNDERSTAND: ', type);
  }

  addListeners();
}