<?php
// api/log_food.php
session_start(); // Start session to get user_id
require_once 'connect.php'; // Use your existing database connection

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['message' => 'Unauthorized. Please log in.']);
    http_response_code(401);
    exit();
}

$user_id = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

$log_date = $input['log_date'] ?? date('Y-m-d'); // Default to today's date if not provided
$meal_type = $input['meal_type'] ?? null;
$foods = $input['foods'] ?? []; // Expected: [{food_item_id: X, quantity: Y}, ...]

// Basic validation
if (!$meal_type || empty($foods)) {
    echo json_encode(['message' => 'Meal type and food items are required.']);
    http_response_code(400);
    exit();
}

try {
    // Start a transaction for atomicity (either all inserts succeed or none do)
    $pdo->beginTransaction();

    // 1. Find or create the user_logged_meal entry for the given user, date, and meal type.
    // If it exists, we'll clear its old food items and add new ones (re-logging).
    $stmt = $pdo->prepare("SELECT id FROM user_logged_meals WHERE user_id = ? AND log_date = ? AND meal_type = ?");
    $stmt->execute([$user_id, $log_date, $meal_type]);
    $logged_meal = $stmt->fetch();

    $logged_meal_id = null;
    if ($logged_meal) {
        $logged_meal_id = $logged_meal['id'];
        // Delete existing logged food items for this meal before inserting new ones.
        // This effectively updates the meal if a user logs the same meal type again for the same day.
        $stmt_delete_old = $pdo->prepare("DELETE FROM user_logged_food_items WHERE logged_meal_id = ?");
        $stmt_delete_old->execute([$logged_meal_id]);
    } else {
        // Create a new logged meal entry
        $stmt = $pdo->prepare("INSERT INTO user_logged_meals (user_id, log_date, meal_type) VALUES (?, ?, ?)");
        $stmt->execute([$user_id, $log_date, $meal_type]);
        $logged_meal_id = $pdo->lastInsertId(); // Get the ID of the newly inserted row
    }

    // 2. Insert each food item into user_logged_food_items
    $total_meal_calories = 0;
    $food_item_stmt = $pdo->prepare("SELECT calories_per_serving FROM food_items WHERE id = ?");
    $insert_food_stmt = $pdo->prepare("INSERT INTO user_logged_food_items (logged_meal_id, food_item_id, quantity, calories_at_log) VALUES (?, ?, ?, ?)");

    foreach ($foods as $food) {
        $food_item_id = $food['food_item_id'] ?? null;
        $quantity = $food['quantity'] ?? null;

        // Validate individual food item data
        if (!filter_var($food_item_id, FILTER_VALIDATE_INT) || $food_item_id <= 0 || !is_numeric($quantity) || $quantity <= 0) {
            throw new Exception("Invalid food item ID or quantity provided.");
        }

        // Fetch calories_per_serving for the food item
        $food_item_stmt->execute([$food_item_id]);
        $item_data = $food_item_stmt->fetch();

        if ($item_data) {
            $calories_per_serving = $item_data['calories_per_serving'];
            $calculated_calories = $quantity * $calories_per_serving;
            $total_meal_calories += $calculated_calories;

            // Insert into user_logged_food_items
            $insert_food_stmt->execute([$logged_meal_id, $food_item_id, $quantity, $calculated_calories]);
        } else {
            // If a food_item_id is not found, rollback the transaction
            throw new Exception("Food item with ID " . $food_item_id . " not found.");
        }
    }

    // If all successful, commit the transaction
    $pdo->commit();
    echo json_encode(['message' => 'Food logged successfully!', 'total_meal_calories' => round($total_meal_calories, 2)]);
    http_response_code(201); // 201 Created

} catch (Exception $e) {
    // If any error occurs, rollback the transaction
    $pdo->rollBack();
    error_log("Food logging error: " . $e->getMessage()); // Log error for debugging
    echo json_encode(['message' => 'Failed to log food: ' . $e->getMessage()]);
    http_response_code(500); // 500 Internal Server Error
}
?>