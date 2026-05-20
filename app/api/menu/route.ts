import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/db';

function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-device-token');
  if (!token) return false;
  const devices = readJson<{id:string}[]>('devices.json', []);
  return devices.some(d => d.id === token);
}

export async function GET() {
  return NextResponse.json(readJson('menu.json', null));
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json();
  writeJson('menu.json', body);
  return NextResponse.json({ ok: true });
}