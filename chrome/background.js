/*
Background script:
- Loaded behind the scenes.
- Exists as long as the browser is open.
- Can be accessed by other scipts in the extension.
- A middle man between the Browser Action and the Content Script.
*/

var myUsername;
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

var createCommandObject = function createCommandObject(commandName, commandSender, time) {
  var commandObject = {};

  commandObject['command'] = commandName ? commandName : 'NO_COMMAND';
  commandObject['user'] = commandSender ? commandSender : myUsername;
  commandObject['time'] = time ? time : '';

  return commandObject;
}

var sendToContentScript = function sendToContentScript(commandObject) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, commandObject);
  });
}

var sendToServer = function sendToServer(commandObject) {
  console.log('Unsupported Operation - SendToServer.');
}


// Internal - from browserAction to content script and server.
var sendCommand = function sendCommand(commandName, commandSender, time) {
  var command = createCommandObject(commandName, commandSender, time);

  sendToContentScript(command);

  commandSender == myUsername ? sendToServer(command) : '';

  if (command.command.indexOf('_') == -1) {
    videoHistory.add(command);
  }
}

var handleMessageFromContentScript = function(message, sender, sendResponse) {
  console.log("Background caught a message.");
  console.log(sender);
  console.log("Can I catch my own messages?");
  console.log(message.greeting);
};

var init = function() {
  // Set myUsername
  chrome.identity.getProfileUserInfo(function(userInfo) {
    myUsername = userInfo.email.split("@")[0];
  });

  chrome.runtime.onMessage.addListener(handleMessageFromContentScript);

  // Read other stuff out of browser storage?
  // Connect to websocket
}

init();