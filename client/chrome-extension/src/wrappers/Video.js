/**
 * Exports a class
 * Constructor takes a video element, or if none is passed
 * will attatch to the first video element on the page
 *
 */

class Video {
  constructor(video) {
    this.video = video;
    this.listeners = {};
  }

  addHighlight() {
    this.video.classList.add('wwmVideo');
  }

  removeHighlight() {
    this.video.classList.remove('wwmVideo');
  }

  /**
   * Play is an async command so you need to add the listener
   * after it resolves
   */
  play(time) {
    const listener = this.listeners.play;

    this.video.removeEventListener('play', listener);
    if (time) {
      this.video.currentTime = time;
    }
    this.video.play().then(() => {
      this.video.addEventListener('play', listener);
    });
  }

  /**
   * Pause is sync so you can add the listener immediately
   *
   * Can't find a cleaner solution
   *
   * Pause doesn't return a promise, but the event is still bubbling
   * after the pause line, re-attaching the listener catches the current
   * pause event.
   * Solution:
   *  Add a handler that catches the current event, and binds our correct
   *  handler.
   */
  pause(time) {
    const listener = this.listeners.pause;

    this.video.removeEventListener('pause', listener);

    if (time) {
      this.video.currentTime = time;
    }

    new Promise((resolve, reject) => { this.video.pause(); resolve(); })
      .then(() => {
        this.video.addEventListener('pause', listener, { capture: false });
      });
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

export default Video;
