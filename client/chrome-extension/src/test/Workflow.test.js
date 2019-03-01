/* eslint-disable no-unused-expressions one-var no-new, one-var-declaration-per-line */

import React from 'react';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import AppController from '../background/AppController';
import PopupContent, {
  notExactlyOneVideoMsg, connectingMsg, connectedMsg, connectionErrorMsg,
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
  const jsdom = new JSDOM(pageHtml);
  const dom = jsdom.window.document;
  const pageWatcher = new PageWatcher({
    dom,
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

  return { client, appController, pageWatcher, popupContent, dom, jsdom };
};

describe('The Entire App', () => {
  it('can be initialized in a test environment', () => {
    initializeTestEnvironment('').popupContent;
  });

  describe('When no video is present', () => {
    it('shows error when connect is clicked', () => {
      const { popupContent } = initializeTestEnvironment('');
      popupContent.find('button').simulate('click');
      expect(popupContent.someWhere(n => n.text().includes(notExactlyOneVideoMsg))).to.be.true;
    });
  });

  describe('When more than one video is present', () => {
    it('shows error when connect is clicked', () => {
      const { popupContent } = initializeTestEnvironment('<div><video /><video /></div>');
      popupContent.find('button').simulate('click');
      expect(popupContent.someWhere(n => n.text().includes(notExactlyOneVideoMsg))).to.be.true;
    });
  });

  describe('When one video is present', () => {
    describe('When connection is unsuccessful', () => {
      it('will show user that connection could not be made', () => {
        const testEnv = initializeTestEnvironment('<video />');
        testEnv.popupContent.find('button').simulate('click');
        testEnv.client.mock.connectError();
        expect(testEnv.popupContent.someWhere(n => n.text().includes(connectionErrorMsg))).to.be.true;
      });
    });

    describe('When connection is successful', () => {
      let popupContent, client, dom, jsdom;
      it('can be initialized in a test environment', () => {
        const testEnv = initializeTestEnvironment('<video />');
        popupContent = testEnv.popupContent;
        client = testEnv.client;
        dom = testEnv.dom;
        jsdom = testEnv.jsdom;
      });
      it('attempts to connect when connect button is clicked', () => {
        popupContent.find('button').simulate('click');
        expect(popupContent.someWhere(n => n.text().includes(connectingMsg))).to.be.true;
      });
      it('shows that user is connected when connection is successfully made', () => {
        client.mock.connectSuccess();
        expect(popupContent.someWhere(n => n.text().includes(connectedMsg))).to.be.true;
      });
      describe('Video interaction', () => {
        beforeEach(() => {
          client.play.reset();
          client.pause.reset();
        });
        it('will send a play event through the client when video play is clicked', () => {
          const video = dom.getElementsByTagName('video')[0];
          video.dispatchEvent(new jsdom.window.Event('play'));
          // expect client sent a play message
          expect(client.play.calledOnce).to.equal(true);
          // expect the play message said the video was at the start (time 0)
          expect(client.play.firstCall.args[0]).to.equal(0);
        });
        it('will send a pause event through the client when video pause is clicked', () => {
          const video = dom.getElementsByTagName('video')[0];
          video.dispatchEvent(new jsdom.window.Event('pause'));
          expect(client.pause.calledOnce).to.equal(true);
          expect(client.pause.firstCall.args[0]).to.equal(0);
        });
      });
    });
  });
});
