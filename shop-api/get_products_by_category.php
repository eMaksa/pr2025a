<?php
require_once 'db.php';
// Проверяем, передан ли category_id
if (!isset($_GET['category_id'])) {
header('Content-Type: application/json');
http_response_code(400); // Bad Request
echo json_encode(['error' => 'Category ID is required']);
exit;
}
// 1. Готовим запрос с плейсхолдером
$sql = "SELECT id, name, price, stock_quantity FROM products WHERE category_id = ?";
$stmt = $pdo->prepare($sql);
// 2. Привязываем значение и выполняем
$stmt->execute([$_GET['category_id']]);
// 3. Получаем результат
$products = $stmt->fetchAll();
// 4. Отправляем JSON-ответ
header('Content-Type: application/json');
echo json_encode($products);