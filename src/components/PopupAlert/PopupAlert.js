import React from 'react';
import './PopupAlert.css';
import closeIcon from "../../assets/closebtn.png"

const PopupAlert = ({ message, onClose }) => (
  <div className="popup-box">
    <div className="popup-item">
      <img src={closeIcon} alt='' onClick={onClose} className="close-button"/>
      <div>
        <p>{message}</p>
      </div>
    </div>
  </div>
);

export default PopupAlert;