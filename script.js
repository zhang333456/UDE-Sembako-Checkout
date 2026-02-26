const whatsappNumber = "6281266221333";
let shippingNear = 8000;
let shippingDefault = 15000;
let cart = {};
let products = [];

// LOAD PRODUCTS.JSON
window.addEventListener("DOMContentLoaded", async () => {
  products = await fetch("products.json").then(r => r.json());
  renderProducts();
  updateSummary();
});

// ===== RENDER PRODUCT BY CATEGORY =====
function renderProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  // GROUP BY CATEGORY
  const categories = [...new Set(products.map(p => p.category))];

  categories.forEach(cat => {
    productList.innerHTML += `<div class="category-title">${cat}</div>`;

    products.filter(p => p.category === cat).forEach(p => {
      productList.innerHTML += `
        <div class="product">
          <img src="${p.img}" alt="${p.name}">
          <div class="info">
            <b>${p.name}</b>
            <div class="price">Rp ${p.price.toLocaleString()}</div>
            <div class="quantity">
              Jumlah Pcs:
              <button class="qty-btn" onclick="changeQty(${p.id},-1)">-</button>
              <span id="qty-${p.id}">${cart[p.id]?.qty || 0}</span>
              <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
            </div>
            <div class="total-product" id="total-${p.id}">Rp 0</div>
          </div>
        </div>
      `;
    });
  });
}

// ===== CHANGE QUANTITY =====
function changeQty(id, delta) {
  if(!cart[id] && delta>0) cart[id] = {...products.find(p => p.id===id), qty:0};
  cart[id] = cart[id] || {...products.find(p => p.id===id), qty:0};
  cart[id].qty += delta;
  if(cart[id].qty < 0) cart[id].qty = 0;
  if(cart[id].qty === 0) delete cart[id];

  document.getElementById("qty-"+id).innerText = cart[id]?.qty || 0;
  document.getElementById("total-"+id).innerText = `Rp ${(cart[id]?.price*cart[id]?.qty || 0).toLocaleString()}`;

  updateSummary();
}

// ===== UPDATE SUMMARY =====
function updateSummary() {
  let total = 0, totalItems = 0;
  const cartItemsDiv = document.getElementById("cartItems");
  cartItemsDiv.innerHTML = "";

  for(let id in cart){
    const item = cart[id];
    total += item.price * item.qty;
    totalItems += item.qty;

    cartItemsDiv.innerHTML += `
      <div class="cart-item">
        <span>${item.name} x${item.qty}</span>
        <span>Rp ${(item.price*item.qty).toLocaleString()}</span>
        <button onclick="deleteItem(${id})">🗑</button>
      </div>
    `;
  }

  if(totalItems === 0) cartItemsDiv.innerHTML = "Belum ada barang";

  const area = document.getElementById("area").value;
  let shipping = shippingDefault;
  if(area==="gadut") shipping=0;
  else if((area==="bukittinggi" || area==="tilatang kamang") && totalItems>1) shipping=0;
  else if(area==="bukittinggi" || area==="tilatang kamang") shipping=shippingNear;

  const finalTotal = total + shipping;

  document.getElementById("totalItems").innerText = `Total Barang: Rp ${total.toLocaleString()}`;
  document.getElementById("shippingCost").innerText = shipping===0 ? "Ongkir: GRATIS ONGKIR ✅" : `Ongkir: Rp ${shipping.toLocaleString()}`;
  document.getElementById("summary").innerText = `Total Bayar: Rp ${finalTotal.toLocaleString()}`;

  const floating = document.getElementById("floatingCheckout");
  if(totalItems>0) floating.style.display="block";
  else floating.style.display="none";
}

// ===== DELETE ITEM =====
function deleteItem(id){
  delete cart[id];
  document.getElementById("qty-"+id).innerText = 0;
  document.getElementById("total-"+id).innerText = "Rp 0";
  updateSummary();
}

// ===== SCROLL TO CART =====
function scrollToCart() {
  document.querySelector(".cart").scrollIntoView({behavior:"smooth"});
}

// ===== CHECKOUT =====
function checkout(){
  if(Object.keys(cart).length === 0){ alert("Belum ada barang!"); return; }

  const nama = document.getElementById("namaPemesan").value.trim();
  if(!nama){ alert("Isi nama pemesan!"); return; }

  const area = document.getElementById("area").value;
  const alamat = document.getElementById("detailAlamat").value;

  let total = 0, totalItems = 0;
  for(let id in cart){
    const i = cart[id];
    total += i.price * i.qty;
    totalItems += i.qty;
  }

  let shipping = shippingDefault;
  if(area==="gadut") shipping=0;
  else if((area==="bukittinggi" || area==="tilatang kamang") && totalItems>1) shipping=0;
  else if(area==="bukittinggi" || area==="tilatang kamang") shipping=shippingNear;

  const finalTotal = total + shipping;

  let metode = document.querySelector('input[name="bayar"]:checked').value;

  let message = `Nama Pemesan: ${nama}%0A`;
  let no = 1;
  for(let id in cart){
    let i = cart[id];
    message += `${no}. ${i.name} x${i.qty}%0A`;
    no++;
  }
  message += `%0AOngkir: ${shipping===0 ? "GRATIS ONGKIR ✅" : "Rp "+shipping.toLocaleString()}`;
  message += `%0ATotal Bayar: Rp ${finalTotal.toLocaleString()}`;
  message += `%0AMetode Bayar: ${metode}`;
  message += `%0AArea: ${area}`;
  message += `%0AAlamat: ${alamat}`;

  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
}
