/*
Content scripts:
- Run in an "Isolated world."
- Can't access or be accessed by other scripts.
- Must communicate using the Chrome Window Messaging APIs.
- Content scripts can access the current tab's DOM.
*/

import $ from 'jquery';

function funcLog() {
  const callingFuncName = new Error().stack.split('\n')[2].trim().split(' ')[1];
  let logArgs = ['[' + callingFuncName + ']'];
  logArgs = logArgs.concat(Array.prototype.slice.call(arguments));
  console.log.apply(console, logArgs);
}

function sendMessageToBackgroundScript(message) {
  funcLog('Sending message:', message);
  chrome.runtime.sendMessage(message);
}

function handleVideoPlayEvent() {
  funcLog();
  sendMessageToBackgroundScript({ type: 'PLAY' });
}

function handleVideoPauseEvent(e) {
  const time = e.target.currentTime;
  funcLog('Time is:', time);
  sendMessageToBackgroundScript({ type: 'PAUSE', time: time });
}

function handleVideoSeekEvent(e) {
  const time = e.target.currentTime;
  funcLog('Time is:', time);
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

  selectNextVideoElement: function selectNextVideoElement() {
    if (!this.videoElements || this.videoElements.length < 2) {
      funcLog('No other elements to select.');
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

  addPlayListener: function addPlayListener() {
    funcLog();
    if (this.video) $(this.video).on('play', handleVideoPlayEvent);
  },
  removePlayListener: function removePlayListener() {
    funcLog();
    if (this.video) $(this.video).off('play', handleVideoPlayEvent);
  },
  addPauseListener: function addPauseListener() {
    funcLog();
    if (this.video) $(this.video).on('pause', handleVideoPauseEvent);
  },
  removePauseListener: function removePauseListener() {
    funcLog();
    if (this.video) $(this.video).off('pause', handleVideoPauseEvent);
  },
  addSeekListener: function addSeekListener() {
    funcLog();
    if (this.video) $(this.video).on('seeking', handleVideoSeekEvent);
  },
  removeSeekListener: function removeSeekListener() {
    funcLog();
    if (this.video) $(this.video).off('seeking', handleVideoSeekEvent);
  },

  addVideoListeners: function addVideoListeners() {
    funcLog();
    if (this.video) {
      this.addPlayListener();
      this.addPauseListener();
      this.addSeekListener();
    }
  },

  removeVideoListeners: function removeVideoListeners() {
    funcLog();
    if (this.video) {
      this.removePlayListener();
      this.removePauseListener();
      this.removeSeekListener();
    }
  },

  play: function play() {
    funcLog();
    const self = this;
    if (this.video) {
      this.removePlayListener();
      $(this.video).one('play', function () {
        self.addPlayListener();
      });
      this.video.play();
    }
  },

  pause: function pause() {
    funcLog();
    const self = this;
    if (this.video) {
      this.removePauseListener();
      $(this.video).one('pause', function () {
        self.addPauseListener();
      });
      this.video.pause();
    }
  },

  skipTo: function skipTo(timeSeconds) {
    funcLog('Time is:', timeSeconds);
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
  funcLog();
  $("<style type='text/css'> .wwmVideo{ border: 2px solid #35D418; border-radius: 20px;} </style>").appendTo('head');
}

function handleMessageFromBackgroundScript(message) {
  funcLog('Message is: ', message);
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
      funcLog(handleMessageFromBackgroundScript, 'Failed to interpret message type: ', type);
  }
}

function init() {
  funcLog();
  chrome.runtime.connect();
  setWwmClassStyle();
  videoControl.init();

  chrome.runtime.onMessage.addListener(function (message, sender) {
    console.log('[contentScript init addListener callback] Sender is: ', sender);
    handleMessageFromBackgroundScript(message);
  });
}

init();
