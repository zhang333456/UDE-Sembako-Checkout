const whatsappNumber = "6281266221333";
let shippingNear = 8000;
let shippingDefault = 15000;
let cart = {};
let products = [];

window.addEventListener("DOMContentLoaded", async () => {
  products = await fetch("products.json").then(r=>r.json());
  renderProducts();
  updateSummary();
});

// ===== RENDER PRODUK =====
function renderProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  const categories = [...new Set(products.map(p => p.category || "Umum"))];
  categories.forEach(cat => {
    productList.innerHTML += `<h4 class="categoryTitle">${cat}</h4><hr>`;
    products.filter(p=>p.category===cat || (cat==="Umum" && !p.category)).forEach(p=>{
      productList.innerHTML += `
        <div class="product">
          <img src="${p.img}" alt="${p.name}">
          <div class="info">
            <b>${p.name}</b>
            <div class="price">Rp ${p.price.toLocaleString()}</div>
            <div class="total-product" id="total-${p.id}">Rp 0</div>
          </div>
          <div class="actions">
            <span class="qtyLabel">Jumlah Pcs:</span>
            <button class="qty-btn" onclick="changeQty(${p.id},-1)">-</button>
            <span id="qty-${p.id}">0</span>
            <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
          </div>
        </div>
      `;
    });
  });
}

// ===== CHANGE QTY =====
function changeQty(id, delta) {
  if(!cart[id] && delta>0) cart[id] = {...products.find(p=>p.id===id), qty:0};
  if(cart[id]) {
    cart[id].qty += delta;
    if(cart[id].qty<0) cart[id].qty=0;
    document.getElementById("qty-"+id).innerText = cart[id].qty;
    document.getElementById("total-"+id).innerText = "Rp " + (cart[id].price*cart[id].qty).toLocaleString();
    if(cart[id].qty===0) delete cart[id];
  }
  updateSummary();
}

// ===== UPDATE SUMMARY =====
function updateSummary() {
  let total=0, totalItems=0;
  const cartItemsDiv = document.getElementById("cartItems");
  cartItemsDiv.innerHTML="";
  for(let id in cart){
    const item = cart[id];
    total += item.price*item.qty;
    totalItems += item.qty;
    cartItemsDiv.innerHTML += `
      <div class="cart-item">
        <span>${item.name} x${item.qty}</span>
        <button class="hapus" onclick="deleteItem(${id})">× Hapus</button>
      </div>
    `;
  }
  if(totalItems===0) cartItemsDiv.innerHTML="Belum ada barang";

  let area = document.getElementById("area").value;
  let shipping = shippingDefault;
  if(area==="gadut") shipping=0;
  else if((area==="bukittinggi" || area==="tilatang kamang") && totalItems>1) shipping=0;
  else if(area==="bukittinggi" || area==="tilatang kamang") shipping=shippingNear;

  document.getElementById("totalItems").innerText = "Rp " + total.toLocaleString();
  document.getElementById("shippingCost").innerText = shipping===0?"GRATIS ONGKIR ✅":"Rp " + shipping.toLocaleString();
  document.getElementById("summary").innerText = "Rp " + (total+shipping).toLocaleString();

  // transfer note logic
  const metode = document.querySelector('input[name="bayar"]:checked')?.value;
  document.getElementById("transferNote").style.display = metode==="TRANSFER"?"block":"none";
}

// ===== DELETE ITEM =====
function deleteItem(id){
  delete cart[id];
  document.getElementById("qty-"+id).innerText="0";
  document.getElementById("total-"+id).innerText="Rp 0";
  updateSummary();
}

// ===== SCROLL TO CART =====
function scrollToCart(){
  document.querySelector(".cart").scrollIntoView({behavior:"smooth"});
}

// ===== CHECKOUT =====
function checkout(){
  if(Object.keys(cart).length===0){alert("Belum ada barang!"); return;}
  const nama = document.getElementById("namaPemesan").value.trim();
  if(!nama){alert("Isi nama pemesan!"); return;}
  const alamat = document.getElementById("detailAlamat").value.trim();
  const catatan = document.getElementById("catatan").value.trim();
  const area = document.getElementById("area").value;
  const metode = document.querySelector('input[name="bayar"]:checked')?.value;
  if(!metode){alert("Pilih metode bayar!"); return;}
  
  let total=0, totalItems=0;
  for(let id in cart){total+=cart[id].price*cart[id].qty; totalItems+=cart[id].qty;}
  let shipping = shippingDefault;
  if(area==="gadut") shipping=0;
  else if((area==="bukittinggi" || area==="tilatang kamang") && totalItems>1) shipping=0;
  else if(area==="bukittinggi" || area==="tilatang kamang") shipping=shippingNear;

  let finalTotal = total + shipping;
  let message = `Nama Pemesan: ${nama}%0A`;
  let no=1;
  for(let id in cart){message += `${no}. ${cart[id].name} x${cart[id].qty}%0A`; no++;}
  message += `%0AOngkir: ${shipping===0?"GRATIS ONGKIR ✅":"Rp "+shipping.toLocaleString()}`;
  message += `%0ATotal Bayar: Rp ${finalTotal.toLocaleString()}`;
  message += `%0AMetode Bayar: ${metode}`;
  message += `%0AArea: ${area}`;
  message += `%0AAlamat: ${alamat}`;
  if(catatan) message += `%0ACatatan: ${catatan}`;

  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
}
