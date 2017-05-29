"use strict"

/**
 * Exports an object with two functions
 *  - play
 *  - pause
 * 
 * They each take the video time and the initiator
 * They return an object suitable to send to the server
 * 
 */
const clientEvent = function(type, video_time, initiator) {
  return {
      type: type,
      video_time: video_time,
      world_time: Date.now(),
      initiator: initiator
    };
}
const actions = {
  play: function(video_time, initiator) {
    return clientEvent("PLAY", video_time, initiator);
  },

  pause: function(video_time, initiator) {
    return clientEvent("PAUSE", video_time, initiator);
  }
}

export default actions;
