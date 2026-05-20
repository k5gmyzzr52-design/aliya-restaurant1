import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db';
import crypto from 'crypto';

interface Order {
  id: string;
  items: { id: number; name: string; price: number; qty: number }[];
  total: number;
  customer: { name: string; phone: string; table?: string; notes?: string };
  status: 'new' | 'in_progress' | 'done' | 'cancelled';
  createdAt: string;
}

function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-device-token');
  if (!token) return false;
  const devices = readJSON<{id:string}[]>('devices.json', []);
  return devices.some(d => d.id === token);
}

// POST – klient składa zamówienie (publiczne)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const orders = readJSON<Order[]>('orders.json', []);
  const order: Order = {
    id: crypto.randomBytes(6).toString('hex'),
    items: body.items || [],
    total: body.total || 0,
    customer: body.customer || { name: '', phone: '' },
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  writeJSON('orders.json', orders);
  return NextResponse.json({ ok: true, id: order.id });
}

// GET – tylko admin
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json(readJSON<Order[]>('orders.json', []));
}

// PATCH – zmiana statusu (admin)
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const { id, status } = await req.json();
  const orders = readJSON<Order[]>('orders.json', []);
  const o = orders.find(x => x.id === id);
  if (!o) return NextResponse.json({ ok: false }, { status: 404 });
  o.status = status;
  writeJSON('orders.json', orders);
  return NextResponse.json({ ok: true });
}

// DELETE – usuń zamówienie
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await req.json();
  let orders = readJSON<Order[]>('orders.json', []);
  orders = orders.filter(x => x.id !== id);
  writeJSON('orders.json', orders);
  return NextResponse.json({ ok: true });
}