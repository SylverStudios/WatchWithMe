import $ from 'jquery';
import funcLog from '../util/funcLog';

class VideoControl {
  constructor() {
    funcLog();
    this.initVideo();
  }

  initVideo() {
    this._videoElements = $('video');
    this._video = this._videoElements[this._currentVideo];
    if (this._video) {
      this.addVideoListeners();
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
      this.removeVideoListeners();
    }

    this._video = newSelectedVideo;

    if (this._video) {
      this.addHighlight();
      this.addVideoListeners();
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

  setOnVideoPlay(onVideoPlay) {
    this._onVideoPlay = onVideoPlay;
    return this;
  }
  setOnVideoPause(onVideoPause) {
    this._onVideoPause = onVideoPause;
    return this;
  }
  setOnVideoSeek(onVideoSeek) {
    this._onVideoSeek = onVideoSeek;
    return this;
  }

  addPlayListener() {
    funcLog();
    if (this._video) $(this._video).on('play', this._onVideoPlay);
  }
  removePlayListener() {
    funcLog();
    if (this._video) $(this._video).off('play', this._onVideoPlay);
  }
  addPauseListener() {
    funcLog();
    if (this._video) $(this._video).on('pause', this._onVideoPause);
  }
  removePauseListener() {
    funcLog();
    if (this._video) $(this._video).off('pause', this._onVideoPause);
  }
  addSeekListener() {
    funcLog();
    if (this._video) $(this._video).on('seeking', this._onVideoSeek);
  }
  removeSeekListener() {
    funcLog();
    if (this._video) $(this._video).off('seeking', this._onVideoSeek);
  }

  addVideoListeners() {
    funcLog();
    if (this._video) {
      this.addPlayListener();
      this.addPauseListener();
      this.addSeekListener();
    }
  }

  removeVideoListeners() {
    funcLog();
    if (this._video) {
      this.removePlayListener();
      this.removePauseListener();
      this.removeSeekListener();
    }
  }

  play() {
    funcLog();
    if (this._video) {
      this.removePlayListener();
      $(this._video).one('play', () => {
        this.addPlayListener();
      });
      this._video.play();
    }
  }

  pause() {
    funcLog();
    if (this._video) {
      this.removePauseListener();
      $(this._video).one('pause', () => {
        this.addPauseListener();
      });
      this._video.pause();
    }
  }

  skipTo(timeSeconds) {
    funcLog('Time is:', timeSeconds);
    if (this._video) {
      this.removeSeekListener();
      $(this._video).one('seeking', () => {
        this.addSeekListener();
      });
      this._video.currentTime = timeSeconds;
    }
  }
}

export default VideoControl;
