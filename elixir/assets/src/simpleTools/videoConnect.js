"use strict"

// find the video
// return a wrapper?
// listen on events, but also be able to send play/pause(time)
// 


/**
 * Exports a function to connect to the first video element
 * Once connected, it adds the style class 'wwmVideo'
 * Adds a listener on [play, pause, seeking] to log event
 * 
 * Wrapper has these methods
 *  - play(time)
 *  - pause(time)
 *  - getState() - returns { playing: boolean, time: time }
 */

const video = document.querySelector("video");

class VideoWrapper {
  constructor(video) {
    this.video = video;
    this.video.classList.add('wwmVideo');

    this.video.addEventListener("play", (event) => {
      console.log("play event");
      console.log(event);
    });

    this.listeners = {};
  }

  /**
   * Play is an async command so you need to add the listener
   * after it resolves
   */
  play(time) {
    const listener = this.listeners["play"];

    this.video.removeEventListener("play", listener);
    (time) ? this.video.currentTime = time : console.debug("didn't send time, must be local");
    this.video.play().then(() => {
      this.video.addEventListener("play", listener);
    });
  }

  /**
   * Pause is sync so you can add the listener immediately
   * 
   * Doing a shitty thing.
   * Somehow the pause event is still catchable by the time I want to
   * add the listener again, so I'm going to catch the first event,
   * destroy it, then add the handler I actually want.
   */
  pause(time) {
    const listener = this.listeners["pause"];

    this.video.removeEventListener("pause", listener);
    this.video.pause();
    (time) ? this.video.currentTime = time : console.debug("didn't send time, must be local");
    const ignoreNext = (event) => {
      this.video.addEventListener("pause", listener, false);
    }

    this.video.addEventListener("pause", ignoreNext, { capture: false, once: true});
  }

  getState() {
    return { playing: !this.video.paused, time: this.video.currentTime };
  }

  get time() {
    return this.video.currentTime;
  }

  on(event, fxn) {
    this.video.addEventListener(event, fxn);
    this.listeners[event] = fxn;
  }

  removeListener(event) {
    this.video.removeEventListener(event, this.listeners[event]);
    this.listeners[event] = undefined;
  }
}

export default new VideoWrapper(video);
