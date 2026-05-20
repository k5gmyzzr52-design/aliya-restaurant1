import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, Reservation } from '@/lib/db';
import crypto from 'crypto';

const MAX_GUESTS = 20;
const OPEN_HOUR = 12;
const CLOSE_HOUR = 22;

interface Device { id: string; name: string; createdAt: string; }

function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get('x-device-token');
  if (!token) return false;
  const devices = readJSON<Device[]>('devices.json', []);
  return devices.some(d => d.id === token);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, date, time, guests } = body;

    if (!customer?.name || !customer?.phone)
      return NextResponse.json({ ok: false, error: 'Brak wymaganych danych' }, { status: 400 });

    if (!/^\+?\d[\d\s-]{7,}$/.test(customer.phone))
      return NextResponse.json({ ok: false, error: 'Nieprawidłowy telefon' }, { status: 400 });

    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))
      return NextResponse.json({ ok: false, error: 'Nieprawidłowy email' }, { status: 400 });

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || ''))
      return NextResponse.json({ ok: false, error: 'Nieprawidłowa data (YYYY-MM-DD)' }, { status: 400 });

    if (!/^\d{2}:\d{2}$/.test(time || ''))
      return NextResponse.json({ ok: false, error: 'Nieprawidłowa godzina (HH:MM)' }, { status: 400 });

    const when = new Date(`${date}T${time}:00`);
    if (isNaN(when.getTime()) || when.getTime() < Date.now())
      return NextResponse.json({ ok: false, error: 'Termin musi być w przyszłości' }, { status: 400 });

    const hour = parseInt(time.split(':')[0], 10);
    if (hour < OPEN_HOUR || hour > CLOSE_HOUR)
      return NextResponse.json({ ok: false, error: `Rezerwacje ${OPEN_HOUR}:00–${CLOSE_HOUR}:00` }, { status: 400 });

    const guestsNum = Number(guests);
    if (!Number.isInteger(guestsNum) || guestsNum < 1 || guestsNum > MAX_GUESTS)
      return NextResponse.json({ ok: false, error: `Liczba osób: 1–${MAX_GUESTS}` }, { status: 400 });

    const id = 'RES-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const reservation: Reservation = {
      id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      date,
      time,
      guests: guestsNum,
      customer: {
        name: String(customer.name).slice(0, 100),
        phone: String(customer.phone).slice(0, 30),
        email: customer.email ? String(customer.email).slice(0, 120) : undefined,
        notes: customer.notes ? String(customer.notes).slice(0, 500) : undefined,
      },
    };

    const reservations = readJSON<Reservation[]>('reservations.json', []);
    reservations.unshift(reservation);
    writeJSON('reservations.json', reservations);

    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// ⚠️ TABLICA BEZPOŚREDNIO — admin robi setReservations(await r.json())
export async function GET(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const reservations = readJSON<Reservation[]>('reservations.json', []);
  return NextResponse.json(reservations);
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await req.json();
  const validStatuses = ['pending','confirmed','completed','cancelled'];
  if (status && !validStatuses.includes(status))
    return NextResponse.json({ ok: false, error: 'Nieprawidłowy status' }, { status: 400 });

  const reservations = readJSON<Reservation[]>('reservations.json', []);
  const idx = reservations.findIndex(r => r.id === id);
  if (idx === -1)
    return NextResponse.json({ ok: false, error: 'Nie znaleziono' }, { status: 404 });

  if (status) reservations[idx].status = status;
  writeJSON('reservations.json', reservations);
  return NextResponse.json({ ok: true, reservation: reservations[idx] });
}