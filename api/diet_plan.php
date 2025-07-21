<?php
// api/diet_plan.php
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

// Fetch user profile
$stmt = $pdo->prepare("SELECT weight_goal, dietary_type, allergies FROM user_profiles WHERE user_id = ?");
$stmt->execute([$user_id]);
$profile = $stmt->fetch();

if (!$profile) {
    echo json_encode(['message' => 'User profile not set. Please set your preferences first.']);
    http_response_code(400);
    exit();
}

$weight_goal = $profile['weight_goal'];
$dietary_type = $profile['dietary_type'];
$allergies = $profile['allergies'];

// --- Fetch the detailed diet plan ---
$stmt = $pdo->prepare("
    SELECT
        dp.name AS plan_name,
        dpm.meal_type,
        fi.name AS food_item_name,
        mf.quantity,
        fi.serving_unit,
        fi.calories_per_serving
    FROM
        diet_plans dp
    JOIN
        diet_plan_meals dpm ON dp.id = dpm.diet_plan_id
    JOIN
        meal_food_items mf ON dpm.id = mf.diet_plan_meal_id
    JOIN
        food_items fi ON mf.food_item_id = fi.id
    WHERE
        dp.dietary_type = ? AND dp.weight_goal = ?
    ORDER BY
        FIELD(dpm.meal_type, 'Breakfast', 'Lunch', 'Dinner', 'Snack'), fi.name
");
$stmt->execute([$dietary_type, $weight_goal]);
$raw_plan_data = $stmt->fetchAll();

if (empty($raw_plan_data)) {
    echo json_encode(['message' => 'No specific diet plan found for your preferences. Try adjusting your profile.']);
    http_response_code(404);
    exit();
}

$diet_plan = [
    'plan_name' => $raw_plan_data[0]['plan_name'],
    'allergies_to_consider' => $allergies,
    'meals' => [],
    'total_calories' => 0
];

$current_meal = null;
$meal_calories = 0;

foreach ($raw_plan_data as $row) {
    if ($row['meal_type'] !== $current_meal) {
        // New meal type encountered, save previous meal's data
        if ($current_meal !== null) {
            $diet_plan['meals'][array_key_last($diet_plan['meals'])]['meal_calories'] = round($meal_calories, 2);
            $diet_plan['total_calories'] += $meal_calories;
        }
        // Start new meal
        $current_meal = $row['meal_type'];
        $meal_calories = 0;
        $diet_plan['meals'][] = [
            'meal_type' => $current_meal,
            'items' => []
        ];
    }

    $item_calories = $row['quantity'] * $row['calories_per_serving'];
    $meal_calories += $item_calories;

    $diet_plan['meals'][array_key_last($diet_plan['meals'])]['items'][] = [
        'name' => $row['food_item_name'],
        'quantity' => $row['quantity'],
        'unit' => $row['serving_unit'],
        'calories' => round($item_calories, 2)
    ];
}

// Add calories for the last meal after the loop finishes
if ($current_meal !== null) {
    $diet_plan['meals'][array_key_last($diet_plan['meals'])]['meal_calories'] = round($meal_calories, 2);
    $diet_plan['total_calories'] += $meal_calories;
}
$diet_plan['total_calories'] = round($diet_plan['total_calories'], 2);


echo json_encode($diet_plan);
http_response_code(200);

?>