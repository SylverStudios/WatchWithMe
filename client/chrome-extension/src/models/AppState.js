import { Record, List } from 'immutable';

const AppState = new Record({
  connected: false,
  connecting: false,
  pageIsInvalid: false,
  couldNotConnect: false,
  channelHistory: List(),
});

export default AppState;
