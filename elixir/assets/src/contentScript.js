/**
 * 
 * Content scripts:
 * - Run in an "Isolated world."
 * - Can't access or be accessed by other scripts.
 * - Must communicate using the Chrome Window Messaging APIs.
 * - Content scripts can access the current tab's DOM.
 * 
 * 
 * Responsible
 * Find a video and start watching it.
 * Connect to the chrome runtime for messages
 * 
 * On events from chrome, do something
 * On events from the video, do something. 
 */

import Video from './wrappers/Video';
import actions from './models/actions';
import { ChromeMessages } from './models/Constants';

let video

//  VIDEO EVENT HANDLING
//  Listen to on video event, send the message to the background script
const handlePlay = (event) => {
  chrome.runtime.sendMessage(actions.play(video.time, undefined));
}

const handlePause = (event) => {
  chrome.runtime.sendMessage(actions.pause(video.time, undefined));
}


//  CHROME MESSAGE HANDLING
//  We receive messages of many types
//  Determine what type it is, then do something
const handleChromeMessage = (message) => {
  switch (message) {
    case ChromeMessages.STATE_REQUEST_MESSAGE:
      chrome.runtime.sendMessage(video.getState());
      break;

    case ChromeMessages.POPUP_OPEN_EVENT:
      video.addHighlight();
      break;

    case ChromeMessages.POPUP_CLOSE_EVENT:
      video.removeHighlight();
      break;

    case ChromeMessages.FIND_NEW_VIDEO_COMMAND:
      video.selectNextVideoElement();
      break;

    // If it's not one of our events, then it
    // should be an object describing the state
    default:
      console.log("Content script received: ", message);
      if (message.is_playing) {
        video.play(message.time);
      } else {
        video.pause(message.time);
      }
  }
}


// Add highlight style to DOM
const setWwmStyle = function() {
  const css = '.wwmVideo { border: 2px solid #35D418; border-radius: 20px; }';
  const styleTag = document.createElement('style');
  styleTag.type = 'text/css';

  if (style.styleSheet){
    styleTag.styleSheet.cssText = css;
  } else {
    styleTag.appendChild(document.createTextNode(css));
  }
  document.querySelector("head").appendChild(styleTag);
}

function init() {
  setWwmClassStyle();
  
  video = new Video();
  video.on("play", handlePlay);
  video.on("pause", handlePause);

  chrome.runtime.connect();
  chrome.runtime.onMessage.addListener((message) => {
    handleChromeMessage(message);
  });
}

init();
