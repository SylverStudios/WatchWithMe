import Video from '../wrappers/Video';
import actions from '../models/actions';
import { ChromeMessages } from '../models/Constants';

class PageWatcher {
  constructor({ dom, sendMessage, onMessage }) {
    // add highlight style to DOM
    const css = '.wwmVideo { border: 2px solid #35D418 }';
    const styleTag = dom.createElement('style');
    styleTag.type = 'text/css';
    if (styleTag.styleSheet) {
      styleTag.styleSheet.cssText = css;
    } else {
      styleTag.appendChild(dom.createTextNode(css));
    }
    dom.querySelector('head').appendChild(styleTag);

    //  VIDEO EVENT HANDLING
    //  Listen to on video event, send the message to the background script
    const handlePlay = () => {
      console.debug('Caught a play');
      sendMessage(actions.play(this.video.time, undefined));
    };

    const handlePause = () => {
      console.debug('Caught a pause');
      sendMessage(actions.pause(this.video.time, undefined));
    };

    const connectToVideo = (video) => {
      console.debug('Connecting to this.video');
      this.video = new Video(video);
      this.video.addHighlight();
      this.video.on('play', handlePlay);
      this.video.on('pause', handlePause);
    };

    //  CHROME MESSAGE HANDLING
    //  We receive messages of many types
    //  Determine what type it is, then do something
    onMessage((message) => {
      console.debug('received message - ', message);
      switch (message) {
        case ChromeMessages.STATE_REQUEST_MESSAGE:
          sendMessage(this.video.getState());
          break;

        case ChromeMessages.POPUP_OPEN_EVENT:
          if (this.video) {
            this.video.addHighlight();
          } else {
            console.debug('Not connected to video yet, popup open event');
          }
          break;

        case ChromeMessages.POPUP_CLOSE_EVENT:
          if (this.video) {
            this.video.removeHighlight();
          } else {
            console.debug('Not connected to video yet, popup close event');
          }
          break;

        case ChromeMessages.FIND_NEW_VIDEO_COMMAND:
          const videos = dom.querySelectorAll('video');
          if (videos.length !== 1) {
            console.debug('found ' + videos.length + ' videos, exiting');
            sendMessage('NOT_EXACTLY_ONE_VIDEO');
          } else {
            console.debug('found ' + videos.length + ' videos, continuing');
            sendMessage('FOUND_VIDEO');
            connectToVideo(videos[0]);
          }
          break;

        // If it's not one of our events, then it
        // should be an object describing the state
        default:
          console.debug('Content script received: ', message);
          if (message.is_playing) {
            this.video.play(message.time);
          } else {
            this.video.pause(message.time);
          }
      }
    });
  }
}

export default PageWatcher;
