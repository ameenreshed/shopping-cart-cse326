(function(){
 shell('account.html',{title:'Account'});const u=Auth.user();
 const mi=(h,i,l,x='')=>`<a class="mi" href="${h}" ${x}>${ic(i,18)}<span>${l}</span>${ic('chev',14)}</a>`;
 page(u?`<div class="card prof"><span class="av big">${esc(u.name[0].toUpperCase())}</span><div><h2>${esc(u.name)}</h2><div class="mu sm">${esc(u.email)}</div><span class="bg ${u.role==='admin'?'in':''}" style="margin-top:6px">${u.role}</span></div></div>
 <div class="card menu">${u.role==='admin'?mi('admin/dashboard.html','shield','Admin dashboard'):mi('orders.html','package','My orders')}${mi('wishlist.html','heart','Wishlist')}${mi('cart.html','cart','SAAHFY')}${mi('#','moon','Switch light / dark theme','onclick="toggleTheme();return false"')}${mi('#','logout','Log out','onclick="logout();return false"')}</div>`
 :`<div class="empty">${ic('user',52)}<h2>Welcome to ${CONFIG.brand}</h2><p>Log in to track orders, save a wishlist and write reviews.</p><div class="row" style="justify-content:center"><a class="btn" href="login.html">Log in</a><a class="btn o" href="register.html">Create account</a></div></div>`);
})();
