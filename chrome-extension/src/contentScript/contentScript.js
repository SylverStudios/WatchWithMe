/*
Content scripts:
- Run in an "Isolated world."
- Can't access or be accessed by other scripts.
- Must communicate using the Chrome Window Messaging APIs.
- Content scripts can access the current tab's DOM.
*/

import $ from 'jquery';
import VideoControl from './videoControl';
import funcLog from '../util/funcLog';

let videoControl;

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

const popupOpen = function () {
  if (!videoControl.video) {
    videoControl.initVideo();
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

  videoControl = new VideoControl()
    .setOnVideoPlay(handleVideoPlayEvent)
    .setOnVideoPause(handleVideoPauseEvent)
    .setOnVideoSeek(handleVideoSeekEvent);

  chrome.runtime.onMessage.addListener(function (message, sender) {
    console.log('[contentScript init addListener callback] Sender is: ', sender);
    handleMessageFromBackgroundScript(message);
  });
}

init();
