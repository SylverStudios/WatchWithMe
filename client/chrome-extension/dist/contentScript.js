/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var TIME_SEEK_EPSILON = 0.1;
var SERVER_ADDRESS = 'localhost:4000';

var ChromeMessages = {
  STATE_REQUEST_MESSAGE: 'VIDEO_STATE_REQUEST',
  POPUP_OPEN_EVENT: 'POPUP_OPEN_EVENT',
  POPUP_CLOSE_EVENT: 'POPUP_CLOSE_EVENT',
  CONNECT_COMMAND: 'CONNECT_COMMAND',
  FIND_NEW_VIDEO_COMMAND: 'FIND_NEW_VIDEO_COMMAND'
};

var ServerMessages = {
  none: undefined
};

exports.ChromeMessages = ChromeMessages;
exports.ServerMessages = ServerMessages;
exports.TIME_SEEK_EPSILON = TIME_SEEK_EPSILON;
exports.SERVER_ADDRESS = SERVER_ADDRESS;

/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Exports an object with two functions
 *  - play
 *  - pause
 * 
 * They each take the video time and the initiator
 * They return an object suitable to send to the server
 * 
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
var clientEvent = function clientEvent(type, video_time, initiator) {
  return {
    type: type,
    video_time: video_time,
    world_time: Date.now(),
    initiator: initiator
  };
};
var actions = {
  play: function play(video_time, initiator) {
    return clientEvent("PLAY", video_time, initiator);
  },

  pause: function pause(video_time, initiator) {
    return clientEvent("PAUSE", video_time, initiator);
  }
};

exports.default = actions;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Exports a class
 * Constructor takes a video element, or if none is passed
 * will attatch to the first video element on the page
 * 
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Video = function () {
  function Video(video) {
    _classCallCheck(this, Video);

    this.video = video ? video : document.querySelector("video");
    this.listeners = {};
  }

  _createClass(Video, [{
    key: "addHighlight",
    value: function addHighlight() {
      this.video.classList.add('wwmVideo');
    }
  }, {
    key: "removeHighlight",
    value: function removeHighlight() {
      this.video.classList.remove('wwmVideo');
    }

    /**
     * Play is an async command so you need to add the listener
     * after it resolves
     */

  }, {
    key: "play",
    value: function play(time) {
      var _this = this;

      var listener = this.listeners["play"];

      this.video.removeEventListener("play", listener);
      if (time) {
        this.video.currentTime = time;
      };
      this.video.play().then(function () {
        _this.video.addEventListener("play", listener);
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

  }, {
    key: "pause",
    value: function pause(time) {
      var _this2 = this;

      var listener = this.listeners["pause"];

      this.video.removeEventListener("pause", listener);
      this.video.pause();
      if (time) {
        this.video.currentTime = time;
      };
      var ignoreNext = function ignoreNext(event) {
        _this2.video.addEventListener("pause", listener, false);
      };

      this.video.addEventListener("pause", ignoreNext, { capture: false, once: true });
    }
  }, {
    key: "getState",
    value: function getState() {
      return { playing: !this.video.paused, time: this.video.currentTime };
    }
  }, {
    key: "on",
    value: function on(event, fxn) {
      this.video.addEventListener(event, fxn);
      this.listeners[event] = fxn;
    }
  }, {
    key: "removeListener",
    value: function removeListener(event) {
      this.video.removeEventListener(event, this.listeners[event]);
      this.listeners[event] = undefined;
    }
  }, {
    key: "time",
    get: function get() {
      return this.video.currentTime;
    }
  }]);

  return Video;
}();

exports.default = Video;

/***/ }),
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Video = __webpack_require__(3);

var _Video2 = _interopRequireDefault(_Video);

var _actions = __webpack_require__(2);

var _actions2 = _interopRequireDefault(_actions);

var _Constants = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var video = void 0;

//  VIDEO EVENT HANDLING
//  Listen to on video event, send the message to the background script
/**
 * 
 * Content scripts:
 * - Run in an "Isolated world."
 * - Can't access or be accessed by other scripts.
 * - Must communicate using the Chrome Window Messaging APIs.
 * - Content scripts can access the current tab's DOM.
 * 
 * 
 * Responsible
 * Find a video and start watching it.
 * Connect to the chrome runtime for messages
 * 
 * On events from chrome, do something
 * On events from the video, do something. 
 */

var handlePlay = function handlePlay(event) {
  console.log('Caught a play');
  chrome.runtime.sendMessage(_actions2.default.play(video.time, undefined));
};

var handlePause = function handlePause(event) {
  console.log('Caught a pause');
  chrome.runtime.sendMessage(_actions2.default.pause(video.time, undefined));
};

//  CHROME MESSAGE HANDLING
//  We receive messages of many types
//  Determine what type it is, then do something
var handleChromeMessage = function handleChromeMessage(message) {
  console.log("received message - ", message);
  switch (message) {
    case _Constants.ChromeMessages.STATE_REQUEST_MESSAGE:
      chrome.runtime.sendMessage(video.getState());
      break;

    case _Constants.ChromeMessages.POPUP_OPEN_EVENT:
      if (video) {
        video.addHighlight();
      } else {
        console.log("Not connected to video yet, popup open event");
      }
      break;

    case _Constants.ChromeMessages.POPUP_CLOSE_EVENT:
      if (video) {
        video.removeHighlight();
      } else {
        console.log("Not connected to video yet, popup close event");
      }
      break;

    case _Constants.ChromeMessages.FIND_NEW_VIDEO_COMMAND:
      connectToVideo();
      break;

    // If it's not one of our events, then it
    // should be an object describing the state
    default:
      console.log("Content script received: ", message);
      if (message.is_playing) {
        video.play(message.time);
      } else {
        video.pause(message.time);
      }
  }
};

var connectToVideo = function connectToVideo() {
  console.log('Connecting to video');
  video = new _Video2.default();
  video.addHighlight();
  video.on("play", handlePlay);
  video.on("pause", handlePause);
};

// Add highlight style to DOM
var addWwmVideoStyle = function addWwmVideoStyle() {
  var css = '.wwmVideo { border: 2px solid #35D418; border-radius: 20px; }';
  var styleTag = document.createElement('style');
  styleTag.type = 'text/css';

  if (styleTag.styleSheet) {
    styleTag.styleSheet.cssText = css;
  } else {
    styleTag.appendChild(document.createTextNode(css));
  }
  document.querySelector("head").appendChild(styleTag);
};

// Start stuff
addWwmVideoStyle();
console.log('content script loaded');

chrome.runtime.connect();
chrome.runtime.onMessage.addListener(function (message) {
  handleChromeMessage(message);
});

/***/ })
/******/ ]);