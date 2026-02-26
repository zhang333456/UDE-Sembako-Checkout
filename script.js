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

function renderProducts(){
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  // ambil kategori unik urut pertama muncul
  const categories = [...new Set(products.map(p=>p.category))];

  categories.forEach(cat=>{
    // tampilkan judul kategori
    productList.innerHTML += `<div class="category-title">${cat}</div>`;

    // tampilkan produk kategori ini
    products.filter(p=>p.category===cat).forEach(p=>{
      productList.innerHTML += `
      <div class="product">
        <img src="${p.img}" alt="${p.name}">
        <div class="info">
          <b>${p.name}</b>
          <div class="price">Rp ${p.price.toLocaleString()}</div>
          <div class="qty-label">Jumlah Pcs :</div>
          <div class="total-product" id="total-${p.id}">Rp 0</div>
        </div>
        <div class="actions">
          <button class="qty-btn" onclick="changeQty(${p.id},-1)">-</button>
          <span id="qty-${p.id}">0</span>
          <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
        </div>
      </div>
      `;
    });
  });
}

function changeQty(id, delta){
  if(!cart[id] && delta>0) cart[id] = {...products.find(p=>p.id===id), qty:0};
  if(cart[id]){
    cart[id].qty += delta;
    if(cart[id].qty<0) cart[id].qty=0;
    if(cart[id].qty===0) delete cart[id];
  }
  updateSummary();
}

function updateSummary(){
  let total = 0;
  let totalItems = 0;
  const cartItemsDiv = document.getElementById("cartItems");
  cartItemsDiv.innerHTML="";

  for(let id in cart){
    const item = cart[id];
    total += item.price * item.qty;
    totalItems += item.qty;

    cartItemsDiv.innerHTML += `
      <div class="cart-item">
        <span>${item.name} x${item.qty} = Rp ${(item.price*item.qty).toLocaleString()}</span>
        <button onclick="deleteItem(${item.id})">🗑</button>
      </div>
    `;
    document.getElementById("qty-"+item.id).innerText = item.qty;
    const totalProd = document.getElementById("total-"+item.id);
    if(totalProd) totalProd.innerText = `Rp ${(item.price*item.qty).toLocaleString()}`;
  }

  if(totalItems===0) cartItemsDiv.innerHTML="Belum ada barang";

  let area = document.getElementById("area").value;
  let shipping = shippingDefault;
  if(area==="gadut") shipping=0;
  else if((area==="bukittinggi"||area==="tilatang kamang")&&totalItems>1) shipping=0;
  else if(area==="bukittinggi"||area==="tilatang kamang") shipping=shippingNear;

  let finalTotal = total + shipping;
  document.getElementById("summary").innerText = 
    `Total Barang: Rp ${total.toLocaleString()} \n Ongkir: ${shipping===0?"✅ GRATIS ONGKIR":"Rp "+shipping.toLocaleString()} \n Total Bayar: Rp ${finalTotal.toLocaleString()}`;

  // floating checkout
  const floating = document.getElementById("floatingCheckout");
  if(totalItems>0 && window.scrollY + window.innerHeight < document.querySelector(".cart").offsetTop){
    floating.style.display="block";
  } else {
    floating.style.display="none";
  }
}

function deleteItem(id){
  delete cart[id];
  updateSummary();
}

function scrollToCart(){
  document.querySelector(".cart").scrollIntoView({behavior:"smooth"});
}

function checkout(){
  if(Object.keys(cart).length===0){ alert("Belum ada barang!"); return; }

  let nama = document.getElementById("namaPemesan").value;
  if(nama.trim()===""){ alert("Isi nama pemesan!"); return; }

  let area = document.getElementById("area").value;
  let alamat = document.getElementById("detailAlamat").value;

  let total = 0;
  let totalItems = 0;
  for(let id in cart){
    const i = cart[id];
    total += i.price*i.qty;
    totalItems += i.qty;
  }

  let shipping = shippingDefault;
  if(area==="gadut") shipping=0;
  else if((area==="bukittinggi"||area==="tilatang kamang")&&totalItems>1) shipping=0;
  else if(area==="bukittinggi"||area==="tilatang kamang") shipping=shippingNear;

  let finalTotal = total + shipping;

  let metode = document.querySelector('input[name="bayar"]:checked');
  if(!metode){ alert("Pilih metode bayar!"); return; }
  metode = metode.value;

  let message = `Nama Pemesan: ${nama}%0A`;
  let no=1;
  for(let id in cart){
    let i = cart[id];
    message += `${no}. ${i.name} x${i.qty}%0A`;
    no++;
  }
  message += `%0AOngkir: ${shipping===0?"✅ GRATIS ONGKIR":"Rp "+shipping.toLocaleString()}`;
  message += `%0ATotal Bayar: Rp ${finalTotal.toLocaleString()}`;
  message += `%0AMetode Bayar: ${metode}`;
  message += `%0AArea: ${area}`;
  message += `%0AAlamat: ${alamat}`;

  window.open(`https://wa.me/${whatsappNumber}?text=${message}`,"_blank");
}

window.addEventListener("scroll", ()=>{
  const totalItems = Object.keys(cart).length;
  const floating = document.getElementById("floatingCheckout");
  const cartTop = document.querySelector(".cart").offsetTop;

  if(totalItems>0 && window.scrollY + window.innerHeight < cartTop){
    floating.style.display="block";
  } else {
    floating.style.display="none";
  }
});
