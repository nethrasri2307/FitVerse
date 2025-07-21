<?php
// api/get_daily_log.php
session_start();
require_once 'connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['message' => 'Unauthorized. Please log in.']);
    http_response_code(401);
    exit();
}

$user_id = $_SESSION['user_id'];
$log_date = $_GET['date'] ?? date('Y-m-d'); // Get date from GET parameter, default to today

try {
    // 1. Fetch user profile
    $stmt_profile = $pdo->prepare("SELECT weight_goal, dietary_type FROM user_profiles WHERE user_id = ?");
    $stmt_profile->execute([$user_id]);
    $profile = $stmt_profile->fetch(PDO::FETCH_ASSOC);

    $suggested_daily_calorie_target = null;
    if ($profile) {
        // 2. Fetch the target calories from the diet_plans based on user profile
        $stmt_plan_target = $pdo->prepare("SELECT target_calories FROM diet_plans WHERE dietary_type = ? AND weight_goal = ? LIMIT 1");
        $stmt_plan_target->execute([$profile['dietary_type'], $profile['weight_goal']]);
        $plan_target = $stmt_plan_target->fetch(PDO::FETCH_ASSOC);
        if ($plan_target) {
            $suggested_daily_calorie_target = (float)$plan_target['target_calories'];
        }
    }

    // SQL query to fetch all logged food items for a user on a given date
    $stmt = $pdo->prepare("
        SELECT
            ulm.meal_type,
            ulm.id AS logged_meal_id,
            ulfi.quantity,
            ulfi.calories_at_log,
            fi.name AS food_name,
            fi.serving_unit
        FROM
            user_logged_meals ulm
        JOIN
            user_logged_food_items ulfi ON ulm.id = ulfi.logged_meal_id
        JOIN
            food_items fi ON ulfi.food_item_id = fi.id
        WHERE
            ulm.user_id = ? AND ulm.log_date = ?
        ORDER BY
            FIELD(ulm.meal_type, 'Breakfast', 'Lunch', 'Dinner', 'Snack'), fi.name
    ");
    $stmt->execute([$user_id, $log_date]);
    $raw_log_data = $stmt->fetchAll();

    $daily_log = [
        'logged_date' => $log_date,
        'meals' => [],
        'total_daily_calories' => 0,
        'suggested_daily_calorie_target' => $suggested_daily_calorie_target // Include target in response
    ];

    $current_meal_type = null;
    $current_meal_calories = 0;
    $meal_items = [];

    // Process raw data into a structured format
    foreach ($raw_log_data as $row) {
        if ($row['meal_type'] !== $current_meal_type) {
            // New meal type encountered, save previous meal's data
            if ($current_meal_type !== null) {
                $daily_log['meals'][] = [
                    'meal_type' => $current_meal_type,
                    'meal_calories' => round($current_meal_calories, 2),
                    'items' => $meal_items
                ];
                $daily_log['total_daily_calories'] += $current_meal_calories;
            }
            // Start new meal
            $current_meal_type = $row['meal_type'];
            $current_meal_calories = 0;
            $meal_items = [];
        }

        $current_meal_calories += $row['calories_at_log']; // Use pre-calculated calories
        $meal_items[] = [
            'name' => $row['food_name'],
            'quantity' => $row['quantity'],
            'unit' => $row['serving_unit'],
            'calories' => round($row['calories_at_log'], 2)
        ];
    }

    // Add the last meal's data after the loop finishes
    if ($current_meal_type !== null) {
        $daily_log['meals'][] = [
            'meal_type' => $current_meal_type,
            'meal_calories' => round($current_meal_calories, 2),
            'items' => $meal_items
        ];
        $daily_log['total_daily_calories'] += $current_meal_calories;
    }


    echo json_encode($daily_log);
    http_response_code(200);

} catch (PDOException $e) {
    error_log("Error fetching daily log: " . $e->getMessage());
    echo json_encode(['message' => 'Error fetching daily log.']);
    http_response_code(500);
}
?>