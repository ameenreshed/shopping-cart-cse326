(function(){
 /* Cart is a primary tab page — same app shell + tab bar as Home / Wishlist / Orders / Account */
 shell('cart.html',{title:'My cart'});
 window.qty=(id,d)=>{if(!Cart.set(id,(db.cart[id]||0)+d))toast('Only limited stock available');draw()};
 window.rm=id=>{Cart.remove(id);draw()};
 window.coupon=()=>{const c=$('#cp').value.trim().toUpperCase();if(CONFIG.coupons[c]){db.coupon=c;save();toast('Coupon applied: '+CONFIG.coupons[c]+'% off')}else toast('Invalid coupon code');draw()};
 window.toCheckout=()=>go('checkout.html');
 function draw(){const it=Cart.items(),t=Cart.totals();syncBadge();
  if(MOB)stickyBar(it.length?`<div class="tot"><span class="mu sm">Total</span><b>${inr(t.total)}</b></div><button class="btn p" onclick="toCheckout()">Checkout ${ic('chev',15)}</button>`:'');
  if(!it.length){page(`<div class="empty">${ic('cart',52)}<h2>Your cart is empty</h2><p>Looks like you haven’t added anything yet.</p><a class="btn" href="index.html">Continue shopping</a></div>`);return}
  page(`<div class="steps"><span class="on">1 Cart</span><span>2 Checkout</span><span>3 Confirmation</span></div><h1 style="margin-bottom:18px">Shopping cart</h1>
  <div class="two"><div class="card">${it.map(x=>`<div class="li"><a class="th" href="product.html?id=${x.p.id}">${pimg(x.p)}</a><div><a href="product.html?id=${x.p.id}"><b>${esc(x.p.name)}</b></a><div class="mu sm">${inr(x.p.price)} each</div>
  <div class="row" style="margin-top:8px"><div class="qt"><button onclick="qty(${x.p.id},-1)" aria-label="Decrease">${ic('minus',14)}</button><b>${x.q}</b><button onclick="qty(${x.p.id},1)" aria-label="Increase">${ic('plus',14)}</button></div><button class="btn o s" onclick="rm(${x.p.id})">${ic('trash',14)}Remove</button></div></div><b>${inr(x.p.price*x.q)}</b></div>`).join('')}</div>
  <aside class="card sum"><h3 style="margin-bottom:10px">Order summary</h3><div class="row" style="flex-wrap:nowrap;margin-bottom:10px"><input id="cp" placeholder="Coupon code (try SAVE10)" value="${esc(db.coupon)}"><button class="btn o" onclick="coupon()">Apply</button></div>
  <div class="r"><span class="mu">Subtotal</span><span>${inr(t.sub)}</span></div>${t.disc?`<div class="r"><span class="mu">Discount</span><span class="okc">−${inr(t.disc)}</span></div>`:''}
  <div class="r"><span class="mu">Shipping</span><span>${t.ship?inr(t.ship):'Free'}</span></div><div class="r"><span class="mu">GST (18%)</span><span>${inr(t.gst)}</span></div><div class="r t"><span>Total</span><span>${inr(t.total)}</span></div>
  <button class="btn b dsk" style="margin-top:14px" onclick="toCheckout()">${ic('lock',17)}Proceed to checkout</button></aside></div>`)}
 draw();
})();