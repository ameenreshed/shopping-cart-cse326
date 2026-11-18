(function(){
  const u = guard('customer'); if (!u) return;
  if (!Cart.count()) { go('cart.html'); return; }

  const t = Cart.totals(), it = Cart.items();

  window.fmtCard = el => { el.value = el.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); };
  window.fmtExp = el => { let v = el.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); el.value = v; };

  $('#nm').value = u.name;
  $('#em').value = u.email;

  $('#co-items').innerHTML = it.map(x =>
    `<div class="r"><span class="row" style="flex-wrap:nowrap"><span class="th tn">${pimg(x.p)}</span>${esc(x.p.name)} × ${x.q}</span><span>${inr(x.p.price * x.q)}</span></div>`
  ).join('');
  $('#co-sub').textContent = inr(t.sub);
  if (t.disc) { $('#co-disc-row').hidden = false; $('#co-disc').textContent = '−' + inr(t.disc); }
  $('#co-ship').textContent = t.ship ? inr(t.ship) : 'Free';
  $('#co-gst').textContent = inr(t.gst);
  $('#co-total').textContent = inr(t.total);
  $('#co-total-btn').textContent = inr(t.total);

  if (MOB) stickyBar(`<div class="tot"><span class="mu sm">Pay</span><b>${inr(t.total)}</b></div><button class="btn p" form="cf"><span data-icon="lock:16"></span>Place order</button>`);

  $('#cf').onsubmit = e => {
    e.preventDefault();
    const v = V(), g = i => $('#' + i).value.trim(), cn = g('cn').replace(/\s/g, ''),
      ex = g('ex').match(/^(0[1-9]|1[0-2])\/(\d\d)$/);
    v('nm', g('nm').length >= 3, 'Enter your full name.');
    v('em', EMAIL.test(g('em')), 'Enter a valid email.');
    v('ph', /^[6-9]\d{9}$/.test(g('ph')), 'Enter a valid 10-digit mobile number.');
    v('ad', g('ad').length >= 10, 'Address must be at least 10 characters.');
    v('pn', /^\d{6}$/.test(g('pn')), 'PIN must be 6 digits.');
    v('cn', /^\d{16}$/.test(cn) && luhn(cn), 'Enter a valid 16-digit card number.');
    v('ex', !!ex && new Date(2000 + +ex[2], +ex[1], 1) > new Date(), 'Enter a valid, unexpired date.');
    v('cv', /^\d{3}$/.test(g('cv')), 'CVV must be 3 digits.');
    if (!v.ok()) return;
    for (const x of Cart.items()) if (x.q > x.p.stock) { toast(x.p.name + ' is no longer available in that quantity'); return; }
    const o = Ord.place(u, { name: g('nm'), email: g('em'), phone: g('ph'), address: g('ad'), pin: g('pn') });
    go('orders.html?placed=' + o.id);
  };
})();