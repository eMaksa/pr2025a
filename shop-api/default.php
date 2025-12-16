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

    /* КОРЗИНА */
    #cartButton {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 65px;
        height: 65px;
        border-radius: 50%;
        background: linear-gradient(135deg, #28a745, #20c997);
        border: none;
        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
        color: white;
        font-size: 24px;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 1000;
    }

    #cartButton:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(40, 167, 69, 0.6);
    }

    #cartBadge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #dc3545;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }

    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border-bottom: 1px solid #e9ecef;
    }

    .cart-item:last-child {
        border-bottom: none;
    }

    .cart-item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .cart-qty {
        min-width: 30px;
        text-align: center;
        font-weight: bold;
    }

    #emptyCartMsg {
        text-align: center;
        padding: 40px;
        color: #6c757d;
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1100;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        min-width: 250px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .modal-header {
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
    }

    .modal-header .btn-close {
        filter: brightness(0) invert(1);
    }

    #cartFooter {
        border-top: 2px solid #28a745;
        padding-top: 15px;
    }
</style>

</head>
<body>

<div class="container mt-4">

    <h1 class="mb-4">🛍️ Магазин: Товары и Категории</h1>

    <button id="loadCategoriesBtn" class="btn btn-primary mb-3">
        Получить данные
    </button>

    <div id="categoriesList" class="list-group"></div>

    <div id="productsList" class="mt-4"></div>

</div>

<!-- КНОПКА КОРЗИНЫ -->
<button id="cartButton" onclick="openCart()">
    🛒
    <span id="cartBadge">0</span>
</button>

<!-- МОДАЛЬНОЕ ОКНО КОРЗИНЫ -->
<div class="modal fade" id="cartModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">🛒 Корзина покупок</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div id="emptyCartMsg">
            <h5>Корзина пуста</h5>
            <p class="mb-0">Добавьте товары для оформления заказа</p>
        </div>
        <div id="cartItems"></div>
      </div>
      <div class="modal-footer" id="cartFooter" style="display: none;">
        <div class="w-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Итого:</h5>
                <h4 class="mb-0 text-success"><span id="cartTotal">0.00</span>€</h4>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-danger flex-grow-1" onclick="clearCart()">
                    Очистить
                </button>
                <button class="btn btn-success flex-grow-1" onclick="alert('Функция оформления заказа будет добавлена вечером 😊')">
                    Оформить заказ
                </button>
            </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="app.js"></script>
</body>
</html>