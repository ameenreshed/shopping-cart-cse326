(function(){
 const qp=new URLSearchParams(location.search),s={q:qp.get('q')||'',cat:qp.get('cat')||'All',sort:'def',deals:qp.get('deals')==='1',price:'any',rate:0,stock:false};
 const all=Prod.all(),cats=[...new Set(all.map(p=>p.cat))],PR={any:[0,1e9],u1:[0,1000],m:[1000,2500],o:[2500,1e9]};
 const disc=p=>p.mrp>p.price?1-p.price/p.mrp:0,free=inr(CONFIG.freeShipOver);
 shell('index.html');
 const sortSel=`<select id="sort" aria-label="Sort" style="width:auto"><option value="def">Featured</option><option value="pa">Price: low to high</option><option value="pd">Price: high to low</option><option value="rt">Top rated</option><option value="dc">Biggest discount</option></select>`;
 const radio=(k,v,l,cur)=>`<label><input type="radio" name="${k}" data-f="${k}" value="${esc(v)}" ${String(cur)===String(v)?'checked':''}>${l}</label>`;
 const filters=()=>`<h3>Category</h3>${['All',...cats].map(c=>radio('cat',c,esc(c),s.cat)).join('')}<h3>Price</h3>${[['any','Any price'],['u1','Under ₹1,000'],['m','₹1,000 – ₹2,500'],['o','Above ₹2,500']].map(x=>radio('price',x[0],x[1],s.price)).join('')}
 <h3>Rating</h3>${[[0,'All ratings'],[4,'4★ & up'],[3,'3★ & up']].map(x=>radio('rate',x[0],x[1],s.rate)).join('')}<h3>Availability</h3><label><input type="checkbox" data-f="stock" ${s.stock?'checked':''}>In stock only</label><label><input type="checkbox" data-f="deals" ${s.deals?'checked':''}>Deals only</label><button class="btn o s b" style="margin-top:14px" onclick="resetF()">Reset filters</button>`;
 function list(){const l=all.filter(p=>(s.cat==='All'||p.cat===s.cat)&&(p.name+p.cat+p.desc).toLowerCase().includes(s.q.toLowerCase())&&p.price>=PR[s.price][0]&&p.price<PR[s.price][1]&&Rev.avg(p.id)>=s.rate&&(!s.stock||p.stock>0)&&(!s.deals||disc(p)>0));
  const so={pa:(a,b)=>a.price-b.price,pd:(a,b)=>b.price-a.price,rt:(a,b)=>Rev.avg(b.id)-Rev.avg(a.id),dc:(a,b)=>disc(b)-disc(a)}[s.sort];if(so)l.sort(so);return l}
 function draw(){const l=list();$('#ttl').textContent=s.q?'Results for “'+s.q+'”':s.deals?'Deals':s.cat==='All'?'All products':s.cat;$('#cnt').textContent=l.length+' items';
  $('#grid').innerHTML=l.length?l.map(pcard).join(''):`<div class="empty">${ic('search',36)}<h3>No products found</h3><p>Try different filters or search.</p></div>`}
 if(!MOB){
  page(`<section class="hero"><div><span class="eb">Curated essentials · Honest reviews</span><h1>Everything you need,<br>reviewed by real buyers.</h1><p>Browse the catalog, compare ratings and check out in seconds.</p><div class="row"><a class="btn" href="#shop">${ic('bag',17)}Shop now</a><a class="btn o" href="register.html">Create account</a></div></div><div class="hcol">${all.slice(0,3).map(p=>`<a class="th" href="product.html?id=${p.id}">${pimg(p)}</a>`).join('')}</div></section>
  <div class="feat"><div>${ic('truck',20)}Free delivery over ${free}</div><div>${ic('star',20)}Real customer reviews</div><div>${ic('lock',20)}Validated, secure checkout</div></div>
  <div class="shop" id="shop"><aside class="fil card" id="fil">${filters()}</aside><section><div class="row sp" style="margin-bottom:14px"><h2 id="ttl"></h2><div class="row"><span class="mu sm" id="cnt"></span>${sortSel}</div></div><div class="grid" id="grid"></div></section></div>`);
  $('#fil').onchange=e=>{const t=e.target,k=t.dataset.f;if(!k)return;if(t.type==='checkbox')s[k]=t.checked;else s[k]=k==='rate'?+t.value:t.value;draw()};
  window.resetF=()=>{Object.assign(s,{cat:'All',price:'any',rate:0,stock:false,deals:false,q:''});$('#fil').innerHTML=filters();draw()};
 }else{
  const deals=all.filter(p=>disc(p)>0).sort((a,b)=>disc(b)-disc(a)).slice(0,6);
  page(`<form class="ms" onsubmit="return false">${ic('search',18)}<input id="mq" placeholder="Search products" value="${esc(s.q)}" aria-label="Search"></form>
  <div class="promo"><div><b>Free delivery</b><span>on orders over ${free}</span></div><a class="btn s" href="#grid">Shop now</a></div>
  ${deals.length?`<div class="row sp"><h3>${ic('bolt',16)} Hot deals</h3></div><div class="hs-row">${deals.map(hcard).join('')}</div>`:''}
  <div class="row sp" style="margin:6px 0 10px"><h3 id="ttl"></h3>${sortSel}</div><div class="mu sm" id="cnt" style="margin-bottom:10px"></div><div class="grid" id="grid"></div>`);
  $('#mq').oninput=e=>{s.q=e.target.value;draw()};
 }
 $('#sort').onchange=e=>{s.sort=e.target.value;draw()};draw();
})();