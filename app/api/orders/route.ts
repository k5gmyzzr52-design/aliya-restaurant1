import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;
import { readJson } from '@/lib/json-db';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
export const dynamic = 'force-dynamic';

const MIN_ORDER = 60;
const DELIVERY_FEE = 12;
const FREE_DELIVERY_FROM = 200;

interface Device {
  id: string;
  name: string;
  createdAt: string;
}

async function isAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('x-device-token');
  if (!token) return false;
  const devices = await readJson<Device[]>('devices.json', []);
  return devices.some(d => d.id === token);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer, paymentMethod, blikCode } = body;

    if (!Array.isArray(items) || items.length === 0)
      return NextResponse.json({ ok: false, error: 'Pusty koszyk' }, { status: 400 });

    if (!customer?.name || !customer?.phone || !customer?.street || !customer?.building || !customer?.postal || !customer?.city)
      return NextResponse.json({ ok: false, error: 'Brak wymaganych danych' }, { status: 400 });

    if (!/^\+?\d[\d\s-]{7,}$/.test(customer.phone))
      return NextResponse.json({ ok: false, error: 'Nieprawidłowy telefon' }, { status: 400 });

    if (!/^\d{2}-\d{3}$/.test(customer.postal))
      return NextResponse.json({ ok: false, error: 'Nieprawidłowy kod pocztowy' }, { status: 400 });

    const validMethods = ['blik', 'card', 'transfer', 'cash', 'card_courier'];
    if (!validMethods.includes(paymentMethod))
      return NextResponse.json({ ok: false, error: 'Nieprawidłowa metoda płatności' }, { status: 400 });

    if (paymentMethod === 'blik' && !/^\d{6}$/.test(blikCode || ''))
      return NextResponse.json({ ok: false, error: 'Kod BLIK musi mieć 6 cyfr' }, { status: 400 });

    const subtotal = items.reduce((s: number, i: any) => s + Number(i.price) * Number(i.qty), 0);

    if (subtotal < MIN_ORDER)
      return NextResponse.json({ ok: false, error: `Min. zamówienie ${MIN_ORDER} zł` }, { status: 400 });

    const delivery = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
    const total = subtotal + delivery;
    const id = 'ALIYA-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    await prisma.order.create({
      data: {
        id,
        status: 'new',
        paymentStatus: paymentMethod === 'cash' || paymentMethod === 'card_courier' ? 'cod' : 'pending',
        paymentMethod,
        subtotal,
        delivery,
        total,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        street: customer.street,
        building: customer.building,
        apt: customer.apt,
        postal: customer.postal,
        city: customer.city,
        notes: customer.notes,
        items: {
          create: items.map((i: any) => ({
            name: i.name,
            price: Number(i.price),
            qty: Number(i.qty),
          })),
        },
      },
    });

    return NextResponse.json({ ok: true, id, total });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

 return NextResponse.json(
    orders.map((o: OrderWithItems) => ({
      id: o.id,
      status: o.status,
      createdAt: o.createdAt,
      total: o.total,
      customer: {
        name: o.customerName,
        phone: o.customerPhone,
        email: o.customerEmail ?? null,
        table: null,
        notes: o.notes ?? null,
      },
      items: o.items.map(i => ({
        name: i.name,
        price: i.price,
        qty: i.qty,
      })),
    }))
  );
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const { id, status, paymentStatus } = await req.json();

  const validStatuses = ['new', 'in_progress', 'done', 'cancelled'];
  if (status && !validStatuses.includes(status))
    return NextResponse.json({ ok: false, error: 'Nieprawidłowy status' }, { status: 400 });

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ ok: false, error: 'Nie znaleziono' }, { status: 404 });

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
    },
    include: { items: true },
  });

  return NextResponse.json({ ok: true, order: updated });
}