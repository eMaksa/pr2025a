<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Магазин: Товары и Категории</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
    #productsList {
        opacity: 1;
        transition: opacity 300ms ease;
    }
    .product-card {
        transform: translateY(10px);
        transition: opacity 400ms ease, transform 400ms ease;
    }
    .product-card.show {
        opacity: 1;
        transform: translateY(0);
    }
</style>

</head>
<body>

<div class="container mt-4">

    <h1 class="mb-4">Магазин: Товары и Категории</h1>

    <button id="loadCategoriesBtn" class="btn btn-primary mb-3">
        Получить данные
    </button>


    <div id="categoriesList" class="list-group"></div>

    <div id="productsList" class="mt-4"></div>

</div>

<script src="app.js"></script>
</body>
</html>
