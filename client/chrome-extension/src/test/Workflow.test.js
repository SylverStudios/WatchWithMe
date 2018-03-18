/* eslint-disable no-unused-expressions one-var no-new, one-var-declaration-per-line */

import React from 'react';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import AppController from '../background/AppController';
import PopupContent, {
  notExactlyOneVideoMsg, connectingMsg, connectedMsg,
} from '../browserAction/PopupContent';
import PageWatcher from '../contentScript/PageWatcher';
import MockClient from '../client/MockClient';

configure({ adapter: new Adapter() });

const initializeTestEnvironment = (pageHtml) => {
  const client = new MockClient();

  let onMessageToAppController = () => {};
  let onMessageToPageWatcher = () => {};
  const appController = new AppController({
    client,
    sendMessage: (message) => onMessageToPageWatcher(message),
    onMessage: (callback) => { onMessageToAppController = callback; },
  });
  const pageWatcher = new PageWatcher({
    dom: new JSDOM(pageHtml).window.document,
    sendMessage: (message) => onMessageToAppController(message),
    onMessage: (callback) => { onMessageToPageWatcher = callback; },
  });

  // enzyme needs globally available document to attach mounted react components to.
  // JSDOM allows us to avoid this document colliding with the document provided to PageWatcher.
  global.document = new JSDOM().window.document;

  // set up popup react component
  const getPopupProps = () => {
    return {
      ...appController.state.toObject(),
      ...appController.browserActionActions,
    };
  };
  const popupContent = mount(<PopupContent {...getPopupProps()} />);
  appController.onStateChange(() => popupContent.setProps(getPopupProps()));

  return { client, appController, pageWatcher, popupContent };
};

describe('The Entire App', () => {
  let appController, pageWatcher, popupContent, client; // eslint-disable-line no-unused-vars
  describe('When no video is present', () => {
    it('can be initialized in a test environment', () => {
      popupContent = initializeTestEnvironment('').popupContent;
    });
    it('shows error when connect is clicked', () => {
      popupContent.find('button').simulate('click');
      expect(popupContent.someWhere(n => n.text().includes(notExactlyOneVideoMsg))).to.be.true;
    });
  });
  describe('When more than one video is present', () => {
    it('can be initialized in a test environment', () => {
      popupContent = initializeTestEnvironment('<div><video /><video /></div>').popupContent;
    });
    it('shows error when connect is clicked', () => {
      popupContent.find('button').simulate('click');
      expect(popupContent.someWhere(n => n.text().includes(notExactlyOneVideoMsg))).to.be.true;
    });
  });
  describe('When one video is present', () => {
    it('can be initialized in a test environment', () => {
      const testEnv = initializeTestEnvironment('<video />');
      popupContent = testEnv.popupContent;
      client = testEnv.client;
    });
    it('attempts to connect when connect button is clicked', () => {
      popupContent.find('button').simulate('click');
      expect(popupContent.someWhere(n => n.text().includes(connectingMsg))).to.be.true;
    });
    it('shows that user is connected when connection is successfully made', () => {
      client.mock.connectSuccess();
      expect(popupContent.someWhere(n => n.text().includes(connectedMsg))).to.be.true;
    });
  });
});
