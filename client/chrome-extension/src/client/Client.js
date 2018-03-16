import { Socket } from 'phoenix';

// until we have multi-room, this is just the one room we have
const ROOM = 'room:lobby';

class Client {
  constructor(address, username) {
    console.log('construct client');
    this.username = username;

    this.socket = new Socket(address, {
      reconnectAfterMs: () => -1, // do not attempt to reconnect
    });
  }
  connect(onSuccess, onError) {
    console.log('connect');
    this.socket.onError(onError);
    this.socket.connect();
    this.channel = this.socket.channel(ROOM, {
      username: this.username,
    });
    this.channel.join()
      .receive('ok', onSuccess)
      .receive('error', onError);
  }
}

export default Client;
