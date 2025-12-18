<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Магазин: Товары и Категории</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        #productsList { opacity: 1; transition: opacity 300ms ease; }

        .product-card { transform: translateY(10px); transition: opacity 400ms ease, transform 400ms ease; }
        .product-card.show { opacity: 1; transform: translateY(0); }

        /* === CART BUTTON (OLD STYLE) === */
        #cartButton{
            position: fixed; bottom: 30px; right: 30px;
            width: 65px; height: 65px; border-radius: 50%;
            background: linear-gradient(135deg, #28a745, #20c997);
            border: none; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
            color: white; font-size: 24px; cursor: pointer;
            transition: all 0.3s ease; z-index: 1000;
        }
        #cartButton:hover{ transform: scale(1.1); }

        #cartBadge{
            position: absolute; top: -5px; right: -5px;
            background: #dc3545; color: white; border-radius: 50%;
            width: 24px; height: 24px; display: none;
            align-items: center; justify-content: center;
            font-size: 12px; font-weight: bold;
        }

        /* cart items */
        .cart-item{ display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #e9ecef; }
        .cart-item-info{ flex:1; display:flex; flex-direction:column; }
        .cart-item-controls{ display:flex; align-items:center; gap:8px; }
        .cart-qty{ min-width:30px; text-align:center; font-weight:bold; }

        #emptyCartMsg{ text-align:center; padding:40px; color:#6c757d; }

        .notification{
            position: fixed; top: 20px; right: 20px;
            z-index: 1100; opacity: 0; transform: translateY(-20px);
            transition: all 0.3s ease; min-width: 250px;
        }

        .modal-header{
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
        }
        .modal-header .btn-close{ filter: brightness(0) invert(1); }

        #cartFooter{ border-top: 2px solid #28a745; padding-top: 15px; }

        /* skeleton blocks for lazy loading */
        .skeleton-block{
            border:1px solid #e9ecef;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 12px;
            background: linear-gradient(90deg, #f2f2f2 25%, #e7e7e7 37%, #f2f2f2 63%);
            background-size: 400% 100%;
            animation: shimmer 1.2s ease-in-out infinite;
        }
        @keyframes shimmer {
            0%{ background-position: 100% 0; }
            100%{ background-position: 0 0; }
        }

        /* Chat UI */
        #chatBox{
            max-height: 280px;
            overflow:auto;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 12px;
            background:#fff;
        }
        .chat-help-btn{
            position: fixed;
            left: 24px;
            bottom: 24px;
            z-index: 1000;
            border-radius: 999px;
            box-shadow: 0 6px 18px rgba(0,0,0,.15);
        }
    </style>
</head>
<body>

<!-- NAVBAR -->
<nav class="navbar navbar-dark bg-success">
    <div class="container">
        <span class="navbar-brand">🛍️ Магазин</span>

        <button class="btn btn-outline-light" id="loginBtn"
                data-bs-toggle="modal" data-bs-target="#authModal">
            Вход / Регистрация
        </button>

        <div class="dropdown d-none" id="userMenu">
            <button class="btn btn-outline-light dropdown-toggle" data-bs-toggle="dropdown">
                👤 Кабинет
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
                <li>
                    <button class="dropdown-item"
                            data-bs-toggle="modal"
                            data-bs-target="#ordersModal">
                        Мои заказы
                    </button>
                </li>
                <li>
                    <button class="dropdown-item text-danger" onclick="logout()">Выйти</button>
                </li>
            </ul>
        </div>
    </div>
</nav>

<!-- CONTENT -->
<div class="container mt-4">
    <h1 class="mb-3">🛍️ Магазин: Товары и Категории</h1>

    <button id="loadCategoriesBtn" class="btn btn-primary mb-3">
        Получить данные
    </button>

    <!-- FILTERS & SORT (task #4) -->
    <div class="row g-2 align-items-end mb-3">
        <div class="col-md-4">
            <label class="form-label mb-1">Сортировка</label>
            <select id="sortSelect" class="form-select">
                <option value="">Без сортировки</option>
                <option value="priceAsc">Цена ↑</option>
                <option value="priceDesc">Цена ↓</option>
                <option value="name">Название (А-Я)</option>
            </select>
        </div>
        <div class="col-md-8">
            <label class="form-label mb-1">Фильтр по цене (макс.): <strong><span id="priceVal">1000</span>€</strong></label>
            <input type="range" id="priceRange" class="form-range" min="0" max="1000" value="1000">
        </div>
    </div>

    <div id="categoriesList" class="list-group"></div>
    <div id="productsList" class="mt-4"></div>
</div>

<!-- CART BUTTON -->
<button id="cartButton" onclick="openCart()">
    🛒
    <span id="cartBadge">0</span>
</button>

<!-- CHAT BUTTON -->
<button class="btn btn-success chat-help-btn" data-bs-toggle="modal" data-bs-target="#chatModal">
    💬 Помощь
</button>

<!-- CART MODAL -->
<div class="modal fade" id="cartModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">🛒 Корзина покупок</h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <div id="emptyCartMsg">
                    <h5>Корзина пуста</h5>
                    <p class="mb-0">Добавьте товары для оформления заказа</p>
                </div>

                <div id="cartItems"></div>

                <!-- PROMO (task #3) -->
                <div class="mt-3">
                    <label class="form-label mb-1">Промокод</label>
                    <div class="d-flex gap-2">
                        <input id="promoInput" class="form-control" placeholder="Например: SALE10 или SALE20">
                        <button class="btn btn-outline-success" onclick="applyPromo()">Применить</button>
                    </div>
                    <div id="promoInfo" class="small mt-2"></div>
                </div>
            </div>

            <div class="modal-footer" id="cartFooter" style="display:none;">
                <div class="w-100">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0">Итого:</h5>
                        <h4 class="mb-0 text-success">
                            <span id="cartTotal">0.00</span> €
                        </h4>
                    </div>

                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-danger flex-grow-1" onclick="clearCart()">
                            Очистить
                        </button>
                        <button class="btn btn-success flex-grow-1" onclick="checkout()">
                            Оформить заказ
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>

<!-- ORDERS MODAL -->
<div class="modal fade" id="ordersModal" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">📦 Мои заказы</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body" id="ordersList">
        <div class="text-muted text-center">Загрузка...</div>
      </div>
    </div>
  </div>
</div>

<!-- CHAT MODAL (task #6) -->
<div class="modal fade" id="chatModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">💬 Поддержка</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div id="chatBox"></div>
        <input id="chatInput" class="form-control mt-2" placeholder="Введите сообщение...">
        <button class="btn btn-success w-100 mt-2" onclick="sendMessage()">Отправить</button>
      </div>
    </div>
  </div>
</div>

<!-- AUTH MODAL -->
<div class="modal fade" id="authModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Авторизация</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">

        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link active" type="button" data-tab="login">Вход</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" type="button" data-tab="register">Регистрация</button>
          </li>
        </ul>

        <form id="loginForm">
          <input type="email" id="loginEmail" class="form-control mb-2" placeholder="Email">
          <input type="password" id="loginPassword" class="form-control mb-3" placeholder="Пароль (мин. 6)">
          <button class="btn btn-success w-100" disabled>Войти</button>
        </form>

        <form id="registerForm" class="d-none">
          <input type="text" id="regName" class="form-control mb-2" placeholder="Имя">
          <input type="email" id="regEmail" class="form-control mb-2" placeholder="Email">
          <input type="password" id="regPassword" class="form-control mb-2" placeholder="Пароль (мин. 6)">
          <input type="password" id="regRepeat" class="form-control mb-3" placeholder="Повторите пароль">
          <button class="btn btn-primary w-100" disabled>Регистрация</button>
        </form>

      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="app.js"></script>
<script src="auth.js"></script>

</body>
</html>
