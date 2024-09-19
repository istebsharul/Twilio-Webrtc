import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import IncomingCall from './IncomingCall';
import OutgoingCall from './OutgoingCall';
import Dialpad from './Dialpad'; // Import the Dialpad component

const TwilioWebRTC = () => {
  const [device, setDevice] = useState(null);
  const [incomingConnection, setIncomingConnection] = useState(null);
  const [currentConnection, setCurrentConnection] = useState(null);
  const [callInProgress, setCallInProgress] = useState(false);
  const [callStatus, setCallStatus] = useState('Device not ready');
  const [callSid, setCallSid] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const isOutgoingRef = useRef(false);

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
        const callSid = connection.parameters.CallSid;  // Get the callSid for incoming calls
        console.log('Incoming callSid:', callSid);

        if (isOutgoingRef.current) {
          // This is an outgoing call, so accept the connection automatically
          console.log('Outgoing Call Detected');
          connection.accept();
          setCurrentConnection(connection); // Store the active connection
          setCallStatus('Outgoing call accepted');
          setCallInProgress(true);
        } else {
          // Handle incoming call scenario
          setIncomingConnection(connection);
          setCallStatus(`Incoming call... (Call SID: ${callSid})`);
          setCallSid(callSid);
        }
      });

      setDevice(newDevice);
    } else {
      console.error('Failed to initialize Twilio device');
      setCallStatus('Error initializing device');
    }
  };

  const makeCall = async (phoneNumber) => {
    try {
      if (device) {
        isOutgoingRef.current = true;

        const response = await axios.post('http://localhost:3000/call', { phoneNumber });
        console.log(response);

        // Store the callSid from the response
        setCallSid(response.data.callSid);
        setCallInProgress(true);
        setCallStatus('Calling...');

      } else {
        console.warn('Device not initialized');
        setCallStatus('Device not ready');
      }
    } catch (error) {
      console.error('Error making call', error);
      setCallStatus('Error making call');
    }
  };

  const endCall = async () => {
    try {
      if (callSid) {
        const response = await axios.post('http://localhost:3000/endCall', { callSid });
        console.log(response.data);

        setCallInProgress(false);
        setCallStatus('Call ended');
        setCallSid(null);
        setCurrentConnection(null);
      } else {
        console.warn('No active call to end');
      }
    } catch (error) {
      console.error('Error ending call:', error);
      setCallStatus('Error ending call');
    }
  };

  const acceptCall = () => {
    if (incomingConnection) {
      incomingConnection.accept();
      setCallInProgress(true);
      setCurrentConnection(incomingConnection);
      setIncomingConnection(null);
      setCallStatus('Call in progress');
    }
  };

  const rejectCall = () => {
    if (incomingConnection) {
      incomingConnection.reject();
      setIncomingConnection(null);
      setCallStatus('Call rejected');
    }
  };

  const muteCall = () => {
    if (currentConnection) {
      currentConnection.mute(true);
      setIsMuted(true);
      setCallStatus('Call muted');
    }
  };

  const resumeCall = () => {
    if (currentConnection) {
      currentConnection.mute(false);
      setIsMuted(false);
      setCallStatus('Call resumed');
    }
  };

  return (
    <div>
      <h1>Twilio WebRTC Client</h1>
      <p>Status: {callStatus}</p>

      {incomingConnection && (
        <div>
          <p>Incoming Call SID: {incomingConnection.parameters.CallSid}</p>
          <IncomingCall
            connection={incomingConnection}
            onAccept={acceptCall}
            onReject={rejectCall}
          />
        </div>
      )}

      {!incomingConnection && !callInProgress && (
        <Dialpad onCall={makeCall} /> 
      )}

      {callInProgress && !incomingConnection && (
        <div>
          <OutgoingCall onEndCall={endCall} />
          {isMuted ? (
            <button onClick={resumeCall}>Resume Call</button>
          ) : (
            <button onClick={muteCall}>Mute Call</button>
          )}
        </div>
      )}
    </div>
  );
};

export default TwilioWebRTC;
