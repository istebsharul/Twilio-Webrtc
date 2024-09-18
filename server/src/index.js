import express from 'express';
import twilio from 'twilio';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

// Token Generation
app.get('/token', (req, res) => {
  console.log("Hello from Token server");
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_APP_SID,
    incomingAllow: true,
  });

  // Ensure identity is specified
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity: 'web-user' } // Add identity here
  );
  token.addGrant(voiceGrant);

  res.json({ token: token.toJwt() });
});

// Endpoint to make a call
app.post('/call', (req, res) => {
  console.log("Hello from call server");
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).send('Phone number is required');
  }

  twilioClient.calls
    .create({
      url: 'https://4bee-203-171-244-100.ngrok-free.app/voice', // URL to TwiML voice instructions
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
    })
    .then((call) => res.send(`Call started with SID: ${call.sid}`))
    .catch((err) => res.status(500).send(err));
});

// TwiML instructions for the call
app.post('/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('You are connected to the web support agent.');
  twiml.dial().client('web-user'); // Dial to the web user via WebRTC
  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(3000, () => console.log('Server listening on port 3000'));
