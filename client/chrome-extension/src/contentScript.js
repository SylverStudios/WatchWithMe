/* globals chrome document */

import PageWatcher from './contentScript/PageWatcher';

// connect to chrome
chrome.runtime.connect();

// initialize main logic module
new PageWatcher({ // eslint-disable-line no-new
  dom: document,
  sendMessage: (message) => chrome.runtime.sendMessage(message),
  onMessage: (callback) => chrome.runtime.onMessage.addListener(callback),
});

console.log('content script loaded');
