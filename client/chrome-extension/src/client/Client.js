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
    this.socket.onError(onError);
    this.socket.connect();
    this.channel = this.socket.channel(ROOM, {
      username: this.username,
    });
    this.channel.join()
      .receive('ok', onSuccess)
      .receive('error', onError);
    this.channel.on('state_change', (state) => {
      // detect user join events
      const prevGroupSize = this.prevState ? this.prevState.group_size : 0;
      if (prevGroupSize < state.group_size) {
        if (this.onUserJoinCallback) {
          this.onUserJoinCallback(state.group_size);
        }
      }
      this.prevState = state;
    });
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
    this.channel.leave().receive('ok', () => {
      this.socket.disconnect(() => {
        onSuccess();
      });
    });
  }
  async disconnectSync() {
    await new Promise(resolve => this.disconnect(resolve));
  }
  onUserJoin(callback) {
    this.onUserJoinCallback = callback;
  }
}

export default Client;
