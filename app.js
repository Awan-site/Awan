(function(){
  const $ = (sel, el=document) => el.querySelector(sel);
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

  const PRODUCTS = window.AWAN_PRODUCTS || [];
  const BG = window.AWAN_BG || [];
  const CART_KEY = "awan_cart_v1";

  function money(p){
    return `${p.toFixed(0)} €`;
  }

  function getProduct(id){
    return PRODUCTS.find(p => p.id === id);
  }

  function loadCart(){
    try{
      return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    }catch(e){
      return {};
    }
  }

  function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function cartCount(){
    const cart = loadCart();
    return Object.values(cart).reduce((a,b)=>a + b, 0);
  }

  function updateCartCount(){
    const el = $("#cartCount");
    if(!el) return;
    const c = cartCount();
    el.textContent = c;
    el.style.display = c > 0 ? "inline-flex" : "none";
  }

  function addToCart(id, qty=1){
    const cart = loadCart();
    cart[id] = (cart[id] || 0) + qty;
    if(cart[id] <= 0) delete cart[id];
    saveCart(cart);
  }

  function setQty(id, qty){
    const cart = loadCart();
    if(qty <= 0) delete cart[id];
    else cart[id] = qty;
    saveCart(cart);
  }

  function clearCart(){
    localStorage.removeItem(CART_KEY);
    updateCartCount();
  }

  // HOME background slideshow
  function initHomeSlideshow(){
    const bgEl = $("#homeBg");
    if(!bgEl || !BG.length) return;

    let i = 0;
    bgEl.style.backgroundImage = `url('${BG[i]}')`;

    // slow + elegant
    const duration = 7000; // 7s
    setInterval(() => {
      i = (i + 1) % BG.length;

      // fade trick: use opacity
      bgEl.style.opacity = 0.0;
      setTimeout(() => {
        bgEl.style.backgroundImage = `url('${BG[i]}')`;
        bgEl.style.opacity = 1.0;
      }, 700);
    }, duration);
  }

  function renderCollection(){
    const grid = $("#collectionGrid");
    if(!grid) return;

    grid.innerHTML = PRODUCTS.map(p => `
      <article class="card">
        <div class="media">
          <img src="${p.cover}" alt="${escapeHtml(p.name)}">
        </div>
        <div class="body">
          <div class="kicker">AWAN • Collection</div>
          <div class="title">${escapeHtml(p.name)}</div>
          <div class="row">
            <div class="price">${money(p.price)}</div>
            <span class="badge">Premium minimal</span>
          </div>
          <div class="actions">
            <div class="small">${escapeHtml(p.short)}</div>
            <a class="btn" href="product.html?id=${encodeURIComponent(p.id)}">Voir</a>
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderProduct(){
    const wrap = $("#productWrap");
    if(!wrap) return;

    const params = new URLSearchParams(location.search);
    const id = params.get("id") || "";
    const p = getProduct(id);

    if(!p){
      wrap.innerHTML = `
        <div class="panel">
          <div class="h1">Produit introuvable</div>
          <p class="lead">Le lien semble incomplet. Retour à la collection.</p>
          <a class="btn" href="collection.html">Voir la collection</a>
        </div>
      `;
      return;
    }

    const imgs = p.images && p.images.length ? p.images : [p.cover];
    const main = imgs[0];

    wrap.innerHTML = `
      <div class="product">
        <div class="gallery">
          <div class="main">
            <img id="mainImg" src="${main}" alt="${escapeHtml(p.name)}">
          </div>
          <div class="thumbs">
            ${imgs.map((src, idx)=>`
              <div class="thumb" data-src="${src}" title="Image ${idx+1}">
                <img src="${src}" alt="${escapeHtml(p.name)} ${idx+1}">
              </div>
            `).join("")}
          </div>
        </div>

        <aside class="panel">
          <div class="kicker">AWAN • Objet</div>
          <div class="h1" style="margin-top:6px;">${escapeHtml(p.name)}</div>
          <div class="row" style="margin:10px 0 6px;">
            <div class="price" style="font-size:20px;">${money(p.price)}</div>
            <span class="badge">Livraison : info en CGV</span>
          </div>
          <p class="lead" style="margin-top:10px;">${escapeHtml(p.short)}</p>
          <div class="desc">${escapeHtml(p.long)}</div>

          <hr class="sep">

          <div class="row">
            <button class="btn primary" id="addBtn">Ajouter au panier</button>
            <a class="btn" href="cart.html">Voir le panier</a>
          </div>

          <p class="small" style="margin-top:12px;">
            Paiement non actif (démo). Le panier sert de maquette.
          </p>
        </aside>
      </div>
    `;

    // thumbs click
    $$(".thumb", wrap).forEach(t => {
      t.addEventListener("click", () => {
        const src = t.getAttribute("data-src");
        $("#mainImg", wrap).src = src;
      });
    });

    $("#addBtn", wrap).addEventListener("click", () => {
      addToCart(p.id, 1);
      pulseCart();
    });
  }

  function pulseCart(){
    const badge = $("#cartCount");
    if(!badge) return;
    badge.animate([
      { transform:"scale(1)" },
      { transform:"scale(1.22)" },
      { transform:"scale(1)" }
    ], { duration: 420, easing: "ease-out" });
  }

  function renderCart(){
    const list = $("#cartList");
    const sum = $("#cartSummary");
    if(!list || !sum) return;

    const cart = loadCart();
    const items = Object.entries(cart)
      .map(([id, qty]) => ({ product: getProduct(id), qty }))
      .filter(x => x.product);

    if(items.length === 0){
      list.innerHTML = `
        <div class="panel">
          <div class="h1">Panier vide</div>
          <p class="lead">Ici, on garde ce que tu aimes. Pour l’instant, il n’y a rien dedans.</p>
          <a class="btn" href="collection.html">Continuer la collection</a>
        </div>
      `;
      sum.innerHTML = `
        <div class="panel">
          <div class="title">Résumé</div>
          <p class="small">Ajoute un produit pour voir le total.</p>
        </div>
      `;
      return;
    }

    let total = 0;

    list.innerHTML = items.map(({product:p, qty}) => {
      const lineTotal = p.price * qty;
      total += lineTotal;

      return `
        <div class="line" data-id="${p.id}">
          <div class="img"><img src="${p.cover}" alt="${escapeHtml(p.name)}"></div>
          <div class="meta">
            <div class="title">${escapeHtml(p.name)}</div>
            <div class="small">${money(p.price)} • ${escapeHtml(p.short)}</div>
            <div class="row" style="margin-top:10px;">
              <div class="qty">
                <button class="dec" aria-label="Diminuer">−</button>
                <span class="q">${qty}</span>
                <button class="inc" aria-label="Augmenter">+</button>
              </div>
              <div class="price">${money(lineTotal)}</div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    sum.innerHTML = `
      <div class="panel">
        <div class="title">Résumé</div>
        <p class="small">Total estimatif (démo).</p>
        <hr class="sep">
        <div class="row">
          <div style="font-weight:700;">Total</div>
          <div class="price" style="font-size:18px;">${money(total)}</div>
        </div>
        <div style="height:12px"></div>
        <button class="btn" id="clearBtn">Vider le panier</button>
        <div style="height:10px"></div>
        <a class="btn primary" href="collection.html">Continuer la collection</a>
        <p class="small" style="margin-top:12px;">
          Paiement non actif (démo). Voir CGV pour la version vente.
        </p>
      </div>
    `;

    // events qty
    $$(".line").forEach(line => {
      const id = line.getAttribute("data-id");
      const qEl = $(".q", line);
      const dec = $(".dec", line);
      const inc = $(".inc", line);

      dec.addEventListener("click", () => {
        const cur = parseInt(qEl.textContent, 10);
        const next = cur - 1;
        setQty(id, next);
        location.reload();
      });

      inc.addEventListener("click", () => {
        const cur = parseInt(qEl.textContent, 10);
        const next = cur + 1;
        setQty(id, next);
        location.reload();
      });
    });

    $("#clearBtn").addEventListener("click", () => {
      clearCart();
      location.reload();
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  function init(){
    updateCartCount();

    const page = document.body.getAttribute("data-page") || "";
    if(page === "home") initHomeSlideshow();
    if(page === "collection") renderCollection();
    if(page === "product") renderProduct();
    if(page === "cart") renderCart();
  }

  document.addEventListener("DOMContentLoaded", init);
})();