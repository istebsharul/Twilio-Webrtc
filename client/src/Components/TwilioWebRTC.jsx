import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TwilioWebRTC = () => {
  const [device, setDevice] = useState(null);
  const [incomingConnection, setIncomingConnection] = useState(null);
  const [callInProgress, setCallInProgress] = useState(false);
  const [callStatus, setCallStatus] = useState('Device not ready');
  
  // Load the Twilio Client SDK
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
        device.destroy(); // Ensure we clean up the device when the component unmounts
      }
    };
  }, []);

  // Fetch Twilio token
  const getToken = async () => {
    try {
      const response = await axios.get('http://localhost:3000/token');
      return response.data.token;
    } catch (error) {
      console.error('Error fetching token:', error);
      return null;
    }
  };

  // Initialize Twilio device
  const initDevice = async () => {
    const token = await getToken();
    if (token) {
      const newDevice = new Twilio.Device(token, { debug: true });

      newDevice.on('ready', () => {
        console.log('Device ready');
        setCallStatus('Device ready');
      });

      newDevice.on('error', (error) => {
        console.error('Twilio device error:', error.message);
        setCallStatus('Error: ' + error.message);
      });

      newDevice.on('incoming', (connection) => {
        console.log('Incoming call detected');
        setIncomingConnection(connection);
        setCallStatus('Incoming call...');
      });

      setDevice(newDevice);
    } else {
      console.error('Failed to initialize Twilio device');
      setCallStatus('Error initializing device');
    }
  };

  // Handle accepting the incoming call
  const acceptCall = () => {
    if (incomingConnection) {
      console.log('Accepting call...');
      incomingConnection.accept();
      setCallInProgress(true);
      setIncomingConnection(null);
      setCallStatus('Call in progress');
    }
  };

  // Handle rejecting the incoming call
  const rejectCall = () => {
    if (incomingConnection) {
      console.log('Rejecting call...');
      incomingConnection.reject();
      setIncomingConnection(null);
      setCallStatus('Call rejected');
    }
  };

  // Handle outgoing call
  const makeCall = () => {
    if (device) {
      const phoneNumber = '+917439011473'; // Replace with the phone number you want to call
      axios
        .post('http://localhost:3000/call', { phoneNumber })
        .then(() => {
          console.log('Outgoing call initiated');
          setCallInProgress(true);
          setCallStatus('Calling...');
        })
        .catch((error) => {
          console.error('Error making outgoing call:', error);
          setCallStatus('Error making call');
        });
    } else {
      console.warn('Device not initialized');
      setCallStatus('Device not ready');
    }
  };

  // End the current call
  const endCall = () => {
    if (device) {
      console.log('Ending call...');
      device.disconnectAll();
      setCallInProgress(false);
      setCallStatus('Call ended');
    } else {
      console.warn('No active call to end');
    }
  };

  return (
    <div>
      <h1>Twilio WebRTC Client</h1>
      
      {/* Display call status */}
      <p>Status: {callStatus}</p>

      {/* Incoming Call UI */}
      {incomingConnection && (
        <div className="incoming-call">
          <h2>Incoming Call...</h2>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}

      {/* Ongoing Call UI */}
      {callInProgress ? (
        <div>
          <h2>Ongoing Call</h2>
          <button onClick={endCall}>End Call</button>
        </div>
      ) : (
        <button onClick={makeCall}>Start Call</button>
      )}
    </div>
  );
};

export default TwilioWebRTC;