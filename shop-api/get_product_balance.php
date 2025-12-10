<?php
require_once 'db.php';

if (!isset($_GET['product_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Product ID is required']);
    exit;
}

$stmt = $pdo->prepare("
    SELECT 
        SUM(CASE WHEN movement_type = 'приход' THEN quantity ELSE 0 END) AS total_in,
        SUM(CASE WHEN movement_type = 'расход' THEN quantity ELSE 0 END) AS total_out
    FROM product_movements
    WHERE product_id = ?
");
$stmt->execute([$_GET['product_id']]);
$data = $stmt->fetch();

echo json_encode([
    'product_id' => $_GET['product_id'],
    'приход' => intval($data['total_in']),
    'расход' => intval($data['total_out']),
    'остаток' => intval($data['total_in']) - intval($data['total_out'])
]);