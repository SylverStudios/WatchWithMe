/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import sinon from 'sinon';

import Client from './Client';
import MockClient from './MockClient';

// this may not be the best way to do it...
const getArgNamesForFunction = (func) => {
  return func.toString().substring(
    func.toString().indexOf('(') + 1,
    func.toString().indexOf(')'),
  ).split(', ');
};

describe('MockClient', () => {
  it('has all the same functions with same argument names as Client.js', () => {
    // const realClient = new Client();
    // const mockClient = new MockClient();
    const funcNames = Object.getOwnPropertyNames(Client.prototype)
      .filter((funcName) => typeof Client.prototype[funcName] === 'function');
    funcNames.forEach(funcName => {
      expect(
        typeof MockClient.prototype[funcName] === 'function',
        `MockClient has Client function named '${funcName}'`,
      ).to.be.true;
      const realArgNames = getArgNamesForFunction(Client.prototype[funcName]);
      const mockArgNames = getArgNamesForFunction(MockClient.prototype[funcName]);
      expect(
        mockArgNames,
        `MockClient's function '${funcName}' must have same argument names as Client`,
      ).to.deep.eql(realArgNames);
    });
  });
  describe('Mock server communication', () => {
    let client;
    beforeEach(() => {
      client = new MockClient();
    });
    it('can simulate successful connection', () => {
      const onSuccess = sinon.spy();
      client.connect(onSuccess);
      client.mock.connectSuccess();
      expect(onSuccess.called).to.be.true;
    });
    it('can simulate unsuccessful connection', () => {
      const onError = sinon.spy();
      client.connect(() => {}, onError);
      client.mock.connectError();
      expect(onError.called).to.be.true;
    });
  });
});
