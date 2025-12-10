<?php
sleep(1);
require_once 'db.php';

if (!isset($_GET['category_id'])) {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['error' => 'Category ID is required']);
    exit;
}

$sql = "SELECT id, name, price, stock_quantity FROM products WHERE category_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$_GET['category_id']]);

$products = $stmt->fetchAll();

foreach ($products as &$product) {
    $product['stock'] = $product['stock_quantity']; 
}

header('Content-Type: application/json');
echo json_encode($products);
