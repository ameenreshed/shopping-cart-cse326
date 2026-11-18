(function(){
 const u=guard('admin');if(!u)return;adminShell('dashboard','Dashboard');
 const os=Ord.all(),rev=os.reduce((a,o)=>a+o.total,0),low=Prod.all().filter(p=>p.stock<=3),cat={};
 os.forEach(o=>o.items.forEach(i=>{const p=Prod.get(i.pid),c=p?p.cat:'Other';cat[c]=(cat[c]||0)+i.price*i.q}));
 const mx=Math.max(1,...Object.values(cat)),S=(i,v,l)=>`<div class="card stc"><i>${ic(i,20)}</i><div><b>${v}</b><span class="mu sm">${l}</span></div></div>`;
 page(`<div class="stats">${S('rupee',inr(rev),'Total revenue')}${S('package',os.length,'Orders')}${S('users',db.users.filter(x=>x.role==='customer').length,'Customers')}${S('alert',low.length,'Low stock items')}</div>
 <div class="dg"><div class="card"><h3 style="margin-bottom:12px">Sales by category</h3>${Object.keys(cat).map(c=>`<div class="bl" style="grid-template-columns:90px 1fr 80px"><span>${esc(c)}</span><i><b style="width:${cat[c]/mx*100}%"></b></i><span>${inr(cat[c])}</span></div>`).join('')||'<p class="mu">No sales yet.</p>'}</div>
 <div class="card"><h3 style="margin-bottom:12px">Low stock</h3>${low.map(p=>`<div class="row sp" style="padding:6px 0"><span class="row" style="flex-wrap:nowrap"><span class="th tn">${pimg(p)}</span>${esc(p.name)}</span><span class="bg ${p.stock?'wn':'er'}">${p.stock} left</span></div>`).join('')||'<p class="mu">All products are well stocked.</p>'}<a class="btn o s" style="margin-top:10px" href="products.html">Manage inventory</a></div></div>
 <h3 style="margin-bottom:10px">Recent orders</h3><div class="tw"><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>${os.slice(0,5).map(o=>`<tr><td>#${o.id}</td><td>${esc(o.user)}</td><td>${o.date}</td><td>${inr(o.total)}</td><td><span class="bg ${{Placed:'in',Shipped:'wn',Delivered:'ok'}[o.status]}">${o.status}</span></td></tr>`).join('')||'<tr><td colspan="5" class="mu">No orders yet.</td></tr>'}</tbody></table></div>`);
})();
