import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/json-db';
import crypto from 'crypto';

const MASTER = process.env.MASTER_PAIR_CODE || 'aliya2025';

interface Device { id: string; name: string; createdAt: string; }

// POST { code, name } -> sparowanie nowego urządzenia
export async function POST(req: NextRequest) {
  const { code, name } = await req.json();
  if (code !== MASTER) {
    return NextResponse.json({ ok: false, error: 'Nieprawidłowy kod' }, { status: 401 });
  }
  const devices = await readJson<Device[]>('devices.json', []);
  const id = crypto.randomBytes(24).toString('hex');
  devices.push({ id, name: name || 'Urządzenie', createdAt: new Date().toISOString() });
  await writeJson('devices.json', devices);
  return NextResponse.json({ ok: true, token: id });
}

// GET -> sprawdzenie tokenu (header: x-device-token)
export async function GET(req: NextRequest) {
  const token = req.headers.get('x-device-token');
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const devices = await readJson<Device[]>('devices.json', []);
  const found = devices.find(d => d.id === token);
  if (!found) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, device: { name: found.name, createdAt: found.createdAt } });
}

// DELETE -> wylogowanie urządzenia (sam siebie kasuje)
export async function DELETE(req: NextRequest) {
  const token = req.headers.get('x-device-token');
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const devices = await readJson<Device[]>('devices.json', []);
  await writeJson('devices.json', devices.filter(d => d.id !== token));
  return NextResponse.json({ ok: true });
}