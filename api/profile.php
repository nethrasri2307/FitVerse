<?php
// api/profile.php
session_start();
require_once 'connect.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['message' => 'Unauthorized. Please log in.']);
    http_response_code(401);
    exit();
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch user profile
    $stmt = $pdo->prepare("SELECT * FROM user_profiles WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $profile = $stmt->fetch();

    if ($profile) {
        echo json_encode([
            'weight_goal' => $profile['weight_goal'],
            'dietary_type' => $profile['dietary_type'],
            'allergies' => $profile['allergies']
        ]);
        http_response_code(200);
    } else {
        echo json_encode(['message' => 'Profile not set for this user']);
        http_response_code(404);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Create or update user profile
    $input = json_decode(file_get_contents('php://input'), true);

    $weight_goal = $input['weight_goal'] ?? null;
    $dietary_type = $input['dietary_type'] ?? null;
    $allergies = $input['allergies'] ?? null;

    if (!$weight_goal || !$dietary_type) {
        echo json_encode(['message' => 'Weight goal and dietary type are required']);
        http_response_code(400);
        exit();
    }

    // Check if profile exists
    $stmt = $pdo->prepare("SELECT id FROM user_profiles WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $existing_profile = $stmt->fetch();

    if ($existing_profile) {
        // Update existing profile
        $stmt = $pdo->prepare("UPDATE user_profiles SET weight_goal = ?, dietary_type = ?, allergies = ? WHERE user_id = ?");
        if ($stmt->execute([$weight_goal, $dietary_type, $allergies, $user_id])) {
            echo json_encode(['message' => 'Profile updated successfully']);
            http_response_code(200);
        } else {
            echo json_encode(['message' => 'Failed to update profile']);
            http_response_code(500);
        }
    } else {
        // Create new profile
        $stmt = $pdo->prepare("INSERT INTO user_profiles (user_id, weight_goal, dietary_type, allergies) VALUES (?, ?, ?, ?)");
        if ($stmt->execute([$user_id, $weight_goal, $dietary_type, $allergies])) {
            echo json_encode(['message' => 'Profile created successfully']);
            http_response_code(201);
        } else {
            echo json_encode(['message' => 'Failed to create profile']);
            http_response_code(500);
        }
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['message' => 'Method not allowed']);
}
?>