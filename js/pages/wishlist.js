(function(){
 shell('wishlist.html',{title:'Wishlist'});const h=window.heart;
 window.heart=(id,b)=>{h(id,b);draw()};window.allToCart=()=>{let n=0;Wish.all().forEach(p=>{if(Cart.add(p.id))n++});syncBadge();toast(n?n+' item(s) added to cart':'Nothing could be added')};
 function draw(){const l=Wish.all();
 page(`<div class="row sp" style="margin-bottom:18px"><h1>My wishlist</h1>${l.length?`<button class="btn" onclick="allToCart()">${ic('cart',16)}Add all to cart</button>`:''}</div>
 ${l.length?`<div class="grid">${l.map(pcard).join('')}</div>`:`<div class="empty">${ic('heart',52)}<h2>Your wishlist is empty</h2><p>Tap the heart on any product to save it here.</p><a class="btn" href="index.html">Browse products</a></div>`}`)}
 draw();
})();
