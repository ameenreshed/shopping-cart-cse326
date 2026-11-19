(function(){
 const id = +new URLSearchParams(location.search).get('id'), p = Prod.get(id);
 shell('index.html', { back:true, title:'Product', tabs:false });
 if (!p) {
   page(`<div class="empty">${ic('alert',40)}<h2>Product not found</h2><a class="btn" href="index.html">Back to shop</a></div>`);
   return;
 }
 document.title = p.name + ' – Shopping Cart';

 let qty = 1, star = 0, gi = 0;
 const imgs = p.images || [];
 const alt = `<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:13px;line-height:1.3;color:var(--mu);text-align:center;padding:14px">${esc(p.name)}</span>`;
 const imgTag = s => `<img src="${esc(src(s))}" alt="${esc(p.name)}" onerror="this.remove()">`;
 const mainIn = () => imgs.length ? imgTag(imgs[gi]) : alt;
 const snapG = () => imgs.length
   ? `<div class="snap">${imgs.map(s => `<div class="th">${imgTag(s)}</div>`).join('')}</div>`
   : `<div class="th main">${alt}</div>`;
 const deskG = () => `<div class="gal">
   <div class="th main" id="gm" onmousemove="zoom(event,this)" onclick="lightbox()">${mainIn()}</div>
   ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((s, i) => `<button class="${i === gi ? 'on' : ''}" onclick="pick(${i})" aria-label="Image ${i+1}"><img src="${esc(src(s))}" alt="" onerror="this.parentElement.style.display='none'"></button>`).join('')}</div>` : ''}
 </div>`;
 const gallery = () => MOB ? snapG() : deskG();

 window.pick = i => { gi = i; $('#gm').innerHTML = mainIn(); document.querySelectorAll('.thumbs button').forEach((b, j) => b.classList.toggle('on', j === i)); };
 window.zoom = (e, el) => { const im = el.querySelector('img'); if (!im) return; const r = el.getBoundingClientRect(); im.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%'; };
 window.lightbox = () => { if (imgs.length) modal(`<div class="row sp" style="margin-bottom:10px"><h3>${esc(p.name)}</h3><button class="ib" onclick="closeModal()" aria-label="Close">${ic('x',16)}</button></div><div class="th" style="height:auto;min-height:220px;border-radius:12px">${imgTag(imgs[gi])}</div>`); };
 window.chg = d => { qty = Math.max(1, Math.min(p.stock || 1, qty + d)); const el = $('#qv'); if (el) el.textContent = qty; };
 window.addNow = () => addCart(id, qty);
 window.buyNow = () => { if (addCart(id, qty)) go('cart.html'); };
 window.setStar = n => { star = n; document.querySelectorAll('.sg button').forEach((b, i) => b.classList.toggle('on', i < n)); };
 window.delRev = uid => { Rev.del(id, uid); draw(); };
 window.postRev = () => {
   const u = Auth.user();
   if (!u) { go('login.html?next=' + encodeURIComponent('product.html?id=' + id)); return; }
   const t = $('#rt').value.trim(), m = !star ? 'Please choose a star rating.' : t.length < 10 ? 'Review must be at least 10 characters.' : '';
   $('#e_rv').textContent = m; if (m) return;
   Rev.add(id, u, star, t); star = 0; toast('Review posted'); draw();
 };

 function draw() {
   const u = Auth.user(), rs = Rev.of(id), a = Rev.avg(id), mine = u && rs.find(r => r.uid === u.id), rel = Prod.all().filter(x => x.cat === p.cat && x.id !== id).slice(0, 4);
   page(`<nav class="bc"><a href="index.html">Shop</a> / <a href="index.html?cat=${encodeURIComponent(p.cat)}">${esc(p.cat)}</a> / ${esc(p.name)}</nav>
   <div class="pd">${gallery()}<div><span class="bg">${esc(p.cat)}</span><h1 style="margin:10px 0 6px">${esc(p.name)}</h1>
   <div class="row sm">${stars(a)}<span class="mu">${a.toFixed(1)} · ${rs.length} review${rs.length === 1 ? '' : 's'}</span></div><div class="pr big">${priceHtml(p)}</div><p class="mu">${esc(p.desc)}</p>
   <p class="${p.stock > 3 ? 'okc' : 'low'}">${p.stock ? (p.stock > 3 ? 'In stock' : `Only ${p.stock} left in stock`) : 'Out of stock'}</p>
   <div class="row dsk"><div class="qt"><button onclick="chg(-1)" aria-label="Decrease">${ic('minus',15)}</button><b id="qv">${qty}</b><button onclick="chg(1)" aria-label="Increase">${ic('plus',15)}</button></div>
   <button class="btn" onclick="addNow()" ${p.stock ? '' : 'disabled'}>${ic('cart',17)}Add to cart</button><button class="btn p" onclick="buyNow()" ${p.stock ? '' : 'disabled'}>Buy now</button><button class="btn o wl ${Wish.has(id) ? 'on' : ''}" onclick="heart(${id},this)">${ic('heart',17)}Wishlist</button></div>
   <p class="sm mu" style="margin-top:18px">${ic('truck',16)} Free delivery on orders over ${inr(CONFIG.freeShipOver)}</p></div></div>
   <div class="rl"><div class="card"><h3>Customer reviews</h3><div class="pr big">${a.toFixed(1)} <span class="sm mu">/ 5</span></div>${stars(a)}
   ${[5,4,3,2,1].map(n => { const c = rs.filter(r => r.stars === n).length; return `<div class="bl"><span>${n}★</span><i><b style="width:${rs.length ? c / rs.length * 100 : 0}%"></b></i><span>${c}</span></div>`; }).join('')}</div>
   <div><h3 style="margin-bottom:8px">${rs.length} review${rs.length === 1 ? '' : 's'}</h3>${rs.map(r => `<div class="rv"><div class="row sp"><div class="row">${stars(r.stars)}<b>${esc(r.name)}</b></div><span class="mu sm">${r.date}</span></div><p style="margin:6px 0">${esc(r.text)}</p>${u && (u.role === 'admin' || u.id === r.uid) ? `<button class="btn o s" onclick="delRev(${r.uid})">${ic('trash',14)}Delete</button>` : ''}</div>`).join('') || '<p class="mu">No reviews yet. Be the first!</p>'}
   <div class="card" style="margin-top:14px">${mine ? '<p class="mu" style="margin:0">You have already reviewed this product.</p>' : u?.role === 'admin' ? '<p class="mu" style="margin:0">Admins can moderate but not post reviews.</p>' : `<h3>Write a review</h3><div class="sg">${[1,2,3,4,5].map(n => `<button onclick="setStar(${n})" aria-label="${n} stars">★</button>`).join('')}</div><div class="f"><textarea id="rt" rows="3" placeholder="Share your experience (min 10 characters)"></textarea><div class="err" id="e_rv"></div></div><button class="btn" onclick="postRev()">${u ? 'Submit review' : 'Log in to review'}</button>`}</div></div></div>
   ${rel.length ? `<h2 style="margin:40px 0 14px">You may also like</h2><div class="grid">${rel.map(pcard).join('')}</div>` : ''}`);
 }
 draw();

 if (MOB) stickyBar(`<button class="ib wl2 ${Wish.has(id) ? 'on' : ''}" onclick="heart(${id},this)" aria-label="Wishlist">${ic('heart',20)}</button><button class="btn o" onclick="addNow()" ${p.stock ? '' : 'disabled'}>${ic('cart',16)}Add to cart</button><button class="btn p" onclick="buyNow()" ${p.stock ? '' : 'disabled'}>Buy now</button>`);
})();