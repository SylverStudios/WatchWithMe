/**
 * Browser Action
 * - Has a visible html element.
 * - Runs everytime the popup is opened.
 * - Has access to the Background Page and its functions.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import './browserAction/browserAction.scss';

import { ChromeMessages } from './models/Constants';

let backgroundWindow;
let videoHistory;
let sendMessageToContentScript;

const populateHistory = function () {
  const historyPageElement = document.getElementById('history-list');

  videoHistory.queue.forEach((historyEntry) => {
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(historyEntry));
    historyPageElement.appendChild(li);
  });
};

function test() {
  console.log('yes you hit the test fxn');
}

document.addEventListener('DOMContentLoaded', function () {
  const pageHtml = (
    <div id="popup-body panel-group">

      <div id="action-panel" className="panel panel-primary">

        <div id="app-title" className="panel-heading">
          <h3 className="panel-title">Watch With Me</h3>
        </div>

        <div className="panel-body">

          <span id="group"></span> <br />
          <span id="connection-status"></span>

          <div className="btn-toolbar" role="toolbar">

            <div id="app-buttons" className="btn-group" role="group">

              <button id="connect-btn" type="button" className="btn btn-success btn-sm">Connect</button>

            </div>

          </div>
        </div>

      </div>

      <div id="history-panel" className="panel panel-default">

        <div id="history-title" className="panel-heading">
          <h4 className="panel-title">History</h4>
        </div>

        <div className="history panel-body">
          <ol id="history-list">
          </ol>
        </div>

      </div>


    </div>
  );
  ReactDOM.render(pageHtml, document.getElementById('app-mount'));

  console.log('browserAction script is live');

  backgroundWindow = chrome.extension.getBackgroundPage();
  console.log(backgroundWindow);

  videoHistory = backgroundWindow.videoHistory;
  sendMessageToContentScript = backgroundWindow.sendMessageToContentScript;

  sendMessageToContentScript(ChromeMessages.POPUP_OPEN_EVENT);

  addEventListener('unload',() => {
    sendMessageToContentScript(ChromeMessages.POPUP_CLOSE_EVENT);
  }, true);


  document.querySelector("#connect-btn").addEventListener("click", () => {
    console.log('sending connect message');
    sendMessageToContentScript(ChromeMessages.FIND_NEW_VIDEO_COMMAND);
  });

  populateHistory();
});
