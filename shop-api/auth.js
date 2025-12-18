const AUTH_KEY = 'shopUser';

console.log("auth.js загружен!");

/* ======================
   HELPERS
====================== */
function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isLoggedIn() {
    return !!localStorage.getItem(AUTH_KEY);
}

function setUser(user) {
    // glabājam USER kā JSON (pareizi)
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    updateAuthUI();
}

/* ======================
   LOGOUT
====================== */
function logout() {
    // ja logout.php neeksistē – nekas nelūzīs
    fetch('logout.php').catch(() => {});
    localStorage.removeItem(AUTH_KEY);
    updateAuthUI();
    showNotification('Вы вышли');
}

// padarām pieejamu HTML
window.logout = logout;

/* ======================
   UI UPDATE
====================== */
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

/* ======================
   NOTIFICATIONS
====================== */
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

/* ======================
   DOM READY
====================== */
document.addEventListener('DOMContentLoaded', () => {

    updateAuthUI();

    /* === TABS === */
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            loginForm.classList.toggle('d-none', tab.dataset.tab !== 'login');
            registerForm.classList.toggle('d-none', tab.dataset.tab !== 'register');
        });
    });

    /* === LOGIN VALIDATION === */
    function validateLogin() {
        loginForm.querySelector('button').disabled =
            !(isEmail(loginEmail.value) && loginPassword.value.length >= 6);
    }

    loginEmail.addEventListener('input', validateLogin);
    loginPassword.addEventListener('input', validateLogin);

    /* === LOGIN SUBMIT === */
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
            bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
            showNotification('Вход выполнен');

        } catch {
            showNotification('Ошибка сервера', 'danger');
        }
    });

    /* === REGISTER VALIDATION === */
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

    /* === REGISTER SUBMIT === */
    registerForm.addEventListener('submit', async e => {
        e.preventDefault();

        const btn = registerForm.querySelector('button');
        btn.disabled = true;

        try {
            const fullName = regName.value.trim();
            const [first_name, ...rest] = fullName.split(' ');
            const last_name = rest.join(' ') || 'User';

            const response = await fetch('register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name,
                    last_name,
                    email: regEmail.value,
                    password: regPassword.value
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showNotification(data.error || 'Ошибка регистрации', 'danger');
                return;
            }

            showNotification('Регистрация успешна! Теперь войдите');
            document.querySelector('[data-tab="login"]').click();

            registerForm.reset();
            validateRegister();

        } catch {
            showNotification('Ошибка сервера', 'danger');
        } finally {
            btn.disabled = false;
        }
    });

    /* === ORDERS (заглушка) === */
    document.getElementById('ordersModal')
        ?.addEventListener('shown.bs.modal', () => {
            const box = document.getElementById('ordersList');
            if (box) box.innerHTML = '<p class="text-muted">Заказов пока нет</p>';
        });
});
