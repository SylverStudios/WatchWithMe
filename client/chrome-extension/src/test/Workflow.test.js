/* eslint-disable no-unused-expressions one-var no-new */

import React from 'react';
import { JSDOM } from 'jsdom';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import AppController from '../background/AppController';
import PopupContent from '../browserAction/PopupContent';
import PageWatcher from '../contentScript/PageWatcher';
import MockClient from '../client/MockClient';

configure({ adapter: new Adapter() });

describe('The Entire App', () => {
  it('can be initialized in a test environment', () => {
    const client = new MockClient();

    let onMessageToAppController = () => {};
    let onMessageToPageWatcher = () => {};
    new AppController({
      client,
      sendMessage: (message) => onMessageToPageWatcher(message),
      onMessage: (callback) => { onMessageToAppController = callback; },
    });
    new PageWatcher({
      dom: new JSDOM('<!DOCTYPE html><p>Hello world</p>').window.document,
      sendMessage: (message) => onMessageToAppController(message),
      onMessage: (callback) => { onMessageToPageWatcher = callback; },
    });

    // enzyme needs globally available document to attach mounted react components to.
    // JSDOM allows us to avoid this document colliding with the document provided to PageWatcher.
    global.document = new JSDOM().window.document;
    mount(<PopupContent />);
  });
});
