-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 21, 2025 at 04:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `diet_app_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `diet_plans`
--

CREATE TABLE `diet_plans` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `dietary_type` varchar(20) NOT NULL,
  `weight_goal` varchar(20) NOT NULL,
  `target_calories` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diet_plans`
--

INSERT INTO `diet_plans` (`id`, `name`, `dietary_type`, `weight_goal`, `target_calories`) VALUES
(1, 'Vegan Weight Loss', 'vegan', 'loss', 1600.00),
(2, 'Vegan Weight Gain', 'vegan', 'gain', 2500.00),
(3, 'Vegetarian Weight Loss', 'vegetarian', 'loss', 1800.00),
(4, 'Vegetarian Weight Gain', 'vegetarian', 'gain', 2700.00),
(5, 'Non-Veg Weight Loss', 'non-veg', 'loss', 2000.00),
(6, 'Non-Veg Weight Gain', 'non-veg', 'gain', 3000.00);

-- --------------------------------------------------------

--
-- Table structure for table `diet_plan_meals`
--

CREATE TABLE `diet_plan_meals` (
  `id` int(11) NOT NULL,
  `diet_plan_id` int(11) NOT NULL,
  `meal_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diet_plan_meals`
--

INSERT INTO `diet_plan_meals` (`id`, `diet_plan_id`, `meal_type`) VALUES
(1, 1, 'Breakfast'),
(3, 1, 'Dinner'),
(2, 1, 'Lunch'),
(4, 6, 'Breakfast'),
(6, 6, 'Dinner'),
(5, 6, 'Lunch'),
(7, 6, 'Snack');

-- --------------------------------------------------------

--
-- Table structure for table `food_items`
--

CREATE TABLE `food_items` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `calories_per_serving` decimal(10,2) NOT NULL,
  `serving_unit` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `food_items`
--

INSERT INTO `food_items` (`id`, `name`, `calories_per_serving`, `serving_unit`) VALUES
(1, 'Oatmeal', 150.00, 'cup cooked'),
(2, 'Banana', 105.00, 'medium'),
(3, 'Almond Milk', 30.00, 'cup'),
(4, 'Brown Rice', 200.00, 'cup cooked'),
(5, 'Chicken Breast', 165.00, '100g'),
(6, 'Broccoli', 55.00, 'cup chopped'),
(7, 'Salmon', 206.00, '100g'),
(8, 'Sweet Potato', 112.00, 'medium'),
(9, 'Quinoa', 222.00, 'cup cooked'),
(10, 'Lentils', 230.00, 'cup cooked'),
(11, 'Tofu', 76.00, '100g'),
(12, 'Eggs', 78.00, 'large'),
(13, 'Whole Wheat Bread', 82.00, 'slice'),
(14, 'Peanut Butter', 190.00, '2 tbsp'),
(15, 'Apple', 95.00, 'medium'),
(16, 'Yogurt (Greek, Plain)', 100.00, '100g'),
(17, 'Spinach', 7.00, 'cup raw'),
(18, 'Olive Oil', 120.00, 'tbsp'),
(19, 'Avocado', 160.00, '100g'),
(20, 'Mixed Nuts', 180.00, 'quarter cup');

-- --------------------------------------------------------

--
-- Table structure for table `meal_food_items`
--

CREATE TABLE `meal_food_items` (
  `id` int(11) NOT NULL,
  `diet_plan_meal_id` int(11) NOT NULL,
  `food_item_id` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meal_food_items`
--

INSERT INTO `meal_food_items` (`id`, `diet_plan_meal_id`, `food_item_id`, `quantity`) VALUES
(1, 1, 1, 0.50),
(2, 1, 2, 1.00),
(3, 1, 3, 1.00),
(4, 2, 4, 0.75),
(5, 2, 11, 1.50),
(6, 2, 6, 1.00),
(7, 3, 9, 0.50),
(8, 3, 10, 1.00),
(9, 3, 17, 2.00),
(10, 4, 12, 3.00),
(11, 4, 13, 2.00),
(12, 4, 19, 0.50),
(13, 5, 5, 2.00),
(14, 5, 4, 1.50),
(15, 5, 6, 1.00),
(16, 6, 7, 1.50),
(17, 6, 8, 1.50),
(18, 6, 17, 2.00),
(19, 6, 18, 0.50),
(20, 7, 16, 2.00),
(21, 7, 20, 0.50);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(80) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `created_at`) VALUES
(1, 'Nethrasri', '$2y$10$GKLLq/6UAGA542GoA2Aaxe5qrXzhCR2HpneTo/1muF.OLgv4gw25a', '2025-07-14 11:28:56');

-- --------------------------------------------------------

--
-- Table structure for table `user_logged_food_items`
--

CREATE TABLE `user_logged_food_items` (
  `id` int(11) NOT NULL,
  `logged_meal_id` int(11) NOT NULL,
  `food_item_id` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `calories_at_log` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_logged_food_items`
--

INSERT INTO `user_logged_food_items` (`id`, `logged_meal_id`, `food_item_id`, `quantity`, `calories_at_log`) VALUES
(1, 1, 19, 1.00, 160.00),
(2, 2, 5, 1.50, 247.50);

-- --------------------------------------------------------

--
-- Table structure for table `user_logged_meals`
--

CREATE TABLE `user_logged_meals` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `log_date` date NOT NULL,
  `meal_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_logged_meals`
--

INSERT INTO `user_logged_meals` (`id`, `user_id`, `log_date`, `meal_type`) VALUES
(1, 1, '2025-07-14', 'Breakfast'),
(2, 1, '2025-07-14', 'Lunch');

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `weight_goal` varchar(20) NOT NULL,
  `dietary_type` varchar(20) NOT NULL,
  `allergies` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `weight_goal`, `dietary_type`, `allergies`) VALUES
(1, 1, 'gain', 'non-veg', 'Turmeric');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `diet_plans`
--
ALTER TABLE `diet_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dietary_type` (`dietary_type`,`weight_goal`);

--
-- Indexes for table `diet_plan_meals`
--
ALTER TABLE `diet_plan_meals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `diet_plan_id` (`diet_plan_id`,`meal_type`);

--
-- Indexes for table `food_items`
--
ALTER TABLE `food_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `meal_food_items`
--
ALTER TABLE `meal_food_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `diet_plan_meal_id` (`diet_plan_meal_id`),
  ADD KEY `food_item_id` (`food_item_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `user_logged_food_items`
--
ALTER TABLE `user_logged_food_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `logged_meal_id` (`logged_meal_id`),
  ADD KEY `food_item_id` (`food_item_id`);

--
-- Indexes for table `user_logged_meals`
--
ALTER TABLE `user_logged_meals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`log_date`,`meal_type`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `diet_plans`
--
ALTER TABLE `diet_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `diet_plan_meals`
--
ALTER TABLE `diet_plan_meals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `food_items`
--
ALTER TABLE `food_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `meal_food_items`
--
ALTER TABLE `meal_food_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_logged_food_items`
--
ALTER TABLE `user_logged_food_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_logged_meals`
--
ALTER TABLE `user_logged_meals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `diet_plan_meals`
--
ALTER TABLE `diet_plan_meals`
  ADD CONSTRAINT `diet_plan_meals_ibfk_1` FOREIGN KEY (`diet_plan_id`) REFERENCES `diet_plans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `meal_food_items`
--
ALTER TABLE `meal_food_items`
  ADD CONSTRAINT `meal_food_items_ibfk_1` FOREIGN KEY (`diet_plan_meal_id`) REFERENCES `diet_plan_meals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meal_food_items_ibfk_2` FOREIGN KEY (`food_item_id`) REFERENCES `food_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_logged_food_items`
--
ALTER TABLE `user_logged_food_items`
  ADD CONSTRAINT `user_logged_food_items_ibfk_1` FOREIGN KEY (`logged_meal_id`) REFERENCES `user_logged_meals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_logged_food_items_ibfk_2` FOREIGN KEY (`food_item_id`) REFERENCES `food_items` (`id`);

--
-- Constraints for table `user_logged_meals`
--
ALTER TABLE `user_logged_meals`
  ADD CONSTRAINT `user_logged_meals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
