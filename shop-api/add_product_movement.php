<?php
require_once 'db.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$product_id = $data['product_id'] ?? null;
$type_raw   = $data['movement_type'] ?? null;   
$qty        = (int)($data['quantity'] ?? 0);

if (!$product_id || !$type_raw || $qty <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing or invalid data']);
    exit;
}

$movement_type = ($type_raw === 'приход') ? 1 : 0;

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("SELECT stock_quantity, category_id FROM products WHERE id = ? FOR UPDATE");
    $stmt->execute([$product_id]);
    $product = $stmt->fetch();

    if (!$product) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'error' => 'Product not found']);
        exit;
    }

    $current_stock = (int)$product['stock_quantity'];
    $category_id   = $product['category_id'];

    if ($movement_type === 0 && $qty > $current_stock) {
        $pdo->rollBack();
        echo json_encode([
            'success' => false,
            'error'   => "Недостаточно товара. Доступно: $current_stock"
        ]);
        exit;
    }

    if ($movement_type === 1) {

        $new_stock = $current_stock + $qty;
    } else {
        $new_stock = $current_stock - $qty;
    }

    $stmt = $pdo->prepare("
        INSERT INTO product_movements (product_id, movement_type, quantity)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$product_id, $movement_type, $qty]);

    $stmt = $pdo->prepare("
        UPDATE products
        SET stock_quantity = ?
        WHERE id = ?
    ");
    $stmt->execute([$new_stock, $product_id]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'new_stock' => $new_stock,
        'category_id' => $category_id
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
