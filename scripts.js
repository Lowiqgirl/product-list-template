const cart = {},
  $ = (s, p = document) => p.querySelector(s),
  $$ = (s, p = document) => [...p.querySelectorAll(s)];

const confirmBtn = $(".cart .button-order-confirmation"),
  overlay = $(".order-confirmation-overlay"),
  restartBtn = $(".order-confirmation-menu .button-order-confirmation");

const createCard = p => `
  <li class="goods-item">
    <div class="card">
      <div class="card-main">
        <img class="card-image" src="${p.image.desktop}" alt="${p.category}">
        <div class="add-button">
          <img class="add-image" src="./assets/images/icon-add-to-cart.svg" alt="add">Add to Cart
        </div>
        <div class="button-active visually-hidden">
          <svg class="round-icon" viewBox="0 0 10 2"><path fill="#fff" d="M0 .375h10v1.25H0Z"/></svg>
          <div class="counter">1</div>
          <svg class="round-icon" viewBox="0 0 10 10"><path fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10Z"/></svg>
        </div>
      </div>
      <div class="card-goods">
        <a href="/" class="goods-category">${p.category}</a>
        <a href="/" class="goods-name">${p.name}</a>
        <p class="goods-price">${p.price.toFixed(2)}</p>
      </div>
    </div>
  </li>
`;

const renderCart = () => {
  const cartList = $(".cart-full .list"),
    confirmList = $(".order-confirmation-body .list"),
    cartEmpty = $(".cart-empty"),
    cartFull = $(".cart-full"),
    totalCost = $(".total-cost"),
    cartCounter = $(".cart-counter");

  cartList.innerHTML = confirmList.innerHTML = "";
  let total = 0, count = 0;

  for (const [name, { count: c, price, image }] of Object.entries(cart)) {
    const sum = c * price;
    total += sum;
    count += c;

    cartList.innerHTML += `
      <li class="item">
        <div class="cart-item">
          <div class="cart-main">
            <h4 class="item-title">${name}</h4>
            <div class="item-extra">
              <p class="item-amount">${c}</p>
              <div class="item-costs">
                <p class="cost-for-one">${price.toFixed(2)}</p>
                <p class="cost-for-everything">${sum.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div class="cancel-icon" data-name="${name}">
            <svg class="round-icon-alt" width="10" height="10" viewBox="0 0 10 10">
              <path fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/>
            </svg>
          </div>
        </div>
      </li>
    `;

    confirmList.innerHTML += `
      <li class="item">
        <div class="cart-item">
          <div class="cart-item-alt">
            <img class="order-image" src="${image}" alt="">
            <div class="cart-main">
              <h4 class="item-title">${name}</h4>
              <div class="item-extra">
                <p class="item-amount">${c}</p>
                <div class="item-costs">
                  <p class="cost-for-one">${price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="cost-for-everything-alt">
            <p class="cost-for-everything">${sum.toFixed(2)}</p>
          </div>
        </div>
      </li>
    `;
  }

  if (count === 0) {
    cartEmpty.classList.remove("visually-hidden");
    cartFull.classList.add("visually-hidden");
  } else {
    cartEmpty.classList.add("visually-hidden");
    cartFull.classList.remove("visually-hidden");
  }

  cartCounter.textContent = `(${count})`;
  totalCost.textContent = `$${total.toFixed(2)}`;
  $(".order-confirmation-body .total-cost").textContent = `$${total.toFixed(2)}`;
};

const bindCardEvents = () => {
  $$(".card").forEach(card => {
    const add = $(".add-button", card),
      active = $(".button-active", card),
      img = $(".card-image", card),
      counter = $(".counter", active),
      name = $(".goods-name", card).textContent,
      price = +$(".goods-price", card).textContent,
      category = $(".goods-category", card).textContent,
      image = img.src,
      plus = active.children[2],
      minus = active.children[0];

    add.onclick = () => {
      add.classList.add("visually-hidden");
      active.classList.remove("visually-hidden");
      img.classList.add("is-active");
      cart[name] = { count: 1, price, category, image };
      renderCart();
    };

    plus.onclick = () => {
      counter.textContent = ++cart[name].count;
      renderCart();
    };

    minus.onclick = () => {
      if (--cart[name].count) {
        counter.textContent = cart[name].count;
      } else {
        delete cart[name];
        add.classList.remove("visually-hidden");
        active.classList.add("visually-hidden");
        img.classList.remove("is-active");
        counter.textContent = 1;
      }
      renderCart();
    };
  });
};

document.addEventListener("DOMContentLoaded", () =>
  fetch("./data.json")
    .then(r => r.json())
    .then(data => {
      $(".goods-list").innerHTML = data.map(createCard).join("");
      bindCardEvents();
    })
);

document.addEventListener("click", e => {
  const cancel = e.target.closest(".cancel-icon");
  if (!cancel) return;
  const name = cancel.dataset.name;
  delete cart[name];
  renderCart();

  $$(".card").forEach(card => {
    if ($(".goods-name", card).textContent === name) {
      $(".add-button", card).classList.remove("visually-hidden");
      $(".button-active", card).classList.add("visually-hidden");
      $(".card-image", card).classList.remove("is-active");
      $(".counter", card).textContent = 1;
    }
  });
});

confirmBtn.onclick = () => overlay.classList.replace("visually-hidden", "show");
restartBtn.onclick = () => {
  overlay.classList.replace("show", "visually-hidden");
  Object.keys(cart).forEach(k => delete cart[k]);
  renderCart();
  $$(".card").forEach(card => {
    $(".add-button", card).classList.remove("visually-hidden");
    $(".button-active", card).classList.add("visually-hidden");
    $(".card-image", card).classList.remove("is-active");
    $(".counter", card).textContent = 1;
  });
};
