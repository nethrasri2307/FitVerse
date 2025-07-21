<?php
// api/login.php
session_start();
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

$stmt = $pdo->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    // Login successful
    $_SESSION['user_id'] = $user['id']; // Store user ID in session
    $_SESSION['username'] = $user['username']; // Store username in session
    echo json_encode([
        'message' => 'Login successful',
        'user_id' => $user['id'],
        'username' => $user['username']
    ]);
    http_response_code(200);
} else {
    echo json_encode(['message' => 'Invalid username or password']);
    http_response_code(401);
}
?>