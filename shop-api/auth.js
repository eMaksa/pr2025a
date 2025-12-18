const AUTH_KEY = 'shopUser';

console.log("auth.js загружен!");

// Проверка, что элементы существуют
document.addEventListener('DOMContentLoaded', () => {
    console.log("Форма регистрации:", document.getElementById('registerForm'));
    console.log("Поле имени:", document.getElementById('regName'));
});

// === ПРОВЕРКА АВТОРИЗАЦИИ ===
function isLoggedIn() {
    return !!localStorage.getItem(AUTH_KEY);
}

function setUser(email) {
    localStorage.setItem(AUTH_KEY, email);
    updateAuthUI();
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    updateAuthUI();
}

// === ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ===
function updateAuthUI() {
    const userMenu = document.getElementById('userMenu');
    const loginBtn = document.getElementById('loginBtn');
    const loadBtn = document.getElementById('loadCategoriesBtn');

    if (isLoggedIn()) {
        userMenu?.classList.remove('d-none');
        loginBtn?.classList.add('d-none');
        loadBtn?.classList.remove('d-none');
    } else {
        userMenu?.classList.add('d-none');
        loginBtn?.classList.remove('d-none');
        loadBtn?.classList.add('d-none');
    }
}

document.addEventListener('DOMContentLoaded', updateAuthUI);

// === УТИЛИТЫ ===
function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Функция для показа уведомлений
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

// === ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ===
document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        loginForm.classList.toggle('d-none', tab.dataset.tab !== 'login');
        registerForm.classList.toggle('d-none', tab.dataset.tab !== 'register');
    });
});

// === ВХОД (пока без функционала) ===
function validateLogin() {
    loginForm.querySelector('button').disabled =
        !(isEmail(loginEmail.value) && loginPassword.value.length >= 6);
}

loginEmail.addEventListener('input', validateLogin);
loginPassword.addEventListener('input', validateLogin);

loginForm.addEventListener('submit', e => {
    e.preventDefault();
    // Временно: просто логиним
    setUser(loginEmail.value);
    bootstrap.Modal.getInstance(authModal).hide();
    showNotification('Вход выполнен!');
});

// === РЕГИСТРАЦИЯ ===
function validateRegister() {
    registerForm.querySelector('button').disabled = !(
        regName.value.length >= 2 &&
        isEmail(regEmail.value) &&
        regPassword.value.length >= 6 &&
        regPassword.value === regRepeat.value
    );
}

[regName, regEmail, regPassword, regRepeat].forEach(el =>
    el.addEventListener('input', validateRegister)
);

// ОБРАБОТКА ФОРМЫ РЕГИСТРАЦИИ
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = registerForm.querySelector('button');
    const originalText = btn.textContent;
    
    // Показываем процесс загрузки
    btn.disabled = true;
    btn.textContent = 'Регистрация...';

    try {
        // Разделяем имя на имя и фамилию
        const fullName = regName.value.trim();
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || fullName;
        const lastName = nameParts.slice(1).join(' ') || 'User';

        // Отправляем данные на сервер
        const response = await fetch('register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: regEmail.value,
                password: regPassword.value
            })
        });

        const data = await response.json();

        // Если ошибка
        if (!response.ok || !data.success) {
            showNotification(data.error || 'Ошибка регистрации', 'danger');
            return;
        }

        // Если успешно
        showNotification('Регистрация успешна! Теперь войдите в систему', 'success');
        
        // Переключаемся на вкладку "Вход"
        document.querySelector('[data-tab="login"]').click();
        
        // Очищаем форму
        regName.value = '';
        regEmail.value = '';
        regPassword.value = '';
        regRepeat.value = '';

    } catch (error) {
        // Ошибка подключения
        showNotification('Ошибка подключения к серверу', 'danger');
        console.error(error);
    } finally {
        // Возвращаем кнопку в исходное состояние
        btn.disabled = false;
        btn.textContent = originalText;
        validateRegister(); // Обновляем состояние кнопки
    }
});

// === ЗАГРУЗКА ЗАКАЗОВ (пока заглушка) ===
async function loadOrders() {
    const box = document.getElementById('ordersList');
    if (!box) return;
    box.innerHTML = '<p class="text-muted">Заказов пока нет</p>';
}

document.getElementById('ordersModal')
    ?.addEventListener('shown.bs.modal', loadOrders);