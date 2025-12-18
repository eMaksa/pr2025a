<?php
// Подключаем базу данных
require_once 'db.php';

// Устанавливаем заголовок для JSON ответа
header('Content-Type: application/json');

// Получаем данные из запроса
$data = json_decode(file_get_contents("php://input"), true);

// Извлекаем поля из запроса
$firstName = trim($data['first_name'] ?? '');
$lastName = trim($data['last_name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// === ВАЛИДАЦИЯ ДАННЫХ ===

// Проверка: имя и фамилия не пустые
if (empty($firstName) || empty($lastName)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'error' => 'Имя и фамилия обязательны'
    ]);
    exit;
}

// Проверка: email корректный
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'error' => 'Некорректный email'
    ]);
    exit;
}

// Проверка: пароль минимум 6 символов
if (strlen($password) < 4) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'error' => 'Пароль должен быть не менее 6 символов'
    ]);
    exit;
}

try {
    // Проверяем, не занят ли email
    $stmt = $pdo->prepare("SELECT id FROM customers WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'error' => 'Email уже зарегистрирован'
        ]);
        exit;
    }

    // Хешируем пароль (безопасное хранение)
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Добавляем пользователя в базу
    $stmt = $pdo->prepare("
        INSERT INTO customers (first_name, last_name, email, password_hash, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$firstName, $lastName, $email, $passwordHash]);

    // Получаем ID нового пользователя
    $userId = $pdo->lastInsertId();

    // Возвращаем успешный ответ
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $userId,
            'email' => $email,
            'name' => $firstName . ' ' . $lastName
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Ошибка сервера при регистрации'
    ]);
}