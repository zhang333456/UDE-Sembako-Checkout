document.addEventListener("DOMContentLoaded", function () {

  // ================= PENGATURAN =================
  let shippingNear = 8000;
  let shippingDefault = 15000;
  const whatsappNumber = "628xxxxxxxxxx";

  // ================= FORMAT RUPIAH =================
  function formatRupiah(num){
    return "Rp. " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g,".");
  }

  // ================= DATA PRODUK =================
  const products = [
    { id:1, name:"Minyak Kita 1 Dus", price:320000, img:"https://via.placeholder.com/100", active:true },
    { id:2, name:"Minyak Kita 1 Liter", price:16000, img:"https://via.placeholder.com/100", active:true },
    { id:3, name:"Minyak Kita 2 Liter", price:31000, img:"https://via.placeholder.com/100", active:true },
    { id:4, name:"Beras 5 Kg", price:65000, img:"https://via.placeholder.com/100", active:true },
    { id:5, name:"Beras 10 Kg", price:180000, img:"https://via.placeholder.com/100", active:true },
    { id:6, name:"Gas 3 Kg", price:22000, img:"https://via.placeholder.com/100", active:true },
    { id:7, name:"Gas 5 Kg", price:85000, img:"https://via.placeholder.com/100", active:true }
  ];

  let cart = {};
  const productList = document.getElementById("productList");

  // ================= RENDER PRODUK =================
  function renderProducts(){
    productList.innerHTML="";
    products.forEach(p=>{
      productList.innerHTML += `
        <div class="product">
          <img src="${p.img}">
          <div style="flex:1">
            <b>${p.name}</b>
            <div class="price">${formatRupiah(p.price)}</div>
          </div>
          <div>
            <button class="qty-btn" onclick="changeQty(${p.id},-1)">-</button>
            <span id="qty-${p.id}">0</span>
            <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
          </div>
        </div>
      `;
    });
  }

  renderProducts();

  // ================= FLOATING CLICK SCROLL =================
  let floatingBtn = document.getElementById("floatingCheckout");
  if(floatingBtn){
    floatingBtn.addEventListener("click", function(){
      document.querySelector(".cart").scrollIntoView({behavior:"smooth"});
    });
  }

  // ================= TAMBAH / KURANG =================
  window.changeQty = function(id, delta){
    let product = products.find(p=>p.id===id);
    if(!cart[id]){
      if(delta>0) cart[id] = {...product, qty:1};
    } else {
      cart[id].qty += delta;
      if(cart[id].qty <=0) delete cart[id];
    }
    updateSummary();
  }

  // ================= UPDATE RINGKASAN =================
  window.updateSummary = function(){
    let total = 0;
    let totalItems = 0;

    products.forEach(p=>{
      let qtyEl = document.getElementById("qty-"+p.id);
      if(qtyEl) qtyEl.innerText = cart[p.id]?.qty || 0;
    });

    let cartHtml = "";
    Object.values(cart).forEach(item=>{
      total += item.price * item.qty;
      totalItems += item.qty;

      cartHtml += `
        <div class="cart-item">
          <div>${item.name} x${item.qty}</div>
          <div>
            <button onclick="changeQty(${item.id},-1)">-</button>
            <button onclick="changeQty(${item.id},1)">+</button>
          </div>
        </div>
      `;
    });

    document.getElementById("cartItems").innerHTML = cartHtml || "Belum ada barang";

    let area = document.getElementById("area").value;
    let shipping = shippingDefault;
    let hasBeras10kg = cart[5] ? true : false;
    let promoText = "";

    if(area==="gadut"){
      shipping=0;
      promoText='<div class="badge">Area Anda GRATIS ONGKIR 🎉</div>';
    }
    else if((area==="bukittinggi" || area==="tilatang kamang") && (totalItems>1 || hasBeras10kg)){
      shipping=0;
      promoText='<div class="badge">GRATIS ONGKIR 🎉</div>';
    }
    else if(area==="bukittinggi" || area==="tilatang kamang"){
      shipping=shippingNear;
    }

    document.getElementById("promoInfo").innerHTML = promoText;
    let finalTotal = total + shipping;

    document.getElementById("summary").innerText =
      "Total Barang: " + formatRupiah(total) +
      " | Ongkir: " + formatRupiah(shipping) +
      " | Total Bayar: " + formatRupiah(finalTotal);

    // ===== FLOATING CHECKOUT =====
    if(floatingBtn){
      floatingBtn.style.display = totalItems>0 ? "block" : "none";
    }
  }

  // ================= CHECKOUT =================
  window.checkout = function(){
    if(Object.keys(cart).length === 0){
      alert("Belum ada barang!");
      return;
    }

    let area = document.getElementById("area").value;
    let detail = document.getElementById("detailAlamat").value;
    if(area===""){
      alert("Pilih kecamatan dulu");
      return;
    }

    let total = 0;
    let totalItems = 0;
    Object.values(cart).forEach(i=>{
      total += i.price*i.qty;
      totalItems += i.qty;
    });

    let shipping = shippingDefault;
    let hasBeras10kg = cart[5] ? true : false;

    if(area==="gadut") shipping=0;
    else if((area==="bukittinggi" || area==="tilatang kamang") && (totalItems>1 || hasBeras10kg)) shipping=0;
    else if(area==="bukittinggi" || area==="tilatang kamang") shipping=shippingNear;

    let finalTotal = total + shipping;

    let message="Pesanan:%0A";
    Object.values(cart).forEach(i=>{
      message += `${i.name} x${i.qty}%0A`;
    });
    message += `%0AArea: ${area}`;
    message += `%0AAlamat: ${detail}`;
    message += `%0ATotal Barang: ${formatRupiah(total)}`;
    message += `%0AOngkir: ${formatRupiah(shipping)}`;
    message += `%0ATotal Bayar: ${formatRupiah(finalTotal)}`;

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`,"_blank");
  }

});