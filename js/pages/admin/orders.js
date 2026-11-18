(function(){
 const u = guard('admin'); if (!u) return;
 adminShell('orders','Orders');
 let f = 'All';
 const ST = ['Placed','Shipped','Delivered'];
 window.setSt = (id, v) => { Ord.status(id, v); toast('Order #' + id + ' marked ' + v); draw(); };
 window.fil = s => { f = s; draw(); };

 function draw() {
   const l = Ord.all().filter(o => f === 'All' || o.status === f);
   page(`<div class="chips">${['All', ...ST].map(s => `<button class="cp ${s === f ? 'on' : ''}" onclick="fil('${s}')">${s}</button>`).join('')}</div>
   <div class="tw"><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>
   ${l.map(o => `<tr>
     <td><b>#${o.id}</b><div class="mu sm">${o.date}</div></td>
     <td>${esc(o.user)}<div class="mu sm">${o.ship ? esc(o.ship.phone) : ''}</div></td>
     <td class="sm">${o.items.map(i => `${esc(i.name)} × ${i.q}`).join('<br>')}</td>
     <td>${inr(o.total)}</td>
     <td><select onchange="setSt(${o.id},this.value)" aria-label="Order status">${ST.map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
   </tr>`).join('') || '<tr><td colspan="5" class="mu">No orders found.</td></tr>'}
   </tbody></table></div>`);
 }
 draw();
})();