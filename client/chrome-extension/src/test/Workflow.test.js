/* eslint-disable no-unused-expressions one-var no-new, one-var-declaration-per-line */

import React from 'react';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import AppController from '../background/AppController';
import PopupContent, { notExactlyOneVideoMsg } from '../browserAction/PopupContent';
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

  return { appController, pageWatcher, popupContent };
};

describe('The Entire App', () => {
  let appController, pageWatcher, popupContent; // eslint-disable-line no-unused-vars
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
      popupContent = initializeTestEnvironment('<video />').popupContent;
    });
    it('attempts to connect when connect button is clicked', () => {
      popupContent.find('button').simulate('click');
      expect(popupContent.someWhere(n => n.text().includes('Connecting...'))).to.be.true;
    });
  });
});
