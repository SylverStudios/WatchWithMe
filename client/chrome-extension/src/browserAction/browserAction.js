/**
 * Browser Action
 * - Has a visible html element.
 * - Runs everytime the popup is opened.
 * - Has access to the Background Page and its functions.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import PopupContent from './PopupContent';

import './browserAction.scss';

document.addEventListener('DOMContentLoaded', function () {
  const { state: initialState, onStateChange, browserActionActions: actions } = chrome.extension.getBackgroundPage();

  const mountApp = (state) => {
    const { connected, pageIsInvalid, couldNotConnect } = state;
    const { attemptConnect } = actions;
    const popupContent = (
      <PopupContent
        {...{ connected, pageIsInvalid, couldNotConnect, onConnectClick: attemptConnect }}
      />
    );
    ReactDOM.render(popupContent, document.getElementById('app-mount'));
  };
  mountApp(initialState);
  onStateChange((state) => mountApp(state));

  console.log('browserAction script is live');
});
