import React, { useEffect, useState } from 'react';

const OutgoingCall = ({ onEndCall }) => {
  const [callTimer, setCallTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    setCallTimer(0);
    const interval = setInterval(() => {
      setCallTimer((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="outgoing-call">
      <h2>Ongoing Call</h2>
      <p>Timer: {formatTime(callTimer)}</p>
      <button onClick={onEndCall}>End Call</button>
    </div>
  );
};

export default OutgoingCall;
