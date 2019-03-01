import sinon from 'sinon';

import Client from './Client';

class MockClient {
  constructor(address, username) {
    console.debug('MockClient constructed with:', { address, username });
    // wrap all methods of Client in sinon stubbing
    const stub = sinon.createStubInstance(Client);

    // take all methods declared here and attach them as method logic for all stubbed methods
    Object.getOwnPropertyNames(MockClient.prototype)
      .filter(fn => fn !== 'constructor')
      .forEach(fn => {
        stub[fn].callsFake(this[fn]);
      });

    // provide methods for mocking out server communication / functionality
    stub.mock = {
      connectSuccess() {
        stub.connect.lastCall.args[0]();
      },
      connectError() {
        stub.connect.lastCall.args[1]();
      },
      playMessage({ videoTime, worldTime }) {
        stub.onPlay.lastCall.args[0]({ videoTime, worldTime });
      },
      pauseMessage({ videoTime, worldTime }) {
        stub.onPause.lastCall.args[0]({ videoTime, worldTime });
      },
    };

    return stub;
  }
  connect(onSuccess, onError) {
    console.debug('MockClient::connect called with:', { onSuccess: typeof onSuccess, onError: typeof onError });
  }
  connectSync() {}
  disconnect(onSuccess) {
    console.debug('MockClient::disconnect called with:', { onSuccess: typeof onSuccess });
  }
  disconnectSync() {}
  onUserJoin(callback) {
    console.debug('MockClient::onUserJoin called with:', { callback: typeof callback });
  }
  play(videoTime) {
    console.debug('MockClient::play called with:', { videoTime });
  }
  onPlay(callback) {
    console.debug('MockClient::onPlay called with:', { callback: typeof callback });
  }
  pause(videoTime) {
    console.debug('MockClient::pause called with:', { videoTime });
  }
  onPause(callback) {
    console.debug('MockClient::onPause called with:', { callback: typeof callback });
  }
  resetCallbacks() {}
}

export default MockClient;
