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

function setUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    updateAuthUI();
}

function logout() {
    // 🔴 ИЗМЕНЕНО: выход через сервер
    fetch('logout.php')
        .then(() => {
            localStorage.removeItem(AUTH_KEY);
            updateAuthUI();
            showNotification('Вы вышли');
        });
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

// === УВЕДОМЛЕНИЯ ===
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

// === ВХОД ===
function validateLogin() {
    loginForm.querySelector('button').disabled =
        !(isEmail(loginEmail.value) && loginPassword.value.length >= 6);
}

loginEmail.addEventListener('input', validateLogin);
loginPassword.addEventListener('input', validateLogin);

// 🔴 ИЗМЕНЕНО: реальный логин через PHP
loginForm.addEventListener('submit', async e => {
    e.preventDefault();

    try {
        const response = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: loginEmail.value,
                password: loginPassword.value
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            showNotification(data.error || 'Ошибка входа', 'danger');
            return;
        }

        setUser(data.user);
        bootstrap.Modal.getInstance(authModal).hide();
        showNotification('Вход выполнен');

    } catch (e) {
        showNotification('Ошибка сервера', 'danger');
    }
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

    btn.disabled = true;
    btn.textContent = 'Регистрация...';

    try {
        const fullName = regName.value.trim();
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || fullName;
        const lastName = nameParts.slice(1).join(' ') || 'User';

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

        if (!response.ok || !data.success) {
            showNotification(data.error || 'Ошибка регистрации', 'danger');
            return;
        }

        showNotification('Регистрация успешна! Теперь войдите в систему');
        document.querySelector('[data-tab="login"]').click();

        regName.value = '';
        regEmail.value = '';
        regPassword.value = '';
        regRepeat.value = '';

    } catch (error) {
        showNotification('Ошибка подключения к серверу', 'danger');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
        validateRegister();
    }
});

// === ЗАГРУЗКА ЗАКАЗОВ (заглушка) ===
async function loadOrders() {
    const box = document.getElementById('ordersList');
    if (!box) return;
    box.innerHTML = '<p class="text-muted">Заказов пока нет</p>';
}

document.getElementById('ordersModal')
    ?.addEventListener('shown.bs.modal', loadOrders);
