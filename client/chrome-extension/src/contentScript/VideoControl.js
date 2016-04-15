/**
 * Created by aaron on 4/13/16.
 */
import $ from 'jquery';
import funcLog from '../util/funcLog';
import VideoState from '../models/VideoState';

class SimpleVideoControl {
  constructor(onVideoEventListener) {
    funcLog();
    this.setListener(onVideoEventListener);
    this.initVideo();
  }

  initVideo() {
    this._videoElements = $('video');
    this._video = this._videoElements[this._currentVideo];
    if (this._video) {
      this.addListeners();
    }
    this._currentVideo = 0;
  }

  selectNextVideoElement() {
    if (!this._videoElements || this._videoElements.length < 2) {
      funcLog('No other elements to select.');
      return;
    }
    if (this._currentVideo >= this._videoElements.length) {
      this._currentVideo = 0;
    } else {
      this._currentVideo++;
    }
    this.setVideoElement(this._videoElements[this._currentVideo]);
  }

  setVideoElement(newSelectedVideo) {
    if (this._video) {
      this.removeHighlight();
      this.removeListener();
    }

    this._video = newSelectedVideo;

    if (this._video) {
      this.addHighlight();
      this.addListeners();
    }
  }

  addHighlight(jSelector) {
    const addTo = jSelector ? jSelector : this._video;
    $(addTo).addClass('wwmVideo');
  }

  removeHighlight(jSelector) {
    const removeFrom = jSelector ? jSelector : this._video;
    $(removeFrom).removeClass('wwmVideo');
  }

  setListener(listenerFunction) {
    this._listener = listenerFunction;
    return this;
  }

  addListeners() {
    funcLog();
    if (this._video) {
      $(this._video).on('play pause seeking', this._listener);
    }
  }

  removeListeners() {
    funcLog();
    if (this._video) {
      $(this._video).off('play pause seeking', this._listener);
    }
  }

  play(time) {
    funcLog();
    if (this._video && time) {
      this._video.play();
      this._video.currentTime = time;
    }
  }

  pause(time) {
    funcLog();
    if (this._video && time) {
      this._video.pause();
      this._video.currentTime = time;
    }
  }

  getCurrentState() {
    return new VideoState(!this._video.paused, this._video.currentTime);
  }
}

export default SimpleVideoControl;
