console.log("JS загружен");

document.addEventListener("DOMContentLoaded", () => {

    const loadBtn = document.getElementById("loadCategoriesBtn");
    const categoriesList = document.getElementById("categoriesList");
    const productsList = document.getElementById("productsList");

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

    function getStockColor(stock) {
        if (stock <= 5) return "text-danger";  
        if (stock <= 20) return "text-warning";
        return "text-success";                    
    }

    function fadeOut(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = 0;
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    function fadeIn(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = 1;
    }

    async function loadProducts(categoryId) {
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
                        </div>
                    `;

                    let movementBtn = document.createElement("button");
                    movementBtn.className = "btn btn-sm btn-outline-secondary mt-2";
                    movementBtn.textContent = "Движение";
                    movementBtn.addEventListener("click", () => showMovementForm(product.id, product.name));
                    card.querySelector(".card-body").appendChild(movementBtn);

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

    function showMovementForm(productId, productName) {
        const formHtml = `
            <div class="card mt-2 p-3 border">
                <h6>Движение для: ${productName}</h6>
                <div class="mb-2">
                    <select id="movementType" class="form-select">
                        <option value="приход">Приход</option>
                        <option value="расход">Расход</option>
                    </select>
                </div>
                <div class="mb-2">
                    <input type="number" id="movementQty" class="form-control" placeholder="Количество">
                </div>
                <button class="btn btn-success" onclick="submitMovement(${productId})">Сохранить</button>
            </div>
        `;
        productsList.insertAdjacentHTML("beforeend", formHtml);
    }

    window.submitMovement = function(productId) {
        const type = document.getElementById("movementType").value;
        const qty = parseInt(document.getElementById("movementQty").value);

        if (!qty || qty <= 0) {
            alert("Введите корректное количество");
            return;
        }

        fetch("add_product_movement.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: productId, movement_type: type, quantity: qty })
        })
        .then(res => res.json())
        .then(data => {
            alert("Движение добавлено");
            loadProducts(data.category_id);
        })
        .catch(() => alert("Ошибка при добавлении движения"));
    }

});