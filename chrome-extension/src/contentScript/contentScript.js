/*
Content scripts:
- Run in an "Isolated world."
- Can't access or be accessed by other scripts.
- Must communicate using the Chrome Window Messaging APIs.
- Content scripts can access the current tab's DOM.
*/

import $ from 'jquery';
import VideoControl from './VideoControl';
import RoomState from '../models/RoomState';
import funcLog from '../util/funcLog';

import { STATE_REQUEST_MESSAGE, POPUP_OPEN_EVENT, POPUP_CLOSE_EVENT, FIND_NEW_VIDEO_COMMAND, }
  from '../util/constants';


let videoControl;

function reportVideoStateToBackgroundScript() {
  const videoState = videoControl.getCurrentState();
  funcLog('State:', videoState);
  chrome.runtime.sendMessage(videoState);
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
  const roomState = RoomState.fromJSON(message);
  if (message === STATE_REQUEST_MESSAGE) {
    reportVideoStateToBackgroundScript(videoControl.getCurrentState());
  } else if (message === POPUP_OPEN_EVENT) {
    popupOpen();
  } else if (message === POPUP_CLOSE_EVENT) {
    popupClose();
  } else if (message === FIND_NEW_VIDEO_COMMAND) {
    videoControl.selectNextVideoElement();
  } else if (roomState instanceof RoomState) {
    if (roomState.isPlaying) {
      videoControl.play();
    } else {
      videoControl.pause();
    }
    videoControl.skipTo(roomState.time);
  } else {
    funcLog('Failed to interpret message');
  }
}

function init() {
  funcLog();
  chrome.runtime.connect();
  setWwmClassStyle();

  videoControl = new VideoControl()
    .setOnVideoPlay(reportVideoStateToBackgroundScript)
    .setOnVideoPause(reportVideoStateToBackgroundScript)
    .setOnVideoSeek(reportVideoStateToBackgroundScript);

  chrome.runtime.onMessage.addListener(function (message, sender) {
    funcLog('Sender is:', sender);
    handleMessageFromBackgroundScript(message);
  });
}

init();
