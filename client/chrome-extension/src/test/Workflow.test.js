/* eslint-disable no-unused-expressions one-var no-new, one-var-declaration-per-line */

import React from 'react';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import AppController from '../background/AppController';
import PopupContent from '../browserAction/PopupContent';
import PageWatcher from '../contentScript/PageWatcher';
import MockClient from '../client/MockClient';

configure({ adapter: new Adapter() });

describe('The Entire App', () => {
  let appController, pageWatcher, popupContent; // eslint-disable-line no-unused-vars
  it('can be initialized in a test environment', () => {
    const client = new MockClient();

    let onMessageToAppController = () => {};
    let onMessageToPageWatcher = () => {};
    appController = new AppController({
      client,
      sendMessage: (message) => onMessageToPageWatcher(message),
      onMessage: (callback) => { onMessageToAppController = callback; },
    });
    pageWatcher = new PageWatcher({
      dom: new JSDOM('<!DOCTYPE html><video />').window.document,
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
    popupContent = mount(<PopupContent {...getPopupProps()} />);
    appController.onStateChange(() => popupContent.setProps(getPopupProps()));
  });

  it('attempts to connect when connect button is clicked', () => {
    popupContent.find('button').simulate('click');
    expect(popupContent.someWhere(n => n.text().includes('Connecting...'))).to.be.true;
  });
});
