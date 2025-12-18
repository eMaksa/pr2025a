console.log("JS загружен");

document.addEventListener("DOMContentLoaded", () => {

    const loadBtn = document.getElementById("loadCategoriesBtn");
    const categoriesList = document.getElementById("categoriesList");
    const productsList = document.getElementById("productsList");

    // ==============================
    // КОРЗИНА (localStorage)
    // ==============================
    const CART_KEY = 'shopCart';

    // ПРОМОКОДЫ / СКИДКА
    let discountRate = 0; // 0.1 = 10%
    let appliedPromo = "";

    function getCart() {
        const data = localStorage.getItem(CART_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartBadge();
    }

    // ==============================
    // АНИМАЦИЯ: летящая иконка в корзину
    // ==============================
    function flyToCart(fromEl) {
        const cartBtn = document.getElementById("cartButton");
        if (!fromEl || !cartBtn) return;

        const from = fromEl.getBoundingClientRect();
        const to = cartBtn.getBoundingClientRect();

        const bubble = document.createElement("div");
        bubble.textContent = "🛒";
        bubble.style.position = "fixed";
        bubble.style.left = (from.left + from.width / 2) + "px";
        bubble.style.top = (from.top + from.height / 2) + "px";
        bubble.style.transform = "translate(-50%, -50%)";
        bubble.style.zIndex = 2000;
        bubble.style.fontSize = "22px";
        bubble.style.pointerEvents = "none";

        document.body.appendChild(bubble);

        const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
        const dy = (to.top + to.height / 2) - (from.top + from.height / 2);

        bubble.animate([
            { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.2)`, opacity: 0.2 }
        ], { duration: 600, easing: "cubic-bezier(.2,.8,.2,1)" });

        setTimeout(() => bubble.remove(), 650);
    }

    function addToCart(productId, productName, price, stock, btnEl) {

        // Требование: доступ только после входа
        if (!localStorage.getItem('shopUser')) {
            const modal = new bootstrap.Modal(document.getElementById('authModal'));
            modal.show();
            showNotification('Сначала войдите в систему', 'warning');
            return;
        }

        let cart = getCart();
        let existing = cart.find(item => item.id === productId);

        if (existing) {
            if (existing.quantity < stock) {
                existing.quantity++;
                showNotification(`Количество "${productName}" увеличено`);
            } else {
                showNotification(`Максимум доступно: ${stock} шт.`, 'warning');
                return;
            }
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: price,
                quantity: 1,
                maxStock: stock
            });
            showNotification(`"${productName}" добавлен в корзину`);
        }

        saveCart(cart);
        flyToCart(btnEl);
    }

    function removeFromCart(productId) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== productId);
        saveCart(cart);
        renderCart();
    }

    function updateCartQuantity(productId, newQuantity) {
        let cart = getCart();
        let item = cart.find(i => i.id === productId);

        if (item) {
            if (newQuantity <= 0) {
                removeFromCart(productId);
            } else if (newQuantity <= item.maxStock) {
                item.quantity = newQuantity;
                saveCart(cart);
                renderCart();
            } else {
                showNotification(`Максимум доступно: ${item.maxStock} шт.`, 'warning');
            }
        }
    }

    function clearCart() {
        if (confirm('Очистить корзину?')) {
            localStorage.removeItem(CART_KEY);
            updateCartBadge();
            renderCart();
            showNotification('Корзина очищена');
        }
    }

    function updateCartBadge() {
        const cart = getCart();
        const badge = document.getElementById('cartBadge');
        if (!badge) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    function getCartSubtotal() {
        const cart = getCart();
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    function renderCart() {
        const cart = getCart();
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const emptyCartMsg = document.getElementById('emptyCartMsg');
        const cartFooter = document.getElementById('cartFooter');
        const promoInfo = document.getElementById('promoInfo');

        if (!cartItems || !cartTotal) return;

        if (cart.length === 0) {
            cartItems.innerHTML = '';
            if (emptyCartMsg) emptyCartMsg.style.display = 'block';
            if (cartFooter) cartFooter.style.display = 'none';
            cartTotal.textContent = "0.00";
            if (promoInfo) promoInfo.textContent = "";
            return;
        }

        if (emptyCartMsg) emptyCartMsg.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'block';

        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <small class="text-muted">${item.price}€ × ${item.quantity}</small>
                </div>
                <div class="cart-item-controls">
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">−</button>
                    <span class="cart-qty">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart(${item.id})">×</button>
                </div>
            </div>
        `).join('');

        const subtotal = getCartSubtotal();
        const discountAmount = subtotal * discountRate;
        const total = subtotal - discountAmount;

        cartTotal.textContent = total.toFixed(2);

        // Показ скидки в реальном времени (текст)
        if (promoInfo) {
            if (discountRate > 0) {
                promoInfo.textContent = `Промокод "${appliedPromo}" применён. Скидка: -${discountAmount.toFixed(2)}€`;
            } else if (appliedPromo) {
                promoInfo.textContent = `Промокод "${appliedPromo}" недействителен`;
            } else {
                promoInfo.textContent = "";
            }
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }

    // ==============================
    // PROMO (имитация API)
    // ==============================
    function verifyPromoAPI(code) {
        // ИМИТАЦИЯ API: возвращаем результат через Promise
        return new Promise(resolve => {
            setTimeout(() => {
                const normalized = code.trim().toUpperCase();
                if (normalized === "SALE10") return resolve({ ok: true, rate: 0.10 });
                if (normalized === "SALE20") return resolve({ ok: true, rate: 0.20 });
                return resolve({ ok: false, rate: 0 });
            }, 350);
        });
    }

    window.applyPromo = async function () {
        const input = document.getElementById("promoInput");
        const code = (input?.value || "").trim();
        appliedPromo = code;

        const promoInfo = document.getElementById("promoInfo");
        if (promoInfo) promoInfo.textContent = "Проверка промокода...";

        const result = await verifyPromoAPI(code);
        discountRate = result.ok ? result.rate : 0;

        if (result.ok) {
            showNotification(`Промокод применён (-${Math.round(result.rate * 100)}%)`);
        } else {
            showNotification("Промокод не найден", "warning");
        }
        renderCart();
    };

    // Глобальные функции для корзины
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.updateCartQuantity = updateCartQuantity;
    window.clearCart = clearCart;

    window.openCart = function () {
        renderCart();
        const modal = new bootstrap.Modal(document.getElementById('cartModal'));
        modal.show();
    };

    // Инициализация badge
    updateCartBadge();

    // ==============================
    // ЗАГРУЗКА КАТЕГОРИЙ
    // ==============================
    if (loadBtn) loadBtn.addEventListener("click", loadCategories);

    function loadCategories() {
        if (!categoriesList) return;

        categoriesList.innerHTML = `
            <div class="list-group-item d-flex justify-content-center">
                <div class="spinner-border text-primary" role="status"></div>
            </div>
        `;

        if (loadBtn) {
            loadBtn.disabled = true;
            loadBtn.textContent = "Загрузка...";
        }

        fetch("get_categories.php")
            .then(res => res.json())
            .then(data => {
                categoriesList.innerHTML = "";

                data.forEach(category => {
                    let item = document.createElement("button");
                    item.className = "list-group-item list-group-item-action";
                    item.textContent = category.name;

                    item.addEventListener("click", () => loadProducts(category.id));

                    categoriesList.appendChild(item);
                });
            })
            .catch(() => {
                categoriesList.innerHTML =
                    `<div class="list-group-item text-danger">Ошибка загрузки категорий</div>`;
            })
            .finally(() => {
                if (loadBtn) {
                    loadBtn.disabled = false;
                    loadBtn.textContent = "Получить данные";
                }
            });
    }

    // ==============================
    // Цвет количества
    // ==============================
    function getStockColor(stock) {
        if (stock <= 5) return "text-danger";
        if (stock <= 20) return "text-warning";
        return "text-success";
    }

    // ==============================
    // Анимации
    // ==============================
    function fadeOut(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = 0;
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    function fadeIn(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = 1;
    }

    // ==============================
    // ФИЛЬТРЫ + СОРТИРОВКА + ЛЕНИВАЯ ЗАГРУЗКА (UI без перезагрузки)
    // ==============================
    let currentCategoryId = null;
    let rawProducts = [];
    let filteredProducts = [];
    let visibleCount = 0;
    const PAGE_SIZE = 6;
    let isAppending = false;

    const sortSelect = document.getElementById("sortSelect");
    const priceRange = document.getElementById("priceRange");
    const priceVal = document.getElementById("priceVal");

    function applyFiltersAndSort(resetVisible = true) {
        const maxPrice = priceRange ? Number(priceRange.value) : Infinity;
        const sort = sortSelect ? sortSelect.value : "";

        let list = rawProducts.filter(p => Number(p.price) <= maxPrice);

        if (sort === "priceAsc") list.sort((a, b) => Number(a.price) - Number(b.price));
        if (sort === "priceDesc") list.sort((a, b) => Number(b.price) - Number(a.price));
        if (sort === "name") list.sort((a, b) => String(a.name).localeCompare(String(b.name)));

        filteredProducts = list;

        if (resetVisible) visibleCount = 0;

        renderNextChunk();
    }

    function renderSkeletons(count = 3) {
        // Если у тебя нет CSS skeleton — можно просто спиннером
        productsList.insertAdjacentHTML("beforeend", `
            <div class="d-flex justify-content-center my-3 skeleton-block">
                <div class="spinner-border text-success" role="status"></div>
            </div>
        `.repeat(count));
    }

    function clearSkeletons() {
        document.querySelectorAll(".skeleton-block").forEach(el => el.remove());
    }

    function renderNextChunk() {
        if (!productsList) return;
        if (isAppending) return;

        isAppending = true;

        const start = visibleCount;
        const end = Math.min(visibleCount + PAGE_SIZE, filteredProducts.length);
        const chunk = filteredProducts.slice(start, end);

        // если это первая порция - очистим
        if (start === 0) {
            productsList.innerHTML = "";
        }

        if (chunk.length === 0) {
            if (start === 0) {
                productsList.innerHTML = `<p class="text-muted">Нет товаров.</p>`;
            }
            isAppending = false;
            return;
        }

        renderSkeletons(1);

        setTimeout(() => {
            clearSkeletons();

            chunk.forEach(product => {
                const stock = Number(product.stock);
                const colorClass = getStockColor(stock);

                let card = document.createElement("div");
                card.className = "card mb-3 product-card";
                card.style.opacity = "0";

                const safeName = JSON.stringify(String(product.name)); // безопасно для кавычек

                card.innerHTML = `
                    <div class="card-body">
                        <h5>${product.name}</h5>
                        <p>Цена: ${product.price}€</p>
                        <p class="${colorClass}">Доступно: <strong>${stock}</strong> шт.</p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-success flex-grow-1 add-btn"
                                onclick="addToCart(${product.id}, ${safeName}, ${product.price}, ${stock}, this)">
                                🛒 В корзину
                            </button>
                            <button class="btn btn-sm btn-outline-secondary"
                                onclick="showMovementForm(${product.id}, ${safeName}, ${stock})">
                                Движение
                            </button>
                        </div>
                    </div>
                `;

                productsList.appendChild(card);

                setTimeout(() => {
                    card.style.transition = "opacity 400ms";
                    card.style.opacity = "1";
                }, 50);
            });

            visibleCount = end;
            isAppending = false;
        }, 350);
    }

    if (sortSelect) sortSelect.addEventListener("change", () => applyFiltersAndSort(true));
    if (priceRange) priceRange.addEventListener("input", () => {
        if (priceVal) priceVal.textContent = priceRange.value;
        applyFiltersAndSort(true);
    });

    // Бесконечный скролл: подгружаем следующую порцию (без кнопки)
    window.addEventListener("scroll", () => {
        if (!productsList) return;
        if (currentCategoryId === null) return;
        const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 150;
        if (nearBottom) {
            renderNextChunk();
        }
    });

    // ==============================
    // ЗАГРУЗКА ТОВАРОВ
    // ==============================
    async function loadProducts(categoryId) {

        currentCategoryId = categoryId;

        document.querySelectorAll(".movement-form").forEach(f => f.remove());

        await fadeOut(productsList);

        productsList.innerHTML = `
            <div class="d-flex justify-content-center my-3">
                <div class="spinner-border text-success" role="status"></div>
            </div>
        `;
        fadeIn(productsList);

        fetch(`get_products_by_category.php?category_id=${categoryId}`)
            .then(res => res.json())
            .then(async data => {

                await fadeOut(productsList);
                productsList.innerHTML = "";

                // сохраняем сырые товары (для фильтра/сорта/ленивой загрузки)
                rawProducts = Array.isArray(data) ? data : [];
                visibleCount = 0;

                if (priceRange) {
                    // выставим max slider динамически, если можно
                    const maxPrice = rawProducts.reduce((m, p) => Math.max(m, Number(p.price || 0)), 0);
                    const safeMax = Math.max(100, Math.ceil(maxPrice / 10) * 10);
                    priceRange.max = String(safeMax);
                    if (Number(priceRange.value) > safeMax) priceRange.value = String(safeMax);
                    if (priceVal) priceVal.textContent = priceRange.value;
                }

                applyFiltersAndSort(true);
                fadeIn(productsList);
            })
            .catch(() => {
                productsList.innerHTML =
                    `<p class="text-danger">Ошибка загрузки товаров</p>`;
            });
    }

    // ==============================
    // ФОРМА ДВИЖЕНИЯ ТОВАРА
    // ==============================
    window.showMovementForm = function (productId, productName, currentStock) {

        document.querySelectorAll(".movement-form").forEach(f => f.remove());

        const formHtml = `
            <div class="card mt-2 p-3 border movement-form">
                <h6>Движение для: ${productName}</h6>
                <p>Текущий остаток: <strong>${currentStock}</strong></p>

                <div class="mb-2">
                    <select id="movementType" class="form-select">
                        <option value="приход">Приход</option>
                        <option value="расход">Расход</option>
                    </select>
                </div>

                <div class="mb-2">
                    <input type="number" id="movementQty" class="form-control" placeholder="Количество">
                </div>

                <div id="movementError" class="text-danger mb-2"></div>

                <button class="btn btn-success" onclick="submitMovement(${productId}, ${currentStock})">
                    Сохранить
                </button>
            </div>
        `;

        productsList.insertAdjacentHTML("beforeend", formHtml);
    };

    window.submitMovement = function (productId, currentStock) {
        const type = document.getElementById("movementType").value;
        const qty = parseInt(document.getElementById("movementQty").value);
        const errorBox = document.getElementById("movementError");

        errorBox.textContent = "";

        if (!qty || qty <= 0) {
            errorBox.textContent = "Введите корректное количество";
            return;
        }

        if (type === "расход" && qty > currentStock) {
            errorBox.textContent = `Недостаточно товара. Доступно: ${currentStock}`;
            return;
        }

        fetch("add_product_movement.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_id: productId,
                movement_type: type,
                quantity: qty
            })
        })
            .then(res => res.json())
            .then(data => {
                loadProducts(data.category_id);
                showNotification('Движение товара сохранено');
            })
            .catch(() => {
                errorBox.textContent = "Ошибка при добавлении движения";
            });
    };

    // ==============================
    // ОТПРАВКА КОРЗИНЫ В PHP
    // ==============================
    window.checkout = function () {
        const cart = getCart();

        if (cart.length === 0) {
            alert("Корзина пуста");
            return;
        }

        fetch("checkout.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart })
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    alert(data.error || "Ошибка сохранения заказа");
                    return;
                }

                // очищаем корзину и сбрасываем промокод
                localStorage.removeItem(CART_KEY);
                discountRate = 0;
                appliedPromo = "";
                updateCartBadge();
                renderCart();

                showNotification("Заказ успешно сохранён");
            })
            .catch(() => {
                alert("Ошибка сервера при оформлении заказа");
            });
    };

    // ==============================
    // ONLINE CHAT (имитация)
    // ==============================
    const botReplies = [
        "Здравствуйте! Чем помочь?",
        "Секунду, проверяю информацию 🙂",
        "Попробуйте обновить страницу (Ctrl+F5).",
        "Спасибо! Передам оператору.",
        "Промокоды: SALE10, SALE20."
    ];

    window.sendMessage = function () {
        const chatBox = document.getElementById("chatBox");
        const chatInput = document.getElementById("chatInput");
        if (!chatBox || !chatInput) return;

        const text = chatInput.value.trim();
        if (!text) return;

        chatBox.insertAdjacentHTML("beforeend", `<div><strong>Вы:</strong> ${text}</div>`);
        chatInput.value = "";

        const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
        setTimeout(() => {
            chatBox.insertAdjacentHTML("beforeend", `<div><strong>Бот:</strong> ${reply}</div>`);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 450);
    };

});