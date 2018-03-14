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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
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

/***/ 6:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Constants = __webpack_require__(0);

var backgroundWindow = void 0; /**
                                * Browser Action
                                * - Has a visible html element.
                                * - Runs everytime the popup is opened.
                                * - Has access to the Background Page and its functions.
                                */

var videoHistory = void 0;
var sendMessageToContentScript = void 0;

var populateHistory = function populateHistory() {
  var historyPageElement = document.getElementById('history-list');

  videoHistory.queue.forEach(function (historyEntry) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(historyEntry));
    historyPageElement.appendChild(li);
  });
};

function test() {
  console.log('yes you hit the test fxn');
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('browserAction script is live');

  backgroundWindow = chrome.extension.getBackgroundPage();
  console.log(backgroundWindow);

  videoHistory = backgroundWindow.videoHistory;
  sendMessageToContentScript = backgroundWindow.sendMessageToContentScript;

  sendMessageToContentScript(_Constants.ChromeMessages.POPUP_OPEN_EVENT);

  addEventListener('unload', function () {
    sendMessageToContentScript(_Constants.ChromeMessages.POPUP_CLOSE_EVENT);
  }, true);

  document.querySelector("#connect-btn").addEventListener("click", function () {
    console.log('sending connect message');
    sendMessageToContentScript(_Constants.ChromeMessages.FIND_NEW_VIDEO_COMMAND);
  });

  populateHistory();
});

/***/ })

/******/ });