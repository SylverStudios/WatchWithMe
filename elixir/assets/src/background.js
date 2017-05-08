/**
 * Background script:
 * - Loaded behind the scenes.
 * - Exists as long as the browser is open.
 * - Can be accessed by other scipts in the extension.
 * - A middle man between the Browser Action and the Content Script.
 * 
 * Responsibilities:
 * 1. handle messages from the content script
 * 2. Provide access to useful info to the browserAction
 * 3. handle messages from channel
 *  - Join messages go to video history
 *  - state updates go to content script
 */

import { connect } from '../src/wrappers/channelConnect';
import VideoHistory from '../src/models/VideoHistory';

let channel;
let tabId;
const videoHistory = new VideoHistory();


// Content scripts are tab specific because they are linked to a DOM
const sendMessageToContentScript = (message) => {
  if (tabId) {
    chrome.tabs.sendMessage(tabId, message);
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      } else {
        console.log("something bad happened");
      }
    });
  }
}

function setHomeTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    tabId = tabs[0].id;
  });
}

/**
 * 3. Handle messages from channel
 */
const connect2Channel = (address, room) => {
  chrome.identity.getProfileUserInfo(function (userInfo) {
    const myUsername = userInfo.email.split('@')[0];
    channel = connect(address, room, myUsername);
  });
};

const handleUserJoin = (channelPayload) => {
  videoHistory.add(payload.body);
};

const handleStateChange = (channelPayload) => {
  videoHistory.add(channelPayload);

  console.log("recieved a state change from ", channelPayload.last_action.initiator);
  console.log(`I am user: ${channel.username}`);
  if (channelPayload.last_action.initiator == channel.username) {
    console.log("Looks like I made the last action, don't effect video");
    return
  } else {
    console.log("here is the state_change payload");
    console.log(channelPayload);
    sendMessageToContentScript(channelPayload);
  }
};

/**
 * 1. handle messages from the content script
 * The content script only sends 1 of 2 messages
 *  state = { is_playing, time, last_action: { initiator, video_time, world_time, type } }
 *  action = { initiator, video_time, world_time, type }
 */
const handleMessageFromContentScript = message => {
  if (message.is_playing) {
    channel.push("state", message);
  } else {
    // Add our username since the content script doesn't know it.
    message.username = channel.username;
    channel.push("action", message);
  }
}

const init = () => {
  chrome.runtime.onMessage.addListener(handleMessageFromContentScript);
  
  connect2Channel("/socket", "room:lobby");
  channel.on("user_joined", handleUserJoin);
  channel.on("state_change", handleStateChange);
}

init();

// 2. Export videoHistory and mesageContentScript for the browser action
export { videoHistory, sendMessageToContentScript };
