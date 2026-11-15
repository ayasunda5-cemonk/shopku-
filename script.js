const WHATSAPP_NUMBER = '6285156116154'; // Format internasional
let products = [];
let cart = [];
let currentCategory = 'all';

// Load produk dari JSON
async function loadProducts() {
  try {
    const res = await fetch('products.json');
    const data = await res.json();
    products = data.products;
    renderProducts();
  } catch (err) {
    console.error('Gagal load produk:', err);
  }
}

// Render produk
function renderProducts() {
  const grid = document.getElementById('productGrid');
  const search = document.getElementById('searchInput').value.toLowerCase();
  
  let filtered = products.filter(p => {
    const matchCat = currentCategory === 'all' || p.category === currentCategory;
    const matchSearch = p.name.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#757575;">Produk tidak ditemukan 😢</p>';
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <img src="${p.image}" alt="${p.name}" class="product-img" onerror="this.src='https://via.placeholder.com/300?text=No+Image'" />
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">Rp ${p.price.toLocaleString('id-ID')}</div>
        <div class="product-meta">
          <span>⭐ 4.${Math.floor(Math.random()*9)+1}</span>
          <span>${p.sold} terjual</span>
        </div>
        <button class="btn-add" onclick="addToCart(${p.id})">+ Keranjang</button>
      </div>
    </div>
  `).join('');
}

// Tambah ke cart
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCart();
  showNotif('✅ Ditambahkan ke keranjang!');
}

// Update tampilan cart
function updateCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;

  const itemsEl = document.getElementById('cartItems');
  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-cart"></i>
        <p>Keranjang masih kosong</p>
      </div>`;
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
          <div class="cart-qty">
            <button onclick="changeQty(${item.id}, -1)">-</button>
            <input type="number" value="${item.qty}" min="1" onchange="setQty(${item.id}, this.value)" />
            <button onclick="changeQty(${item.id}, 1)">+</button>
            <button class="btn-remove" onclick="removeItem(${item.id})" title="Hapus"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `).join('');
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = 'Rp ' + total.toLocaleString('id-ID');
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) removeItem(id);
  else updateCart();
}

function setQty(id, val) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const v = parseInt(val);
  if (v < 1) removeItem(id);
  else { item.qty = v; updateCart(); }
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  updateCart();
}

// Toggle cart
function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('active');
  document.getElementById('cartOverlay').classList.toggle('active');
}

// Checkout WhatsApp
function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert('Keranjang masih kosong! 🛒');
    return;
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  let msg = `*🛒 PESANAN BARU - ShopKu*\n\n`;
  msg += `Halo kak, saya ingin memesan:\n\n`;
  
  cart.forEach((item, idx) => {
    const subtotal = item.price * item.qty;
    msg += `${idx + 1}. *${item.name}*\n`;
    msg += `   ${item.qty} x Rp ${item.price.toLocaleString('id-ID')} = *Rp ${subtotal.toLocaleString('id-ID')}*\n\n`;
  });
  
  msg += `─────────────────\n`;
  msg += `*TOTAL: Rp ${total.toLocaleString('id-ID')}*\n\n`;
  msg += `Mohon konfirmasi ketersediaan stok dan ongkir ya kak. Terima kasih 🙏`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// Notifikasi
function showNotif(text) {
  const n = document.createElement('div');
  n.textContent = text;
  n.style.cssText = `
    position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
    background:#333;color:#fff;padding:12px 24px;border-radius:30px;
    z-index:9999;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 2000);
}

// Event listener
document.getElementById('searchInput').addEventListener('input', renderProducts);
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat;
    renderProducts();
  });
});

function scrollToProducts() {
  document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
}

// Init
loadProducts();
updateCart();