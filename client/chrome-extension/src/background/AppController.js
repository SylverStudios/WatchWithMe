import AppState from '../models/AppState';
import { ChromeMessages } from '../models/Constants';

class AppController {
  constructor({ client, sendMessage, onMessage }) {
    console.debug('init AppController');

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
      console.debug('received message: ', message);
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
        }
      } else {
        const type = message.type;
        const videoTime = message.video_time;
        switch (type) {
          case 'PLAY':
            console.debug('sending play message to client with video time:', videoTime);
            client.play(videoTime);
            return;
          case 'PAUSE':
            console.debug('sending pause message to client with video time:', videoTime);
            client.pause(videoTime);
        }
      }
    });

    // set up actions that the browserAction popup can perform
    this.browserActionActions = {
      attemptConnect: () => {
        console.debug('attemptConnect');
        sendMessage(ChromeMessages.FIND_NEW_VIDEO_COMMAND);
      },
    };

    // listen to messages coming through the client and route them appropriately
    client.onPlay(({ videoTime, worldTime }) => {
      sendMessage({ type: 'PLAY', videoTime, worldTime });
    });
    client.onPause(({ videoTime, worldTime }) => {
      sendMessage({ type: 'PAUSE', videoTime, worldTime });
    });
  }
}

export default AppController;
