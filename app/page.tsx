"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Phone, MapPin, Clock, Mail, ChevronRight, Star, Menu as MenuIcon, X, ArrowUpRight, Play, Sparkles, Award, Flame, Wine, ChefHat, Globe, Share2, Utensils, Truck, CreditCard, Banknote, Smartphone, Leaf, CheckCircle2 } from 'lucide-react';

export default function AliyaRestaurant() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // CART + CHECKOUT
  const [cart, setCart] = useState<{id:string; name:string; price:number; qty:number; img?:string}[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [orderSent, setOrderSent] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    street: '', building: '', apt: '',
    postal: '', city: 'Warszawa',
    notes: '',
    payment: 'blik' as 'blik' | 'card' | 'transfer' | 'cash' | 'card_courier',
    blikCode: '',
    consent: false,
    age18: false,
  });

  // DELIVERY CONFIG
  const MIN_ORDER = 60;
  const DELIVERY_FEE = 12;
  const FREE_DELIVERY_FROM = 200;

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    setMounted(true);
    const handleMouse = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 30);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 30);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@200;300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch(e){} };
  }, []);

  // CART logic
  const addToCart = (item: any) => {
    setCart(c => {
      const ex = c.find(x => x.id === item.id);
      if (ex) return c.map(x => x.id === item.id ? {...x, qty: x.qty+1} : x);
      return [...c, { id: item.id, name: item.name, price: Number(item.price), qty: 1, img: item.img }];
    });
    setCartOpen(true);
  };
  const updateQty = (id: string, d: number) =>
    setCart(c => c.map(x => x.id === id ? {...x, qty: Math.max(0, x.qty + d)} : x).filter(x => x.qty > 0));

  const cartSubtotal = useMemo(() => cart.reduce((s,i) => s + i.price * i.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s,i) => s + i.qty, 0), [cart]);
  const deliveryFee = cartSubtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  const cartTotal = cartSubtotal + (cart.length ? deliveryFee : 0);
  const missingToMin = Math.max(0, MIN_ORDER - cartSubtotal);
  const missingToFree = Math.max(0, FREE_DELIVERY_FROM - cartSubtotal);

  const sendOrder = async () => {
    if (cartSubtotal < MIN_ORDER) return;
    if (!form.name || !form.phone || !form.street || !form.postal || !form.city) return;
    if (!form.consent) return;
    if (form.payment === 'blik' && form.blikCode.length !== 6) return;

    setProcessing(true);
    try {
      // ⬇️ Tu wpinasz prawdziwą bramkę: Przelewy24 / Tpay / Stripe / PayU
      // Przykładowy szkielet:
      // const r = await fetch('/api/checkout', {
      //   method: 'POST',
      //   headers: {'Content-Type':'application/json'},
      //   body: JSON.stringify({
      //     items: cart, subtotal: cartSubtotal, delivery: deliveryFee, total: cartTotal,
      //     customer: form, paymentMethod: form.payment,
      //   })
      // });
      // const data = await r.json();
      // if (data.redirectUrl) { window.location.href = data.redirectUrl; return; }

      // Symulacja:
      await new Promise(r => setTimeout(r, 1400));
      const id = 'PEACHES-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      setOrderSent(id);
      setCart([]);
      setCheckout(false);
      setForm({ ...form, blikCode: '', notes: '', consent: false, age18: false });
    } finally {
      setProcessing(false);
    }
  };

  // ===== CATEGORIES =====
  const categories = [
    { id: 'all', label: 'Wszystko', icon: Sparkles },
    { id: 'starters', label: 'Przystawki', icon: Flame },
    { id: 'sushi', label: 'Sushi', icon: Sparkles },
    { id: 'mains', label: 'Dania główne', icon: ChefHat },
    { id: 'seafood', label: 'Owoce morza', icon: Award },
    { id: 'pasta', label: 'Pasta', icon: Utensils },
    { id: 'salads', label: 'Sałatki', icon: Leaf },
    { id: 'steaks', label: 'Steki', icon: Flame },
    { id: 'kids', label: 'Dla dzieci', icon: Sparkles },
    { id: 'desserts', label: 'Desery', icon: Award },
    { id: 'drinks', label: 'Napoje', icon: Wine },
    { id: 'cocktails', label: 'Koktajle', icon: Wine },
  ];

  // ===== MENU (z menu na zdjęciach) =====
  type Item = { id: string; cat: string; name: string; desc?: string; price: number; img: string; tag?: string; vege?: boolean; spicy?: boolean };

  const menuItems: Item[] = [
    // PRZYSTAWKI
    { id: 'p1', cat: 'starters', name: 'Hot ebi tempura', desc: 'Krewetki w tempurze rozmiar 13-15 (6 szt.), spicy mayo, sos teriyaki', price: 53, img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', tag: 'Hit' },
    { id: 'p2', cat: 'starters', name: 'Cheesy cioppino', desc: 'Pieczone krewetki, ośmiornica, kalmary, chorizo, sos napolitana, czosnek, cebula, feta, grana padano, pieczywo', price: 54, img: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=800&q=80', tag: 'Spicy', spicy: true },
    { id: 'p3', cat: 'starters', name: 'Gyoza kurczak (5 szt.)', desc: 'Japońskie smażone pierożki, autorski sos, cebula prażona, chilli, szczypiorek, spicy-mayo', price: 38, img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80' },
    { id: 'p4', cat: 'starters', name: 'Beef trufle', desc: 'Smażone kawałki wołowiny, czosnek, cebula, trufla, śmietana, dymka, orzechy, pieczywo', price: 40, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', tag: 'Premium' },
    { id: 'p5', cat: 'starters', name: 'Tatar wołowy', desc: 'Żółtko, piklowane warzywa, musztarda francuska, pieczywo', price: 49, img: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=800&q=80', tag: 'Signature' },
    { id: 'p6', cat: 'starters', name: 'Mix warzyw tempura', desc: 'Mix warzyw w tempurze, spicy mayo i sos teriyaki', price: 28, img: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80', tag: 'Vege', vege: true },
    { id: 'p7', cat: 'starters', name: 'Vege falafel', desc: 'Własnoręcznie robiony falafel, sos napolitana, mango salsa, pita grecka, kiełki mung', price: 29, img: 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=800&q=80', tag: 'Vege', vege: true, spicy: true },

    // SUSHI
    { id: 's1', cat: 'sushi', name: 'Crispy uramaki z chicken chorizo', desc: 'Ogórek, serek, kanpyo, spicy mayo, sezam dressing, teriyaki, orzechy, dymka, prażona cebula, chilli, imbir, wasabi', price: 32, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80' },
    { id: 's2', cat: 'sushi', name: 'Crispy uramaki z łososiem', desc: 'Ogórek, serek, kanpyo, dymka, spicy mayo, sezam dressing, teriyaki, orzechy, imbir, wasabi', price: 35, img: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&q=80', tag: 'Hit' },
    { id: 's3', cat: 'sushi', name: 'Crispy uramaki z wołowiną', desc: 'Ogórek, serek, kanpyo, dymka, spicy mayo, sezam dressing, teriyaki, orzechy, imbir, wasabi', price: 37, img: 'https://images.unsplash.com/photo-1607301405390-d831c242f59b?w=800&q=80' },
    { id: 's4', cat: 'sushi', name: 'Tropical crunch uramaki', desc: 'Ogórek, serek, kanpyo, awokado, mango, apple chipotle, teriyaki, sezam dressing, imbir, wasabi', price: 29, img: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&q=80' },

    // DANIA GŁÓWNE
    { id: 'm1', cat: 'mains', name: 'Kottu rotti', desc: 'Tradycyjne danie kuchni Sri Lanka. Rotti, filet z kurczaka w sosie curry, jajko, mix warzyw, ser, cebula prażona, dymka', price: 49, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80', tag: 'Sri Lanka', spicy: true },
    { id: 'm2', cat: 'mains', name: 'Sri-lankan nice rice 2.0', desc: 'Ryż biriani, mix warzyw, chrupiący kurczak i wieprzowina w sosie słodko-kwaśno-ostrym, sezam, dymka, prażona cebula, jajko sadzone, raita, papadam, kolendra', price: 55, img: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80' },
    { id: 'm3', cat: 'mains', name: 'Cotoletta milanese', desc: 'Soczysty i chrupiący filet z kurczaka, sos napolitana, grana padano, rukola, orzechy, sos do wyboru', price: 42, img: 'https://images.unsplash.com/photo-1599921841143-819065280020?w=800&q=80' },
    { id: 'm4', cat: 'mains', name: "Gentleman's cut (250g)", desc: 'Grillowana polędwiczka wieprzowa, sos pieczarkowy, puree, grillowane warzywa', price: 55, img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80', tag: 'Premium' },
    { id: 'm5', cat: 'mains', name: 'Peaches na słodko/ostro (300g)', desc: 'Karkówka, sos bbq lub sos ostry, puree, grillowane warzywa', price: 52, img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80', tag: 'Signature' },
    { id: 'm6', cat: 'mains', name: 'Żeberka wieprzowe (700g)', desc: 'Na słodko/ostro - sos bbq lub sos ostry, mix sałat, lambweston frytki', price: 67, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', tag: 'BBQ' },
    { id: 'm7', cat: 'mains', name: 'Lahmacun mała', desc: 'Pizza arabska, mielone mięso wołowe, ser, pietruszka, cytryna', price: 39, img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80' },
    { id: 'm8', cat: 'mains', name: 'Lahmacun duża', desc: 'Pizza arabska, mielone mięso wołowe, ser, pietruszka, cytryna', price: 47, img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80' },
    { id: 'm9', cat: 'mains', name: 'Beef cheeks (200g)', desc: 'Policzki wołowe gotowane w czerwonym winie, puree, grillowane warzywa, red port sos', price: 68, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80', tag: 'Chef' },
    { id: 'm10', cat: 'mains', name: 'Classic cheese burger', desc: '100% mięso wołowe sezonowane (200g), cheddar, pomidor, ogórek, cebula czerwona, spicy mayo, ketchup, sałata, lambweston frytki', price: 45, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },

    // OWOCE MORZA
    { id: 'sf1', cat: 'seafood', name: 'Grillowany łosoś', desc: 'Łosoś norweski (200g), puree, grillowane warzywa, sos pesto', price: 66, img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80' },
    { id: 'sf2', cat: 'seafood', name: 'Mule z woka', desc: 'Mule (500g), cebula czerwona, masło, czosnek, chorizo, białe wino, pietruszka, kolendra, pomidorki koktajlowe, grana padano, pieczywo', price: 69, img: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80' },
    { id: 'sf3', cat: 'seafood', name: 'Colossal krewetki (4 szt.)', desc: 'Krewetki rozmiar 6-8, sos maślano-winny, czosnek, czerwona cebula, chorizo, pomidor, pietruszka, cytryna, kolendra, grana padano, pieczywo', price: 115, img: 'https://images.unsplash.com/photo-1625938145744-e380515399b7?w=800&q=80', tag: 'Premium' },
    { id: 'sf4', cat: 'seafood', name: 'Ocean delight (dla 2 osób)', desc: 'Mule (500g), colossal krewetki 4 szt., ośmiornica (150g), homar kanadyjski (350g), beurre blanc, chorizo, czosnek, cebula czerwona, kolendra, grana padano, pomidor, pieczywo', price: 430, img: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800&q=80', tag: '2 osoby' },

    // PASTA
    { id: 'pa1', cat: 'pasta', name: 'Ebi pasta', desc: 'Krewetki, makaron tagliatelle, sos słodkie chilli, śmietana, czosnek, szpinak, grana padano', price: 58, img: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80', spicy: true },
    { id: 'pa2', cat: 'pasta', name: 'Frutti di mare', desc: 'Krewetki, ośmiornica, kalmary, mule, makaron spaghetti, zielone oliwki, pomidory suszone, czosnek, czerwona cebula, białe wino, pietruszka, grana padano', price: 65, img: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80' },
    { id: 'pa3', cat: 'pasta', name: 'Cajun chicken', desc: 'Grillowany filet z kurczaka, makaron spaghetti, przyprawa cajun, mix warzyw, śmietana, szpinak, grana padano, orzechy', price: 49, img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80' },
    { id: 'pa4', cat: 'pasta', name: 'Wołowina z tagliatelle', desc: 'Wołowina, makaron tagliatelle, śmietana, trufla, demi-glace, rukola, orzechy, grana padano', price: 65, img: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80', tag: 'Hit' },
    { id: 'pa5', cat: 'pasta', name: 'Wegatelle', desc: 'Lekko pikantny sos pomidorowy, makaron tagliatelle, burrata, bazylia, rukola, grana padano', price: 47, img: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800&q=80', tag: 'Vege', vege: true },
    { id: 'pa6', cat: 'pasta', name: 'Pad thai (vege)', desc: 'Makaron ryżowy, tofu, orzechy, kiełki, pasta tamarind, kolendra', price: 45, img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80', tag: 'Vege', vege: true },
    { id: 'pa7', cat: 'pasta', name: 'Pad thai (kurczak)', desc: 'Makaron ryżowy, kurczak, orzechy, kiełki, pasta tamarind, kolendra', price: 49, img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80' },
    { id: 'pa8', cat: 'pasta', name: 'Pad thai (krewetki)', desc: 'Makaron ryżowy, krewetki, orzechy, kiełki, pasta tamarind, kolendra', price: 58, img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80' },

    // SAŁATKI
    { id: 'sa1', cat: 'salads', name: 'Poke bowl (vege)', desc: 'Sushi ryż, awokado, edamame, wakame goma, cebula prażona, teriyaki, sezam dressing', price: 36, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', vege: true },
    { id: 'sa2', cat: 'salads', name: 'Poke bowl (kurczak)', desc: 'Sushi ryż, kurczak, awokado, edamame, wakame goma, teriyaki, sezam dressing', price: 42, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' },
    { id: 'sa3', cat: 'salads', name: 'Poke bowl (krewetki)', desc: 'Sushi ryż, krewetki, awokado, edamame, wakame goma, teriyaki, sezam dressing', price: 47, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' },
    { id: 'sa4', cat: 'salads', name: 'Ebi salad', desc: 'Smażone krewetki na maśle, mix sałat, pomidor, czosnek, kapary, orzechy, grana padano, sweet chilli, pieczywo', price: 52, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80' },
    { id: 'sa5', cat: 'salads', name: 'Chix insla', desc: 'Filet z kurczaka, mix sałat, papryka, pomidor, sos słodko-kwaśny, curry mayo, orzechy, grana padano, pieczywo', price: 49, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' },
    { id: 'sa6', cat: 'salads', name: 'Di manzo', desc: 'Wołowina, mix sałat, pomidor, chilli, papryka, sezam, dymka, teriyaki, orzechy, grana padano, pieczywo', price: 62, img: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&q=80', spicy: true },

    // STEKI
    { id: 'st1', cat: 'steaks', name: 'Chateaubriand 500g (na 2 osoby)', desc: 'Najsmaczniejsza i najcenniejsza część polędwicy wołowej, chorizo, masło, puree, grillowane warzywa, sos do wyboru', price: 275, img: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800&q=80', tag: '2 osoby' },
    { id: 'st2', cat: 'steaks', name: 'Tournedo 200g', desc: 'Delikatny i wyjątkowo miękki stek, chorizo, masło, puree, grillowane warzywa, sos do wyboru', price: 125, img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80', tag: 'Premium' },
    { id: 'st3', cat: 'steaks', name: 'Antrykot (100g)', desc: 'Mięso z tuszy wołowej między kręgosłupem a żebrami, chorizo, masło. Cena za 100g, zalecana waga 400g.', price: 40, img: 'https://images.unsplash.com/photo-1607116176187-d4775eba51e9?w=800&q=80' },

    // DLA DZIECI
    { id: 'k1', cat: 'kids', name: 'Kurczak fingers', desc: 'Panierowane kurczaki fingers, lambweston frytki, mix sałat, ketchup', price: 27, img: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80' },
    { id: 'k2', cat: 'kids', name: 'Spaghetti napolitana', desc: 'Sos napolitana, makaron spaghetti, grana padano', price: 25, img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80' },

    // DESERY
    { id: 'd1', cat: 'desserts', name: 'Ice trio', desc: 'Trio lodów premium', price: 32, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80' },
    { id: 'd2', cat: 'desserts', name: 'Crème brûlée', desc: 'Klasyczne crème brûlée z lodami waniliowymi', price: 32, img: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&q=80', tag: 'Classic' },
    { id: 'd3', cat: 'desserts', name: 'Trufito 2.0', desc: 'Autorski deser czekoladowy', price: 32, img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80' },
    { id: 'd4', cat: 'desserts', name: 'Fondant czekoladowy', desc: 'Z lodami waniliowymi - płynne wnętrze', price: 32, img: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800&q=80', tag: 'Hit' },

    // NAPOJE
    { id: 'n1', cat: 'drinks', name: 'Sok świeżo wyciskany 250ml', desc: 'Pomarańcza lub grejpfrut', price: 19, img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80' },
    { id: 'n2', cat: 'drinks', name: 'Coca-cola 250ml', price: 10, img: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80' },
    { id: 'n3', cat: 'drinks', name: 'Coca-cola zero 250ml', price: 10, img: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80' },
    { id: 'n4', cat: 'drinks', name: 'Fanta 250ml', price: 10, img: 'https://images.unsplash.com/photo-1624552184280-9e9631bbeee9?w=800&q=80' },
    { id: 'n5', cat: 'drinks', name: 'Sprite 250ml', price: 10, img: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800&q=80' },
    { id: 'n6', cat: 'drinks', name: 'Tonic Kinley 250ml', price: 10, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
    { id: 'n7', cat: 'drinks', name: 'Karafka lemoniady owocowej 1l', desc: 'Mix owoców, mięta, cytryna, sprite', price: 37, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', tag: 'Hit' },
    { id: 'n8', cat: 'drinks', name: 'Karafka wody 1l', price: 15, img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80' },
    { id: 'n9', cat: 'drinks', name: 'Red Bull 250ml', price: 18, img: 'https://images.unsplash.com/photo-1613502743365-c8c1a7b4c8e9?w=800&q=80' },

    // KOKTAJLE
    { id: 'c1', cat: 'cocktails', name: 'Peaches Spritzzzz', desc: 'Wódka, białe wino, brzoskwinia, tonic różowy', price: 30, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80', tag: 'Signature' },
    { id: 'c2', cat: 'cocktails', name: 'Pornstar martini', desc: 'Wódka, marakuja, wanilia, limonka, prosecco', price: 30, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80' },
    { id: 'c3', cat: 'cocktails', name: 'Aperol spritz', desc: 'Prosecco, aperol, woda gazowana, pomarańcza', price: 32, img: 'https://images.unsplash.com/photo-1560963806-394fbe6f24a4?w=800&q=80' },
    { id: 'c4', cat: 'cocktails', name: 'Moje mojito', desc: 'Rum, sprite, mięta, limonka, cukier brązowy, woda gazowana', price: 32, img: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80' },
    { id: 'c5', cat: 'cocktails', name: 'Whisky sour', desc: 'Whisky, białko, cytryna, imbir, wanilia, miód', price: 38, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80' },
    { id: 'c6', cat: 'cocktails', name: 'Strawberry daiquiri', desc: 'Rum, truskawka, limonka, grenadyna', price: 39, img: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=800&q=80', tag: 'Hit' },
    { id: 'c7', cat: 'cocktails', name: 'Mojito Virgin (bezalk.)', desc: 'Sprite, mięta, limonka, cukier brązowy, woda gazowana', price: 25, img: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80', tag: '0%' },
    { id: 'c8', cat: 'cocktails', name: 'Lemoniada owocowa (bezalk.)', desc: 'Mix owoców, mięta, cytryna, sprite, woda gazowana', price: 24, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', tag: '0%' },
  ];

  const filteredMenu = activeCategory === 'all' ? menuItems : menuItems.filter(i => i.cat === activeCategory);

  const reviews = [
    { name: 'Anna K.', text: 'Najlepsze miejsce w Turku. Atmosfera jak z najlepszych restauracji w Warszawie. Każdy detal dopracowany do perfekcji.', rating: 5, role: 'Krytyk kulinarny' },
    { name: 'Michał W.', text: 'Tatar z truflą to czyste dzieło sztuki. Obsługa profesjonalna, wnętrze zachwyca, smaki niezapomniane.', rating: 5, role: 'Stały gość' },
    { name: 'Karolina P.', text: 'Romantyczna kolacja w Peaches to gwarancja niezapomnianego wieczoru. Cinematic experience na talerzu.', rating: 5, role: 'Food blogger' },
    { name: 'Tomasz B.', text: 'Premium poziom. Wino, jedzenie, muzyka, światło - wszystko gra w idealnej harmonii. Polecam każdemu.', rating: 5, role: 'Sommelier' },
  ];

  const gallery = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80',
    'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80',
    'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80',
  ];

  const paymentOptions = [
    { id: 'blik',         label: 'BLIK',                icon: Smartphone,  desc: 'Wpisz kod z aplikacji bankowej' },
    { id: 'card',         label: 'Karta online',        icon: CreditCard,  desc: 'Visa / Mastercard - bezpieczna płatność' },
    { id: 'transfer',     label: 'Szybki przelew',      icon: CreditCard,  desc: 'Przelewy24 / Tpay / PayU' },
    { id: 'card_courier', label: 'Karta u kuriera',     icon: CreditCard,  desc: 'Płać terminalem przy odbiorze' },
    { id: 'cash',         label: 'Gotówka u kuriera',   icon: Banknote,    desc: 'Płać przy odbiorze' },
  ] as const;

  return (
    <div className="bg-black text-white overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .font-serif-lux { font-family: 'Cormorant Garamond', serif; }
        .gradient-gold { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-flame { background: linear-gradient(135deg, #fb923c 0%, #ef4444 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .glow-gold { box-shadow: 0 0 40px rgba(251,191,36,0.3), 0 0 80px rgba(251,191,36,0.15); }
        .glow-flame { box-shadow: 0 0 40px rgba(251,146,60,0.4), 0 0 80px rgba(239,68,68,0.2); }
        .text-glow { text-shadow: 0 0 20px rgba(251,191,36,0.5); }
        .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .glass-gold { background: rgba(251,191,36,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(251,191,36,0.2); }
        @keyframes grain { 0%,100% {transform:translate(0,0)} 10%{transform:translate(-5%,-10%)} 30%{transform:translate(3%,-15%)} 50%{transform:translate(12%,9%)} 70%{transform:translate(9%,4%)} 90%{transform:translate(-1%,7%)} }
        .grain::after { content:''; position:absolute; inset:-100%; background-image: radial-gradient(circle at center, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 4px 4px; animation: grain 8s steps(10) infinite; pointer-events:none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .marquee { animation: marquee 30s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

      {/* DELIVERY BANNER */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-500/90 backdrop-blur-md text-black text-xs md:text-sm py-2 px-4 flex items-center justify-center gap-2 font-medium tracking-wider">
        <Truck className="w-4 h-4" />
        <span>DOSTAWA DO DOMU · MIN. {MIN_ORDER} ZŁ · DARMOWA OD {FREE_DELIVERY_FROM} ZŁ</span>
      </div>

      {/* NAV */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-8 left-0 right-0 z-50 glass"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-bold text-black text-lg">
                <img src="/peaches-logo.png" alt="Peaches" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 rounded-full border border-amber-400 animate-ping opacity-30"></div>
            </div>
            <div>
              <div className="font-serif-lux text-2xl tracking-wider gradient-gold font-semibold">PEACHES</div>
              <div className="text-xs text-zinc-500 -mt-1 tracking-widest">PREMIUM LOUNGE</div>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center gap-8 text-sm font-light tracking-wider">
            {['Menu', 'O nas', 'Specjalności', 'Galeria', 'Kontakt'].map(item => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="relative group text-zinc-300 hover:text-amber-400 transition-colors"
                whileHover={{ y: -2 }}
              >
                {item.toUpperCase()}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-amber-400 to-orange-500 group-hover:w-full transition-all duration-500"></span>
              </motion.a>
            ))}
          </div>

          <motion.a
            href="tel:799096723"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold text-sm tracking-wide glow-gold"
          >
            <Phone className="w-4 h-4" /> 22 230 21 90
          </motion.a>

          <button className="md:hidden text-amber-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <MenuIcon />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden glass"
            >
              <div className="px-6 py-6 flex flex-col gap-4">
                {['Menu', 'O nas', 'Specjalności', 'Galeria', 'Kontakt'].map(item => (
                  <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setMenuOpen(false)} className="text-zinc-300 hover:text-amber-400 tracking-wider">
                    {item.toUpperCase()}
                  </a>
                ))}
                <a href="tel:799096723" className="px-5 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold text-center">
                  22 230 21 90
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* HERO */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden grain pt-8">
        <motion.div style={{ y: heroY, scale: heroScale, opacity: heroOpacity }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900"></div>
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.4) contrast(1.2) saturate(1.1)'
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/80"></div>
        </motion.div>

        <div className="absolute inset-0 pointer-events-none">
          {mounted && [...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-amber-400"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                opacity: 0
              }}
              animate={{ y: [null, -100, -200], opacity: [0, 0.8, 0] }}
              transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 5 }}
              style={{ filter: 'blur(0.5px)', boxShadow: '0 0 6px #fbbf24' }}
            />
          ))}
        </div>

        <motion.div style={{ x: smoothMouseX, y: smoothMouseY }} className="absolute top-1/4 right-10 hidden lg:block">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="relative w-64 h-64">
            <div className="absolute inset-0 rounded-full border border-amber-400/30"></div>
            <div className="absolute inset-4 rounded-full border border-orange-500/20"></div>
            <div className="absolute inset-8 rounded-full border border-amber-400/10"></div>
            <div className="absolute inset-1/2 w-2 h-2 rounded-full bg-amber-400 -translate-x-1/2 -translate-y-1/2 glow-gold"></div>
          </motion.div>
        </motion.div>

        <div className="relative h-full flex flex-col justify-center max-w-7xl mx-auto px-6 z-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 1 }} className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-amber-400"></div>
            <span className="text-amber-400 text-xs tracking-[0.3em] font-light">DOSTAWA · WARSZAWA · STALOWA 36</span>
          </motion.div>

          <h1 className="font-serif-lux text-7xl md:text-9xl font-light leading-none tracking-tight">
            <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 1.2 }} className="block text-glow">Smak.</motion.span>
            <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 1.2 }} className="block gradient-gold italic">Sztuki.</motion.span>
            <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 1.2 }} className="block">Peaches.</motion.span>
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }} className="mt-8 max-w-xl text-zinc-400 text-lg font-light leading-relaxed">
            Premium kuchnia z dostawą do Twojego domu w Warszawie.
            BLIK, karta, szybki przelew - wybierz wygodną formę płatności.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 1 }} className="mt-12 flex flex-wrap gap-4">
            <motion.a
              href="#menu"
              whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(251,191,36,0.5)' }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-black font-semibold tracking-wide flex items-center gap-2"
              style={{ backgroundSize: '200% 100%' }}
            >
              <span className="relative z-10">ZAMÓW Z DOSTAWĄ</span>
              <Truck className="w-5 h-5 relative z-10" />
            </motion.a>

            <motion.a
              href="#menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 rounded-full glass text-white font-semibold tracking-wide flex items-center gap-3 border border-white/20 hover:border-amber-400/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center group-hover:bg-amber-400/40 transition-colors">
                <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
              </div>
              ZOBACZ MENU
            </motion.a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-xs tracking-[0.3em] text-zinc-500">SCROLL</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-px h-12 bg-gradient-to-b from-amber-400 to-transparent"></motion.div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="relative py-6 border-y border-white/5 bg-zinc-950 overflow-hidden">
        <div className="flex marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6 font-serif-lux text-3xl text-zinc-700">
              <span>DELIVERY</span>
              <Sparkles className="text-amber-400 w-5 h-5" />
              <span className="italic gradient-gold">Peaches Lounge</span>
              <Sparkles className="text-amber-400 w-5 h-5" />
              <span>BLIK · KARTA · PRZELEW</span>
              <Sparkles className="text-amber-400 w-5 h-5" />
              <span className="italic">Warszawa Stalowa 36</span>
              <Sparkles className="text-amber-400 w-5 h-5" />
              <span>FREE OVER {FREE_DELIVERY_FROM} PLN</span>
              <Sparkles className="text-amber-400 w-5 h-5" />
            </div>
          ))}
        </div>
      </div>

      {/* DELIVERY INFO STRIP */}
      <section className="py-12 px-6 bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: Truck, title: 'Szybka dostawa', desc: '30-60 min, Warszawa i okolice' },
            { icon: CreditCard, title: 'Bezpieczna płatność', desc: 'BLIK · Karta · Przelew · Gotówka' },
            { icon: Award, title: 'Premium jakość', desc: 'Świeże składniki, autorskie przepisy' },
          ].map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-full glass-gold flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="font-serif-lux text-2xl">{b.title}</div>
                  <div className="text-zinc-400 text-sm">{b.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* MENU */}
      <section id="menu" className="relative py-32 px-6 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12 bg-amber-400"></div>
              <span className="text-amber-400 text-xs tracking-[0.3em]">MENU · DOSTAWA</span>
              <div className="h-px w-12 bg-amber-400"></div>
            </div>
            <h2 className="font-serif-lux text-5xl md:text-7xl font-light">
              Sztuka <span className="italic gradient-gold">smaku</span>
            </h2>
            <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
              Dodaj do koszyka i zamów z dostawą do domu. Min. zamówienie {MIN_ORDER} zł.
            </p>
          </motion.div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map(cat => {
              const Icon = cat.icon;
              const active = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-full text-xs md:text-sm tracking-wider flex items-center gap-2 transition-all ${
                    active ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold glow-gold' : 'glass text-zinc-300 hover:text-amber-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </motion.button>
              );
            })}
          </div>

          {/* Menu Grid */}
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredMenu.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ delay: i * 0.03, duration: 0.5 }}
                  whileHover={{ y: -10 }}
                  className="group relative overflow-hidden rounded-2xl glass cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <motion.img src={item.img} alt={item.name} className="w-full h-full object-cover" whileHover={{ scale: 1.1 }} transition={{ duration: 0.7 }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

                    <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                      {item.tag && <div className="px-3 py-1 rounded-full glass-gold text-xs text-amber-400 tracking-wider">{item.tag}</div>}
                      {item.vege && <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs text-emerald-300 tracking-wider flex items-center gap-1"><Leaf className="w-3 h-3" /> VEGE</div>}
                      {item.spicy && <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-xs text-red-300 tracking-wider">🌶 SPICY</div>}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-serif-lux text-xl md:text-2xl font-medium">{item.name}</h3>
                      <div className="text-right shrink-0">
                        <div className="font-serif-lux text-2xl gradient-gold font-semibold">{item.price}</div>
                        <div className="text-xs text-zinc-500">PLN</div>
                      </div>
                    </div>
                    {item.desc && <p className="text-zinc-400 text-sm font-light leading-relaxed flex-1">{item.desc}</p>}

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400" />)}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold tracking-wider flex items-center gap-1"
                      >
                        + DO KOSZYKA
                      </motion.button>
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-2xl ring-1 ring-amber-400/0 group-hover:ring-amber-400/30 transition-all pointer-events-none"></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* OPINIE */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12 bg-amber-400"></div>
              <span className="text-amber-400 text-xs tracking-[0.3em]">CO MÓWIĄ GOŚCIE</span>
              <div className="h-px w-12 bg-amber-400"></div>
            </div>
            <h2 className="font-serif-lux text-5xl md:text-7xl font-light">
              Głosy <span className="italic gradient-gold">koneserów</span>
            </h2>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={activeReview} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="glass rounded-3xl p-10 md:p-16 text-center relative">
                <div className="absolute top-6 left-6 font-serif-lux text-8xl gradient-gold opacity-30 leading-none">&quot;</div>
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(reviews[activeReview].rating)].map((_, i) => (<Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />))}
                </div>
                <p className="font-serif-lux text-2xl md:text-4xl font-light italic leading-relaxed mb-8 max-w-3xl mx-auto">{reviews[activeReview].text}</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-bold text-black text-xl">{reviews[activeReview].name[0]}</div>
                  <div className="text-left">
                    <div className="font-semibold">{reviews[activeReview].name}</div>
                    <div className="text-xs text-amber-400 tracking-wider">{reviews[activeReview].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-3 mt-8">
              {reviews.map((_, i) => (
                <button key={i} onClick={() => setActiveReview(i)} className={`h-1 rounded-full transition-all ${i === activeReview ? 'w-12 bg-amber-400' : 'w-6 bg-zinc-700'}`}></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12 bg-amber-400"></div>
              <span className="text-amber-400 text-xs tracking-[0.3em]">GALERIA</span>
              <div className="h-px w-12 bg-amber-400"></div>
            </div>
            <h2 className="font-serif-lux text-5xl md:text-7xl font-light">
              Wizualna <span className="italic gradient-gold">poezja</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
                whileHover={{ y: -8 }}
                onClick={() => setLightbox(img)}
                className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
                  i === 0 ? 'col-span-2 row-span-2 aspect-square' : i === 3 ? 'aspect-[3/4]' : i === 5 ? 'aspect-[3/4]' : 'aspect-square'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {lightbox && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
              <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} src={lightbox} className="max-w-full max-h-full rounded-2xl" alt="" />
              <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 w-12 h-12 rounded-full glass flex items-center justify-center text-amber-400"><X /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* KONTAKT */}
      <section id="kontakt" className="relative py-32 px-6 bg-gradient-to-b from-black to-zinc-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-96 rounded-full bg-amber-500/5 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12 bg-amber-400"></div>
              <span className="text-amber-400 text-xs tracking-[0.3em]">KONTAKT</span>
              <div className="h-px w-12 bg-amber-400"></div>
            </div>
            <h2 className="font-serif-lux text-5xl md:text-7xl font-light">
              Zadzwoń <span className="italic gradient-gold">lub zamów</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass rounded-3xl p-8">
              <h3 className="font-serif-lux text-3xl mb-6">Znajdź nas</h3>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: 'Adres', value: 'Stalowa 36, 00-812 Warszawa' },
                  { icon: Phone, label: 'Telefon', value: '22 230 21 90', href: 'tel:222302190' },
                  { icon: Mail, label: 'Email', value: 'peaches.gastrogirls@gmail.com' },
                  { icon: Clock, label: 'Dostawa', value: 'Wt-Czw: 13:00 - 22:00\nNiedziela 13:00 21:00\nPoniedziałek: Zamknięte' },
                  { icon: Truck, label: 'Strefa dostawy', value: 'Warszawa ' },
                ].map((info, i) => {
                  const Icon = info.icon;
                  const Tag: any = info.href ? 'a' : 'div';
                  return (
                    <Tag key={i} href={info.href} className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-full glass-gold flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-xs text-amber-400 tracking-wider mb-1">{info.label.toUpperCase()}</div>
                        <div className="text-zinc-200 whitespace-pre-line">{info.value}</div>
                      </div>
                    </Tag>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass rounded-3xl p-2 overflow-hidden">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900">
                  <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=21.04037940502167%2C52.25987069849973%2C21.045400500297546%2C52.26208697770061"
                    className="w-full h-full opacity-80 grayscale"
                    style={{ filter: 'invert(0.92) hue-rotate(180deg)' }}
                    title="Mapa"
                  ></iframe>
                  <div className="absolute top-4 left-4 glass-gold rounded-full px-4 py-2 flex items-center gap-2 pointer-events-none">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span className="text-sm">Stalowa 36, Warszawa</span>
                  </div>
                </div>
              </div>

              <motion.a href="tel:222302190" whileHover={{ scale: 1.02 }} className="block glass-gold rounded-3xl p-6 text-center group">
                <div className="text-xs text-amber-400 tracking-widest mb-2">ZADZWOŃ TERAZ</div>
                <div className="font-serif-lux text-4xl gradient-gold font-semibold">22 230 21 90</div>
              </motion.a>

              <motion.a href="#menu" whileHover={{ scale: 1.02 }} className="block bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-6 text-center text-black">
                <div className="text-xs tracking-widest mb-2 opacity-80">LUB</div>
                <div className="font-serif-lux text-3xl font-bold flex items-center justify-center gap-2">
                  <Truck className="w-7 h-7" /> ZAMÓW Z DOSTAWĄ
                </div>
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-bold text-black">
                  <img src="/peaches-logo.png" alt="Peaches" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-serif-lux text-2xl gradient-gold font-semibold">PEACHES</div>
                  <div className="text-xs text-zinc-500 tracking-widest">PREMIUM LOUNGE</div>
                </div>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">Premium gastronomy z dostawą do domu. Smak, sztuka, atmosfera.</p>
            </div>
            <div>
              <h4 className="text-amber-400 text-xs tracking-widest mb-4">NAWIGACJA</h4>
              <ul className="space-y-2 text-sm">
                {['Menu', 'Galeria', 'Kontakt'].map(item => (
                  <li key={item}><a href={`#${item.toLowerCase()}`} className="text-zinc-400 hover:text-amber-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-amber-400 text-xs tracking-widest mb-4">KONTAKT</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>Stalowa 36</li>
                <li>00-812 Warszawa</li>
                <li><a href="tel:222302190" className="hover:text-amber-400">22 230 21 90</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-amber-400 text-xs tracking-widest mb-4">PŁATNOŚCI</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">BLIK, karta Visa/Mastercard, szybki przelew online, gotówka u kuriera, karta u kuriera.</p>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-zinc-600 text-xs tracking-wider">© 2026 PEACHES PREMIUM LOUNGE.</div>
            <div className="flex gap-6 text-xs text-zinc-600">
              <a href="#" className="hover:text-amber-400">POLITYKA PRYWATNOŚCI</a>
              <a href="#" className="hover:text-amber-400">REGULAMIN</a>
            </div>
          </div>
        </div>
      </footer>

      {/* CART FAB */}
      <AnimatePresence>
        {cartCount > 0 && !cartOpen && !checkout && !orderSent && (
          <motion.button
            initial={{ scale: 0, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 100 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-8 right-8 z-50 px-6 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black flex items-center gap-3 glow-gold shadow-2xl font-semibold"
          >
            <Utensils className="w-5 h-5" />
            <span>{cartCount} szt. · {cartSubtotal} zł</span>
            <span className="w-7 h-7 rounded-full bg-black text-amber-400 text-xs font-bold flex items-center justify-center">→</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md" onClick={() => setCartOpen(false)}>
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-amber-400/20 flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div>
                  <div className="text-xs text-amber-400 tracking-[0.3em]">TWÓJ KOSZYK</div>
                  <h3 className="font-serif-lux text-3xl">Zamówienie</h3>
                </div>
                <button onClick={() => setCartOpen(false)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
                  <X className="w-5 h-5 text-amber-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {cart.length === 0 && (
                  <div className="text-center text-zinc-500 py-20 font-serif-lux text-xl italic">Koszyk jest pusty</div>
                )}
                {cart.map(item => (
                  <div key={item.id} className="glass rounded-2xl p-3 flex items-center gap-3">
                    {item.img && <img src={item.img} alt="" className="w-14 h-14 rounded-xl object-cover" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-serif-lux text-base truncate">{item.name}</div>
                      <div className="text-amber-400 text-sm">{item.price} zł</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full glass-gold text-amber-400 text-sm">−</button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, +1)} className="w-7 h-7 rounded-full glass-gold text-amber-400 text-sm">+</button>
                    </div>
                  </div>
                ))}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-white/10 space-y-3">
                  {missingToMin > 0 && (
                    <div className="text-xs text-orange-400 bg-orange-400/10 border border-orange-400/30 rounded-xl p-3 text-center">
                      Min. zamówienie {MIN_ORDER} zł · brakuje <b>{missingToMin} zł</b>
                    </div>
                  )}
                  {missingToMin === 0 && missingToFree > 0 && (
                    <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-xl p-3 text-center">
                      Dodaj jeszcze <b>{missingToFree} zł</b> i dostawa będzie GRATIS! 🚚
                    </div>
                  )}
                  {missingToMin === 0 && missingToFree === 0 && (
                    <div className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 rounded-xl p-3 text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> DARMOWA DOSTAWA
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-zinc-400">
                    <span>Wartość zamówienia</span><span>{cartSubtotal} zł</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-400">
                    <span>Dostawa</span>
                    <span>{deliveryFee === 0 ? <span className="text-emerald-400">GRATIS</span> : `${deliveryFee} zł`}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                    <span className="text-zinc-300 tracking-wider text-sm">RAZEM</span>
                    <span className="font-serif-lux text-3xl gradient-gold font-semibold">{cartTotal} zł</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    disabled={cartSubtotal < MIN_ORDER}
                    onClick={() => { setCartOpen(false); setCheckout(true); }}
                    className="w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold tracking-wider glow-gold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    PRZEJDŹ DO PŁATNOŚCI <ArrowUpRight className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {checkout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-xl flex items-start md:items-center justify-center p-4 md:p-6 overflow-y-auto" onClick={() => !processing && setCheckout(false)}>
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 md:p-10 max-w-2xl w-full my-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-xs text-amber-400 tracking-[0.3em] mb-2">FINALIZACJA · DOSTAWA</div>
                  <h3 className="font-serif-lux text-3xl md:text-4xl">Dane do zamówienia</h3>
                </div>
                <button onClick={() => !processing && setCheckout(false)} className="w-10 h-10 rounded-full glass flex items-center justify-center shrink-0">
                  <X className="w-5 h-5 text-amber-400" />
                </button>
              </div>

              {/* SECTION: KONTAKT */}
              <div className="mb-6">
                <div className="text-xs text-amber-400 tracking-widest mb-3 flex items-center gap-2"><Phone className="w-3 h-3" /> KONTAKT</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 tracking-wider mb-2 block">IMIĘ I NAZWISKO *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 tracking-wider mb-2 block">TELEFON *</label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+48 ..." className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-xs text-zinc-500 tracking-wider mb-2 block">EMAIL (opcjonalnie)</label>
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400" />
                </div>
              </div>

              {/* SECTION: ADRES */}
              <div className="mb-6">
                <div className="text-xs text-amber-400 tracking-widest mb-3 flex items-center gap-2"><MapPin className="w-3 h-3" /> ADRES DOSTAWY</div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-500 tracking-wider mb-2 block">ULICA *</label>
                    <input value={form.street} onChange={e => setForm({...form, street: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 tracking-wider mb-2 block">NR DOMU *</label>
                    <input value={form.building} onChange={e => setForm({...form, building: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="text-xs text-zinc-500 tracking-wider mb-2 block">MIESZKANIE</label>
                    <input value={form.apt} onChange={e => setForm({...form, apt: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 tracking-wider mb-2 block">KOD *</label>
                    <input value={form.postal} onChange={e => setForm({...form, postal: e.target.value})} placeholder="62-700" className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 tracking-wider mb-2 block">MIASTO *</label>
                    <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-xs text-zinc-500 tracking-wider mb-2 block">UWAGI (kod do bramy, piętro itp.)</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400 resize-none" />
                </div>
              </div>

              {/* SECTION: PŁATNOŚĆ */}
              <div className="mb-6">
                <div className="text-xs text-amber-400 tracking-widest mb-3 flex items-center gap-2"><CreditCard className="w-3 h-3" /> METODA PŁATNOŚCI</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {paymentOptions.map(opt => {
                    const Icon = opt.icon;
                    const active = form.payment === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setForm({...form, payment: opt.id as any})}
                        className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                          active ? 'border-amber-400 bg-amber-400/10 glow-gold' : 'border-white/10 hover:border-amber-400/40 glass'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${active ? 'bg-amber-400 text-black' : 'glass-gold text-amber-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{opt.label}</div>
                          <div className="text-xs text-zinc-400 mt-0.5">{opt.desc}</div>
                        </div>
                        {active && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* BLIK CODE */}
                {form.payment === 'blik' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 overflow-hidden">
                    <label className="text-xs text-zinc-500 tracking-wider mb-2 block">KOD BLIK (6 cyfr) *</label>
                    <input
                      value={form.blikCode}
                      onChange={e => setForm({...form, blikCode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                      maxLength={6}
                      placeholder="● ● ● ● ● ●"
                      className="w-full bg-transparent border-b border-amber-400/40 py-3 outline-none focus:border-amber-400 text-2xl tracking-[0.4em] font-mono text-center"
                    />
                  </motion.div>
                )}
                {form.payment === 'card' && (
                  <div className="mt-4 text-xs text-zinc-400 bg-amber-400/5 border border-amber-400/20 rounded-xl p-3">
                    🔒 Po kliknięciu „Zapłać" zostaniesz przekierowany do bezpiecznej bramki płatności (Przelewy24 / Tpay).
                  </div>
                )}
                {form.payment === 'transfer' && (
                  <div className="mt-4 text-xs text-zinc-400 bg-amber-400/5 border border-amber-400/20 rounded-xl p-3">
                    🔒 Po kliknięciu „Zapłać" wybierzesz swój bank w bramce Przelewy24 / Tpay / PayU.
                  </div>
                )}
              </div>

              {/* PODSUMOWANIE */}
              <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-5 mb-6">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-zinc-400"><span>Produkty ({cartCount})</span><span>{cartSubtotal} zł</span></div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Dostawa</span>
                    <span>{deliveryFee === 0 ? <span className="text-emerald-400">GRATIS</span> : `${deliveryFee} zł`}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                    <span className="text-zinc-200 tracking-wider">DO ZAPŁATY</span>
                    <span className="font-serif-lux text-3xl gradient-gold font-semibold">{cartTotal} zł</span>
                  </div>
                </div>
              </div>

              {/* ZGODY */}
              <div className="space-y-2 mb-6 text-xs text-zinc-400">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.consent} onChange={e => setForm({...form, consent: e.target.checked})} className="mt-0.5 accent-amber-400" />
                  <span>Akceptuję <a href="#" className="text-amber-400 underline">regulamin</a> i <a href="#" className="text-amber-400 underline">politykę prywatności</a>. *</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.age18} onChange={e => setForm({...form, age18: e.target.checked})} className="mt-0.5 accent-amber-400" />
                  <span>Mam ukończone 18 lat (wymagane dla zamówień z alkoholem).</span>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                disabled={
                  processing || cartSubtotal < MIN_ORDER ||
                  !form.name || !form.phone || !form.street || !form.building || !form.postal || !form.city ||
                  !form.consent ||
                  (form.payment === 'blik' && form.blikCode.length !== 6)
                }
                onClick={sendOrder}
                className="w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold tracking-wider glow-gold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"></motion.div>
                    PRZETWARZANIE...
                  </>
                ) : (
                  <>
                    {form.payment === 'cash' || form.payment === 'card_courier' ? 'ZŁÓŻ ZAMÓWIENIE' : `ZAPŁAĆ ${cartTotal} ZŁ`}
                    <ArrowUpRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              <div className="mt-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5">
                🔒 Bezpieczna płatność SSL · Twoje dane są szyfrowane
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS */}
      <AnimatePresence>
        {orderSent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-6" onClick={() => setOrderSent(null)}>
            <div className="text-center max-w-md">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 glow-gold">
                <CheckCircle2 className="w-12 h-12 text-black" />
              </motion.div>
              <h3 className="font-serif-lux text-5xl mb-4">Dziękujemy!</h3>
              <p className="text-zinc-400 mb-1">Twoje zamówienie zostało przyjęte.</p>
              <p className="text-zinc-400 mb-4">Kurier dostarczy je w ciągu <b className="text-amber-400">30-60 min</b>.</p>
              <p className="text-amber-400 text-sm tracking-widest font-mono">NR: {orderSent}</p>
              <button onClick={() => setOrderSent(null)} className="mt-8 px-6 py-2.5 rounded-full glass-gold text-amber-400 text-sm tracking-wider hover:bg-amber-400/20 transition">ZAMKNIJ</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence> <ReservationWidget />
    </div>
  );
}
/* ============================================================
   REZERWACJA STOLIKA — samodzielny widget
   ============================================================ */
function ReservationWidget() {
  const [open, setOpen] = React.useState(false);
  const [sent, setSent] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const [f, setF] = React.useState({
    name: '', phone: '', email: '',
    date: today, time: '19:00',
    guests: 2, notes: '',
    consent: false,
  });

  const send = async () => {
    setErr(null);
    if (!f.name || !f.phone || !f.date || !f.time) { setErr('Uzupełnij wymagane pola'); return; }
    if (!/^\+?\d[\d\s-]{7,}$/.test(f.phone)) { setErr('Nieprawidłowy telefon'); return; }
    if (!f.consent) { setErr('Zaakceptuj regulamin'); return; }

    setProcessing(true);
    try {
      const r = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name: f.name, phone: f.phone, email: f.email || undefined, notes: f.notes || undefined },
          date: f.date, time: f.time, guests: Number(f.guests),
        }),
      });
      const data = await r.json();
      if (!data.ok) { setErr(data.error || 'Błąd rezerwacji'); return; }
      setSent(data.id);
      setOpen(false);
      setF({ ...f, notes: '', consent: false });
    } catch (e: any) {
      setErr(e.message || 'Błąd sieci');
    } finally {
      setProcessing(false);
    }
  };

  // godziny 12:00–22:00 co 30 min
  const slots: string[] = [];
  for (let h = 12; h <= 22; h++) {
    slots.push(`${String(h).padStart(2,'0')}:00`);
    if (h < 22) slots.push(`${String(h).padStart(2,'0')}:30`);
  }

  return (
    <>
      {/* FAB — przycisk pływający lewy dolny róg */}
      <motion.button
        initial={{ scale: 0, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-8 z-50 px-6 h-14 rounded-full glass border border-amber-400/40 text-amber-400 flex items-center gap-2 font-semibold tracking-wider text-sm hover:bg-amber-400/10 transition"
        style={{ boxShadow: '0 0 30px rgba(251,191,36,0.2)' }}
      >
        <Utensils className="w-4 h-4" />
        REZERWACJA
      </motion.button>

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !processing && setOpen(false)}
            className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-xl flex items-start md:items-center justify-center p-4 md:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 md:p-10 max-w-xl w-full my-auto"
              style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(251,191,36,0.2)' }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-xs tracking-[0.3em] mb-2" style={{ color: '#fbbf24' }}>REZERWACJA STOLIKA</div>
                  <h3 className="font-serif-lux text-3xl md:text-4xl">Zarezerwuj wizytę</h3>
                  <p className="text-zinc-400 text-sm mt-2">Stalowa 36, Warszawa · 13:00–22:00</p>
                </div>
                <button onClick={() => !processing && setOpen(false)} className="w-10 h-10 rounded-full glass flex items-center justify-center shrink-0">
                  <X className="w-5 h-5 text-amber-400" />
                </button>
              </div>

              {/* DANE */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-zinc-500 tracking-wider mb-2 block">IMIĘ I NAZWISKO *</label>
                  <input value={f.name} onChange={e => setF({...f, name: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 tracking-wider mb-2 block">TELEFON *</label>
                  <input value={f.phone} onChange={e => setF({...f, phone: e.target.value})} placeholder="+48 ..." className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400" />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-zinc-500 tracking-wider mb-2 block">EMAIL (opcjonalnie)</label>
                <input type="email" value={f.email} onChange={e => setF({...f, email: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400" />
              </div>

              {/* DATA / GODZINA / OSOBY */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-zinc-500 tracking-wider mb-2 block">DATA *</label>
                  <input
                    type="date"
                    min={today}
                    value={f.date}
                    onChange={e => setF({...f, date: e.target.value})}
                    className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400 text-white [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 tracking-wider mb-2 block">GODZINA *</label>
                  <select
                    value={f.time}
                    onChange={e => setF({...f, time: e.target.value})}
                    className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400 text-white"
                    style={{ colorScheme: 'dark' }}
                  >
                    {slots.map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 tracking-wider mb-2 block">OSÓB *</label>
                  <select
                    value={f.guests}
                    onChange={e => setF({...f, guests: Number(e.target.value)})}
                    className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400 text-white"
                    style={{ colorScheme: 'dark' }}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,12,15,20].map(n => <option key={n} value={n} className="bg-zinc-900">{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs text-zinc-500 tracking-wider mb-2 block">UWAGI (alergie, okazja, preferencje)</label>
                <textarea value={f.notes} onChange={e => setF({...f, notes: e.target.value})} rows={2} className="w-full bg-transparent border-b border-white/20 py-2.5 outline-none focus:border-amber-400 resize-none" />
              </div>

              {/* PODSUMOWANIE */}
              <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-4 mb-5 flex items-center gap-4 text-sm">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <div className="text-zinc-300">
                    {new Date(f.date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })} · <b className="text-amber-400">{f.time}</b>
                  </div>
                  <div className="text-zinc-500 text-xs">{f.guests} {f.guests === 1 ? 'osoba' : f.guests < 5 ? 'osoby' : 'osób'}</div>
                </div>
              </div>

              {/* ZGODA */}
              <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-400 mb-4">
                <input type="checkbox" checked={f.consent} onChange={e => setF({...f, consent: e.target.checked})} className="mt-0.5 accent-amber-400" />
                <span>Akceptuję regulamin i wyrażam zgodę na kontakt telefoniczny w celu potwierdzenia rezerwacji. *</span>
              </label>

              {err && (
                <div className="mb-4 text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded-xl p-3 text-center">
                  {err}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                disabled={processing || !f.name || !f.phone || !f.consent}
                onClick={send}
                className="w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold tracking-wider glow-gold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                    WYSYŁANIE...
                  </>
                ) : (
                  <>REZERWUJ STOLIK <ArrowUpRight className="w-5 h-5" /></>
                )}
              </motion.button>

              <div className="mt-4 text-center text-xs text-zinc-500">
                Potwierdzimy rezerwację telefonicznie w ciągu 30 minut.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS */}
      <AnimatePresence>
        {sent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-6" onClick={() => setSent(null)}>
            <div className="text-center max-w-md">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 glow-gold">
                <CheckCircle2 className="w-12 h-12 text-black" />
              </motion.div>
              <h3 className="font-serif-lux text-5xl mb-4">Rezerwacja przyjęta!</h3>
              <p className="text-zinc-400 mb-1">Skontaktujemy się z Tobą telefonicznie</p>
              <p className="text-zinc-400 mb-4">w ciągu <b className="text-amber-400">30 minut</b> w celu potwierdzenia.</p>
              <p className="text-amber-400 text-sm tracking-widest font-mono">NR: {sent}</p>
              <button onClick={() => setSent(null)} className="mt-8 px-6 py-2.5 rounded-full glass-gold text-amber-400 text-sm tracking-wider hover:bg-amber-400/20 transition">ZAMKNIJ</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}