<?php
// api/get_foods.php
require_once 'connect.php'; // Use your existing database connection

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT id, name, serving_unit FROM food_items ORDER BY name");
    $foods = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($foods);
    http_response_code(200);
} catch (PDOException $e) {
    error_log("Error fetching food items: " . $e->getMessage());
    echo json_encode(['message' => 'Error fetching food items.']);
    http_response_code(500);
}
?>