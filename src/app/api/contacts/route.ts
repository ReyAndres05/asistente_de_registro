import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        calls: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: 'Error fetching contacts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contacts } = body;
    
    if (!Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Invalid data format. Expected an array of contacts.' }, { status: 400 });
    }

    // Process and insert contacts
    const createPromises = contacts.map((contact: any) => {
      // Required: phone. Optional: name, agent
      if (!contact.phone) return null;
      
      return prisma.contact.create({
        data: {
          phone: String(contact.phone),
          name: contact.name ? String(contact.name) : null,
          agent: contact.agent ? String(contact.agent) : null,
        }
      });
    }).filter(Boolean);

    await Promise.all(createPromises);

    return NextResponse.json({ message: 'Contacts imported successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error importing contacts' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Se requiere un array de IDs.' }, { status: 400 });
    }

    // Delete associated calls first, then contacts
    await prisma.call.deleteMany({ where: { contactId: { in: ids } } });
    const result = await prisma.contact.deleteMany({ where: { id: { in: ids } } });

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Error al eliminar los registros.' }, { status: 500 });
  }
}
