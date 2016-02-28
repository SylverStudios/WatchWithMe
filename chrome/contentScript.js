/*
Content scripts:
- Run in an "Isolated world."
- Can't access or be accessed by other scripts.
- Must communicate using the Chrome Window Messaging APIs.
- Content scripts can access the current tab's DOM.
*/

var current = 0;
var videoElements;
var selectedVideo;

var port = chrome.runtime.connect();
console.log('Content Script is running');

var handleCommand = function(message) {
	var command = message['command'];

	switch(command) {
		case 'PLAY':
			playVideo();
			break;
		case 'PAUSE':
			pauseVideo();
			break;
		case 'SKIP':
			skipTo(message['time']);
			break;
		case 'POPUP_OPEN':
			popupOpen();
			break;
		case 'POPUP_CLOSE':
			popupClose();
			break;
		case 'FIND':
			findNextVideoElement();
			break;
		default:
			console.log('Failed to interpret command : '+command);
	}
}

var findNextVideoElement = function() {
	current++;
	var newElement = videoElements[current];
	if (!newElement) {
		current = 0;
		newElement = videoElements[current];
	}
	utils.setVideoElement(newElement);
}

var popupClose = function() {
	utils.removeHighlight(selectedVideo);
}

var popupOpen = function() {
	if (!selectedVideo) {
		initialSetup();
	}

	utils.addHighlight(selectedVideo);
}

var initialSetup = function() {
	utils.setWwmClassStyle();
	videoElements = $('video');
	selectedVideo = videoElements[current];

	!selectedVideo ? console.log('No video element found.') : '';
}

function playVideo() {
	if (selectedVideo) {
		selectedVideo.play();
	}
}

function pauseVideo() {
	if (selectedVideo) {
		selectedVideo.pause();
	}
}

function skipTo(time) {
	console.log("Unsupported operation. skipTo("+time+")");
}

var utils = {
	setVideoElement : function(newElement) {
		if (selectedVideo) {
			utils.removeHighlight(selectedVideo);
		}
		
		selectedVideo = newElement;	

		if (selectedVideo) {
			utils.addHighlight(selectedVideo);
		}
	},

	addHighlight : function(jSelector) {
		$(jSelector).addClass('wwmVideo');
	},

	removeHighlight : function(jSelector) {
		$(jSelector).removeClass('wwmVideo');
	},

	setWwmClassStyle : function() {
		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = `
		.wwmVideo {
		    border: 2px solid #35D418;
		    border-radius: 20px;
		}`;
		document.getElementsByTagName('head')[0].appendChild(style);
	}
};


// This is how we can read Chrome messages.
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("Command recieved at contentScript: "+message['command']);
  handleCommand(message);
});