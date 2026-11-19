/* ==========================================================================
    — UNIFIED CORE
   ========================================================================== */

const CONFIG = {
  brand:'', currency:'₹', locale:'en-IN',
  gstPct:18, freeShipOver:999, shipFee:49,
  coupons:{ SAVE10:10, WELCOME5:5 },
  mobileMax:768, useFA:true,
  faCdn:'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
};
const MQ = matchMedia('(max-width:' + CONFIG.mobileMax + 'px)');
const MOB = MQ.matches;
MQ.addEventListener('change', () => location.reload());

(function () {
  const d = document.documentElement;
  let t = null; try { t = localStorage.getItem('kk_theme'); } catch (e) {}
  d.dataset.theme = t || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  d.classList.add(MOB ? 'is-mobile' : 'is-desktop');
  if (CONFIG.useFA) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = CONFIG.faCdn;
    l.onload = () => d.classList.add('fa-ok');
    document.head.append(l);
  }
})();

/* ============ DATABASE + SERVICES ============ */
const KEY = 'kk_store_v3';
const today = () => new Date().toISOString().slice(0, 10);

function seed() {
  // Images live in assets/img/ as p{id}.webp and p{id}a.webp
  const P = [
    [1,'Wireless Headphones','Electronics',2499,12,'Over-ear Bluetooth headphones with 30-hour battery.'],
    [2,'Smart Watch','Electronics',3999,8,'Fitness tracking, heart-rate and notifications.'],
    [3,'Running Shoes','Fashion',1999,20,'Lightweight, breathable daily trainers.'],
    [4,'Backpack','Fashion',1299,15,'Water-resistant 25L laptop backpack.'],
    [5,'Coffee Mug Set','Home',599,30,'Set of 4 ceramic mugs, dishwasher safe.'],
    [6,'Desk Lamp','Home',899,3,'Dimmable LED lamp with USB charging port.'],
    [7,'JavaScript Handbook','Books',449,25,'A practical guide to modern JavaScript.'],
    [8,'Yoga Mat','Sports',799,0,'Non-slip 6 mm mat with carry strap.'],
    [9,'Wireless Mouse','Electronics',699,40,'Ergonomic silent-click mouse, 2.4 GHz.'],
    [10,'Bluetooth Speaker','Electronics',1799,10,'Portable waterproof speaker with deep bass.']
  ];
  const ship = { name:'Demo Customer', email:'user@shop.com', phone:'9876543210', address:'12 Model Town Road, Jalandhar', pin:'144001' };
  return {
    users: [
      { id:1, name:'Admin', email:'admin@shop.com', pw:'admin123', role:'admin', joined:'2026-09-01' },
      { id:2, name:'Demo Customer', email:'user@shop.com', pw:'user123', role:'customer', joined:'2026-09-15' }
    ],
    products: P.map(a => ({
      id:a[0], name:a[1], cat:a[2], price:a[3], stock:a[4],
      desc:a[5],
      images:['assets/img/p'+a[0]+'.webp','assets/img/p'+a[0]+'a.webp'],
      mrp: Math.round(a[3]*(1.15+(a[0]%4)*.08)/10)*10
    })),
    reviews: [
      { pid:1, uid:2, name:'Demo Customer', stars:5, text:'Superb sound and battery life.', date:'2026-10-02' },
      { pid:3, uid:2, name:'Demo Customer', stars:4, text:'Comfortable for daily runs.', date:'2026-10-05' }
    ],
    orders: [
      { id:101, uid:2, user:'Demo Customer', date:'20/10/2026, 4:12:09 pm', status:'Delivered', ship,
        total:2949, t:{ sub:2499, disc:0, ship:0, gst:450, total:2949 },
        items:[{ pid:1, name:'Wireless Headphones', img:'assets/img/p1.webp', price:2499, q:1 }] },
      { id:102, uid:2, user:'Demo Customer', date:'02/11/2026, 11:30:41 am', status:'Shipped', ship,
        total:1943, t:{ sub:1647, disc:0, ship:0, gst:296, total:1943 },
        items:[
          { pid:5, name:'Coffee Mug Set', img:'assets/img/p5.webp', price:599, q:2 },
          { pid:7, name:'JavaScript Handbook', img:'assets/img/p7.webp', price:449, q:1 }
        ] }
    ],
    cart:{}, wish:[], coupon:'', session:null, seq:110
  };
}

let db; try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
if (!db || !Array.isArray(db.products)) db = seed();
if (!Array.isArray(db.users)) db.users = seed().users;
if (!Array.isArray(db.reviews)) db.reviews = [];
if (!Array.isArray(db.orders)) db.orders = [];
if (!Array.isArray(db.wish)) db.wish = [];
if (!db.cart || typeof db.cart !== 'object' || Array.isArray(db.cart)) db.cart = {};
if (typeof db.coupon !== 'string') db.coupon = '';
if (typeof db.seq !== 'number' || !isFinite(db.seq)) db.seq = 110;
if (db.session !== null && !db.users.some(u => u.id === db.session)) db.session = null;

const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { return false; } };
const nid = () => ++db.seq;

const Auth = {
  user: () => db.users.find(u => u.id === db.session) || null,
  login(e, pw) {
    const u = db.users.find(u => u.email === e.toLowerCase() && u.pw === pw);
    if (!u) return null;
    db.session = u.id; save(); return u;
  },
  register(name, e, pw) {
    e = e.toLowerCase();
    if (db.users.some(u => u.email === e)) return null;
    const u = { id:nid(), name, email:e, pw, role:'customer', joined:today() };
    db.users.push(u); db.session = u.id; save(); return u;
  },
  logout() { db.session = null; save(); }
};

const Prod = {
  get: id => db.products.find(p => p.id === +id),
  all: () => db.products,
  save(d, id) {
    let before = null, added = null;
    if (id) {
      const p = Prod.get(id); if (!p) return false;
      before = { ...p }; Object.assign(p, d);
    } else { added = { id:nid(), ...d }; db.products.push(added); }
    if (!save()) {
      if (id && before) Object.assign(Prod.get(id), before);
      else if (added) {
        const i = db.products.indexOf(added);
        if (i > -1) db.products.splice(i, 1);
      }
      return false;
    }
    return true;
  },
  del(id) {
    db.products = db.products.filter(p => p.id !== id);
    delete db.cart[id];
    db.wish = db.wish.filter(w => w !== id);
    db.reviews = db.reviews.filter(r => r.pid !== id);
    save();
  }
};

const Cart = {
  items: () => Object.keys(db.cart).map(k => ({ p:Prod.get(k), q:db.cart[k] })).filter(x => x.p),
  count: () => Cart.items().reduce((a, x) => a + x.q, 0),
  add(id, q = 1) {
    const p = Prod.get(id), n = (db.cart[id] || 0) + q;
    if (!p || n > p.stock) return false;
    db.cart[id] = n; save(); return true;
  },
  set(id, q) {
    const p = Prod.get(id); if (!p) return false;
    if (q < 1) delete db.cart[id];
    else if (q > p.stock) return false;
    else db.cart[id] = q;
    save(); return true;
  },
  remove(id) { delete db.cart[id]; save(); },
  clear() { db.cart = {}; db.coupon = ''; save(); },
  totals() {
    const sub = Cart.items().reduce((a, x) => a + x.p.price * x.q, 0);
    const disc = Math.round(sub * (CONFIG.coupons[db.coupon] || 0) / 100);
    const ship = (!sub || sub - disc >= CONFIG.freeShipOver) ? 0 : CONFIG.shipFee;
    const gst = Math.round((sub - disc) * CONFIG.gstPct / 100);
    return { sub, disc, ship, gst, total: sub - disc + ship + gst };
  }
};

const Rev = {
  of: id => db.reviews.filter(r => r.pid === +id),
  avg(id) { const r = Rev.of(id); return r.length ? r.reduce((a, b) => a + b.stars, 0) / r.length : 0; },
  add(pid, u, stars, text) { db.reviews.push({ pid:+pid, uid:u.id, name:u.name, stars, text, date:today() }); save(); },
  del(pid, uid) { db.reviews = db.reviews.filter(r => !(r.pid === pid && r.uid === uid)); save(); }
};

const Ord = {
  all: () => db.orders.slice().reverse(),
  of: uid => Ord.all().filter(o => o.uid === uid),
  place(u, ship) {
    const t = Cart.totals(), it = Cart.items();
    it.forEach(x => { x.p.stock -= x.q; });
    const o = {
      id:nid(), uid:u.id, user:u.name, date:new Date().toLocaleString('en-IN'),
      status:'Placed', ship, total:t.total, t,
      items: it.map(x => ({
        pid:x.p.id, name:x.p.name,
        img:(x.p.images || [])[0] || '', price:x.p.price, q:x.q
      }))
    };
    db.orders.push(o); Cart.clear(); return o;
  },
  status(id, s) { db.orders.find(o => o.id === id).status = s; save(); }
};

const Wish = {
  has: id => db.wish.includes(+id),
  all: () => db.wish.map(i => Prod.get(i)).filter(Boolean),
  toggle(id) {
    id = +id;
    const i = db.wish.indexOf(id);
    if (i < 0) db.wish.push(id); else db.wish.splice(i, 1);
    save(); return i < 0;
  }
};

/* ============ ICONS ============ */
const IC = {
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  bag:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  cart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 2h2l2.7 12.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L22 7H5"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  package:'<path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  dash:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus:'<path d="M5 12h14"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  alert:'<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  rupee:'<path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3a5 5 0 0 0 0-10"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  truck:'<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  back:'<path d="m15 18-6-6 6-6"/>',
  chev:'<path d="m9 18 6-6-6-6"/>',
  bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>'
};
const FA = {
  home:'solid house', bag:'solid bag-shopping', cart:'solid cart-shopping',
  user:'solid user', users:'solid users', package:'solid box',
  shield:'solid shield-halved', dash:'solid gauge-high', search:'solid magnifying-glass',
  moon:'solid moon', plus:'solid plus', minus:'solid minus',
  trash:'solid trash-can', edit:'solid pen', x:'solid xmark',
  logout:'solid right-from-bracket', login:'solid right-to-bracket', lock:'solid lock',
  alert:'solid triangle-exclamation', rupee:'solid indian-rupee-sign', check:'solid check',
  eye:'solid eye', truck:'solid truck-fast', star:'solid star',
  heart:'regular heart', upload:'solid upload', image:'solid image',
  back:'solid chevron-left', chev:'solid chevron-right', bolt:'solid bolt'
};
const ic = (n, s = 18) => {
  const f = FA[n].split(' ');
  return `<span class="ico" style="font-size:${s}px;width:${s}px;height:${s}px"><i class="fa-${f[0]} fa-${f[1]}"></i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg></span>`;
};

/* ============ UTILITIES ============ */
const R = document.body.dataset.root || '';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const inr = n => CONFIG.currency + Number(n).toLocaleString(CONFIG.locale);
const stars = n => {
  const r = Math.round(n);
  return `<span class="stars" aria-label="${n.toFixed(1)} of 5">${'★'.repeat(r)}<i>${'★'.repeat(5 - r)}</i></span>`;
};
const go = u => { location.href = R + u; };
const page = h => {
  // Admin pages have dual containers (#page-mobile + #page). Only fill the one for the current viewport.
  const dual = !!document.getElementById('page-mobile');
  document.querySelectorAll('#page, .page').forEach(el => {
    if (dual) {
      if (MOB && el.id !== 'page-mobile') return;
      if (!MOB && el.id === 'page-mobile') return;
    }
    el.innerHTML = h;
  });
  cardify();
};

function toast(m) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = m;
  document.body.append(t);
  setTimeout(() => t.remove(), 2200);
}
function toggleTheme() {
  const d = document.documentElement;
  const t = d.dataset.theme === 'dark' ? 'light' : 'dark';
  d.dataset.theme = t;
  try { localStorage.setItem('kk_theme', t); } catch (e) {}
}
function logout() { Auth.logout(); go('index.html'); }
function guard(role) {
  const u = Auth.user();
  if (u && (!role || u.role === role)) return u;
  if (u) { location.replace(R + 'index.html'); return null; }
  location.replace(R + 'login.html?next=' + encodeURIComponent((R ? 'admin/' : '') + location.pathname.split('/').pop() + location.search));
  return null;
}
function nextUrl() {
  const n = new URLSearchParams(location.search).get('next');
  return n && /^[\w\-\/.?=&%]+$/.test(n) && !n.startsWith('/') && !n.includes('..') ? n : null;
}
function luhn(n) {
  let s = 0, d = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let x = +n[i];
    if (d) { x *= 2; if (x > 9) x -= 9; }
    s += x; d = !d;
  }
  return s % 10 === 0;
}
function V() {
  let ok = true;
  const f = (id, c, m) => {
    const e = document.getElementById('e_' + id);
    if (e) {
      e.textContent = c ? '' : m;
      const w = e.closest('.f');
      if (w) w.classList.toggle('bad', !c);
    }
    if (!c) ok = false;
    return c;
  };
  f.ok = () => ok;
  return f;
}
const field = (id, label, type = 'text', x = '') =>
  `<div class="f"><label for="${id}">${label}</label><input id="${id}" type="${type}" ${x}><div class="err" id="e_${id}"></div></div>`;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function modal(h) {
  closeModal();
  const d = document.createElement('div');
  d.className = 'ov'; d.id = 'ov';
  d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  d.onclick = e => { if (e.target === d) closeModal(); };
  d.innerHTML = `<div class="md">${h}</div>`;
  document.body.append(d);
  hydrateIcons(d);
}
function closeModal() { $('#ov')?.remove(); }

function syncBadge() {
  const n = Cart.count();
  document.querySelectorAll('.cb').forEach(b => { b.textContent = n; b.hidden = !n; });
  const w = db.wish.length;
  document.querySelectorAll('.wb').forEach(b => { b.textContent = w; b.hidden = !w; });
}

function syncAuth() {
  const u = Auth.user();
  document.body.dataset.auth = u ? 'in' : 'out';
  document.body.dataset.role = u ? u.role : '';
  document.querySelectorAll('.auth-out').forEach(el => el.hidden = !!u);
  document.querySelectorAll('.auth-in').forEach(el => el.hidden = !u);
  document.querySelectorAll('[data-need]').forEach(el => el.hidden = !u || u.role !== el.dataset.need);
  document.querySelectorAll('[data-hide-role]').forEach(el => el.hidden = !!(u && u.role === el.dataset.hideRole));
  document.querySelectorAll('[data-avatar]').forEach(el => el.textContent = u ? u.name[0].toUpperCase() : '');
  document.querySelectorAll('[data-username]').forEach(el => el.textContent = u ? u.name.split(' ')[0] : '');
  if (document.querySelector('.tab')) document.body.classList.add('has-tab');
  syncBadge();
}

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    const [n, s] = el.dataset.icon.split(':');
    el.insertAdjacentHTML('afterbegin', ic(n, +s || 18));
    delete el.dataset.icon;
  });
}

function setActive(active) {
  document.querySelectorAll('.nav a, .tab a, .sb a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (!href || href === '#') return;
    a.classList.toggle('on', href === active || href === R + active);
  });
}

function addCart(id, q = 1) {
  const ok = Cart.add(id, q);
  toast(ok ? 'Added to cart' : 'Not enough stock');
  if (ok) syncBadge();
  return ok;
}
function togglePw(id) {
  const i = $('#' + id);
  i.type = i.type === 'password' ? 'text' : 'password';
}
const src = s => /^(data:|https?:)/.test(s) ? s : R + s;

/* Product image — photo from assets/img/ (or URL), else product name as alt text.
   Inline styles keep the fallback visible behind the photo; if the file 404s
   the <img> removes itself and the fallback text shows. No CSS changes needed. */
const pimg = (p, i = 0) => {
  const name = esc(p.name || '');
  const alt = `<span style="position:absolute;inset:0;z-index:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:4px;font-size:10px;line-height:1.2;color:var(--mu);overflow:hidden;word-break:break-word">${name}</span>`;
  const s = p.images && p.images[i];
  if (!s) return alt;
  return alt + `<img src="${esc(src(s))}" alt="${name}" loading="lazy" style="z-index:1" onerror="this.remove()">`;
};

const priceHtml = p => {
  const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  return `${inr(p.price)}${off ? ` <s class="mu sm">${inr(p.mrp)}</s> <span class="off">${off}% off</span>` : ''}`;
};
function heart(id, b) {
  const on = Wish.toggle(id);
  if (b) b.classList.toggle('on', on);
  toast(on ? 'Added to wishlist' : 'Removed from wishlist');
  syncBadge();
}
function back() { document.referrer && history.length > 1 ? history.back() : go('index.html'); }
function cardify() {
  document.querySelectorAll('.tw table').forEach(t => {
    const h = [...t.querySelectorAll('th')].map(x => x.textContent);
    t.querySelectorAll('tbody tr').forEach(r => [...r.children].forEach((c, i) => c.dataset.label = h[i] || ''));
  });
}

/* ============ COMPONENTS ============ */
const pcard = p => {
  const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  return `<article class="card pc"><div class="ph"><a href="${R}product.html?id=${p.id}" class="th">${pimg(p)}</a>${off ? `<span class="dc">${off}% OFF</span>` : ''}${!p.stock ? '<span class="so">Sold out</span>' : ''}<button class="wh ${Wish.has(p.id) ? 'on' : ''}" onclick="heart(${p.id},this)" aria-label="Wishlist">${ic('heart', 17)}</button></div>
<span class="mu sm">${esc(p.cat)}</span><a href="${R}product.html?id=${p.id}"><h3>${esc(p.name)}</h3></a><div class="row sm">${stars(Rev.avg(p.id))}<span class="mu">(${Rev.of(p.id).length})</span>${p.stock && p.stock <= 3 ? `<span class="bg wn">Only ${p.stock} left</span>` : ''}</div>
<div class="pr">${priceHtml(p)}</div><button class="btn s b" onclick="addCart(${p.id})" ${p.stock ? '' : 'disabled'}>${ic('cart', 15)}${p.stock ? 'Add to cart' : 'Out of stock'}</button></article>`;
};
const hcard = p => `<a class="hc card" href="${R}product.html?id=${p.id}"><div class="th">${pimg(p)}</div><div class="sm" style="margin:8px 0 2px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.name)}</div><div class="pr sm">${priceHtml(p)}</div></a>`;

/* ============ LAYOUT HYDRATION ============ */
function shell(active, o = {}) {
  setActive(active);
  hydrateIcons();
  syncAuth();
  if (o.title) {
    const mt = document.querySelector('.mh .mt');
    if (mt) mt.textContent = o.title;
  }
  if (o.tabs === false) {
    document.querySelectorAll('.tab').forEach(t => t.remove());
    document.body.classList.remove('has-tab');
  }
}

function adminShell(active, title, actions = '') {
  setActive(active);
  hydrateIcons();
  syncAuth();
  if (title) document.querySelectorAll('.mh .mt').forEach(el => el.textContent = title);
  if (actions) document.querySelectorAll('[data-admin-actions]').forEach(el => el.innerHTML = actions);
}

function authShell() { hydrateIcons(); syncAuth(); }

function stickyBar(h) {
  document.querySelector('.sbar')?.remove();
  const pg = $('#page'); if (pg) pg.classList.remove('hasbar');
  document.body.classList.remove('has-sbar');
  if (!h) return;
  const d = document.createElement('div');
  d.className = 'sbar'; d.innerHTML = h;
  const app = $('#app'); if (app) app.append(d);
  const tab = document.querySelector('.tab');
  if (tab) { d.classList.add('has-tab'); d.style.bottom = tab.offsetHeight + 'px'; }
  if (pg) pg.classList.add('hasbar');
  document.body.classList.add('has-sbar');
  hydrateIcons(d);
}

document.addEventListener('DOMContentLoaded', () => {
  hydrateIcons();
  syncAuth();
});