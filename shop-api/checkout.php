<?php
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$cart = $data["cart"] ?? [];

if (empty($cart)) {
    echo json_encode(["success" => false, "error" => "Корзина пуста"]);
    exit;
}

$pdo->beginTransaction();

try {

    // 1️⃣ Guest klients (VISI NOT NULL LAUKI AIZPILDĪTI)
    $guestEmail = 'guest_' . time() . '@shop.local';
    $guestPasswordHash = password_hash('guest', PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO customers (first_name, last_name, email, password_hash)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([
        'Guest',
        'User',
        $guestEmail,
        $guestPasswordHash
    ]);

    $customerId = $pdo->lastInsertId();

    // 2️⃣ Order
    $stmt = $pdo->prepare("
        INSERT INTO orders (customer_id, created_at)
        VALUES (?, NOW())
    ");
    $stmt->execute([$customerId]);
    $orderId = $pdo->lastInsertId();

    // 3️⃣ Grozs
    foreach ($cart as $item) {

        $stmt = $pdo->prepare("
            SELECT stock_quantity, price
            FROM products
            WHERE id = ?
        ");
        $stmt->execute([$item["id"]]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            throw new Exception("Товар не найден");
        }

        if ($item["quantity"] > $product["stock_quantity"]) {
            throw new Exception("Недостаточно товара: " . $item["name"]);
        }

        // order_items
        $stmt = $pdo->prepare("
            INSERT INTO order_items (order_id, product_id, quantity, price_per_item)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $orderId,
            $item["id"],
            $item["quantity"],
            $product["price"]
        ]);

        // movement (0 = расход)
        $stmt = $pdo->prepare("
            INSERT INTO product_movements (product_id, movement_type, quantity)
            VALUES (?, 0, ?)
        ");
        $stmt->execute([
            $item["id"],
            $item["quantity"]
        ]);

        // stock update
        $stmt = $pdo->prepare("
            UPDATE products
            SET stock_quantity = stock_quantity - ?
            WHERE id = ?
        ");
        $stmt->execute([
            $item["quantity"],
            $item["id"]
        ]);
    }

    $pdo->commit();
    echo json_encode(["success" => true]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
