import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch {}
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDir();
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
    return JSON.parse(raw);
  } catch { return fallback; }
}

export async function writeJson(file: string, data: any) {
  await ensureDir();
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8');
}

export type Order = {
  id: string;
  createdAt: string;
  status: 'new' | 'confirmed' | 'preparing' | 'delivering' | 'done' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cod';
  paymentMethod: 'blik' | 'card' | 'transfer' | 'cash' | 'card_courier';
  blikCode?: string;
  items: { id: string; name: string; price: number; qty: number }[];
  subtotal: number;
  delivery: number;
  total: number;
  customer: {
    name: string; phone: string; email?: string;
    street: string; building: string; apt?: string;
    postal: string; city: string; notes?: string;
  };
};
export type Reservation = {
  id: string;
  createdAt: string;
  status: 'new' | 'confirmed' | 'cancelled' | 'done';
  date: string;     // YYYY-MM-DD
  time: string;     // HH:MM
  people: number;
  notes: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
};
