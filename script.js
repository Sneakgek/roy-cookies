

const defaultProducts = [
  { id: 1, name: "Chocolate Chip", category: "Classic", price: 90, stock: 20, icon: "🍪" },
  { id: 2, name: "Oatmeal Raisin", category: "Classic", price: 80, stock: 15, icon: "🍪" },
  { id: 3, name: "Sugar Cookie", category: "Classic", price: 70, stock: 25, icon: "🍪" },
  { id: 4, name: "Double Chocolate", category: "Specialty", price: 110, stock: 10, icon: "🍫" },
  { id: 5, name: "Peanut Butter", category: "Specialty", price: 95, stock: 12, icon: "🥜" },
  { id: 6, name: "White Choc Macadamia", category: "Specialty", price: 120, stock: 8, icon: "🌰" },
  { id: 7, name: "Red Velvet", category: "Seasonal", price: 130, stock: 6, icon: "❤️" },
  { id: 8, name: "Gingerbread", category: "Seasonal", price: 100, stock: 5, icon: "🍯" },
];

// Load products/stock 
function loadProducts() {
  const saved = localStorage.getItem("royCookiesProducts");
  if (saved) return JSON.parse(saved);
  localStorage.setItem("royCookiesProducts", JSON.stringify(defaultProducts));
  return defaultProducts;
}

function saveProducts(products) {
  localStorage.setItem("royCookiesProducts", JSON.stringify(products));
}

function loadCart() {
  const saved = localStorage.getItem("royCookiesCart");
  return saved ? JSON.parse(saved) : [];
}

function saveCart(cart) {
  localStorage.setItem("royCookiesCart", JSON.stringify(cart));
}

let products = loadProducts();
let cart = loadCart();
let activeCategory = "All";

const productGrid = document.getElementById("productGrid");
const categoryFilters = document.getElementById("categoryFilters");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");

// Rendering

function renderCategoryFilters() {
  const categories = ["All", ...new Set(products.map(p => p.category))];
  categoryFilters.innerHTML = categories.map(cat =>
    `<button class="filter-btn ${cat === activeCategory ? "active" : ""}" data-cat="${cat}">${cat}</button>`
  ).join("");

  categoryFilters.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderCategoryFilters();
      renderProducts();
    });
  });
}

function renderProducts() {
  const filtered = activeCategory === "All"
    ? products
    : products.filter(p => p.category === activeCategory);

  productGrid.innerHTML = filtered.map(p => {
    let stockClass = "stock-ok";
    let stockLabel = `${p.stock} in stock`;
    if (p.stock === 0) {
      stockClass = "stock-out";
      stockLabel = "Out of stock";
    } else if (p.stock <= 5) {
      stockClass = "stock-low";
      stockLabel = `Only ${p.stock} left!`;
    }

    return `
      <div class="product-card">
        <div class="product-icon">${p.icon}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-category">${p.category}</div>
        <div class="product-price">₹${p.price.toFixed(2)}</div>
        <div class="product-stock ${stockClass}">${stockLabel}</div>
        <button class="add-btn" data-id="${p.id}" ${p.stock === 0 ? "disabled" : ""}>
          ${p.stock === 0 ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    `;
  }).join("");

  productGrid.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
  });
}

function renderCart() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<div class="empty-cart">Your cart is empty.</div>`;
  } else {
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.icon} ${item.name}</div>
          <div>${item.qty} × ₹${item.price.toFixed(2)}</div>
        </div>
        <button class="remove-btn" data-id="${item.id}">Remove</button>
      </div>
    `).join("");
  }

  const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.qty * i.price, 0);
  cartCountEl.textContent = totalCount;
  cartTotalEl.textContent = totalPrice.toFixed(2);

  cartItemsEl.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(Number(btn.dataset.id)));
  });
}

//  Cart logic: this is where stock actually goes up/down 

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product || product.stock <= 0) return;

  product.stock -= 1; // subtract from inventory

  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, icon: product.icon, qty: 1 });
  }

  saveProducts(products);
  saveCart(cart);
  renderProducts();
  renderCart();
}

function removeFromCart(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  const product = products.find(p => p.id === id);
  if (product) product.stock += item.qty; // give the stock back

  cart = cart.filter(i => i.id !== id);

  saveProducts(products);
  saveCart(cart);
  renderProducts();
  renderCart();
}

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  const total = cart.reduce((sum, i) => sum + i.qty * i.price, 0);
  const summary = cart.map(i => `${i.qty} × ${i.name}`).join(", ");
  alert(`Order placed!\n${summary}\nTotal: ₹${total.toFixed(2)}\nThank you for shopping at Roy Cookies!`);

  // Stock was already deducted when items were added to cart, so we just clear the cart.
  cart = [];
  saveCart(cart);
  renderCart();
}

//  Cart panel toggle 

document.getElementById("cartToggle").addEventListener("click", () => {
  cartPanel.classList.add("open");
  overlay.classList.add("show");
});

document.getElementById("closeCart").addEventListener("click", closeCartPanel);
overlay.addEventListener("click", closeCartPanel);

function closeCartPanel() {
  cartPanel.classList.remove("open");
  overlay.classList.remove("show");
}

document.getElementById("checkoutBtn").addEventListener("click", checkout);

// Init
renderCategoryFilters();
renderProducts();
renderCart();