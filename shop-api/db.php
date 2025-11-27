<?php
$host = 'localhost';
$dbname = 'shopdb'; // Имя БД, которую они создали
$user = 'Tjoma'; // Пользователь по умолчанию в XAMPP
$pass = 'Qwerty_889.513.'; // Пароль по умолчанию пустой
$options = [
PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
PDO::ATTR_EMULATE_PREPARES => false,
];
try {
$pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass,
$options);
} catch (\PDOException $e) {
// В реальном проекте здесь не стоит выводить ошибку, а писать в лог
throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
?>
