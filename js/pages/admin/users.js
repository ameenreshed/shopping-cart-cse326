(function(){
 const u=guard('admin');if(!u)return;adminShell('users','Customers');const os=Ord.all();
 page(`<div class="tw"><table><thead><tr><th>Customer</th><th>Email</th><th>Joined</th><th>Orders</th><th>Total spent</th></tr></thead><tbody>${db.users.filter(x=>x.role==='customer').map(c=>{const m=os.filter(o=>o.uid===c.id);return`<tr><td><div class="row"><span class="av">${esc(c.name[0].toUpperCase())}</span><b>${esc(c.name)}</b></div></td><td>${esc(c.email)}</td><td>${c.joined}</td><td>${m.length}</td><td>${inr(m.reduce((a,o)=>a+o.total,0))}</td></tr>`}).join('')}</tbody></table></div>`);
})();
