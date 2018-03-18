import sinon from 'sinon';

import Client from './Client';

class MockClient {
  constructor(address, username) {
    console.log('MockClient constructed with:', { address, username });
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
    };

    return stub;
  }
  connect(onSuccess, onError) {
    console.log('MockClient::connect called with:', { onSuccess: typeof onSuccess, onError: typeof onError });
  }
}

export default MockClient;
