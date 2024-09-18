import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TwilioWebRTC = () => {
  const [device, setDevice] = useState(null);
  const [activeConnection, setActiveConnection] = useState(null);
  const [callInProgress, setCallInProgress] = useState(false);
  const [callType, setCallType] = useState(null); // 'incoming' or 'outgoing'
  const [callStatus, setCallStatus] = useState('Device not ready');
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState(0); // Call duration in seconds
  const [isOnHold, setIsOnHold] = useState(false);

  let callTimer;

  // Load Twilio SDK
  useEffect(() => {
    const loadTwilioSdk = () => {
      const script = document.createElement('script');
      script.src = 'https://media.twiliocdn.com/sdk/js/client/v1.13/twilio.min.js';
      script.async = true;
      script.onload = () => {
        console.log('Twilio SDK loaded');
        initDevice();
      };
      document.body.appendChild(script);
    };

    loadTwilioSdk();

    return () => {
      if (device) {
        device.destroy();
      }
      clearInterval(callTimer);
    };
  }, []);

  const startCallTimer = () => {
    setTimer(0);
    callTimer = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    clearInterval(callTimer);
  };

  const getToken = async () => {
    try {
      const response = await axios.get('http://localhost:3000/token');
      return response.data.token;
    } catch (error) {
      console.error('Error fetching token:', error);
      return null;
    }
  };

  const initDevice = async () => {
    const token = await getToken();
    if (token) {
      const newDevice = new Twilio.Device(token, { debug: true });

      newDevice.on('ready', () => {
        setCallStatus('Device ready');
      });

      newDevice.on('error', (error) => {
        setCallStatus(`Error: ${error.message}`);
      });

      newDevice.on('incoming', (connection) => {
        setActiveConnection(connection);
        setCallStatus('Incoming call...');
        setCallType('incoming');
      });

      setDevice(newDevice);
    }
  };

  const acceptCall = () => {
    if (activeConnection) {
      activeConnection.accept();
      setCallInProgress(true);
      setCallStatus('Call in progress (incoming)');
      startCallTimer();
    }
  };

  const makeCall = () => {
    if (device) {
      const phoneNumber = '+917439011473'; // Replace with the phone number you want to call
      axios.post('http://localhost:3000/call', { phoneNumber }).then(() => {
        const connection = device.connect({ phoneNumber });
        setActiveConnection(connection);
        setCallInProgress(true);
        setCallType('outgoing');
        setCallStatus('Calling...');

        // Handle connection state change for outgoing calls
        connection.on('accept', () => {
          setCallStatus('Call accepted (outgoing)');
          
        });

        connection.on('disconnect', () => {
          endCall();
        });
      });
    }
  };

  const endCall = () => {
    if (activeConnection) {
      activeConnection.disconnect();
      setActiveConnection(null);
      setCallInProgress(false);
      setCallType(null);
      setCallStatus('Call ended');
      stopCallTimer();
    }
  };

  const toggleMute = () => {
    if (activeConnection) {
      activeConnection.mute(!isMuted);
      setIsMuted(!isMuted);
      setCallStatus(isMuted ? 'Unmuted' : 'Muted');
    }
  };

  const toggleHold = async () => {
    if (activeConnection) {
      if (!isOnHold) {
        // Send request to the backend to update TwiML and put the call on hold
        await axios.post('http://localhost:3000/hold', { callSid: activeConnection.parameters.CallSid });
        setCallStatus('On Hold');
      } else {
        // Resume the call
        await axios.post('http://localhost:3000/resume', { callSid: activeConnection.parameters.CallSid });
        setCallStatus('Resumed');
      }
      setIsOnHold(!isOnHold);
    }
  };

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div>
      <h1>Twilio WebRTC Client</h1>
      <p>Status: {callStatus}</p>
      {callInProgress && <p>Call Duration: {formatTimer(timer)}</p>}

      {callType === 'incoming' && !callInProgress && (
        <div className="incoming-call">
          <h2>Incoming Call...</h2>
          <button onClick={acceptCall}>Accept</button>
        </div>
      )}

      {callInProgress && (
        <div>
          <h2>{callType === 'incoming' ? 'Incoming Call' : 'Outgoing Call'}</h2>
          <button onClick={endCall}>End Call</button>
          <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
          <button onClick={toggleHold}>{isOnHold ? 'Resume' : 'Hold'}</button>
        </div>
      )}

      {!callInProgress && callType !== 'incoming' && (
        <button onClick={makeCall}>Start Outgoing Call</button>
      )}
    </div>
  );
};

export default TwilioWebRTC;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const TwilioWebRTC = () => {
//   const [device, setDevice] = useState(null);
//   const [activeConnection, setActiveConnection] = useState(null);
//   const [callInProgress, setCallInProgress] = useState(false);
//   const [callType, setCallType] = useState(null); // 'incoming' or 'outgoing'
//   const [callStatus, setCallStatus] = useState('Device not ready');
//   const [isMuted, setIsMuted] = useState(false);
//   const [timer, setTimer] = useState(0); // Call duration in seconds
//   const [isOnHold, setIsOnHold] = useState(false);

//   let callTimer;

//   // Load Twilio SDK
//   useEffect(() => {
//     const loadTwilioSdk = () => {
//       const script = document.createElement('script');
//       script.src = 'https://media.twiliocdn.com/sdk/js/client/v1.13/twilio.min.js';
//       script.async = true;
//       script.onload = () => {
//         console.log('Twilio SDK loaded');
//         initDevice();
//       };
//       document.body.appendChild(script);
//     };

//     loadTwilioSdk();

//     return () => {
//       if (device) {
//         device.destroy();
//       }
//       clearInterval(callTimer);
//     };
//   }, []);

//   const startCallTimer = () => {
//     setTimer(0);
//     callTimer = setInterval(() => {
//       setTimer((prev) => prev + 1);
//     }, 1000);
//   };

//   const stopCallTimer = () => {
//     clearInterval(callTimer);
//   };

//   const getToken = async () => {
//     try {
//       const response = await axios.get('http://localhost:3000/token');
//       return response.data.token;
//     } catch (error) {
//       console.error('Error fetching token:', error);
//       return null;
//     }
//   };

//   const initDevice = async () => {
//     const token = await getToken();
//     if (token) {
//       const newDevice = new Twilio.Device(token, { debug: true });

//       newDevice.on('ready', () => {
//         setCallStatus('Device ready');
//       });

//       newDevice.on('error', (error) => {
//         setCallStatus(`Error: ${error.message}`);
//       });

//       newDevice.on('incoming', (connection) => {
//         setActiveConnection(connection);
//         setCallStatus('Incoming call...');
//         setCallType('incoming');
//       });

//       setDevice(newDevice);
//     }
//   };

//   const acceptCall = () => {
//     if (activeConnection) {
//       activeConnection.accept();
//       setCallInProgress(true);
//       setCallStatus('Call in progress (incoming)');
//       startCallTimer();
//     }
//   };

//   const makeCall = () => {
//     if (device) {
//       const phoneNumber = '+917439011473';
//       axios.post('http://localhost:3000/call', { phoneNumber }).then(() => {
//         const connection = device.connect({ phoneNumber });
//         setActiveConnection(connection);
//         setCallInProgress(true);
//         setCallType('outgoing');
//         setCallStatus('Calling...');
//         startCallTimer();
//       });
//     }
//   };

//   const endCall = () => {
//     if (activeConnection) {
//       activeConnection.disconnect();
//       setActiveConnection(null);
//       setCallInProgress(false);
//       setCallType(null);
//       setCallStatus('Call ended');
//       stopCallTimer();
//     }
//   };

//   const toggleMute = () => {
//     if (activeConnection) {
//       activeConnection.mute(!isMuted);
//       setIsMuted(!isMuted);
//       setCallStatus(isMuted ? 'Unmuted' : 'Muted');
//     }
//   };

//   const toggleHold = () => {
//     if (activeConnection) {
//       if (!isOnHold) {
//         // Mute both directions to simulate hold
//         activeConnection.mute(true);
//         activeConnection.mediaStream?.getAudioTracks().forEach(track => (track.enabled = false));
//         setCallStatus('On Hold');
//       } else {
//         activeConnection.mute(false);
//         activeConnection.mediaStream?.getAudioTracks().forEach(track => (track.enabled = true));
//         setCallStatus('Resumed');
//       }
//       setIsOnHold(!isOnHold);
//     }
//   };

//   const formatTimer = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
//   };

//   return (
//     <div>
//       <h1>Twilio WebRTC Client</h1>
//       <p>Status: {callStatus}</p>
//       {callInProgress && <p>Call Duration: {formatTimer(timer)}</p>}

//       {callType === 'incoming' && !callInProgress && (
//         <div className="incoming-call">
//           <h2>Incoming Call...</h2>
//           <button onClick={acceptCall}>Accept</button>
//         </div>
//       )}

//       {callInProgress && (
//         <div>
//           <h2>{callType === 'incoming' ? 'Incoming Call' : 'Outgoing Call'}</h2>
//           <button onClick={endCall}>End Call</button>
//           <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
//           <button onClick={toggleHold}>{isOnHold ? 'Resume' : 'Hold'}</button>
//         </div>
//       )}

//       {!callInProgress && callType !== 'incoming' && (
//         <button onClick={makeCall}>Start Outgoing Call</button>
//       )}
//     </div>
//   );
// };

// export default TwilioWebRTC;
