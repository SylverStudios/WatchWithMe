import React from 'react';

const PopupContent = ({ connected, connecting, pageIsInvalid, couldNotConnect, attemptConnect }) => {
  console.log(connected, connecting, pageIsInvalid, couldNotConnect, attemptConnect);
  return (
    <div className="popup-content">
      <h3 className="popup-title">Watch With Me</h3>
      <button className="connect-button" onClick={attemptConnect}>Connect</button>
      {connecting ? (
        <span className="general-message">Connecting...</span>
      ) : null}
      {pageIsInvalid ? (
        <span className="general-message">Cannot connect - there is not exactly one video on this page</span>
      ) : null}
      {couldNotConnect ? (
        <span className="general-message">Could not establish connection with server</span>
      ) : null}
      {connected ? (
        <span className="general-message">Connected!</span>
      ) : null}
    </div>
  );
};

export default PopupContent;
