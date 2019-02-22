import { Socket } from 'phoenix';

// until we have multi-room, this is just the one room we have
const ROOM = 'room:lobby';

class Client {
  constructor(address, username) {
    console.debug('construct client');
    this.username = username;

    this.socket = new Socket(address, {
      reconnectAfterMs: () => 500,
    });
  }
  connect(onSuccess, onError) {
    console.debug('connect');
    if (this.connected) {
      return onSuccess();
    }
    this.socket.onError(onError);
    this.socket.connect();
    this.channel = this.socket.channel(ROOM, {
      username: this.username,
    });
    this.channel.join()
      .receive('ok', () => console.debug(`connected client for user ${this.username}, now awaiting first state_change before declaring success`))
      .receive('error', onError);
    let gotAnyStateChange = false;
    this.channel.on('state_change', (state) => {
      console.debug(`client state_change for user '${this.username}': `, state);
      if (!gotAnyStateChange) {
        onSuccess();
        gotAnyStateChange = true;
      }
      // detect user join events
      const prevGroupSize = this.prevState ? this.prevState.group_size : 0;
      if (prevGroupSize < state.group_size) {
        if (this.onUserJoinCallback) {
          this.onUserJoinCallback(state.group_size);
        }
      }
      // detect play events
      if (state.last_action.type === 'play') {
        if (this.onPlayCallback) {
          this.onPlayCallback({
            videoTime: state.last_action.video_time,
            worldTime: state.last_action.world_time,
          });
        }
      }
      // detect pause events
      if (state.last_action.type === 'pause') {
        if (this.onPauseCallback) {
          this.onPauseCallback({
            videoTime: state.last_action.video_time,
            worldTime: state.last_action.world_time,
          });
        }
      }
      this.prevState = state;
    });
  }
  get connected() {
    return this.socket.isConnected();
  }
  async connectSync() {
    await new Promise((resolve) => {
      const onError = (event) => {
        throw new Error(`Could not connect: ${event}`);
      };
      this.connect(resolve, onError);
    });
  }
  disconnect(onSuccess) {
    if (!this.channel) {
      console.warn('tried to disconnect with no channel');
      onSuccess();
      return;
    }
    this.channel.leave().receive('ok', () => {
      this.socket.disconnect(() => {
        onSuccess();
      });
    });
  }
  async disconnectSync() {
    await new Promise(resolve => this.disconnect(resolve));
  }
  resetCallbacks() {
    this.onUserJoin();
    this.onPlay();
    this.onPause();
  }
  onUserJoin(callback) {
    this.onUserJoinCallback = callback;
  }
  play(videoTime) {
    this.channel.push('action', {
      type: 'play',
      video_time: videoTime,
      world_time: Date.now(),
    });
  }
  onPlay(callback) {
    this.onPlayCallback = callback;
  }
  pause(videoTime) {
    this.channel.push('action', {
      type: 'pause',
      video_time: videoTime,
      world_time: Date.now(),
    });
  }
  onPause(callback) {
    this.onPauseCallback = callback;
  }
}

export default Client;
