```javascript
// ===== CONFIG =====
const whatsappNumber = "6281266221333";
let shippingNear = 8000;
let shippingDefault = 15000;
let cart = {};
let products = [];

// ===== LOAD PRODUCTS =====
window.addEventListener("DOMContentLoaded", async () => {
  products = await fetch("products.json").then(r => r.json());
  renderProducts();
  updateSummary();
});

// ===== RENDER PRODUCTS BERDASARKAN KATEGORI =====
function renderProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  // Kumpulkan kategori unik
  const categories = [...new Set(products.map(p => p.category || "Umum"))];

  categories.forEach(cat => {
    // Judul kategori
    productList.innerHTML += `<div class="categoryTitle">${cat}</div>`;

    products.filter(p => (p.category || "Umum") === cat).forEach(p => {
      productList.innerHTML += `
      <div class="product" id="product-${p.id}">
        <img src="${p.img}" alt="${p.name}">
        <div class="info">
          <b>${p.name}</b>
          <div class="price" id="price-${p.id}">Rp ${p.price.toLocaleString()}</div>
          <div class="qtyContainer">
            Jumlah Pcs: 
            <button class="qty-btn" onclick="changeQty(${p.id},-1)">-</button>
            <span id="qty-${p.id}">0</span>
            <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
            <div class="subPrice" id="subPrice-${p.id}">Rp 0</div>
          </div>
        </div>
      </div>
      `;
    });
  });
}

// ===== TAMBAH / KURANGKAN QTY =====
function changeQty(id, delta) {
  if(!cart[id] && delta>0) cart[id] = {...products.find(p => p.id===id), qty:0};
  if(cart[id]){
    cart[id].qty += delta;
    if(cart[id].qty < 0) cart[id].qty = 0;
  }
  updateSummary();
}

// ===== UPDATE SUMMARY & CART =====
function updateSummary() {
  let total = 0;
  let totalItems = 0;
  const cartItemsDiv = document.getElementById("cartItems");
  cartItemsDiv.innerHTML = "";

  for(let id in cart){
    const item = cart[id];
    total += item.price * item.qty;
    totalItems += item.qty;

    document.getElementById("qty-"+item.id).innerText = item.qty;
    document.getElementById("subPrice-"+item.id).innerText = `Rp ${(item.price*item.qty).toLocaleString()}`;

    if(item.qty>0){
      cartItemsDiv.innerHTML += `
        <div class="cart-item">
          <span>${item.name} x${item.qty} = Rp ${(item.price*item.qty).toLocaleString()}</span>
          <button class="deleteBtn" onclick="deleteItem(${item.id})">✖ Hapus</button>
        </div>
      `;
    }
  }

  if(totalItems===0) cartItemsDiv.innerHTML = "Belum ada barang";

  // Hitung ongkir
  let area = document.getElementById("area").value;
  let shipping = shippingDefault;
  if(area==="gadut") shipping=0;
  else if((area==="bukittinggi" || area==="tilatang kamang") && totalItems>1) shipping=0;
  else if(area==="bukittinggi" || area==="tilatang kamang") shipping=shippingNear;

  document.getElementById("totalItems").innerText = `Rp ${total.toLocaleString()}`;
  document.getElementById("shippingCost").innerText = shipping===0 ? "GRATIS ONGKIR ✅" : `Rp ${shipping.toLocaleString()}`;
  document.getElementById("summary").innerText = `Rp ${(total+shipping).toLocaleString()}`;

  // Floating checkout tetap muncul
  const floating = document.getElementById("floatingCheckout");
  floating.style.display="block";
}

// ===== DELETE ITEM =====
function deleteItem(id){
  if(cart[id]){
    cart[id].qty = 0;
    updateSummary();
  }
}

// ===== SCROLL TO CART =====
function scrollToCart(){
  document.querySelector(".cart").scrollIntoView({behavior:"smooth"});
}

// ===== CHECKOUT =====
function checkout(){
  if(Object.keys(cart).length===0){
    alert("Belum ada barang!");
    return;
  }

  let nama = document.getElementById("namaPemesan").value.trim();
  if(!nama){ alert("Isi nama pemesan!"); return; }

  let area = document.getElementById("area").value;
  let alamat = document.getElementById("detailAlamat").value;
  let catatan = document.getElementById("catatan") ? document.getElementById("catatan").value : "";

  let total = 0;
  let totalItems = 0;
  for(let id in cart){
    let i = cart[id];
    total += i.price * i.qty;
    totalItems += i.qty;
  }

  let shipping = shippingDefault;
  if(area==="gadut") shipping=0;
  else if((area==="bukittinggi" || area==="tilatang kamang") && totalItems>1) shipping=0;
  else if(area==="bukittinggi" || area==="tilatang kamang") shipping=shippingNear;

  let finalTotal = total + shipping;

  let metode = document.querySelector('input[name="bayar"]:checked').value;

  let message = `Nama Pemesan: ${nama}%0A`;
  let no=1;
  for(let id in cart){
    let i = cart[id];
    if(i.qty>0) message += `${no}. ${i.name} x${i.qty}%0A`;
    no++;
  }

  message += `%0AOngkir: ${shipping===0 ? "GRATIS ONGKIR ✅" : "Rp "+shipping.toLocaleString()}`;
  message += `%0ATotal Bayar: Rp ${finalTotal.toLocaleString()}`;
  message += `%0AMetode Bayar: ${metode}`;
  message += `%0AArea: ${area}`;
  message += `%0AAlamat: ${alamat}`;
  if(catatan) message += `%0ACatatan: ${catatan}`;

  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
}
```
