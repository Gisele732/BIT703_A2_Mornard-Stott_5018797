// js/cart.js
const CART_KEY = "aag_cart_v1";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId, qty = 1, model = null) {
  const id = Number(productId);
  const quantity = Math.max(1, Number(qty) || 1);

  const cart = getCart();
  const existing = cart.find((item) => item.id === id && item.model === model);

  if (existing) existing.qty += quantity;
  else cart.push({ id, qty: quantity, model });

  saveCart(cart);
  updateCartCount();
}

function updateItemQty(index, qty) {
  const cart = getCart();
  const quantity = Math.max(1, Number(qty) || 1);
  if (!cart[index]) return;
  cart[index].qty = quantity;
  saveCart(cart);
  updateCartCount();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCartCount();
}

function clearCart() {
  saveCart([]);
  updateCartCount();
}

function cartTotals() {
  const cart = getCart();
  const items = cart
    .map((item) => {
      const p = PRODUCTS[item.id];
      if (!p) return null;
      return {
        ...item,
        name: p.name,
        price: p.price,
        image: p.image,
        lineTotal: p.price * item.qty
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const shipping = subtotal > 0 ? 0 : 0; // wireframe shows FREE
  const taxes = subtotal > 0 ? 13 : 0;   // matches your example; you can change later
  const total = subtotal + shipping + taxes;

  return { items, subtotal, shipping, taxes, total };
}

/* Optional small badge in nav (if you add a span) */
function updateCartCount() {
  const el = document.querySelector("[data-cart-count]");
  if (!el) return;
  const count = getCart().reduce((sum, i) => sum + i.qty, 0);
  el.textContent = String(count);
}

/* Cart page rendering */
function renderCartStep1({
  itemsContainerSelector,
  subtotalSelector,
  shippingSelector,
  taxesSelector,
  totalSelector
}) {
  const container = document.querySelector(itemsContainerSelector);
  if (!container) return;

  const { items, subtotal, shipping, taxes, total } = cartTotals();

  if (items.length === 0) {
    container.innerHTML = `<p class="text-muted mb-0">Your cart is empty.</p>`;
  } else {
    container.innerHTML = items
      .map((item, index) => {
        const modelText = item.model ? `<span class="text-muted small">Model: ${item.model}</span><br />` : "";
        return `
          <div class="d-flex align-items-start gap-3 mb-4">
            <img src="${item.image}" alt="${item.name}" class="img-fluid" style="max-width: 90px" />
            <div class="flex-grow-1">
              <p class="mb-1 text-uppercase small">${item.name}</p>
              ${modelText}
              <p class="mb-0">$${item.price}</p>
              <button type="button" class="btn btn-link p-0 small text-danger" data-remove="${index}">
                Remove
              </button>
            </div>
            <div style="max-width: 110px">
              <label class="visually-hidden" for="qty-${index}">Quantity</label>
              <input id="qty-${index}" type="number" class="form-control" min="1" value="${item.qty}" data-qty="${index}" />
            </div>
          </div>
        `;
      })
      .join("");
  }

  // totals
  const s1 = document.querySelector(subtotalSelector);
  const s2 = document.querySelector(shippingSelector);
  const s3 = document.querySelector(taxesSelector);
  const s4 = document.querySelector(totalSelector);
  if (s1) s1.textContent = `$${subtotal}`;
  if (s2) s2.textContent = shipping === 0 ? "FREE" : `$${shipping}`;
  if (s3) s3.textContent = `$${taxes}`;
  if (s4) s4.textContent = `$${total}`;

  // events
  container.querySelectorAll("[data-qty]").forEach((input) => {
    input.addEventListener("input", (e) => {
      updateItemQty(Number(e.target.dataset.qty), e.target.value);
      renderCartStep1({
        itemsContainerSelector,
        subtotalSelector,
        shippingSelector,
        taxesSelector,
        totalSelector
      });
    });
  });

  container.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      removeItem(Number(e.target.dataset.remove));
      renderCartStep1({
        itemsContainerSelector,
        subtotalSelector,
        shippingSelector,
        taxesSelector,
        totalSelector
      });
    });
  });
}

/* Utility: read product id from ?id= */
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id")) || 1;
}
