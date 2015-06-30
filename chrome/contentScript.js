/*
contentScript.js

The content script is a very weird file. Like all pages in the chome extension
this one has limitations as well. It runs in what they call an "isolated world."

This script has access to the current tab's DOM, which is awesome! This is how we can
get the access to our beloved video element. The only issue with a content script is
that it is completely hidden from the rest of the extension and the current tab. This 
means that we need a unique way to communicate and that is why we use the window messaging
apis.

*/

var port = chrome.runtime.connect();

console.log("Content Script is running");

var videoElement = $('video').get(0);

if (null != videoElement) {
	console.log("Found a videoElement");
}

// This is the essential element of the script.
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  // sendResponse({farewell:"goodbye"});
  var command = message['command'];

  if (exists(command)) {
  	handleCommand(command);
  } else {
  	console.log("failed to handle command.");
  }

});

function handleCommand(commandName) {
	if ('PLAY' == commandName) {
		playVideo();
	} else if ('PAUSE' == commandName) {
	  	pauseVideo();
	}
}

function playVideo() {
	console.log("received play video command.");
	if (exists(videoElement)) {
		videoElement.play();
	}
}

function pauseVideo() {
	console.log("received pause video command.");
	if (exists(videoElement)) {
		videoElement.pause();
	}
}

// Some utility methods
function exists(variable) {
	if (null == variable || undefined == variable) {
		return false;
	}
	return true;
}