const whatsappNumber = "6281266221333";

let products = [];
let cart = {};
let ongkirData = {};

// ===== LOAD DATA =====
window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Ambil data produk
    products = await fetch("products.json").then(r => r.json());
    // Ambil data ongkir
    ongkirData = await fetch("ongkir.json").then(r => r.json());

    renderProducts();
    updateSummary();
  } catch (err) {
    console.error("Error loading JSON:", err);
  }
});

// ===== RENDER PRODUK =====
function renderProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <div class="price">Rp ${p.price.toLocaleString()}</div>
      <div class="quantity">
        <button onclick="changeQty(${p.id}, -1)">-</button>
        <span id="qty-${p.id}">0</span>
        <button onclick="changeQty(${p.id}, 1)">+</button>
      </div>
      <div class="total-product" id="total-${p.id}"></div>
    `;
    productList.appendChild(card);
  });
}

// ===== UBAH QUANTITY =====
function changeQty(id, delta) {
  const product = products.find(p => p.id === id);
  if (!cart[id] && delta > 0) cart[id] = { ...product, qty: 0 };

  if (cart[id]) {
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
  }

  updateSummary();
}

// ===== HITUNG ONGKIR DARI JSON =====
function getShipping(area, totalItems) {
  if (!ongkirData[area]) return 15000; // default
  const rules = ongkirData[area];
  // Cari rule yang cocok berdasarkan totalItems
  for (let r of rules) {
    if (totalItems >= r.minItem && totalItems <= r.maxItem) return r.cost;
  }
  return rules[rules.length - 1].cost; // fallback terakhir
}

// ===== UPDATE SUMMARY & CART =====
function updateSummary() {
  const cartItemsDiv = document.getElementById("cartItems");
  cartItemsDiv.innerHTML = "";
  let total = 0;
  let totalItems = 0;

  for (let id in cart) {
    const item = cart[id];
    total += item.price * item.qty;
    totalItems += item.qty;

    // Update product total di product-card
    const totalDiv = document.getElementById(`total-${id}`);
    totalDiv.innerText = item.qty > 0 ? `Subtotal: Rp ${(item.price*item.qty).toLocaleString()}` : "";

    // Render cart item
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <h4>${item.name}</h4>
      <div class="price">Rp ${(item.price*item.qty).toLocaleString()}</div>
      <div class="quantity-cart">
        <button onclick="changeQty(${id}, -1)">-</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${id}, 1)">+</button>
        <button class="delete" onclick="deleteItem(${id})">🗑</button>
      </div>
    `;
    cartItemsDiv.appendChild(cartItem);

    const qtySpan = document.getElementById(`qty-${id}`);
    if (qtySpan) qtySpan.innerText = item.qty;
  }

  if (totalItems === 0) cartItemsDiv.innerHTML = "<p>Belum ada barang</p>";

  const area = document.getElementById("area").value || "lainnya";
  const shipping = getShipping(area, totalItems);
  const finalTotal = total + shipping;

  document.getElementById("totalItems").innerText = `Rp ${total.toLocaleString()}`;
  document.getElementById("shippingCost").innerText = `Rp ${shipping.toLocaleString()}`;
  document.getElementById("summary").innerText = `Rp ${finalTotal.toLocaleString()}`;

  const floating = document.getElementById("floatingCheckout");
  floating.style.display = totalItems > 0 ? "block" : "none";
}

// ===== DELETE ITEM =====
function deleteItem(id) {
  delete cart[id];
  updateSummary();
}

// ===== SCROLL TO CART =====
function scrollToCart() {
  document.getElementById("cartItems").scrollIntoView({ behavior: "smooth" });
}

// ===== CHECKOUT =====
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (Object.keys(cart).length === 0) { alert("Belum ada barang!"); return; }

  const nama = document.getElementById("customerName").value.trim();
  if (!nama) { alert("Isi nama pemesan!"); return; }

  const area = document.getElementById("area").value;
  const alamat = document.getElementById("detailAlamat").value.trim();
  if (!area) { alert("Pilih lokasi!"); return; }
  if (!alamat) { alert("Isi alamat lengkap!"); return; }

  let total = 0, totalItems = 0;
  for (let id in cart) {
    total += cart[id].price * cart[id].qty;
    totalItems += cart[id].qty;
  }

  const shipping = getShipping(area, totalItems);
  const finalTotal = total + shipping;

  let metode = document.querySelector('input[name="payment"]:checked')?.value;
  if (!metode) { alert("Pilih metode bayar!"); return; }

  let message = `Nama Pemesan: ${nama}%0A`;
  let no = 1;
  for (let id in cart) {
    const i = cart[id];
    message += `${no}. ${i.name} x${i.qty} = Rp ${(i.price*i.qty).toLocaleString()}%0A`;
    no++;
  }
  message += `%0AOngkir: Rp ${shipping.toLocaleString()}`;
  message += `%0ATotal Bayar: Rp ${finalTotal.toLocaleString()}`;
  message += `%0AMetode Bayar: ${metode}`;
  message += `%0AArea: ${area}`;
  message += `%0AAlamat: ${alamat}`;

  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
});
