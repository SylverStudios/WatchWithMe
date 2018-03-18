import React from 'react';

export const connectingMsg = 'Connecting...';
export const notExactlyOneVideoMsg = 'Cannot connect - there is not exactly one video on this page';
export const connectionErrorMsg = 'Could not establish connection with server';
export const connectedMsg = 'Connected!';

const PopupContent = ({ connected, connecting, pageIsInvalid, couldNotConnect, attemptConnect }) => {
  console.log(connected, connecting, pageIsInvalid, couldNotConnect, attemptConnect);
  return (
    <div className="popup-content">
      <h3 className="popup-title">Watch With Me</h3>
      <button className="connect-button" onClick={attemptConnect}>Connect</button>
      {connecting ? (
        <span className="general-message">{connectingMsg}</span>
      ) : null}
      {pageIsInvalid ? (
        <span className="general-message">{notExactlyOneVideoMsg}</span>
      ) : null}
      {couldNotConnect ? (
        <span className="general-message">{connectionErrorMsg}</span>
      ) : null}
      {connected ? (
        <span className="general-message">{connectedMsg}</span>
      ) : null}
    </div>
  );
};

export default PopupContent;
