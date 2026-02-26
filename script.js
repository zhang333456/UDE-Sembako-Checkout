const whatsappNumber = "6281266221333";
let shippingNear = 8000;
let shippingDefault = 15000;
let cart = {};
let products = [];

window.addEventListener("DOMContentLoaded", async () => {
  // Fetch JSON
  products = await fetch("products.json").then(r => r.json());
  renderProducts();
  updateSummary();
  handleScrollFloating();
});

// ===== RENDER PRODUK BERDASARKAN KATEGORI =====
function renderProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  // Kategori unik
  const categories = [...new Set(products.map(p => p.category))];

  categories.forEach(cat => {
    // Tambahkan judul kategori & garis tipis
    productList.innerHTML += `
      <h3 class="category-title">${cat}</h3>
      <hr class="category-divider">
    `;

    // Produk dalam kategori
    products.filter(p => p.category === cat && p.active).forEach(p => {
      productList.innerHTML += `
      <div class="product-card">
        <img src="${p.img}" alt="${p.name}">
        <div class="info">
          <b>${p.name}</b>
          <div class="price">Rp ${p.price.toLocaleString()}</div>
          <div class="quantity-controls">
            <span class="qty-label">Jumlah Pcs:</span>
            <button class="qty-btn" onclick="changeQty(${p.id},-1)">-</button>
            <span id="qty-${p.id}">${cart[p.id]?.qty || 0}</span>
            <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
          </div>
          <div class="total-product" id="total-${p.id}">Rp ${cart[p.id] ? (cart[p.id].qty*p.price).toLocaleString() : 0}</div>
        </div>
      </div>
      `;
    });
  });
}

// ===== TAMBAH / UPDATE CART =====
function changeQty(id, delta) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  if (!cart[id] && delta > 0) {
    cart[id] = { ...product, qty: 1 };
  } else if (cart[id]) {
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
  }

  // Update tampilan qty & total produk
  const qtySpan = document.getElementById(`qty-${id}`);
  const totalSpan = document.getElementById(`total-${id}`);
  qtySpan.innerText = cart[id]?.qty || 0;
  totalSpan.innerText = `Rp ${cart[id] ? (cart[id].qty*product.price).toLocaleString() : 0}`;

  updateSummary();
}

// ===== UPDATE SUMMARY =====
function updateSummary() {
  const cartItemsDiv = document.getElementById("cartItems");
  cartItemsDiv.innerHTML = "";

  let total = 0, totalItems = 0;
  for (let id in cart) {
    const item = cart[id];
    total += item.price * item.qty;
    totalItems += item.qty;

    cartItemsDiv.innerHTML += `
      <div class="cart-item">
        <span>${item.name} x${item.qty} = Rp ${(item.price*item.qty).toLocaleString()}</span>
        <button onclick="deleteItem(${item.id})">🗑</button>
      </div>
    `;
  }

  if (totalItems === 0) cartItemsDiv.innerHTML = "Belum ada barang";

  // Ongkir
  const area = document.getElementById("area").value;
  let shipping = shippingDefault;
  if (area === "gadut") shipping = 0;
  else if ((area === "bukittinggi" || area === "tilatang kamang") && totalItems > 1) shipping = 0;
  else if (area === "bukittinggi" || area === "tilatang kamang") shipping = shippingNear;

  const summaryDiv = document.getElementById("summary");
  const shippingText = shipping === 0 ? "GRATIS ONGKIR ✅" : `Rp ${shipping.toLocaleString()}`;
  summaryDiv.innerHTML = `
    Total Barang: Rp ${total.toLocaleString()}<br>
    Ongkos Kirim: <span style="color:teal">${shippingText}</span><br>
    <b>Total Bayar: Rp ${(total+shipping).toLocaleString()}</b>
  `;

  toggleFloatingCheckout(totalItems);
}

// ===== DELETE ITEM =====
function deleteItem(id) {
  delete cart[id];
  // reset qty di card produk
  const qtySpan = document.getElementById(`qty-${id}`);
  const totalSpan = document.getElementById(`total-${id}`);
  if (qtySpan) qtySpan.innerText = 0;
  if (totalSpan) totalSpan.innerText = `Rp 0`;
  updateSummary();
}

// ===== SCROLL TO CART =====
function scrollToCart() {
  document.querySelector(".cart").scrollIntoView({ behavior: "smooth" });
}

// ===== FLOATING CHECKOUT =====
function toggleFloatingCheckout(totalItems) {
  const floating = document.getElementById("floatingCheckout");
  if (totalItems > 0) floating.style.display = "block";
  else floating.style.display = "none";
}

// Floating scroll animation (loncat2)
function handleScrollFloating() {
  const floating = document.getElementById("floatingCheckout");
  window.addEventListener("scroll", () => {
    const cart = document.querySelector(".cart");
    if (!cart) return;
    const rect = cart.getBoundingClientRect();
    if (rect.top < window.innerHeight) floating.style.display = "none";
    else if (Object.keys(cart).length > 0) floating.style.display = "block";
  });
}

// ===== CHECKOUT =====
function checkout() {
  if (Object.keys(cart).length === 0) { alert("Belum ada barang!"); return; }

  const nama = document.getElementById("namaPemesan").value.trim();
  if (!nama) { alert("Isi nama pemesan!"); return; }

  const area = document.getElementById("area").value;
  const alamat = document.getElementById("detailAlamat").value;

  let total = 0, totalItems = 0;
  for (let id in cart) { total += cart[id].price*cart[id].qty; totalItems += cart[id].qty; }

  let shipping = shippingDefault;
  if (area === "gadut") shipping = 0;
  else if ((area === "bukittinggi" || area === "tilatang kamang") && totalItems > 1) shipping = 0;
  else if (area === "bukittinggi" || area === "tilatang kamang") shipping = shippingNear;

  const finalTotal = total + shipping;

  let metode = document.querySelector('input[name="bayar"]:checked');
  if (!metode) { alert("Pilih metode bayar!"); return; }
  metode = metode.value;

  let message = `Nama Pemesan: ${nama}%0A`;
  let no = 1;
  for (let id in cart) {
    let i = cart[id];
    message += `${no}. ${i.name} x${i.qty}%0A`;
    no++;
  }
  message += `%0AOngkir: ${shipping===0?"GRATIS ONGKIR ✅":`Rp ${shipping.toLocaleString()}`}`;
  message += `%0ATotal Bayar: Rp ${finalTotal.toLocaleString()}`;
  message += `%0AMetode Bayar: ${metode}`;
  message += `%0AArea: ${area}`;
  message += `%0AAlamat: ${alamat}`;

  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
}
