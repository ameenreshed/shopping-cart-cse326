(function(){
 const u = guard('customer'); if (!u) return;
 shell('orders.html', { title:'My orders' });
 const placed = +new URLSearchParams(location.search).get('placed');
 const flow = ['Placed','Shipped','Delivered'];
 const cls = { Placed:'in', Shipped:'wn', Delivered:'ok' };
 const os = Ord.of(u.id);

 page(`${placed ? `<div class="card" style="display:flex;gap:14px;align-items:center;margin-bottom:20px;border-color:var(--ok)"><span class="av" style="background:var(--ok);color:#fff">${ic('check',20)}</span><div><b>Order #${placed} placed successfully</b><div class="mu sm">Thank you for shopping with SAAHFY. We'll update the status as it ships.</div></div></div>` : ''}
 <h1 style="margin-bottom:18px">My orders</h1>${os.length ? os.map(o => `<div class="card" style="margin-bottom:14px"><div class="row sp"><div><b>Order #${o.id}</b><div class="mu sm">${o.date}</div></div><span class="bg ${cls[o.status]}">${o.status}</span></div>
 <div class="pg">${flow.map((s, i) => `<div class="${i <= flow.indexOf(o.status) ? 'on' : ''}">${s}</div>`).join('')}</div>
 ${o.items.map(i => `<div class="row sp" style="padding:6px 0"><span class="row" style="flex-wrap:nowrap"><span class="th tn">${pimg({ name:i.name, images:i.img ? [i.img] : [] })}</span>${esc(i.name)} <span class="mu">× ${i.q}</span></span><span>${inr(i.price * i.q)}</span></div>`).join('')}
 <div class="row sp" style="border-top:1px solid var(--bd);margin-top:8px;padding-top:10px"><span class="mu sm">${o.ship ? `Ships to ${esc(o.ship.address)} – ${esc(o.ship.pin)}` : ''}</span><b>Total ${inr(o.total)}</b></div></div>`).join('') : `<div class="empty">${ic('package',52)}<h2>No orders yet</h2><p>Your orders will show up here.</p><a class="btn" href="index.html">Start shopping</a></div>`}`);
})();