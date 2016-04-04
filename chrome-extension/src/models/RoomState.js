// SYNC WITH RoomState.java

import _ from 'underscore';

class RoomState {
  constructor(isPlaying, wasPlaying, time, partySize, definedBy) {
    this._isPlaying = isPlaying;
    this._wasPlaying = wasPlaying;
    this._time = time;
    this._partySize = partySize;
    this._definedBy = definedBy;
  }
  get isPlaying() {
    return this._isPlaying;
  }
  get wasPlaying() {
    return this._wasPlaying;
  }
  get time() {
    return this._time;
  }
  get partySize() {
    return this._partySize;
  }
  get definedBy() {
    return this._definedBy;
  }

  toJSON() {
    return {
      isPlaying: this._isPlaying,
      wasPlaying: this._wasPlaying,
      time: this._time,
      partySize: this._partySize,
      definedBy: this._definedBy,
    };
  }

  static fromJSON(obj) {
    const { isPlaying, wasPlaying, time, partySize, definedBy } = obj;
    if (
      _.isBoolean(isPlaying) &&
      _.isBoolean(wasPlaying) &&
      _.isNumber(time) &&
      _.isNumber(partySize) &&
      _.isString(definedBy)
    ) {
      return new RoomState(isPlaying, wasPlaying, time, partySize, definedBy);
    }
  }
}

export default RoomState;
