import { NextResponse } from 'next/server';
import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export async function GET() {
  try {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioApiKey = process.env.TWILIO_API_KEY;
    const twilioApiSecret = process.env.TWILIO_API_SECRET;
    const twilioTwiMLAppSid = process.env.TWILIO_TWIML_APP_SID;

    if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret || !twilioTwiMLAppSid) {
      return NextResponse.json(
        { error: 'Twilio credentials are not fully configured in the environment variables.' },
        { status: 500 }
      );
    }

    // Identificador del usuario (podría ser el ID del agente que inició sesión)
    const identity = 'agent_front_desk';

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twilioTwiMLAppSid,
      incomingAllow: true,
    });

    const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret, {
      identity,
    });

    token.addGrant(voiceGrant);

    return NextResponse.json({ token: token.toJwt() });
  } catch (error) {
    console.error('Error generating Twilio token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
