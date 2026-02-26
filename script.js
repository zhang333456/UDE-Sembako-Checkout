document.addEventListener("DOMContentLoaded", async function() {

const productList = document.getElementById("productList");
const cartItemsDiv = document.getElementById("cartItems");
const summaryDiv = document.getElementById("summary");
const promoInfoDiv = document.getElementById("promoInfo");
const floating = document.getElementById("floatingCheckout");
const transferNoteDiv = document.getElementById("transferNote");

let products = await fetch('products.json').then(r=>r.json());
let ongkirData = await fetch('ongkir.json').then(r=>r.json());
let cart = {};

const whatsappNumber = "6281266221333";

function formatRupiah(num){
  return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g,".");
}

// ===== Render Produk =====
function renderProducts(){
  productList.innerHTML="";
  products.forEach(p=>{
    productList.innerHTML += `
      <div class="product">
        <div class="info">
          <b>${p.name}</b>
          <div class="price-total" id="total-${p.id}">${formatRupiah(p.price)}</div>
        </div>
        <div>
          <button onclick="buyProduct(${p.id})">Beli</button>
          <div id="qty-controls-${p.id}" style="display:none; margin-top:5px;">
            <button onclick="changeQty(${p.id},-1)">-</button>
            <span id="qty-${p.id}">0</span> pcs
            <button onclick="changeQty(${p.id},1)">+</button>
          </div>
        </div>
      </div>
    `;
  });
}

renderProducts();

// ===== Tambah / Kurang =====
window.buyProduct = function(id){
  if(!cart[id]) cart[id] = {...products.find(p=>p.id===id), qty:1};
  document.getElementById(`qty-controls-${id}`).style.display="block";
  updateSummary();
}

window.changeQty = function(id,delta){
  if(!cart[id] && delta>0) cart[id] = {...products.find(p=>p.id===id), qty:1};
  else if(cart[id]) cart[id].qty += delta;
  if(cart[id]?.qty <=0) delete cart[id];
  document.getElementById(`qty-controls-${id}`).style.display = cart[id]? "block":"none";
  updateSummary();
}

// ===== Update Payment Note =====
window.updatePaymentNote = function(){
  const method = document.querySelector('input[name="payment"]:checked')?.value;
  if(method === "TRANSFER"){
    transferNoteDiv.innerHTML = "No rek UDE Sembako akan kami kirim di WhatsApp setelah memesan";
  } else {
    transferNoteDiv.innerHTML = "";
  }
}

// ===== Update Ringkasan Cart =====
window.updateSummary = function(){
  let total=0, totalItems=0;
  let area = document.getElementById("area").value;
  let cartHtml = "";

  Object.values(cart).forEach((item,index)=>{
    const subtotal = item.price*item.qty;
    total += subtotal;
    totalItems += item.qty;
    document.getElementById(`qty-${item.id}`).innerText = item.qty;
    document.getElementById(`total-${item.id}`).innerText = formatRupiah(subtotal);

    cartHtml += `
      <div class="cart-item">
        <b>${index+1}. ${item.name}</b>
        <div>
          ${formatRupiah(subtotal)}
          <button onclick="changeQty(${item.id},-1)">-</button>
          <button onclick="changeQty(${item.id},1)">+</button>
          <button onclick="deleteItem(${item.id})">🗑️</button>
        </div>
      </div>
    `;
  });

  cartItemsDiv.innerHTML = cartHtml || "Belum ada barang";

  // Ongkir
  let shipping = ongkirData.default;
  let promoText="";
  let hasBeras10kg = cart[5]?true:false;

  if(ongkirData.gratisArea.includes(area)){
    shipping = 0;
    promoText='<div class="badge" style="color:green; font-weight:bold;">GRATIS ONGKIR ✓</div>';
  } else if(ongkirData.nearbyArea.includes(area) && (totalItems>1 || hasBeras10kg)){
    shipping=0;
    promoText='<div class="badge" style="color:green; font-weight:bold;">GRATIS ONGKIR ✓</div>';
  } else if(ongkirData.nearbyArea.includes(area)){
    shipping = ongkirData.near;
  }

  promoInfoDiv.innerHTML = promoText;

  summaryDiv.innerHTML = `
    Ongkir: ${shipping>0?formatRupiah(shipping):"GRATIS"} | <b>Total Bayar: ${formatRupiah(total+shipping)}</b>
  `;

  // Floating checkout
  floating.style.display = totalItems>0? "block":"none";
}

// ===== Delete Item =====
window.deleteItem = function(id){
  delete cart[id];
  document.getElementById(`qty-controls-${id}`).style.display="none";
  updateSummary();
}

// ===== Checkout =====
window.checkout = function(){
  if(Object.keys(cart).length==0){
    alert("Belum ada barang!");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  const detail = document.getElementById("detailAlamat").value.trim();
  const area = document.getElementById("area").value;
  const method = document.querySelector('input[name="payment"]:checked')?.value;

  if(!name || !detail || !area || !method){
    alert("Lengkapi semua info, termasuk metode bayar!");
    return;
  }

  let total = 0;
  let message = `Nama Pemesan/Toko: ${name}%0A`;

  Object.values(cart).forEach((item,index)=>{
    const subtotal = item.price*item.qty;
    total += subtotal;
    message += `${index+1}. ${item.name} x${item.qty} pcs = ${formatRupiah(subtotal)}%0A`;
  });

  // Ongkir
  let shipping = ongkirData.default;
  if(ongkirData.gratisArea.includes(area)) shipping=0;
  else if(ongkirData.nearbyArea.includes(area) && (Object.values(cart).reduce((a,b)=>a+b.qty,0)>1 || cart[5])) shipping=0;
  else if(ongkirData.nearbyArea.includes(area)) shipping=ongkirData.near;

  message += `Ongkir: ${shipping>0?formatRupiah(shipping):"GRATIS ONGKIR"}%0A`;
  message += `Total Bayar: ${formatRupiah(total+shipping)}%0A`;
  message += `METODE BAYAR: ${method}%0A`;

  window.open(`https://wa.me/${whatsappNumber}?text=${message}`,"_blank");
}

// ===== Scroll to Cart =====
window.scrollToCart = function(){
  document.querySelector(".cart").scrollIntoView({behavior:"smooth"});
}

}); // DOMContentLoaded
