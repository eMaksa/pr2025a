console.log("JS загружен");

document.addEventListener("DOMContentLoaded", () => {

    const loadBtn = document.getElementById("loadCategoriesBtn");
    const categoriesList = document.getElementById("categoriesList");
    const productsList = document.getElementById("productsList");

    // ==============================
    // КОРЗИНА (localStorage)
    // ==============================
    const CART_KEY = 'shopCart';

    function getCart() {
        const data = localStorage.getItem(CART_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartBadge();
    }

    function addToCart(productId, productName, price, stock) {
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
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    function getCartTotal() {
        const cart = getCart();
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    function renderCart() {
        const cart = getCart();
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const emptyCartMsg = document.getElementById('emptyCartMsg');
        const cartFooter = document.getElementById('cartFooter');

        if (cart.length === 0) {
            cartItems.innerHTML = '';
            emptyCartMsg.style.display = 'block';
            cartFooter.style.display = 'none';
            return;
        }

        emptyCartMsg.style.display = 'none';
        cartFooter.style.display = 'block';

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

        cartTotal.textContent = getCartTotal().toFixed(2);
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

    // Глобальные функции для корзины
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.updateCartQuantity = updateCartQuantity;
    window.clearCart = clearCart;

    window.openCart = function() {
        renderCart();
        const modal = new bootstrap.Modal(document.getElementById('cartModal'));
        modal.show();
    };

    // Инициализация badge
    updateCartBadge();

    // ==============================
    // ЗАГРУЗКА КАТЕГОРИЙ
    // ==============================
    loadBtn.addEventListener("click", loadCategories);

    function loadCategories() {
        categoriesList.innerHTML = `
            <div class="list-group-item d-flex justify-content-center">
                <div class="spinner-border text-primary" role="status"></div>
            </div>
        `;

        loadBtn.disabled = true;
        loadBtn.textContent = "Загрузка...";

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
                loadBtn.disabled = false;
                loadBtn.textContent = "Получить данные";
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
    // ЗАГРУЗКА ТОВАРОВ
    // ==============================
    async function loadProducts(categoryId) {

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

                if (data.length === 0) {
                    productsList.innerHTML = `<p class="text-muted">Нет товаров.</p>`;
                    fadeIn(productsList);
                    return;
                }

                data.forEach(product => {

                    let stock = product.stock;        
                    let colorClass = getStockColor(stock);

                    let card = document.createElement("div");
                    card.className = "card mb-3 product-card";
                    card.style.opacity = "0";

                    card.innerHTML = `
                        <div class="card-body">
                            <h5>${product.name}</h5>
                            <p>Цена: ${product.price}€</p>
                            <p class="${colorClass}">Доступно: <strong>${stock}</strong> шт.</p>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-success flex-grow-1" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, ${stock})">
                                    🛒 В корзину
                                </button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="showMovementForm(${product.id}, '${product.name}', ${stock})">
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
    window.showMovementForm = function(productId, productName, currentStock) {

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

    window.submitMovement = function(productId, currentStock) {
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

            // очищаем корзину
            localStorage.removeItem(CART_KEY);
            updateCartBadge();
            renderCart();

            showNotification("Заказ успешно сохранён");
        })
        .catch(() => {
            alert("Ошибка сервера при оформлении заказа");
        });
    };
});