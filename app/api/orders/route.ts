import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson, Order } from '@/lib/db';
import crypto from 'crypto';

const MIN_ORDER = 60;
const DELIVERY_FEE = 12;
const FREE_DELIVERY_FROM = 200;

interface Device { id: string; name: string; createdAt: string; }

// Ten sam mechanizm co w /api/auth/device
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

    if (!customer?.name || !customer?.phone || !customer?.street ||
        !customer?.building || !customer?.postal || !customer?.city)
      return NextResponse.json({ ok: false, error: 'Brak wymaganych danych' }, { status: 400 });

    if (!/^\+?\d[\d\s-]{7,}$/.test(customer.phone))
      return NextResponse.json({ ok: false, error: 'Nieprawidłowy telefon' }, { status: 400 });

    if (!/^\d{2}-\d{3}$/.test(customer.postal))
      return NextResponse.json({ ok: false, error: 'Nieprawidłowy kod pocztowy' }, { status: 400 });

    const validMethods = ['blik','card','transfer','cash','card_courier'];
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

    const order: Order = {
      id,
      createdAt: new Date().toISOString(),
      status: 'new',
      paymentStatus: paymentMethod === 'cash' || paymentMethod === 'card_courier' ? 'cod' : 'pending',
      paymentMethod,
      blikCode: paymentMethod === 'blik' ? blikCode : undefined,
      items, subtotal, delivery, total, customer,
    };

    const orders = await readJson<Order[]>('orders.json', []);
    orders.unshift(order);
    writeJson('orders.json', orders);

    return NextResponse.json({ ok: true, id, total });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// ⚠️ TABLICA BEZPOŚREDNIO — admin robi setOrders(await r.json())
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const orders = readJson<Order[]>('orders.json', []);
  return NextResponse.json(orders);
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const { id, status, paymentStatus } = await req.json();
  const validStatuses = ['new','in_progress','done','cancelled'];
  if (status && !validStatuses.includes(status))
    return NextResponse.json({ ok: false, error: 'Nieprawidłowy status' }, { status: 400 });

  const orders = await readJson<Order[]>('orders.json', []);
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1)
    return NextResponse.json({ ok: false, error: 'Nie znaleziono' }, { status: 404 });

  if (status) orders[idx].status = status;
  if (paymentStatus) orders[idx].paymentStatus = paymentStatus;
  writeJson('orders.json', orders);
  return NextResponse.json({ ok: true, order: orders[idx] });
}