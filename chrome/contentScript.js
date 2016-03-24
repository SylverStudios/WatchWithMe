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
    console.log('[videoControl init]');
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


  timeUpdateHandler : function(event) {
    // This is happening too often I think, multiple times per second.
    setTimeout(function() {
      console.log("The timeout is working I hope, here is the event");
      console.log(event);
    }, 2000);
  },

  addVideoListeners : function(jSelector) {
    $(jSelector).on(this.actionEvents, handleEventFromVideo);
    // $(jSelector).on(this.passiveEvents, this.timeUpdateHandler);

  },

  removeVideoListeners : function(jSelector) {
    $(jSelector).off(this.activeEvents, handleEventFromVideo);
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

function setWwmClassStyle() {
  console.log('[setWwmClassStyle]');
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
  .wwmVideo {
      border: 2px solid #35D418;
      border-radius: 20px;
  }`;
  document.getElementsByTagName('head')[0].appendChild(style);
}

function handleEventFromVideo(event) {
  console.log('[handleEventFromVideo] Event is: ', event);
  var eventType = event.type;

  switch(eventType) {
    case 'play':
      sendMessageToBackgroundScript({type: 'PLAY'});
      break;
    case 'pause':
      sendMessageToBackgroundScript({type: 'PAUSE', time: event.target.currentTime});
      break;
    case 'seeking':
      console.log("[handleEventFromVideo] Seeking to: ", event.target.currentTime);
      break;
    default:
      console.log("[handleEventFromVideo] I don't know how to hangle event: ", eventType);
  }
}

function handleMessageFromBackgroundScript(message) {
  console.log('[handleMessageFromBackgroundScript] Message is: ', message);
  var type = message['type'];
  switch(type) {
    case 'PLAY':
      videoControl.play();
      break;
    case 'PAUSE':
      videoControl.pause();
      videoControl.skipTo(message['time']);
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
      console.log('[handleMessageFromBackgroundScript] Failed to interpret message type: ', type);
  }
}

function sendMessageToBackgroundScript(message) {
  console.log('[sendMessageToBackgroundScript] Sending message: ', message);
  chrome.runtime.sendMessage(message, function(response) {
    console.log('[sendMessageToBackgroundScript sendMessage callback] Response is: ', response);
  });
}

var init = function() {
  console.log('[init]');
  var port = chrome.runtime.connect();
  setWwmClassStyle();
  videoControl.init();

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log('[contentScript init addListener callback] Sender is: ', sender);
    handleMessageFromBackgroundScript(message);
  });
}

init();
