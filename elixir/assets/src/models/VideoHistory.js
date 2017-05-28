"use strict"

import numeral from 'numeral';
import { TIME_SEEK_EPSILON } from './Constants';

class VideoHistory {
  constructor() {
    this._queue = [];
  }
  get queue() {
    return this._queue;
  }

  // Expects state in the form
  // { is_playing, time, last_action: { initiator, video_time, world_time, type } }
  add(state) {
    const videoTime = numeral(state.time).format('00:00');
    let historyEntry = state.last_action.initiator;

    if (state.is_playing) {
      historyEntry += ' played at ';
    } else {
      historyEntry += ' paused at ';
    }
    historyEntry += videoTime;

    this._queue.push(historyEntry);
    this.trim();
  }

  addMessage(message) {
    this._queue.push(message);
    this.trim();
  }

  trim() {
    if (this._queue.length > 10) {
      this._queue.shift();
    }
  }
}


export default VideoHistory;
