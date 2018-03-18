/* global chrome, document */

import React from 'react';
import ReactDOM from 'react-dom';

import PopupContent from './PopupContent';

import './browserAction.scss';

document.addEventListener('DOMContentLoaded', () => {
  const { state: initialState, onStateChange, browserActionActions: actions } = chrome.extension.getBackgroundPage();

  const mountApp = (state) => {
    ReactDOM.render(<PopupContent {...state.toObject()} {...actions} />, document.getElementById('app-mount'));
  };
  mountApp(initialState);
  onStateChange((state) => mountApp(state));

  console.log('browserAction script is live');
});
