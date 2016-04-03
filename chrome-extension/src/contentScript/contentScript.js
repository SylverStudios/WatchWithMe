/*
Content scripts:
- Run in an "Isolated world."
- Can't access or be accessed by other scripts.
- Must communicate using the Chrome Window Messaging APIs.
- Content scripts can access the current tab's DOM.
*/

import $ from 'jquery';

function sendMessageToBackgroundScript(message) {
  console.log('[sendMessageToBackgroundScript] Sending message: ', message);
  chrome.runtime.sendMessage(message);
}

function handleVideoPlayEvent() {
  console.log('[handleVideoPlayEvent]');
  sendMessageToBackgroundScript({ type: 'PLAY' });
}

function handleVideoPauseEvent(e) {
  const time = e.target.currentTime;
  console.log('[handleVideoPauseEvent] Time is: ', time);
  sendMessageToBackgroundScript({ type: 'PAUSE', time: time });
}

function handleVideoSeekEvent(e) {
  const time = e.target.currentTime;
  console.log('[handleVideoSeekEvent] Time is: ', time);
  sendMessageToBackgroundScript({ type: 'SEEK', time: time });
}

const videoControl = {
  videoElements: undefined,
  video: undefined,
  currentVideo: 0,
  actionEvents: 'play pause seeking',
  passiveEvents: 'timeupdate',

  init: function () {
    console.log('[videoControl init]');
    this.videoElements = $('video');
    this.video = this.videoElements[this.currentVideo];
    if (this.video) {
      this.addVideoListeners();
    }
  },

  selectNextVideoElement: function () {
    if (!this.videoElements || this.videoElements.length < 2) {
      console.log('No other elements to select.');
      return;
    }
    if (this.currentVideo >= this.videoElements.length) {
      this.currentVideo = 0;
    } else {
      this.currentVideo++;
    }
    this.setVideoElement(this.videoElements[this.currentVideo]);
  },

  setVideoElement: function (newSelectedVideo) {
    if (this.video) {
      this.removeHighlight();
      this.removeVideoListeners();
    }

    this.video = newSelectedVideo;

    if (this.video) {
      this.addHighlight();
      this.addVideoListeners();
    }
  },

  addHighlight: function (jSelector) {
    const addTo = jSelector ? jSelector : this.video;
    $(addTo).addClass('wwmVideo');
  },

  removeHighlight: function (jSelector) {
    const removeFrom = jSelector ? jSelector : this.video;
    $(removeFrom).removeClass('wwmVideo');
  },

  addPlayListener: function () {
    console.log('[addPlayListener]');
    if (this.video) $(this.video).on('play', handleVideoPlayEvent);
  },
  removePlayListener: function () {
    console.log('[removePlayListener]');
    if (this.video) $(this.video).off('play', handleVideoPlayEvent);
  },
  addPauseListener: function () {
    console.log('[addPauseListener]');
    if (this.video) $(this.video).on('pause', handleVideoPauseEvent);
  },
  removePauseListener: function () {
    console.log('[removePauseListener]');
    if (this.video) $(this.video).off('pause', handleVideoPauseEvent);
  },
  addSeekListener: function () {
    console.log('[addSeekListener]');
    if (this.video) $(this.video).on('seeking', handleVideoSeekEvent);
  },
  removeSeekListener: function () {
    console.log('[removeSeekListener]');
    if (this.video) $(this.video).off('seeking', handleVideoSeekEvent);
  },

  addVideoListeners: function () {
    console.log('[addVideoListeners]');
    if (this.video) {
      this.addPlayListener();
      this.addPauseListener();
      this.addSeekListener();
    }
  },

  removeVideoListeners: function () {
    console.log('[removeVideoListeners]');
    if (this.video) {
      this.removePlayListener();
      this.removePauseListener();
      this.removeSeekListener();
    }
  },

  play: function () {
    console.log('[videoControl::play]');
    const self = this;
    if (this.video) {
      this.removePlayListener();
      $(this.video).one('play', function () {
        self.addPlayListener();
      });
      this.video.play();
    }
  },

  pause: function () {
    console.log('[videoControl::pause]');
    const self = this;
    if (this.video) {
      this.removePauseListener();
      $(this.video).one('pause', function () {
        self.addPauseListener();
      });
      this.video.pause();
    }
  },

  skipTo: function (timeSeconds) {
    console.log('[videoControl::skipTo] Time is: ', timeSeconds);
    const self = this;
    if (this.video) {
      this.removeSeekListener();
      $(this.video).one('seeking', function () {
        self.addSeekListener();
      });
      this.video.currentTime = timeSeconds;
    }
  },
};

function logFunctionName(callee) {
  let name = callee.substr('function '.length);
  name = name.substr(0, name.indexOf('('));
  console.log('[' + name + ']');
}

const popupOpen = function () {
  if (!videoControl.video) {
    videoControl.init();
  }

  videoControl.addHighlight();
};

const popupClose = function () {
  videoControl.removeHighlight();
};

function setWwmClassStyle() {
  logFunctionName(arguments.callee.toString());
  $("<style type='text/css'> .wwmVideo{ border: 2px solid #35D418; border-radius: 20px;} </style>").appendTo('head');
}

function handleMessageFromBackgroundScript(message) {
  console.log('[handleMessageFromBackgroundScript] Message is: ', message);
  const { type, time } = message;
  switch (type) {
    case 'PLAY':
      videoControl.play();
      break;
    case 'PAUSE':
      videoControl.pause();
      if (time !== undefined) {
        videoControl.skipTo(time);
      }
      break;
    case 'SKIP':
      if (time !== undefined) {
        videoControl.skipTo(time);
      }
      break;
    case 'POPUP_OPEN':
      popupOpen();
      break;
    case 'TAB_HOME_ACTIVE':
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

const init = function () {
  console.log('[init]');
  chrome.runtime.connect();
  setWwmClassStyle();
  videoControl.init();

  chrome.runtime.onMessage.addListener(function (message, sender) {
    console.log('[contentScript init addListener callback] Sender is: ', sender);
    handleMessageFromBackgroundScript(message);
  });
};

init();
