<?php
// api/connect.php

$host = 'localhost';
$db   = 'diet_app_db';
$user = 'root'; // Default XAMPP MySQL user
$pass = '';     // Default XAMPP MySQL password (empty)
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Log the error for debugging (don't show detailed errors to users in production)
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Database connection error. Please try again later.']);
    exit();
}
?>