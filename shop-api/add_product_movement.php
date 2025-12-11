<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$product_id = $data['product_id'] ?? null;
$type = $data['movement_type'] ?? null;
$qty = $data['quantity'] ?? null;

if (!$product_id || !$type || !$qty) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing data']);
    exit;
}

// 1. Добавляем движение
$stmt = $pdo->prepare("INSERT INTO product_movements (product_id, movement_type, quantity) VALUES (?, ?, ?)");
$stmt->execute([$product_id, $type, $qty]);

// 2. Обновляем остаток
$sign = $type === 'приход' ? '+' : '-';
$update = $pdo->prepare("UPDATE products SET stock_quantity = stock_quantity $sign ? WHERE id = ?");
$update->execute([$qty, $product_id]);

// 3. Получаем категорию для обновления списка
$catStmt = $pdo->prepare("SELECT category_id FROM products WHERE id = ?");
$catStmt->execute([$product_id]);
$category_id = $catStmt->fetchColumn();

echo json_encode(['success' => true, 'category_id' => $category_id]);