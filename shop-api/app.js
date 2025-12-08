console.log("JS загружен");

document.addEventListener("DOMContentLoaded", () => {

    const loadBtn = document.getElementById("loadCategoriesBtn");
    const categoriesList = document.getElementById("categoriesList");
    const productsList = document.getElementById("productsList");

    loadBtn.addEventListener("click", loadCategories);


    // ==============================
    // ЗАГРУЗКА КАТЕГОРИЙ
    // ==============================
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
    // ФУНКЦИЯ: Цвет для stock
    // ==============================
    function getStockColor(stock) {
        if (stock <= 5) return "text-danger";     
        if (stock <= 20) return "text-warning"; 
        return "text-success";                    
    }


    // ==============================
    // АНИМАЦИОННАЯ ОЧИСТКА
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

                    let stock = Math.floor(Math.random() * (47 - 3 + 1)) + 3;
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

});
