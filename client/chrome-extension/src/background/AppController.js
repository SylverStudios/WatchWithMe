import Client from '../client/Client';
import AppState from '../models/AppState';
import { ChromeMessages } from '../models/Constants';

class AppController {
  constructor({ client, sendMessage, onMessage }) {
    console.log('init AppController');

    // set up app state, to be shared with browserAction
    this.state = new AppState();
    let stateListener = () => {};
    this.onStateChange = (callback) => {
      stateListener = callback;
    };
    const updateState = (updater) => {
      this.state = updater(this.state);
      stateListener(this.state);
    };

    // set up messaging infrastructure
    onMessage((message) => {
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

    // set up actions that the browserAction popup can perform
    this.browserActionActions = {
      attemptConnect: () => {
        console.log('attemptConnect')
        sendMessage(ChromeMessages.FIND_NEW_VIDEO_COMMAND);
      },
    };
  }
}

export default AppController;
