class MockClient {
  constructor(address, username) {
    console.log('MockClient constructed with:', { address, username });
  }
  connect(onSuccess, onError) {
    console.log('MockClient::connect called with:', { onSuccess, onError });
  }
}

export default MockClient;
