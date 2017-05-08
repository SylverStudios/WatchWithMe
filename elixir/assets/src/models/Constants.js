
const TIME_SEEK_EPSILON = 0.1;
const SERVER_ADDRESS = 'localhost:4000';

const ChromeMessages = {
  STATE_REQUEST_MESSAGE:  'VIDEO_STATE_REQUEST',
  POPUP_OPEN_EVENT:       'POPUP_OPEN_EVENT',
  POPUP_CLOSE_EVENT:      'POPUP_CLOSE_EVENT',
  CONNECT_COMMAND:        'CONNECT_COMMAND',
  FIND_NEW_VIDEO_COMMAND: 'FIND_NEW_VIDEO_COMMAND'
}

const ServerMessages = {
  none: undefined
}

export { ChromeMessages, ServerMessages, TIME_SEEK_EPSILON, SERVER_ADDRESS };
