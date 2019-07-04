/* globals chrome, window */

import Client from './client/Client';
import AppController from './background/AppController';
import Config from './Config';

/**
 * Set up parameters to AppController based on environment
 * Here environment is chrome extension and messaging needs to be plumbed a certain way
 */

const config = new Config('dev');
console.debug(`Background connecting to: ${config.url}`);

const client = new Client(config.url, 'user'); // TODO use real values for address and username
const sendMessage = (message) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message);
    } else {
      // TODO call an onError callback denoting that the tab can't be found
      console.error('could not find active tab');
    }
  });
};
const onMessage = fn => chrome.runtime.onMessage.addListener(fn);

const appController = new AppController({ client, sendMessage, onMessage });

// make appController information available on the window, so browserAction can access it
window.state = appController.state;
window.onStateChange = appController.onStateChange;
window.browserActionActions = appController.browserActionActions;
