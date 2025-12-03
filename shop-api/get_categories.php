<?php 
sleep(1);
require_once 'db.php' ;
// 1. Готовим запрос
$stmt = $pdo->query('SELECT id, name, description FROM categories');
// 2. Получаем все строки в виде массива
$categories = $stmt->fetchAll();
// 3. Устанавливаем заголовок
header('Content-Type: application/json');
// 4. Отправляем JSON-ответ
echo json_encode($categories);