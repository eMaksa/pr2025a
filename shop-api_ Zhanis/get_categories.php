<?php
require_once 'db.php';

// 1. SQL
$stmt = $pdo->query("SELECT id, name, description FROM categories");

// 2. Dabūjam visas rindas
$categories = $stmt->fetchAll();

// 3. JSON galvene
header('Content-Type: application/json');

// 4. Izvadam kā JSON
echo json_encode($categories);