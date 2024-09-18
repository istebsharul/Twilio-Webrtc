import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TwilioWebRTC = () => {
  const [device, setDevice] = useState(null);

  // Load the Twilio Client SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://media.twiliocdn.com/sdk/js/client/v1.13/twilio.min.js';
    script.async = true;
    script.onload = () => {
      console.log('Twilio SDK loaded');
      initDevice();
    };
    document.body.appendChild(script);
  }, []);

  // Fetch Twilio token
  const getToken = async () => {
    try {
      const response = await axios.get('http://localhost:3000/token');
      return response.data.token;
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  // Initialize Twilio device
  const initDevice = async () => {
    try {
      const token = await getToken();
      if (token) {
        const newDevice = new Twilio.Device(token, { debug: true });

        newDevice.on('ready', () => {
          console.log('Device ready');
        });

        newDevice.on('error', (error) => {
          console.error('Error:', error.message);
        });

        newDevice.on('incoming', (connection) => {
          console.log('Incoming call');
          connection.accept();
        });

        setDevice(newDevice);
      } else {
        console.error('No token received');
      }
    } catch (error) {
      console.error('Error initializing device:', error);
    }
  };

  // Handle outgoing call
  const makeCall = () => {
    if (device) {
      const phoneNumber = '+917439011473'; // Replace with the phone number you want to call
      axios.post('http://localhost:3000/call', { phoneNumber })
        .then(() => {
          console.log('Call initiated');
        })
        .catch((error) => {
          console.error('Error making call:', error);
        });
    } else {
      console.warn('Device not initialized');
    }
  };

  return (
    <div>
      <h1>Twilio WebRTC Client</h1>
      <button onClick={makeCall}>Start Call</button>
    </div>
  );
};

export default TwilioWebRTC;
