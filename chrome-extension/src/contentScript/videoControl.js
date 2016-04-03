import $ from 'jquery';
import funcLog from '../util/funcLog';

const videoControl = {
  videoElements: undefined,
  video: undefined,
  currentVideo: 0,
  actionEvents: 'play pause seeking',
  passiveEvents: 'timeupdate',

  init: function () {
    console.log('[videoControl init]');
    this.videoElements = $('video');
    this.video = this.videoElements[this.currentVideo];
    if (this.video) {
      this.addVideoListeners();
    }
  },

  selectNextVideoElement: function selectNextVideoElement() {
    if (!this.videoElements || this.videoElements.length < 2) {
      funcLog('No other elements to select.');
      return;
    }
    if (this.currentVideo >= this.videoElements.length) {
      this.currentVideo = 0;
    } else {
      this.currentVideo++;
    }
    this.setVideoElement(this.videoElements[this.currentVideo]);
  },

  setVideoElement: function (newSelectedVideo) {
    if (this.video) {
      this.removeHighlight();
      this.removeVideoListeners();
    }

    this.video = newSelectedVideo;

    if (this.video) {
      this.addHighlight();
      this.addVideoListeners();
    }
  },

  addHighlight: function (jSelector) {
    const addTo = jSelector ? jSelector : this.video;
    $(addTo).addClass('wwmVideo');
  },

  removeHighlight: function (jSelector) {
    const removeFrom = jSelector ? jSelector : this.video;
    $(removeFrom).removeClass('wwmVideo');
  },

  addPlayListener: function addPlayListener() {
    funcLog();
    if (this.video) $(this.video).on('play', this.onVideoPlay);
  },
  removePlayListener: function removePlayListener() {
    funcLog();
    if (this.video) $(this.video).off('play', this.onVideoPlay);
  },
  addPauseListener: function addPauseListener() {
    funcLog();
    if (this.video) $(this.video).on('pause', this.onVideoPause);
  },
  removePauseListener: function removePauseListener() {
    funcLog();
    if (this.video) $(this.video).off('pause', this.onVideoPause);
  },
  addSeekListener: function addSeekListener() {
    funcLog();
    if (this.video) $(this.video).on('seeking', this.onVideoSeek);
  },
  removeSeekListener: function removeSeekListener() {
    funcLog();
    if (this.video) $(this.video).off('seeking', this.onVideoSeek);
  },

  addVideoListeners: function addVideoListeners() {
    funcLog();
    if (this.video) {
      this.addPlayListener();
      this.addPauseListener();
      this.addSeekListener();
    }
  },

  removeVideoListeners: function removeVideoListeners() {
    funcLog();
    if (this.video) {
      this.removePlayListener();
      this.removePauseListener();
      this.removeSeekListener();
    }
  },

  play: function play() {
    funcLog();
    const self = this;
    if (this.video) {
      this.removePlayListener();
      $(this.video).one('play', function () {
        self.addPlayListener();
      });
      this.video.play();
    }
  },

  pause: function pause() {
    funcLog();
    const self = this;
    if (this.video) {
      this.removePauseListener();
      $(this.video).one('pause', function () {
        self.addPauseListener();
      });
      this.video.pause();
    }
  },

  skipTo: function skipTo(timeSeconds) {
    funcLog('Time is:', timeSeconds);
    const self = this;
    if (this.video) {
      this.removeSeekListener();
      $(this.video).one('seeking', function () {
        self.addSeekListener();
      });
      this.video.currentTime = timeSeconds;
    }
  },
};

export default videoControl;
