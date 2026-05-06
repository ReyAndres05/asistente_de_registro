import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contactId, agent, status, duration, trackingType, observations } = body;

    if (!contactId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (status === 'SEGUIMIENTO' && !trackingType) {
      return NextResponse.json({ error: 'Tracking type is required for SEGUIMIENTO status' }, { status: 400 });
    }

    const callRecord = await prisma.callRecord.create({
      data: {
        contactId,
        agent: agent || null,
        status,
        duration: duration ? parseInt(duration, 10) : null,
        trackingType: trackingType || null,
        observations: observations || null,
      }
    });

    return NextResponse.json(callRecord, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error logging call' }, { status: 500 });
  }
}
