import _ from 'underscore';

class VideoState {
  constructor(isPlaying, time) {
    this._isPlaying = isPlaying;
    this._time = time;
  }
  get isPlaying() {
    return this._isPlaying;
  }
  get time() {
    return this._time;
  }
  toJSON() {
    return {
      isPlaying: this._isPlaying,
      time: this._time,
    };
  }
  static fromJSON(obj) {
    const { isPlaying, time } = obj;
    if (_.isBoolean(isPlaying) && _.isNumber(time)) {
      return new VideoState(isPlaying, time);
    }
  }
}

export default VideoState;
