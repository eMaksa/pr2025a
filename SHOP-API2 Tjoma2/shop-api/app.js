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


    function loadProducts(categoryId) {


        productsList.innerHTML = `
            <div class="d-flex justify-content-center my-3">
                <div class="spinner-border text-success" role="status"></div>
            </div>
        `;

        fetch(`get_products_by_category.php?category_id=${categoryId}`)
            .then(res => res.json())
            .then(data => {

                productsList.innerHTML = "";

                if (data.length === 0) {
                    productsList.innerHTML = `<p class="text-muted">Нет товаров.</p>`;
                    return;
                }

                data.forEach(product => {
                    let card = document.createElement("div");
                    card.className = "card mb-3";

                    card.innerHTML = `
                        <div class="card-body">
                            <h5>${product.name}</h5>
                            <p>Цена: ${product.price}€</p>
                        </div>
                    `;

                    productsList.appendChild(card);
                });
            })
            .catch(() => {
                productsList.innerHTML =
                    `<p class="text-danger">Ошибка загрузки товаров</p>`;
            });
    }

});