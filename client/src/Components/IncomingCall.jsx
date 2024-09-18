import React, { useEffect, useState } from 'react';

const IncomingCall = ({ connection, onAccept, onReject }) => {
  const [callTimer, setCallTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    if (connection) {
      setCallTimer(0);
      const interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);

      return () => clearInterval(interval);
    }
  }, [connection]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="incoming-call">
      <h2>Incoming Call...</h2>
      <p>Timer: {formatTime(callTimer)}</p>
      <button onClick={onAccept}>Accept</button>
      <button onClick={onReject}>Reject</button>
    </div>
  );
};

export default IncomingCall;
