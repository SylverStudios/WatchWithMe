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

import Client from './client/Client';
import AppState from './models/AppState';
import { ChromeMessages } from './models/Constants';

const init = () => {
  console.log('init background');
  // set up app state, to be shared with browserAction
  window.state = new AppState();
  let stateListener = () => {};
  window.onStateChange = (callback) => {
    stateListener = callback;
  };
  const updateState = (updater) => {
    window.state = updater(window.state);
    window.onStateChange(window.state);
  };

  // set up server client
  const client = new Client('ws://localhost:4000/socket', 'user'); // TODO use real values for address and username

  // set up messaging infrastructure
  chrome.runtime.onMessage.addListener((message) => {
    console.log('received message: ', message);
    if (typeof message === 'string') {
      switch (message) {
        case 'FOUND_VIDEO':
          updateState(s => s.set('connecting', true));
          client.connect(() => {
            updateState(s => s.set('connected', true).set('connecting', false));
          }, () => {
            updateState(s => s.set('connected', false).set('connecting', false).set('couldNotConnect', true));
          });
          return;
        case 'NOT_EXACTLY_ONE_VIDEO':
          updateState(s => s.set('pageIsInvalid', true));
          return;
      }
    }
  });
  const sendMessageToContentScript = (message) => {
    console.log('sendMessageToContentScript:', message);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('found ' + tabs.length + ' tabs');
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      } else {
        console.log('could not find active tab');
      }
    });
  }

  // set up actions that the browserAction popup can perform
  window.browserActionActions = {
    attemptConnect: () => {
      console.log('attemptConnect')
      sendMessageToContentScript(ChromeMessages.FIND_NEW_VIDEO_COMMAND);
    },
  };
}

init();
