import React from 'react';

const PopupContent = ({ connected, invalidPage, onConnectClick }) => {
  console.log(onConnectClick);
  return (
    <div className="popup-content">
      <h3 className="popup-title">Watch With Me</h3>
      <button className="connect-button" onClick={onConnectClick}>Connect</button>
      {invalidPage ? (
        <span className="invalid-page">Cannot connect - there is not exactly one video on this page</span>
      ) : null}
    </div>
  );
};

export default PopupContent;
