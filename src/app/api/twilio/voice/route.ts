import { NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const to = formData.get('To') as string;

    const twiml = new VoiceResponse();

    if (to) {
      const dial = twiml.dial({ callerId: process.env.TWILIO_CALLER_ID });
      dial.number(to);
    } else {
      twiml.say('Thanks for calling!');
    }

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error generating TwiML:', error);
    const twiml = new VoiceResponse();
    twiml.say('An error occurred. Please try again.');
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
