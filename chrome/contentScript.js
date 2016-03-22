/*
Content scripts:
- Run in an "Isolated world."
- Can't access or be accessed by other scripts.
- Must communicate using the Chrome Window Messaging APIs.
- Content scripts can access the current tab's DOM.
*/

var videoControl = {
  videoElements : undefined,
  video : undefined,
  currentVideo : 0,
  actionEvents : "play pause seeking",
  passiveEvents : "timeupdate",

  init : function init() {
    this.videoElements = $('video');
    this.video = this.videoElements[this.currentVideo];

    this.video ? this.addVideoListeners(this.video) : console.log('No video element found.');
  },

  selectNextVideoElement : function() {

    if (!this.videoElements || this.videoElements.length < 2) {
      console.log('No other elements to select.');
      return;
    } else {
      this.currentVideo >= this.videoElements.length ? this.currentVideo = 0 : this.currentVideo++;
      this.setVideoElement(videoElements[currentVideo]);
    }

  },

  setVideoElement : function(newSelectedVideo) {
    if (this.video) {
      this.removeHightlight();
      this.removeVideoListeners(this.video)
    }

    this.video = newSelectedVideo;

    if (this.video) {
      this.addHighlight();
      this.addVideoListeners(this.video);
    }
  },

  addHighlight : function(jSelector) {
    var addTo = jSelector ? jSelector : this.video;
    $(addTo).addClass('wwmVideo');
  },

  removeHighlight : function(jSelector) {
    var removeFrom = jSelector ? jSelector : this.video;
    $(removeFrom).removeClass('wwmVideo');
  },

  videoListener : function(event) {
    var eventType = event.type;
    sendToBackgroundScript();

    switch(eventType) {
      case 'play':
        console.log("play from: "+event.target.currentTime);
        break;
      case 'pause':
        console.log("pause at: "+event.target.currentTime);
        break;
      case 'seeking':
        console.log("seeking to: "+event.target.currentTime);
        break;
      default:
        console.log("I Don't know how to hangle event: "+eventType);
    }
  },


  timeUpdateHandler : function(event) {
    // This is happening too often I think, multiple times per second.
    setTimeout(function() {
      console.log("The timeout is working I hope, here is the event");
      console.log(event);
    }, 2000);
  },

  addVideoListeners : function(jSelector) {
    $(jSelector).on(this.actionEvents, this.videoListener);
    // $(jSelector).on(this.passiveEvents, this.timeUpdateHandler);

  },

  removeVideoListeners : function(jSelector) {
    $(jSelector).off(this.activeEvents, this.videoListener);
    // $(jSelector).off(this.passiveEvents, this.timeUpdateHandler);
  },

  play : function play() {
    if (this.video) {
      this.video.play();
    }
  },

  pause : function pause() {
    if (this.video) {
      this.video.pause();
    }
  },

  skipTo : function skipTo(timeSeconds) {
    if (this.video) {
      this.video.currentTime = timeSeconds;
    }
  }
}

var popupOpen = function() {
  if (!videoControl.video) {
    videoControl.init();
  }

  videoControl.addHighlight();
}

var popupClose = function() {
  videoControl.removeHighlight();
}

var setWwmClassStyle = function() {
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
  .wwmVideo {
      border: 2px solid #35D418;
      border-radius: 20px;
  }`;
  document.getElementsByTagName('head')[0].appendChild(style);
}

var handleCommand = function(message) {
  var command = message['command'];

  switch(command) {
    case 'PLAY':
      videoControl.play();
      break;
    case 'PAUSE':
      videoControl.pause();
      break;
    case 'SKIP':
      videoControl.skipTo(message['time']);
      break;
    case 'POPUP_OPEN':
      popupOpen();
      break;
    case 'POPUP_CLOSE':
      popupClose();
      break;
    case 'FIND':
      videoControl.selectNextVideoElement();
      break;
    default:
      console.log('Failed to interpret command : '+command);
  }
}

var sendToBackgroundScript = function sendToBackgroundScript() {
  chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  console.log(response);
});
}

var init = function() {
  var port = chrome.runtime.connect();
  setWwmClassStyle();
  videoControl.init();

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log(sender);
    handleCommand(message);
  });
}

init();
