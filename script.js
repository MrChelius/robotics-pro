(() => {
  "use strict";

  /* =====================================================
     ROBOTICS PRO
     GLOBAL STORE SCRIPT
  ====================================================== */

  const STORAGE_KEY = "robotics_pro_cart";

  const PRODUCTS = {
    r1: {
      id: "r1",
      name: "Unitree R1",
      price: 1666666,
      image:
        "https://www.unitree.com/images/920433c1a6c743cf8265fb2ec2eb41a0_1920x1301.png?x-oss-process=image%2Fquality%2Cq_60%2Fformat%2Cwebp"
    },

    g1: {
      id: "g1",
      name: "Unitree G1",
      price: 1666666,
      image:
        "https://www.unitree.com/images/a20ba1ebc0724df8a8135744dee8bbea_2740x1720.jpg"
    },

    "go2-air": {
      id: "go2-air",
      name: "Unitree Go2 Air",
      price: 240000,
      image:
        "https://www.unitree.com/images/b5fffd3e4fc04e6f9fcafedb9516b341_3840x2146.jpg"
    },

    "go2-pro": {
      id: "go2-pro",
      name: "Unitree Go2 Pro",
      price: 350000,
      image:
        "https://www.unitree.com/images/b5fffd3e4fc04e6f9fcafedb9516b341_3840x2146.jpg"
    },

    loona: {
      id: "loona",
      name: "Loona",
      price: 60000,
      image: "./images/loona.jpg"
    }
  };


  /* =====================================================
     HELPERS
  ====================================================== */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));


  const formatPrice = (value) => {
    return `${Number(value).toLocaleString("ru-RU")} ₽`;
  };


  const safeParse = (value, fallback = []) => {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : fallback;
    } catch {
      return fallback;
    }
  };


  /* =====================================================
     CART STATE
  ====================================================== */

  let cart = safeParse(
    localStorage.getItem(STORAGE_KEY),
    []
  );


  const saveCart = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cart)
    );
  };


  const getCartCount = () => {
    return cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  };


  const getCartTotal = () => {
    return cart.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    );
  };


  /* =====================================================
     CART UI
  ====================================================== */

  const cartCountElement = $("#cartCount");

  const cartItemsElement = $("#cartItems");

  const cartEmptyElement = $("#cartEmpty");

  const cartFooterElement = $("#cartFooter");

  const cartTotalElement = $("#cartTotal");


  const updateCartCount = () => {
    if (!cartCountElement) {
      return;
    }

    cartCountElement.textContent =
      getCartCount();
  };


  const renderCart = () => {
    updateCartCount();

    if (!cartItemsElement) {
      return;
    }

    if (cart.length === 0) {
      cartItemsElement.innerHTML = "";

      if (cartEmptyElement) {
        cartEmptyElement.hidden = false;
      }

      if (cartFooterElement) {
        cartFooterElement.hidden = true;
      }

      return;
    }


    if (cartEmptyElement) {
      cartEmptyElement.hidden = true;
    }

    if (cartFooterElement) {
      cartFooterElement.hidden = false;
    }


    cartItemsElement.innerHTML = cart
      .map((item) => {
        return `
          <div
            class="cart-item"
            data-cart-id="${escapeHtml(item.id)}"
          >

            <div class="cart-item__image">

              <img
                src="${escapeAttribute(item.image)}"
                alt="${escapeAttribute(item.name)}"
              >

            </div>


            <div class="cart-item__content">

              <h3 class="cart-item__title">
                ${escapeHtml(item.name)}
              </h3>

              <div class="cart-item__price">
                ${formatPrice(item.price)}
              </div>


              <div class="cart-item__bottom">

                <div class="cart-quantity">

                  <button
                    type="button"
                    data-cart-action="decrease"
                    data-cart-id="${escapeAttribute(item.id)}"
                    aria-label="Уменьшить количество"
                  >
                    −
                  </button>

                  <span>
                    ${item.quantity}
                  </span>

                  <button
                    type="button"
                    data-cart-action="increase"
                    data-cart-id="${escapeAttribute(item.id)}"
                    aria-label="Увеличить количество"
                  >
                    +
                  </button>

                </div>


                <button
                  type="button"
                  class="cart-remove"
                  data-cart-action="remove"
                  data-cart-id="${escapeAttribute(item.id)}"
                >
                  Удалить
                </button>

              </div>

            </div>

          </div>
        `;
      })
      .join("");


    if (cartTotalElement) {
      cartTotalElement.textContent =
        formatPrice(getCartTotal());
    }
  };


  /* =====================================================
     CART OPERATIONS
  ====================================================== */

  const addToCart = ({
    id,
    name,
    price,
    image
  }) => {

    const existing = cart.find(
      (item) => item.id === id
    );


    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id,
        name,
        price: Number(price),
        image,
        quantity: 1
      });
    }


    saveCart();

    renderCart();

    showToast(`${name} добавлен в корзину`);

    openCart();
  };


  const changeQuantity = (id, delta) => {

    const item = cart.find(
      (entry) => entry.id === id
    );

    if (!item) {
      return;
    }


    item.quantity += delta;


    if (item.quantity <= 0) {
      cart = cart.filter(
        (entry) => entry.id !== id
      );
    }


    saveCart();

    renderCart();
  };


  const removeFromCart = (id) => {

    cart = cart.filter(
      (item) => item.id !== id
    );

    saveCart();

    renderCart();
  };


  /* =====================================================
     ADD TO CART BUTTONS
  ====================================================== */

  document.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest("[data-add-cart]");

      if (!button) {
        return;
      }


      const id =
        button.dataset.productId;

      const product =
        PRODUCTS[id];


      if (!product) {

        const fallbackProduct = {
          id,
          name:
            button.dataset.productName ||
            "Товар",
          price:
            Number(button.dataset.productPrice) || 0,
          image:
            button.dataset.productImage ||
            ""
        };

        addToCart(fallbackProduct);

        return;
      }


      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });

    }
  );


  /* =====================================================
     CART CONTROLS
  ====================================================== */

  document.addEventListener(
    "click",
    (event) => {

      const control =
        event.target.closest("[data-cart-action]");

      if (!control) {
        return;
      }


      const action =
        control.dataset.cartAction;

      const id =
        control.dataset.cartId;


      if (!id) {
        return;
      }


      if (action === "increase") {
        changeQuantity(id, 1);
      }

      if (action === "decrease") {
        changeQuantity(id, -1);
      }

      if (action === "remove") {
        removeFromCart(id);
      }

    }
  );


  /* =====================================================
     DRAWERS
  ====================================================== */

  const openSystem = (id) => {

    const system = document.getElementById(id);

    if (!system) {
      return;
    }


    $$(".drawer-system.is-open").forEach(
      (opened) => {
        opened.classList.remove("is-open");
        opened.setAttribute(
          "aria-hidden",
          "true"
        );
      }
    );


    system.classList.add("is-open");

    system.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.classList.add(
      "lock-scroll"
    );
  };


  const closeSystem = (id) => {

    const system = document.getElementById(id);

    if (!system) {
      return;
    }


    system.classList.remove("is-open");

    system.setAttribute(
      "aria-hidden",
      "true"
    );


    if (
      !document.querySelector(
        ".drawer-system.is-open, .mobile-menu.is-open, .search-overlay.is-open"
      )
    ) {
      document.body.classList.remove(
        "lock-scroll"
      );
    }
  };


  const openContact = () => {
    closeMobileMenu();
    closeSearch();
    openSystem("contactSystem");
  };


  const openCart = () => {
    closeMobileMenu();
    closeSearch();
    openSystem("cartSystem");
  };


  window.openContact = openContact;
  window.openCart = openCart;


  document.addEventListener(
    "click",
    (event) => {

      if (
        event.target.closest(
          "[data-open-contact]"
        )
      ) {
        event.preventDefault();
        openContact();
        return;
      }


      if (
        event.target.closest(
          "[data-open-cart]"
        )
      ) {
        event.preventDefault();
        openCart();
        return;
      }


      if (
        event.target.closest(
          "[data-close-contact]"
        )
      ) {
        event.preventDefault();
        closeSystem("contactSystem");
        return;
      }


      if (
        event.target.closest(
          "[data-close-cart]"
        )
      ) {
        event.preventDefault();
        closeSystem("cartSystem");
      }

    }
  );


  /* =====================================================
     MOBILE MENU
  ====================================================== */

  const mobileMenu =
    $("#mobileMenu");


  const openMobileMenu = () => {

    if (!mobileMenu) {
      return;
    }


    mobileMenu.classList.add(
      "is-open"
    );

    mobileMenu.setAttribute(
      "aria-hidden",
      "false"
    );


    const toggle =
      $("[data-mobile-toggle]");

    if (toggle) {
      toggle.setAttribute(
        "aria-expanded",
        "true"
      );
    }


    document.body.classList.add(
      "lock-scroll"
    );
  };


  window.closeMobileMenu =
    () => {

      if (!mobileMenu) {
        return;
      }


      mobileMenu.classList.remove(
        "is-open"
      );

      mobileMenu.setAttribute(
        "aria-hidden",
        "true"
      );


      const toggle =
        $("[data-mobile-toggle]");

      if (toggle) {
        toggle.setAttribute(
          "aria-expanded",
          "false"
        );
      }


      if (
        !document.querySelector(
          ".drawer-system.is-open, .search-overlay.is-open"
        )
      ) {
        document.body.classList.remove(
          "lock-scroll"
        );
      }
    };


  const closeMobileMenu =
    window.closeMobileMenu;


  document.addEventListener(
    "click",
    (event) => {

      const toggle =
        event.target.closest(
          "[data-mobile-toggle]"
        );

      if (toggle) {
        event.preventDefault();

        if (
          mobileMenu?.classList.contains(
            "is-open"
          )
        ) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }

        return;
      }


      if (
        event.target.closest(
          "[data-mobile-close]"
        )
      ) {
        event.preventDefault();
        closeMobileMenu();
        return;
      }


      if (
        event.target.closest(
          "[data-mobile-link]"
        )
      ) {
        closeMobileMenu();
      }

    }
  );


  /* =====================================================
     SEARCH
  ====================================================== */

  const searchOverlay =
    $("#searchOverlay");

  const searchInput =
    $("#searchInput");

  const searchResults =
    $("#searchResults");


  const openSearch = () => {

    if (!searchOverlay) {
      return;
    }


    closeMobileMenu();

    searchOverlay.classList.add(
      "is-open"
    );

    searchOverlay.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.classList.add(
      "lock-scroll"
    );


    setTimeout(() => {
      searchInput?.focus();
    }, 100);
  };


  const closeSearch = () => {

    if (!searchOverlay) {
      return;
    }


    searchOverlay.classList.remove(
      "is-open"
    );

    searchOverlay.setAttribute(
      "aria-hidden",
      "true"
    );


    if (
      !document.querySelector(
        ".drawer-system.is-open, .mobile-menu.is-open"
      )
    ) {
      document.body.classList.remove(
        "lock-scroll"
      );
    }
  };


  document.addEventListener(
    "click",
    (event) => {

      if (
        event.target.closest(
          "[data-open-search]"
        )
      ) {
        event.preventDefault();
        openSearch();
        return;
      }


      if (
        event.target.closest(
          "[data-close-search]"
        )
      ) {
        event.preventDefault();
        closeSearch();
      }

    }
  );


  const searchProducts = (query) => {

    if (!searchResults) {
      return;
    }


    const text =
      query.trim().toLowerCase();


    if (!text) {
      searchResults.innerHTML = "";
      return;
    }


    const matches =
      Object.values(PRODUCTS).filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(text)
      );


    if (matches.length === 0) {

      searchResults.innerHTML = `
        <div
          style="
            padding:16px 2px;
            color:#888;
            font-size:11px;
          "
        >
          Ничего не найдено
        </div>
      `;

      return;
    }


    searchResults.innerHTML =
      matches
        .map(
          (product) => `
            <a
              href="./product.html?product=${encodeURIComponent(product.id)}"
              style="
                display:grid;
                grid-template-columns:48px 1fr auto;
                align-items:center;
                gap:12px;
                padding:11px 0;
                border-bottom:1px solid #e6e6e6;
              "
            >

              <span
                style="
                  width:48px;
                  height:48px;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  overflow:hidden;
                  background:#f1f1f1;
                "
              >
                <img
                  src="${escapeAttribute(product.image)}"
                  alt="${escapeAttribute(product.name)}"
                  style="
                    width:100%;
                    height:100%;
                    object-fit:contain;
                  "
                >
              </span>

              <strong
                style="
                  font-size:11px;
                  font-weight:600;
                "
              >
                ${escapeHtml(product.name)}
              </strong>

              <span
                style="
                  color:#888;
                  font-size:10px;
                "
              >
                →
              </span>

            </a>
          `
        )
        .join("");
  };


  searchInput?.addEventListener(
    "input",
    (event) => {
      searchProducts(
        event.target.value
      );
    }
  );


  /* =====================================================
     TOAST
  ====================================================== */

  let toastTimer = null;


  const showToast = (message) => {

    const toast =
      $("#toast");

    if (!toast) {
      return;
    }


    toast.textContent =
      message;

    toast.classList.add(
      "is-visible"
    );


    clearTimeout(toastTimer);


    toastTimer =
      setTimeout(() => {
        toast.classList.remove(
          "is-visible"
        );
      }, 2400);
  };


  /* =====================================================
     KEYBOARD
  ====================================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key !== "Escape") {
        return;
      }


      closeSystem("contactSystem");
      closeSystem("cartSystem");

      closeMobileMenu();
      closeSearch();

    }
  );


  /* =====================================================
     BACKDROP / CLICK OUTSIDE
  ====================================================== */

  document.addEventListener(
    "click",
    (event) => {

      if (
        event.target.classList.contains(
          "drawer-backdrop"
        )
      ) {

        if (
          event.target.closest(
            "#contactSystem"
          )
        ) {
          closeSystem(
            "contactSystem"
          );
        }

        if (
          event.target.closest(
            "#cartSystem"
          )
        ) {
          closeSystem(
            "cartSystem"
          );
        }
      }


      if (
        event.target.classList.contains(
          "search-backdrop"
        )
      ) {
        closeSearch();
      }


      if (
        event.target.classList.contains(
          "mobile-menu-backdrop"
        )
      ) {
        closeMobileMenu();
      }

    }
  );


  /* =====================================================
     PRODUCT PAGE
  ====================================================== */

  const getProductFromUrl = () => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    return params.get("product");
  };


  const currentProductId =
    getProductFromUrl();


  if (
    currentProductId &&
    PRODUCTS[currentProductId]
  ) {

    const product =
      PRODUCTS[currentProductId];


    window.ROBOTICS_CURRENT_PRODUCT =
      product;


    const productName =
      $("#productName");

    const productPrice =
      $("#productPrice");

    const productImage =
      $("#productImage");

    const productCategory =
      $("#productCategory");


    if (productName) {
      productName.textContent =
        product.name;
    }


    if (productPrice) {
      productPrice.textContent =
        formatPrice(product.price);
    }


    if (productImage) {
      productImage.src =
        product.image;

      productImage.alt =
        product.name;
    }


    if (productCategory) {
      productCategory.textContent =
        getProductCategory(
          product.id
        );
    }

  }


  /* =====================================================
     INITIALIZATION
  ====================================================== */

  renderCart();


  /* =====================================================
     ESCAPE HELPERS
  ====================================================== */

  function escapeHtml(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function escapeAttribute(value) {
    return escapeHtml(value);
  }


  function getProductCategory(id) {

    if (
      id === "r1" ||
      id === "g1"
    ) {
      return "HUMANOID ROBOT";
    }


    if (
      id === "go2-air" ||
      id === "go2-pro"
    ) {
      return "QUADRUPED ROBOT";
    }


    if (id === "loona") {
      return "AI COMPANION";
    }


    return "ROBOTICS";
  }

})();
