<?php
require_once 'db.php';
if (!isset($_GET['order_id'])) {
header('Content-Type: application/json');
http_response_code(400);
echo json_encode(['error' => 'Order ID is required']);
exit;
}
// SQL-запрос с JOIN для получения всех нужных данных
$sql = "
SELECT
o.id as order_id, o.order_date, o.total_amount,
c.first_name, c.last_name, c.email,
p.name as product_name, oi.quantity, oi.price_per_item
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.id = ?
";
$stmt = $pdo->prepare($sql);
$stmt->execute([$_GET['order_id']]);
$rows = $stmt->fetchAll();
if (empty($rows)) {
header('Content-Type: application/json');
http_response_code(404); // Not Found
echo json_encode(['error' => 'Order not found']);
exit;
}
// Формируем структуру ответа
$order = [
'order_id' => $rows[0]['order_id'],
'order_date' => $rows[0]['order_date'],
'total_amount' => $rows[0]['total_amount'],
'customer' => [
'name' => $rows[0]['first_name'] . ' ' . $rows[0]['last_name'],
'email' => $rows[0]['email']
],
'items' => []
];
// Заполняем массив товаров
foreach ($rows as $row) {
$order['items'][] = [
'product_name' => $row['product_name'],
'quantity' => $row['quantity'],
'price_per_item' => $row['price_per_item']
];
}
header('Content-Type: application/json');
echo json_encode($order);
