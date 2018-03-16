import React from 'react';

const PopupContent = ({ connected, pageIsInvalid, couldNotConnect, onConnectClick }) => {
  return (
    <div className="popup-content">
      <h3 className="popup-title">Watch With Me</h3>
      <button className="connect-button" onClick={onConnectClick}>Connect</button>
      {pageIsInvalid ? (
        <span className="invalid-page">Cannot connect - there is not exactly one video on this page</span>
      ) : null}
      {couldNotConnect ? (
        <span className="invalid-page">Could not establish connection with server</span>
      ) : null}
    </div>
  );
};

export default PopupContent;
