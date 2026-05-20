"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogOut, RefreshCw, CheckCircle, Clock, X, Phone, Hash, Sparkles } from 'lucide-react';

const STATUS_LABELS: Record<string,string> = {
  new: 'Nowe', in_progress: 'W realizacji', done: 'Zrealizowane', cancelled: 'Anulowane'
};
const STATUS_COLORS: Record<string,string> = {
  new: 'from-amber-400 to-orange-500',
  in_progress: 'from-blue-400 to-cyan-500',
  done: 'from-emerald-400 to-green-500',
  cancelled: 'from-zinc-500 to-zinc-700'
};

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [code, setCode] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('new');

  // Inject fonts (jak na głównej)
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@200;300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  // Check token on mount
  useEffect(() => {
    const t = localStorage.getItem('aliya_device_token');
    if (!t) { setAuthChecked(true); return; }
    fetch('/api/auth/device', { headers: { 'x-device-token': t } })
      .then(r => r.ok ? setToken(t) : localStorage.removeItem('aliya_device_token'))
      .finally(() => setAuthChecked(true));
  }, []);

  // Load orders
  const loadOrders = async () => {
    if (!token) return;
    const r = await fetch('/api/orders', { headers: { 'x-device-token': token } });
    if (r.ok) setOrders(await r.json());
  };
  useEffect(() => { if (token) { loadOrders(); const i = setInterval(loadOrders, 8000); return () => clearInterval(i); } }, [token]);

  const pair = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const r = await fetch('/api/auth/device', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ code, name: deviceName || 'Urządzenie' })
    });
    const d = await r.json();
    if (d.ok) {
      localStorage.setItem('aliya_device_token', d.token);
      setToken(d.token);
    } else setError(d.error || 'Błąd');
  };

  const logout = async () => {
    if (!token) return;
    await fetch('/api/auth/device', { method:'DELETE', headers: { 'x-device-token': token } });
    localStorage.removeItem('aliya_device_token');
    setToken(null);
  };

  const setStatus = async (id: string, status: string) => {
    await fetch('/api/orders', {
      method: 'PATCH', headers: {'Content-Type':'application/json','x-device-token': token!},
      body: JSON.stringify({ id, status })
    });
    loadOrders();
  };

  const styles = `
    .font-serif-lux { font-family: 'Cormorant Garamond', serif; }
    .gradient-gold { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    .glow-gold { box-shadow: 0 0 40px rgba(251,191,36,0.3); }
    .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
    .glass-gold { background: rgba(251,191,36,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(251,191,36,0.2); }
  `;

  if (!authChecked) return <div className="min-h-screen bg-black" />;

  // === LOGIN ===
  if (!token) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6" style={{ fontFamily:'Inter, sans-serif' }}>
      <style>{styles}</style>
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"></div>
      
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative glass rounded-3xl p-10 max-w-md w-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-12 bg-amber-400"></div>
          <span className="text-amber-400 text-xs tracking-[0.3em]">PANEL ADMINA</span>
        </div>
        <h1 className="font-serif-lux text-5xl font-light mb-2">Sparuj <span className="italic gradient-gold">urządzenie</span></h1>
        <p className="text-zinc-400 text-sm mb-8">Wprowadź kod parowania, aby zalogować to urządzenie. Kod wpisujesz tylko raz.</p>

        <form onSubmit={pair} className="space-y-5">
          <div>
            <label className="text-xs text-zinc-500 tracking-wider mb-2 block">NAZWA URZĄDZENIA</label>
            <input value={deviceName} onChange={e => setDeviceName(e.target.value)} placeholder="np. Tablet baru"
              className="w-full bg-transparent border-b border-white/20 py-3 outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 tracking-wider mb-2 block">KOD PAROWANIA</label>
            <input type="password" value={code} onChange={e => setCode(e.target.value)} required
              className="w-full bg-transparent border-b border-white/20 py-3 outline-none focus:border-amber-400" />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold tracking-wider glow-gold flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> SPARUJ URZĄDZENIE
          </motion.button>
        </form>
      </motion.div>
    </div>
  );

  // === ADMIN ===
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily:'Inter, sans-serif' }}>
      <style>{styles}</style>
      
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-amber-400/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-bold text-black text-lg overflow-hidden">
  <img src="/aliya-logo1.png" alt="Aliya" className="w-full h-full object-cover" />
</div>
            <div>
              <div className="font-serif-lux text-2xl gradient-gold font-semibold">ALIYA</div>
              <div className="text-xs text-zinc-500 tracking-widest">PANEL ADMINA</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={loadOrders} className="w-11 h-11 rounded-full glass flex items-center justify-center text-amber-400">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={logout} className="px-5 py-2 rounded-full glass text-zinc-300 hover:text-amber-400 flex items-center gap-2 text-sm">
              <LogOut className="w-4 h-4" /> Wyloguj
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tytuł + filtry */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-amber-400"></div>
            <span className="text-amber-400 text-xs tracking-[0.3em]">ZAMÓWIENIA</span>
          </div>
          <h2 className="font-serif-lux text-5xl font-light mb-8">Lista <span className="italic gradient-gold">zamówień</span></h2>

          <div className="flex flex-wrap gap-3">
            {['all','new','in_progress','done','cancelled'].map(s => {
              const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
              const active = filter === s;
              return (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-5 py-2.5 rounded-full text-sm tracking-wider transition-all ${active ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold glow-gold' : 'glass text-zinc-300 hover:text-amber-400'}`}>
                  {s === 'all' ? 'Wszystkie' : STATUS_LABELS[s]} <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-500 font-serif-lux text-2xl italic">Brak zamówień</div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map(o => (
              <motion.div key={o.id}
                layout
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className="glass rounded-2xl p-6 relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${STATUS_COLORS[o.status]}`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs text-amber-400 tracking-widest flex items-center gap-1">
                      <Hash className="w-3 h-3" /> {o.id.toUpperCase()}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">{new Date(o.createdAt).toLocaleString('pl-PL')}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${STATUS_COLORS[o.status]} text-black font-semibold`}>
                    {STATUS_LABELS[o.status]}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="font-serif-lux text-xl">{o.customer.name}</div>
                  <a href={`tel:${o.customer.phone}`} className="text-amber-400 text-sm flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" /> {o.customer.phone}
                  </a>
                  {o.customer.table && <div className="text-zinc-400 text-sm mt-1">Stolik: <span className="text-white">{o.customer.table}</span></div>}
                  {o.customer.notes && <div className="text-zinc-400 text-sm mt-2 italic">„{o.customer.notes}"</div>}
                </div>

                <div className="border-t border-white/10 pt-4 mb-4 space-y-1">
                  {o.items.map((it:any, i:number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-zinc-300">{it.qty}× {it.name}</span>
                      <span className="text-amber-400">{it.price * it.qty} zł</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-baseline mb-4 pt-2 border-t border-white/10">
                  <span className="text-xs text-zinc-500 tracking-wider">RAZEM</span>
                  <span className="font-serif-lux text-2xl gradient-gold font-semibold">{o.total} PLN</span>
                </div>

                <div className="flex gap-2">
                  {o.status === 'new' && (
                    <button onClick={() => setStatus(o.id, 'in_progress')}
                      className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 text-black text-xs font-semibold tracking-wider flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> PRZYJMIJ
                    </button>
                  )}
                  {o.status === 'in_progress' && (
                    <button onClick={() => setStatus(o.id, 'done')}
                      className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 text-black text-xs font-semibold tracking-wider flex items-center justify-center gap-1">
                      <CheckCircle className="w-3 h-3" /> ZREALIZUJ
                    </button>
                  )}
                  {(o.status === 'new' || o.status === 'in_progress') && (
                    <button onClick={() => setStatus(o.id, 'cancelled')}
                      className="px-4 py-2.5 rounded-full glass text-zinc-400 hover:text-red-400 text-xs">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}