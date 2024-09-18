import React, { useEffect, useState } from 'react';
import axios from 'axios';
import IncomingCall from './IncomingCall';
import OutgoingCall from './OutgoingCall';

const TwilioWebRTC = () => {
  const [device, setDevice] = useState(null);
  const [incomingConnection, setIncomingConnection] = useState(null);
  const [callInProgress, setCallInProgress] = useState(false);
  const [callStatus, setCallStatus] = useState('Device not ready');

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
        device.destroy(); // Clean up the device when the component unmounts
      }
    };
  }, []);

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

  const acceptCall = () => {
    if (incomingConnection) {
      console.log('Accepting call...');
      incomingConnection.accept();
      setCallInProgress(true);
      setIncomingConnection(null);
      setCallStatus('Call in progress');
    }
  };

  const rejectCall = () => {
    if (incomingConnection) {
      console.log('Rejecting call...');
      incomingConnection.reject();
      setIncomingConnection(null);
      setCallStatus('Call rejected');
    }
  };

  const makeCall = () => {
    try {
      if(device){
        const phoneNumber = '+917439011473';

        const response = axios.post('http://localhost:3000/call',{phoneNumber});
        console.log(response);
        setCallInProgress(true);
        setCallStatus('Calling...');
      }else{
        console.warn('Device not initialized');
        setCallStatus('Device not ready');
      }
    } catch (error) {
      console.error('Error making call',error);
      setCallStatus('Error making call');
    }
  }

  const endCall = () => {
    if (device) {
      console.log('Ending call...');
      const response = device.disconnectAll();
      console.log(response);
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
        <IncomingCall 
          connection={incomingConnection}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}

      {/* Ongoing Call UI */}
      {callInProgress && !incomingConnection ? (
        <OutgoingCall 
          onEndCall={endCall}
        />
      ) : (
        !incomingConnection && !callInProgress && (
          <button onClick={makeCall}>Start Call</button>
        )
      )}
    </div>
  );
};

export default TwilioWebRTC;