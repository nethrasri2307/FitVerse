<?php
// api/register.php
session_start(); // Start session to use $_SESSION
require_once 'connect.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username']) || !isset($input['password'])) {
    echo json_encode(['message' => 'Username and password are required']);
    http_response_code(400);
    exit();
}

$username = $input['username'];
$password = $input['password'];

// Check if username already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    echo json_encode(['message' => 'Username already exists']);
    http_response_code(409);
    exit();
}

// Hash the password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$stmt = $pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
if ($stmt->execute([$username, $password_hash])) {
    echo json_encode(['message' => 'User registered successfully']);
    http_response_code(201);
} else {
    echo json_encode(['message' => 'Registration failed']);
    http_response_code(500);
}
?>