const whatsappNumber = "6281266221333";
let shippingNear = 8000;
let shippingDefault = 15000;
let cart = {};
let products = [];

window.addEventListener("DOMContentLoaded", async () => {
  products = await fetch("products.json").then(r=>r.json());
  renderProductsByCategory();
  updateSummary();
});

function renderProductsByCategory() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  const categories = [...new Set(products.map(p => p.category || "Umum"))];
  categories.forEach(cat => {
    const catTitle = document.createElement("h3");
    catTitle.innerText = cat;
    catTitle.style.marginTop = "20px";
    catTitle.style.fontWeight = "300";
    catTitle.style.borderBottom = "1px solid #ccc";
    catTitle.style.paddingBottom = "4px";
    productList.appendChild(catTitle);
    products.filter(p => p.active && (p.category||"Umum")===cat).forEach(p => {
      const card = document.createElement("div");
      card.className = "product";
      card.innerHTML = `
        <img src="${p.img}" alt="${p.name}">
        <div class="info">
          <b>${p.name}</b>
          <div class="price">Rp ${p.price.toLocaleString()}</div>
          <div class="qty-container">
            Jumlah Pcs: 
            <button class="qty-btn" onclick="changeQty(${p.id},-1)">-</button>
            <span id="qty-${p.id}">0</span>
            <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
            <div class="total-product" id="total-${p.id}">Rp 0</div>
          </div>
        </div>
      `;
      productList.appendChild(card);
    });
  });
}

function addToCart(id) {
  if(!cart[id]) cart[id] = {...products.find(p=>p.id===id), qty:1};
  updateSummary();
}

function changeQty(id, delta) {
  if(!cart[id] && delta>0) cart[id] = {...products.find(p=>p.id===id), qty:1};
  else if(cart[id]){
    cart[id].qty += delta;
    if(cart[id].qty <= 0) {
      cart[id].qty = 0;
      delete cart[id];
    }
  }
  document.getElementById("qty-"+id).innerText = cart[id]?.qty || 0;
  document.getElementById("total-"+id).innerText = cart[id]? `Rp ${(cart[id].price*cart[id].qty).toLocaleString()}` : "Rp 0";
  updateSummary();
}

function updateSummary() {
  let total = 0;
  let totalItems = 0;
  const cartItemsDiv = document.getElementById("cartItems");
  cartItemsDiv.innerHTML = "";
  for(let id in cart){
    const item = cart[id];
    total += item.price * item.qty;
    totalItems += item.qty;
    const miniCard = document.createElement("div");
    miniCard.className = "cart-item";
    miniCard.innerHTML = `
      <span>${item.name} x${item.qty} = Rp ${ (item.price*item.qty).toLocaleString() }</span>
      <button onclick="deleteItem(${item.id})" style="background:red;color:white;border:none;padding:2px 6px;border-radius:4px;">✕ Hapus</button>
    `;
    cartItemsDiv.appendChild(miniCard);
  }
  if(totalItems===0) cartItemsDiv.innerHTML = "Belum ada barang";
  let area = document.getElementById("area").value;
  let shipping = shippingDefault;
  if(area==="gadut") shipping=0;
  else if((area==="bukittinggi" || area==="tilatang kamang") && totalItems>1) shipping=0;
  else if(area==="bukittinggi" || area==="tilatang kamang") shipping=shippingNear;
  const summaryEl = document.getElementById("summary");
  summaryEl.innerHTML = `
    Total Barang: <span style="font-size:14px;color:#333;">Rp ${total.toLocaleString()}</span><br>
    Ongkir: <span style="font-size:14px;color:${shipping===0?"teal":"#333"}">${shipping===0?"GRATIS ONGKIR": "Rp "+shipping.toLocaleString()}</span><br>
    Total Bayar: <span style="font-size:18px;font-weight:bold;color:#006400;">Rp ${(total+shipping).toLocaleString()}</span>
  `;
  const floating = document.getElementById("floatingCheckout");
  if(totalItems>0) floating.style.display="block";
  else floating.style.display="none";
}

function deleteItem(id) {
  delete cart[id];
  document.getElementById("qty-"+id).innerText = 0;
  document.getElementById("total-"+id).innerText = "Rp 0";
  updateSummary();
}

function scrollToCart() {
  document.querySelector(".cart").scrollIntoView({behavior:"smooth"});
  document.getElementById("floatingCheckout").style.display="none";
}

function checkout() {
  if(Object.keys(cart).length===0){
    alert("Belum ada barang!");
    return;
  }
  let nama = document.getElementById("namaPemesan").value.trim();
  if(!nama){ alert("Isi nama pemesan!"); return; }
  let area = document.getElementById("area").value;
  let alamat = document.getElementById("detailAlamat").value;
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
  let metode = document.querySelector('input[name="bayar"]:checked');
  if(!metode){ alert("Pilih metode bayar!"); return; }
  metode = metode.value;
  let message = `Nama Pemesan: ${nama}%0A`;
  let no = 1;
  for(let id in cart){
    let i = cart[id];
    message += `${no}. ${i.name} x${i.qty}%0A`;
    no++;
  }
  message += `%0AOngkir: ${shipping===0?"GRATIS ONGKIR ✅":"Rp "+shipping.toLocaleString()}`;
  message += `%0ATotal Bayar: Rp ${finalTotal.toLocaleString()}`;
  message += `%0AMetode Bayar: ${metode}`;
  message += `%0AArea: ${area}`;
  message += `%0AAlamat: ${alamat}`;
  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
}
```

