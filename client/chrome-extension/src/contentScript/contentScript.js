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
import VideoState from '../models/VideoState';
import funcLog from '../util/funcLog';

import { STATE_REQUEST_MESSAGE, POPUP_OPEN_EVENT, POPUP_CLOSE_EVENT, FIND_NEW_VIDEO_COMMAND, TIME_SEEK_EPSILON, }
  from '../util/constants';

let videoControl;
let lastState;

function updateState(newState) {
  lastState = newState;
}

function significantStateChange(incomingState) {
  return !lastState ||
  incomingState.isPlaying !== lastState.isPlaying ||
  Math.abs(incomingState.time - lastState.time) > TIME_SEEK_EPSILON;
}

function handleVideoStateChange() {
  const incomingState = videoControl ? videoControl.getCurrentState() : '';

  if (incomingState instanceof VideoState && significantStateChange(incomingState)) {
    updateState(incomingState);
    funcLog('State:', lastState);
    chrome.runtime.sendMessage(lastState);
  }
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
  const roomState = RoomState.fromJSON(message);
  funcLog('Info from background script:', roomState);

  if (roomState instanceof RoomState) {
    if (!significantStateChange(roomState)) return;

    updateState(roomState);

    if (roomState.isPlaying) {
      videoControl.play(roomState.time);
    } else {
      videoControl.pause(roomState.time);
    }
    return;
  }

  switch (message) {

    case STATE_REQUEST_MESSAGE:
      chrome.runtime.sendMessage(videoControl.getCurrentState());
      break;

    case POPUP_OPEN_EVENT:
      popupOpen();
      break;

    case POPUP_CLOSE_EVENT:
      popupClose();
      break;

    case FIND_NEW_VIDEO_COMMAND:
      videoControl.selectNextVideoElement();
      break;

    default:
      funcLog('Failed to interpret message', message);
  }
}

function init() {
  funcLog();
  chrome.runtime.connect();
  setWwmClassStyle();

  videoControl = new VideoControl(handleVideoStateChange);

  chrome.runtime.onMessage.addListener(function (message) {
    handleMessageFromBackgroundScript(message);
  });
}

init();
