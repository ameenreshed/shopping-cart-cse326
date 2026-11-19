(function(){
  const u = guard('admin'); if (!u) return;

  adminShell('products', 'Products', `<button class="btn" onclick="openP()">${ic('plus',16)}Add product</button>`);

  page(`<div class="sbx" style="margin-bottom:14px;max-width:360px">${ic('search',18)}<input id="q" placeholder="Search inventory…"></div>
    <div class="tw"><table><thead><tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead><tbody id="tb"></tbody></table></div>`);

  const rows = () => {
    const tb = $('#tb'); if (!tb) return;
    const q = ($('#q')?.value || '').toLowerCase();
    const list = Prod.all().filter(p => (p.name + p.cat).toLowerCase().includes(q));
    tb.innerHTML = list.length ? list.map(p => `<tr>
      <td><span class="th tn">${pimg(p)}</span></td>
      <td><b>${esc(p.name)}</b><div class="mu sm">${(p.images || []).length} image(s)</div></td>
      <td>${esc(p.cat)}</td>
      <td>${priceHtml(p)}</td>
      <td><span class="bg ${p.stock > 3 ? 'ok' : p.stock ? 'wn' : 'er'}">${p.stock}</span></td>
      <td><div class="row" style="flex-wrap:nowrap">
        <button class="btn o s" onclick="openP(${p.id})" aria-label="Edit">${ic('edit',14)}</button>
        <button class="btn d s" onclick="delP(${p.id})" aria-label="Delete">${ic('trash',14)}</button>
      </div></td></tr>`).join('') : '<tr><td colspan="6" class="mu">No products found.</td></tr>';
    setTimeout(cardify, 0);
  };
  const qInit = $('#q'); if (qInit) qInit.oninput = rows;
  rows();

  // Convert "assets/img/p1.webp" → "p1.webp" for display; keep full URLs as-is.
  const strip = p => p.startsWith('assets/img/') ? p.slice('assets/img/'.length) : p;
  // "p1.webp, p1a.webp" → ["assets/img/p1.webp", "assets/img/p1a.webp"]; URLs/absolute paths pass through.
  const parse = raw => (raw || '').split(',').map(s => s.trim()).filter(Boolean)
    .map(s => /^(https?:\/\/|data:|assets\/|\/)/.test(s) ? s : 'assets/img/' + s)
    .slice(0, 5);

  window.openP = id => {
    const p = id ? Prod.get(id) : { name:'', cat:'', price:'', mrp:'', stock:'', desc:'', images:[] };
    if (!p) { toast('Product not found'); return; }
    const a = x => `value="${esc(x ?? '')}"`;
    const filesVal = (p.images || []).map(strip).join(', ');

    modal(`<div class="row sp" style="margin-bottom:14px"><h2>${id ? 'Edit' : 'Add'} product</h2><button class="ib" onclick="closeModal()" aria-label="Close">${ic('x',16)}</button></div>
      <form id="pf" novalidate>
        ${field('p_n','Name','text',a(p.name))}
        <div class="g2">${field('p_c','Category','text',a(p.cat)+' list="cats"')}</div>
        <datalist id="cats">${[...new Set(Prod.all().map(x => x.cat))].map(c => `<option value="${esc(c)}">`).join('')}</datalist>
        <div class="g2">${field('p_p','Selling price (₹)','number',a(p.price)+' min="1"')}${field('p_m','MRP (₹, optional)','number',a(p.mrp)+' min="0"')}</div>
        ${field('p_s','Stock','number',a(p.stock)+' min="0"')}
        <div class="f">
          <label for="p_i">Image filenames</label>
          <input id="p_i" placeholder="p11.webp, p11a.webp" ${a(filesVal)}>
          <div class="mu sm">Files live in <code>assets/img/</code>. Separate with commas (max 5). Full URLs also work. Leave empty for name-only.</div>
          <div class="err" id="e_p_i"></div>
        </div>
        <div class="f"><label for="p_d">Description</label><textarea id="p_d" rows="3">${esc(p.desc)}</textarea></div>
        <div class="row sp"><button type="button" class="btn o" onclick="closeModal()">Cancel</button><button class="btn" type="submit">Save product</button></div>
      </form>`);

    $('#pf').onsubmit = e => {
      e.preventDefault();
      const v = V(), g = i => $('#' + i).value.trim();
      const price = +g('p_p'), mrp = +g('p_m') || 0, stockStr = g('p_s');
      const d = {
        name: g('p_n'), cat: g('p_c'), price, mrp,
        stock: +stockStr, desc: g('p_d'),
        images: parse(g('p_i'))
      };
      v('p_n', d.name.length >= 2, 'Name is required.');
      v('p_c', !!d.cat, 'Category is required.');
      v('p_p', price > 0, 'Enter a price above 0.');
      v('p_m', !mrp || mrp >= price, 'MRP must be at least the selling price.');
      v('p_s', stockStr !== '' && Number.isInteger(+stockStr) && +stockStr >= 0, 'Enter a whole number, 0 or more.');
      if (!v.ok()) return;

      const ok = Prod.save(d, id);
      if (!ok) { toast('Could not save.'); return; }
      closeModal(); rows();
      toast(id ? 'Product updated' : 'Product created');
    };
  };

  window.delP = id => {
    if (!confirm('Delete this product? This also removes its reviews.')) return;
    Prod.del(id); rows(); toast('Product deleted');
  };
})();