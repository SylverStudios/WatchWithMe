import _ from 'underscore';
import RoomState from '../models/RoomState';
import funcLog from '../util/funcLog';

import { STATE_REQUEST_MESSAGE } from '../util/constants';

// const serverIp = '52.38.66.94';
const serverIp = '127.0.0.1';

class WebsocketClient {
  isConnected() {
    return this._websocket && this._websocket.readyState === this._websocket.OPEN;
  }
  onOpenHandler(self) {
    funcLog('self._onOpenCallback: ', self._onOpenCallback);
    if (_.isFunction(self._onOpenCallback)) self._onOpenCallback();
  }
  onMessageHandler(self, websocketMessage) {
    const message = websocketMessage.data;
    funcLog('Message is:', message);
    if (message === STATE_REQUEST_MESSAGE) {
      if (_.isFunction(self._onStateRequestCallback)) self._onStateRequestCallback();
    } else {
      const roomState = RoomState.fromJSON(JSON.parse(message));
      if (roomState instanceof RoomState) {
        if (_.isFunction(self._onStateUpdateCallback)) self._onStateUpdateCallback(roomState);
      } else {
        funcLog('Do not know how to handle message');
      }
    }
  }
  onCloseHandler(self) {
    if (_.isFunction(self._onCloseCallback)) self._onCloseCallback();
  }
  connect() {
    funcLog();
    if (this.isConnected()) {
      this._websocket.close();
    }
    this._websocket = new WebSocket('ws://' + serverIp + ':8080/ws');
    this._websocket.onmessage = _.partial(this.onMessageHandler, this);
    this._websocket.onopen = _.partial(this.onOpenHandler, this);
    this._websocket.onclose = _.partial(this.onCloseHandler, this);
  }
  send(message) {
    funcLog('Message is:', message);
    if (this._websocket) {
      this._websocket.send(JSON.stringify(message));
    } else {
      funcLog('Websock isn\'t open.');
    }
  }

  onOpen(callback) {
    this._onOpenCallback = callback;
    return this;
  }
  onStateRequest(callback) {
    this._onStateRequestCallback = callback;
    return this;
  }
  onStateUpdate(callback) {
    this._onStateUpdateCallback = callback;
    return this;
  }
  onClose(callback) {
    this._onCloseCallback = callback;
    return this;
  }
}

export default WebsocketClient;
