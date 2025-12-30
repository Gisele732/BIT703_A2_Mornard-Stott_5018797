// js/product-page.js
(function () {
  "use strict";

  // Only run on product page
  if (!document.getElementById("productTitle")) return;

  function starsHTML(rating) {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    return "&#9733;".repeat(r) + "&#9734;".repeat(5 - r);
  }

  function currency(n) {
    return `$${Number(n).toFixed(0)}`;
  }

  function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("id"); // string

    if (raw && Object.prototype.hasOwnProperty.call(PRODUCTS, raw)) {
        return Number(raw);
    }

    const firstKey = Object.keys(PRODUCTS)[0];
    return Number(firstKey) || 1;
    }

  function renderProduct(product) {
    document.title = `Aotearoa Adventure Gear | ${product.name}`;

    const img = document.getElementById("productImage");
    const title = document.getElementById("productTitle");
    const stars = document.getElementById("productStars");
    const count = document.getElementById("productReviewCount");
    const price = document.getElementById("productPrice");
    const desc = document.getElementById("productDescription");
    const select = document.getElementById("model-select");
    const addBtn = document.getElementById("addToCartBtn");

    img.src = product.image;
    img.alt = product.name;

    title.textContent = product.name;

    stars.innerHTML = starsHTML(product.rating);
    stars.setAttribute("aria-label", `${product.rating} out of 5 stars`);

    count.textContent = `${product.reviewCount} reviews`;
    price.textContent = currency(product.price);
    desc.textContent = product.description;

    // Models
    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.selected = true;
    placeholder.disabled = true;
    placeholder.textContent = "Select Model";
    select.appendChild(placeholder);

    product.models.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      select.appendChild(opt);
    });

    // Add-to-cart
    addBtn.addEventListener("click", () => {
      const chosenModel =
        select.value && select.value !== "Select Model" ? select.value : null;

      if (!chosenModel) {
        select.focus();
        return;
      }

      if (typeof addToCart === "function") {
        addToCart(product.id, 1, chosenModel);
      }
      window.location.href = "cart.html";
    });
  }

  function renderSimilarProducts(currentId) {
    const wrap = document.getElementById("similarProducts");
    wrap.innerHTML = "";

    const ids = Object.keys(PRODUCTS)
      .map(Number)
      .filter((id) => id !== currentId);

    const similar = ids.slice(0, 3).map((id) => PRODUCTS[id]);

    similar.forEach((p) => {
      const col = document.createElement("div");
      col.className = "col-12 col-md-4";
      col.innerHTML = `
        <a href="product.html?id=${p.id}" class="text-decoration-none text-reset">
          <div class="d-flex align-items-center gap-3">
            <img src="${p.image}" alt="${p.name}" class="img-fluid" style="max-width: 110px" />
            <div>
              <p class="mb-1 small text-uppercase text-muted">${p.name}</p>
              <div class="mb-1"><span class="text-secondary">${starsHTML(p.rating)}</span></div>
              <p class="mb-0">${currency(p.price)}</p>
            </div>
          </div>
        </a>
      `;
      wrap.appendChild(col);
    });
  }

  function renderReviews(product) {
    const wrap = document.getElementById("reviewsList");
    wrap.innerHTML = "";

    product.reviews.forEach((r) => {
      const row = document.createElement("div");
      row.className = "row g-4 align-items-start py-4 border-bottom";
      row.innerHTML = `
        <div class="col-12 col-md-4">
          <div class="d-flex align-items-start gap-3">
            <div class="rounded-circle border d-flex align-items-center justify-content-center"
                 style="width:56px;height:56px" aria-hidden="true">
              <span class="text-muted">&#128100;</span>
            </div>
            <div>
              <p class="mb-0 fw-bold">${r.name}</p>
              <p class="mb-2 text-muted small">${r.date}</p>
              <div><span class="text-secondary">${starsHTML(r.rating)}</span></div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-8">
          <p class="text-muted">${r.text}</p>
        </div>
      `;
      wrap.appendChild(row);
    });
  }

  // Init
  const id = getProductIdFromURL();
  const product = PRODUCTS[id];

  renderProduct(product);
  renderSimilarProducts(id);
  renderReviews(product);

  // Badge is already handled in common.js, but safe if still exposed:
  if (typeof updateCartCount === "function") updateCartCount();
})();
