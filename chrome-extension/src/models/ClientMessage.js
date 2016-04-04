class ClientMessage {
  constructor(isPlaying, time, username) {
    this._isPlaying = isPlaying;
    this._time = time;
    this._username = username;
  }
  get isPlaying() {
    return this._isPlaying;
  }
  get time() {
    return this._time;
  }
  get username() {
    return this._username;
  }
  toJSON() {
    return {
      isPlaying: this._isPlaying,
      time: this._time,
      username: this._username,
    };
  }
}

export default ClientMessage;
