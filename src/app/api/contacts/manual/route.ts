import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, name } = body;
    
    if (!phone) {
      return NextResponse.json({ error: 'El número es requerido' }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: {
        phone: String(phone),
        name: name ? String(name) : null,
        agent: 'Agente Manual',
      }
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creando contacto' }, { status: 500 });
  }
}
