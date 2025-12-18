<?php
require_once "db.php";
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Необходимо войти в систему'
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$cart = $data['cart'] ?? [];

if (empty($cart)) {
    echo json_encode([
        'success' => false,
        'error' => 'Корзина пуста'
    ]);
    exit;
}

$customerId = $_SESSION['user_id'];

$pdo->beginTransaction();

try {
    // Заказ
    $stmt = $pdo->prepare("
        INSERT INTO orders (customer_id, created_at)
        VALUES (?, NOW())
    ");
    $stmt->execute([$customerId]);
    $orderId = $pdo->lastInsertId();

    foreach ($cart as $item) {
        $stmt = $pdo->prepare("
            SELECT stock_quantity, price
            FROM products
            WHERE id = ?
            FOR UPDATE
        ");
        $stmt->execute([$item['id']]);
        $product = $stmt->fetch();

        if (!$product) {
            throw new Exception('Товар не найден');
        }

        if ($item['quantity'] > $product['stock_quantity']) {
            throw new Exception('Недостаточно товара');
        }

        // order_items
        $stmt = $pdo->prepare("
            INSERT INTO order_items (order_id, product_id, quantity, price_per_item)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $orderId,
            $item['id'],
            $item['quantity'],
            $product['price']
        ]);

        // movement
        $stmt = $pdo->prepare("
            INSERT INTO product_movements (product_id, movement_type, quantity)
            VALUES (?, 0, ?)
        ");
        $stmt->execute([
            $item['id'],
            $item['quantity']
        ]);

        // update stock
        $stmt = $pdo->prepare("
            UPDATE products
            SET stock_quantity = stock_quantity - ?
            WHERE id = ?
        ");
        $stmt->execute([
            $item['quantity'],
            $item['id']
        ]);
    }

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}