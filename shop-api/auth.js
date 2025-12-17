const AUTH_KEY = 'shopUser';

// AUTH STATE
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

// UI UPDATE
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

// UTILS
function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// TABS
document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        loginForm.classList.toggle('d-none', tab.dataset.tab !== 'login');
        registerForm.classList.toggle('d-none', tab.dataset.tab !== 'register');
    });
});

// LOGIN
function validateLogin() {
    loginForm.querySelector('button').disabled =
        !(isEmail(loginEmail.value) && loginPassword.value.length >= 6);
}

loginEmail.addEventListener('input', validateLogin);
loginPassword.addEventListener('input', validateLogin);

loginForm.addEventListener('submit', e => {
    e.preventDefault();
    setUser(loginEmail.value);
    bootstrap.Modal.getInstance(authModal).hide();
});

// REGISTER
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

registerForm.addEventListener('submit', e => {
    e.preventDefault();
    setUser(regEmail.value);
    bootstrap.Modal.getInstance(authModal).hide();
});

// LOAD ORDERS
async function loadOrders() {
    const box = document.getElementById('ordersList');
    if (!box) return;

    const res = await fetch('get_order_details.php');
    const orders = await res.json();

    if (!orders.length) {
        box.innerHTML = '<p class="text-muted">Заказов нет</p>';
        return;
    }

    box.innerHTML = orders.map(o => `
        <div class="card mb-2">
            <div class="card-body">
                <strong>Заказ №${o.id}</strong><br>
                ${o.total} €<br>
                <small class="text-muted">${o.created_at}</small>
            </div>
        </div>
    `).join('');
}

document.getElementById('ordersModal')
    ?.addEventListener('shown.bs.modal', loadOrders);
