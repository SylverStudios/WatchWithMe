/* eslint-disable */

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

let video;

//  VIDEO EVENT HANDLING
//  Listen to on video event, send the message to the background script
const handlePlay = (event) => {
  console.log('Caught a play');
  chrome.runtime.sendMessage(actions.play(video.time, undefined));
}

const handlePause = (event) => {
  console.log('Caught a pause');
  chrome.runtime.sendMessage(actions.pause(video.time, undefined));
}


//  CHROME MESSAGE HANDLING
//  We receive messages of many types
//  Determine what type it is, then do something
const handleChromeMessage = (message) => {
  console.log("received message - ", message);
  switch (message) {
    case ChromeMessages.STATE_REQUEST_MESSAGE:
      chrome.runtime.sendMessage(video.getState());
      break;

    case ChromeMessages.POPUP_OPEN_EVENT:
      if (video) {
        video.addHighlight();
      } else {
        console.log("Not connected to video yet, popup open event");
      }
      break;

    case ChromeMessages.POPUP_CLOSE_EVENT:
      if (video) {
        video.removeHighlight();
      } else {
        console.log("Not connected to video yet, popup close event");
      }
      break;

    case ChromeMessages.FIND_NEW_VIDEO_COMMAND:
      const videos = document.querySelectorAll("video");
      if (videos.length !== 1) {
        console.log('found ' + videos.length + ' videos, exiting');
        chrome.runtime.sendMessage('NOT_EXACTLY_ONE_VIDEO');
      } else {
        console.log('found ' + videos.length + ' videos, continuing');
        chrome.runtime.sendMessage('FOUND_VIDEO');
        connectToVideo();
      }
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

const connectToVideo = () => {
  console.log('Connecting to video');
  video = new Video();
  video.addHighlight();
  video.on("play", handlePlay);
  video.on("pause", handlePause);
}


// Add highlight style to DOM
const addWwmVideoStyle = function() {
  const css = '.wwmVideo { border: 2px solid #35D418 }';
  const styleTag = document.createElement('style');
  styleTag.type = 'text/css';

  if (styleTag.styleSheet){
    styleTag.styleSheet.cssText = css;
  } else {
    styleTag.appendChild(document.createTextNode(css));
  }
  document.querySelector("head").appendChild(styleTag);
}


// Start stuff
addWwmVideoStyle();
console.log('content script loaded');

chrome.runtime.connect();
chrome.runtime.onMessage.addListener((message) => {
  handleChromeMessage(message);
});
