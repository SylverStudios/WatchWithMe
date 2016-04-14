import numeral from 'numeral';

import funcLog from '../util/funcLog';

const TIME_SEEK_EPSILON = 0.1; // min time difference in room states to be considered a seek

class VideoHistory {
  constructor() {
    this._queue = [];
  }
  get queue() {
    return this._queue;
  }

  add(roomState) {
    const { isPlaying, wasPlaying, time, prevTime, definedBy } = roomState;
    let historySegment;
    // TODO numeral string to handle videos longer than an hour
    const timeString = numeral(time).format('00:00');
    const isASeek = Math.abs(time - prevTime) > TIME_SEEK_EPSILON;
    if (isPlaying && !wasPlaying) {
      if (isASeek) {
        historySegment = definedBy + ' played and seeked to ' + timeString;
      } else {
        historySegment = definedBy + ' played at ' + timeString;
      }
    } else if (!isPlaying && wasPlaying) {
      historySegment = definedBy + ' paused at ' + timeString;
    } else if (isPlaying === wasPlaying && isASeek) {
      historySegment = definedBy + ' seeked to ' + timeString;
    }
    if (historySegment) {
      this.queue.push(historySegment);
    }

    this.trim();
    funcLog('Added history item:', historySegment);
  }

  trim() {
    if (this.queue.length > 10) {
      this.queue.shift();
    }
  }
}

export default VideoHistory;
