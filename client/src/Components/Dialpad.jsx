import React, { useState } from 'react';

const Dialpad = ({ onCall }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleNumberClick = (num) => {
    setPhoneNumber((prev) => prev + num);
  };

  const handleClear = () => {
    setPhoneNumber('');
  };

  const handleCall = () => {
    if (phoneNumber) {
      onCall(phoneNumber); // Trigger the call with the entered phone number
    }
  };

  return (
    <div className="dialpad">
      <div className="display">
        <input type="text" value={phoneNumber} readOnly />
      </div>
      <div className="buttons">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((num) => (
          <button key={num} onClick={() => handleNumberClick(num)}>
            {num}
          </button>
        ))}
      </div>
      <div className="actions">
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleCall}>Call</button>
      </div>
    </div>
  );
};

export default Dialpad;
