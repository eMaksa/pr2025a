console.log("JS darbojas");
document.addEventListener("DOMContentLoaded", () => {
    const loadBtn = document.getElementById("loadCategoriesBtn");
    const categoriesList = document.getElementById("categoriesList");
    const productsList = document.getElementById("productsList");


    loadBtn.addEventListener("click", () => {
        loadCategories();
    });


    function loadCategories() {
        loadBtn.textContent = "Загрузка...";

        fetch("get_categories.php")
            .then(res => res.json())
            .then(data => {
                console.log("Категории:", data);

                categoriesList.innerHTML = "";
                productsList.innerHTML = "";

                data.forEach(category => {
                    let item = document.createElement("button");
                    item.className = "list-group-item list-group-item-action";
                    item.textContent = category.name;

                    // сохраняем id категории
                    item.dataset.id = category.id;

                    // обработчик клика по категории
                    item.addEventListener("click", () => {
                        loadProducts(category.id);
                    });

                    categoriesList.appendChild(item);
                });
            })
            .catch(err => console.error(err))
            .finally(() => {
                loadBtn.textContent = "Получить данные";
            });
    }

    // --------------------------
    // Функция загрузки продуктов
    // --------------------------
    function loadProducts(categoryId) {
        productsList.innerHTML = "<p>Загрузка товаров...</p>";

        fetch(`get_products_by_category.php?category_id=${categoryId}`)
            .then(res => res.json())
            .then(data => {
                console.log("Товары:", data);

                productsList.innerHTML = "";

                data.forEach(product => {
                    let card = document.createElement("div");
                    card.className = "card mb-3";

                    card.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">Цена: ${product.price}€</p>
                        </div>
                    `;

                    productsList.appendChild(card);
                });
            })
            .catch(err => console.error(err));
    }
});