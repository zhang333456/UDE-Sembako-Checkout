const whatsappNumber = "6281266221333";
let shippingNear = 8000;
let shippingDefault = 15000;
let cart = {};
let products = [];

window.addEventListener("DOMContentLoaded", async () => {
  products = await fetch("products.json").then(r=>r.json());
  renderProducts();
  updateSummary();
  setupFloatingScroll();
  setupPaymentToggle();
});

// ===== RENDER PRODUK =====
function renderProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  products.forEach(p => {
    productList.innerHTML += `
      <div class="product" id="product-${p.id}">
        <div class="product-top">
          <img src="${p.img}" alt="${p.name}">
          <div class="product-info">
            <b>${p.name}</b>
            <div class="price">Rp ${p.price.toLocaleString()}</div>
          </div>
        </div>
        <div class="qty-section">
          <div class="qty-label">Jumlah Pcs :</div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQty(${p.id},-1)">-</button>
            <span class="qty-number" id="qty-${p.id}">0</span>
            <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
          </div>
          <div class="subtotal-product" id="subtotal-${p.id}">Total: Rp 0</div>
        </div>
      </div>
    `;
  });
}

// ===== TAMBAH / UBAH QUANTITY =====
function changeQty(id, delta) {
  if(!cart[id] && delta>0) cart[id] = {...products.find(p=>p.id===id), qty:0};
  if(cart[id]){
    cart[id].qty += delta;
    if(cart[id].qty <= 0) delete cart[id];
  }
  updateSummary();
}

// ===== UPDATE SUMMARY =====
function updateSummary() {
  let total = 0;
  let totalItems = 0;
  const cartItemsDiv = document.getElementById("cartItems");
  cartItemsDiv.innerHTML = "";

  for(let id in cart){
    const item = cart[id];
    total += item.price * item.qty;
    totalItems += item.qty;

    // Cart list
    cartItemsDiv.innerHTML += `
      <div class="cart-item">
        <span>${item.name} x${item.qty}</span>
        <span>Rp ${(item.price*item.qty).toLocaleString()}</span>
      </div>
    `;

    // Update qty & subtotal di card
    document.getElementById("qty-"+item.id).innerText = item.qty;
    document.getElementById("subtotal-"+item.id).innerText =
      `Total: Rp ${(item.price*item.qty).toLocaleString()}`;
  }

  if(totalItems===0) cartItemsDiv.innerHTML = "Belum ada barang";

  // ===== ONGKIR =====
  let area = document.getElementById("area").value;
  let shipping = shippingDefault;
  if(area==="gadut") shipping=0;
  else if((area==="bukittinggi" || area==="tilatang kamang") && totalItems>1) shipping=0;
  else if(area==="bukittinggi" || area==="tilatang kamang") shipping=shippingNear;

  // Update summary
  document.getElementById("totalBarang").innerText = `Rp ${total.toLocaleString()}`;
  document.getElementById("ongkir").innerText = shipping===0 ? "✅ GRATIS ONGKIR" : `Rp ${shipping.toLocaleString()}`;
  document.getElementById("totalBayar").innerText = `Rp ${(total+shipping).toLocaleString()}`;

  // Floating button show/hide
  const floating = document.getElementById("floatingCheckout");
  if(totalItems>0) floating.style.display="block";
  else floating.style.display="none";
}

// ===== DELETE ITEM =====
function deleteItem(id) {
  delete cart[id];
  updateSummary();
}

// ===== FLOATING SCROLL =====
function setupFloatingScroll(){
  const floating = document.getElementById("floatingCheckout");
  floating.addEventListener("click", scrollToCart);

  window.addEventListener("scroll", ()=>{
    const cartSection = document.querySelector(".cart");
    const cartTop = cartSection.getBoundingClientRect().top;
    if(cartTop < window.innerHeight && cartTop > 0){
      floating.style.display="none";
    } else {
      let totalItems = Object.keys(cart).length;
      if(totalItems>0) floating.style.display="block";
    }
  });
}

function scrollToCart(){
  document.querySelector(".cart").scrollIntoView({behavior:"smooth"});
}

// ===== PAYMENT TOGGLE =====
function setupPaymentToggle(){
  const transferInput = document.getElementById("transfer");
  const transferNote = document.getElementById("transferNote");

  transferInput.addEventListener("change", ()=>{
    transferNote.classList.remove("hidden");
  });

  const codInput = document.getElementById("cod");
  codInput.addEventListener("change", ()=>{
    transferNote.classList.add("hidden");
  });
}

// ===== CHECKOUT =====
function checkout() {
  if(Object.keys(cart).length===0){
    alert("Belum ada barang!");
    return;
  }

  let nama = document.getElementById("namaPemesan").value.trim();
  if(!nama){ alert("Isi nama pemesan!"); return; }

  let area = document.getElementById("area").value;
  let alamat = document.getElementById("detailAlamat").value.trim();

  if(!area){ alert("Pilih lokasi!"); return; }
  if(!alamat){ alert("Isi alamat lengkap!"); return; }

  // Hitung total & ongkir
  let total = 0;
  let totalItems = 0;
  for(let id in cart){
    const i = cart[id];
    total += i.price * i.qty;
    totalItems += i.qty;
  }

  let shipping = shippingDefault;
  if(area==="gadut") shipping=0;
  else if((area==="bukittinggi" || area==="tilatang kamang") && totalItems>1) shipping=0;
  else if(area==="bukittinggi" || area==="tilatang kamang") shipping=shippingNear;

  let finalTotal = total + shipping;

  let metode = document.querySelector('input[name="bayar"]:checked').value;

  // Buat pesan WA
  let message = `Nama Pemesan: ${nama}%0A`;
  let no = 1;
  for(let id in cart){
    const i = cart[id];
    message += `${no}. ${i.name} x${i.qty} = Rp ${(i.price*i.qty).toLocaleString()}%0A`;
    no++;
  }
  message += `%0AOngkir: ${shipping===0 ? "✅ GRATIS ONGKIR" : "Rp "+shipping.toLocaleString()}`;
  message += `%0ATotal Bayar: Rp ${finalTotal.toLocaleString()}`;
  message += `%0AMetode Bayar: ${metode}`;
  message += `%0ALokasi: ${area}`;
  message += `%0AAlamat: ${alamat}`;

  // Buka WA
  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
}
