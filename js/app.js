// --- GESTION DU SLIDESHOW (Index) ---
const slideshow = document.getElementById('slideshow');
if (slideshow) {
    for (let i = 1; i <= 10; i++) {
        const div = document.createElement('div');
        div.className = `slide ${i === 1 ? 'active' : ''}`;
        // On adapte le nom du fichier de fond ici
        const bgNumber = String(i).padStart(2, '0');
        div.style.backgroundImage = `url('images:bg:bg${bgNumber}:jpg')`;
        slideshow.appendChild(div);
    }

    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 6000);
    }
}

// --- AFFICHAGE COLLECTION ---
const grid = document.getElementById('product-grid');
if (grid && typeof products !== 'undefined') {
    products.forEach(p => {
        const img = p.images ? p.images[0] : p.image;
        grid.innerHTML += `
            <div class="product-card">
                <img src="${img}" alt="${p.name}">
                <h3 class="premium-font">${p.name}</h3>
                <p style="color: var(--gold); margin: 10px 0;">${p.price} €</p>
                <a href="product:html?id=${p.id}" class="btn-gold" style="padding: 10px 25px;">Voir l'objet</a>
            </div>
        `;
    });
}

// --- GESTION DU PANIER ---
function getCart() { return JSON.parse(localStorage.getItem('awan_cart')) || []; }
function updateCartCount() {
    const count = getCart().length;
    const el = document.getElementById('cart-count');
    if (el) el.innerText = `Panier (${count})`;
}
updateCartCount();

// --- PAGE PRODUIT ---
const urlParams = new URLSearchParams(window.location.search);
const prodId = urlParams.get('id');
if (prodId && document.getElementById('product-detail')) {
    const p = products.find(x => x.id === prodId);
    if (p) {
        document.getElementById('product-name').innerText = p.name;
        document.getElementById('product-price').innerText = `${p.price} €`;
        document.getElementById('product-desc').innerText = p.longDesc || p.shortDesc || "Description à venir.";
        document.getElementById('main-img').src = p.images ? p.images[0] : p.image;
    }
}
