<?php
require_once 'db.php';
session_start();

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Email и пароль обязательны'
    ]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT id, first_name, last_name, password_hash
    FROM customers
    WHERE email = ?
");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Неверный email или пароль'
    ]);
    exit;
}

// ✅ УСПЕХ
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];

echo json_encode([
    'success' => true,
    'user' => [
        'id' => $user['id'],
        'name' => $_SESSION['user_name']
    ]
]);
