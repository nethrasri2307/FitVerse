document.addEventListener('DOMContentLoaded', () => {
    // --- Helper function to show messages consistently across the app ---
    function showMessage(elementId, message, isError = false) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            element.style.backgroundColor = isError ? '#ffe7e7' : '#e7ffe7';
            element.style.borderColor = isError ? '#f44336' : '#4CAF50';
            element.style.color = isError ? '#f44336' : '#4CAF50';
            element.style.border = '1px solid';
            element.style.padding = '10px';
            element.style.borderRadius = '5px';
            element.style.marginBottom = '15px';
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000); // Hide after 5 seconds
        }
    }

    // --- Registration Form Handling ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('api/register.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    showMessage('message', data.message);
                    registerForm.reset();
                    setTimeout(() => { window.location.href = 'login.html'; }, 2000); // Redirect to login after successful registration
                } else {
                    showMessage('message', data.message, true);
                }
            } catch (error) {
                console.error('Error during registration:', error);
                showMessage('message', 'An error occurred. Please try again.', true);
            }
        });
    }

    // --- Login Form Handling ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('api/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    showMessage('message', data.message);
                    // Store user ID and username in localStorage for dashboard use
                    localStorage.setItem('user_id', data.user_id);
                    localStorage.setItem('username', data.username);
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000); // Redirect to dashboard
                } else {
                    showMessage('message', data.message, true);
                }
            } catch (error) {
                console.error('Error during login:', error);
                showMessage('message', 'An error occurred. Please try again.', true);
            }
        });
    }

    // --- Dashboard Specific Logic ---
    if (window.location.pathname.endsWith('/dashboard.html')) {
        const userId = localStorage.getItem('user_id');
        const username = localStorage.getItem('username');
        const dashboardUsernameSpan = document.getElementById('dashboardUsername');

        // Redirect to login if not authenticated
        if (!userId) {
            alert('Please log in to access the dashboard.');
            window.location.href = 'login.html';
            return;
        }

        if (dashboardUsernameSpan && username) {
            dashboardUsernameSpan.textContent = username;
        }

        // --- User Profile Management ---
        const profileForm = document.getElementById('profileForm');
        const weightGoalSelect = document.getElementById('weightGoal');
        const dietaryTypeSelect = document.getElementById('dietaryType');
        const allergiesInput = document.getElementById('allergies');

        async function loadUserProfile() {
            try {
                const response = await fetch('api/profile.php');
                const data = await response.json();
                if (response.ok) {
                    weightGoalSelect.value = data.weight_goal || '';
                    dietaryTypeSelect.value = data.dietary_type || '';
                    allergiesInput.value = data.allergies || '';
                    showMessage('profileMessage', 'Profile loaded successfully!');
                } else if (response.status === 404) {
                    showMessage('profileMessage', 'Profile not set yet. Please fill it out.', false);
                } else {
                    showMessage('profileMessage', data.message || 'Failed to load profile.', true);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                showMessage('profileMessage', 'An error occurred while loading profile.', true);
            }
        }
        loadUserProfile(); // Load profile on dashboard load

        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const weightGoal = weightGoalSelect.value;
                const dietaryType = dietaryTypeSelect.value;
                const allergies = allergiesInput.value;

                try {
                    const response = await fetch('api/profile.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ weight_goal: weightGoal, dietary_type: dietaryType, allergies: allergies }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        showMessage('profileMessage', data.message);
                        // After saving profile, reload daily log to ensure calorie target is up-to-date
                        loadDailyLog(document.getElementById('viewLogDate').value);
                    } else {
                        showMessage('profileMessage', data.message, true);
                    }
                } catch (error) {
                    console.error('Error saving profile:', error);
                    showMessage('profileMessage', 'An error occurred while saving profile.', true);
                }
            });
        }

        // --- Food Logging Elements and Logic ---
        const logFoodForm = document.getElementById('logFoodForm');
        const foodItemsList = document.getElementById('foodItemsList'); // The datalist for suggestions
        const foodItemsContainer = document.getElementById('foodItemsContainer'); // Container for dynamic food input fields
        const addFoodItemButton = document.getElementById('addFoodItem');
        const logDateInput = document.getElementById('logDate');
        const logMealTypeSelect = document.getElementById('logMealType');

        // --- Daily Log Display Elements ---
        const loggedMealsContainer = document.getElementById('loggedMealsContainer');
        const currentLogDateSpan = document.getElementById('currentLogDate');
        const dailyTotalCaloriesSpan = document.getElementById('dailyTotalCalories');
        const viewLogDateInput = document.getElementById('viewLogDate');
        const viewLogButton = document.getElementById('viewLogButton');
        const dailyComparisonSpan = document.createElement('p'); // Use <p> for better block-level display
        dailyComparisonSpan.id = 'dailyComparisonStatus'; // Add an ID for specific styling/access
        dailyTotalCaloriesSpan.insertAdjacentElement('afterend', dailyComparisonSpan); // Insert it after daily total calories

        let allFoods = []; // Stores all food items fetched from the database

        // Set default dates to today
        const today = new Date().toISOString().split('T')[0];
        logDateInput.value = today;
        viewLogDateInput.value = today;

        // --- Fetch all food items to populate the datalist for search suggestions ---
        async function fetchFoodItems() {
            try {
                const response = await fetch('api/get_foods.php');
                if (response.ok) {
                    allFoods = await response.json();
                    foodItemsList.innerHTML = ''; // Clear existing options
                    allFoods.forEach(food => {
                        const option = document.createElement('option');
                        option.value = food.name;
                        // Store food ID and unit in data attributes for easy retrieval
                        option.dataset.id = food.id;
                        option.dataset.unit = food.serving_unit;
                        foodItemsList.appendChild(option);
                    });
                    attachFoodInputListeners(); // Attach listeners to initial input fields
                } else {
                    console.error('Failed to fetch food items:', await response.json());
                }
            } catch (error) {
                console.error('Error fetching food items:', error);
            }
        }
        fetchFoodItems(); // Call on page load

        // --- Attaches event listeners to dynamically created food item input fields ---
        function attachFoodInputListeners() {
            // Event listener for food search input (to get food ID and unit)
            document.querySelectorAll('.food-search').forEach(input => {
                input.oninput = (e) => {
                    const selectedOption = Array.from(foodItemsList.options).find(option => option.value === e.target.value);
                    const hiddenFoodIdInput = e.target.closest('.food-item-input').querySelector('.food-id');
                    const foodUnitSpan = e.target.closest('.food-item-input').querySelector('.food-unit');

                    if (selectedOption) {
                        hiddenFoodIdInput.value = selectedOption.dataset.id;
                        foodUnitSpan.textContent = selectedOption.dataset.unit ? `(${selectedOption.dataset.unit})` : '';
                    } else {
                        hiddenFoodIdInput.value = '';
                        foodUnitSpan.textContent = '';
                    }
                };
            });

            // Event listener for "Remove" button on food item inputs
            document.querySelectorAll('.remove-food-item').forEach(button => {
                button.onclick = (e) => {
                    if (foodItemsContainer.children.length > 1) { // Ensure at least one input remains
                        e.target.closest('.food-item-input').remove();
                    } else {
                        showMessage('logFoodMessage', "You must log at least one food item.", true);
                    }
                };
            });
        }

        let foodItemCounter = 1; // Used to create unique IDs for new input fields
        addFoodItemButton.addEventListener('click', () => {
            foodItemCounter++;
            const newItemHtml = `
                <div class="food-item-input">
                    <label for="foodSearch${foodItemCounter}">Food Item:</label>
                    <input type="text" class="food-search" id="foodSearch${foodItemCounter}" placeholder="Search food..." list="foodItemsList">
                    <input type="hidden" class="food-id" value="">

                    <label for="foodQuantity${foodItemCounter}">Quantity:</label>
                    <input type="number" class="food-quantity" id="foodQuantity${foodItemCounter}" min="0.1" step="0.1" value="1" required>
                    <span class="food-unit"></span>
                    <button type="button" class="remove-food-item">Remove</button>
                </div>
            `;
            foodItemsContainer.insertAdjacentHTML('beforeend', newItemHtml);
            attachFoodInputListeners(); // Re-attach listeners for the new elements
        });

        // --- Handle Log Meal Form submission ---
        logFoodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const logDate = logDateInput.value;
            const mealType = logMealTypeSelect.value;
            const foodInputs = foodItemsContainer.querySelectorAll('.food-item-input');

            const foodsToLog = [];
            let isValid = true;
            foodInputs.forEach(inputDiv => {
                const foodId = inputDiv.querySelector('.food-id').value;
                const quantity = parseFloat(inputDiv.querySelector('.food-quantity').value);
                const foodSearchInput = inputDiv.querySelector('.food-search').value;

                if (!foodId || isNaN(quantity) || quantity <= 0) {
                    showMessage('logFoodMessage', `Please select a valid food item and quantity for "${foodSearchInput || 'an item'}".`, true);
                    isValid = false;
                    return;
                }
                foodsToLog.push({ food_item_id: foodId, quantity: quantity });
            });

            if (!isValid || foodsToLog.length === 0) {
                return; // Validation failed or no foods added
            }

            try {
                const response = await fetch('api/log_food.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        log_date: logDate,
                        meal_type: mealType,
                        foods: foodsToLog
                    }),
                });
                const data = await response.json();
                if (response.ok) {
                    showMessage('logFoodMessage', data.message);
                    logFoodForm.reset(); // Clear form
                    logDateInput.value = today; // Reset date to today

                    // Reset food items container to a single default input field
                    foodItemsContainer.innerHTML = `
                        <div class="food-item-input">
                            <label for="foodSearch1">Food Item:</label>
                            <input type="text" class="food-search" id="foodSearch1" placeholder="Search food..." list="foodItemsList">
                            <input type="hidden" class="food-id" value="">
                            <label for="foodQuantity1">Quantity:</label>
                            <input type="number" class="food-quantity" id="foodQuantity1" min="0.1" step="0.1" value="1" required>
                            <span class="food-unit"></span>
                            <button type="button" class="remove-food-item">Remove</button>
                        </div>
                    `;
                    foodItemCounter = 1; // Reset counter
                    fetchFoodItems(); // Refresh datalist and listeners for the reset form

                    loadDailyLog(logDate); // Reload the daily log to show the newly logged meal
                } else {
                    showMessage('logFoodMessage', data.message, true);
                }
            } catch (error) {
                console.error('Error logging food:', error);
                showMessage('logFoodMessage', 'An error occurred while logging food. Check console for details.', true);
            }
        });

        // --- Function to load and display user's daily food log and compare with target ---
        async function loadDailyLog(date) {
            currentLogDateSpan.textContent = date;
            loggedMealsContainer.innerHTML = '<p>Loading daily log...</p>';
            dailyTotalCaloriesSpan.textContent = '';
            dailyComparisonSpan.textContent = ''; // Clear previous comparison status

            try {
                const response = await fetch(`api/get_daily_log.php?date=${date}`);
                const data = await response.json();

                loggedMealsContainer.innerHTML = ''; // Clear existing content before populating

                if (response.ok) {
                    if (data.meals && data.meals.length > 0) {
                        data.meals.forEach(meal => {
                            const mealDiv = document.createElement('div');
                            mealDiv.classList.add('logged-meal-section');
                            mealDiv.innerHTML = `
                                <h4>${meal.meal_type} (${meal.meal_calories} kcal)</h4>
                                <ul>
                                    ${meal.items.map(item => `
                                        <li>${item.name} - ${item.quantity} ${item.unit} (${item.calories} kcal)</li>
                                    `).join('')}
                                </ul>
                            `;
                            loggedMealsContainer.appendChild(mealDiv);
                        });
                        dailyTotalCaloriesSpan.textContent = `Daily Total Logged Calories: ${data.total_daily_calories} kcal`;

                        // Display comparison with suggested target
                        if (data.suggested_daily_calorie_target) {
                            const remaining = data.suggested_daily_calorie_target - data.total_daily_calories;
                            if (remaining >= 0) {
                                dailyComparisonSpan.innerHTML = `**Target:** ${data.suggested_daily_calorie_target} kcal. You can still eat **${remaining.toFixed(2)} kcal** to reach your goal.`;
                                dailyComparisonSpan.style.color = '#367c39'; // Greenish
                            } else {
                                dailyComparisonSpan.innerHTML = `**Target:** ${data.suggested_daily_calorie_target} kcal. You are **${Math.abs(remaining).toFixed(2)} kcal over** your target!`;
                                dailyComparisonSpan.style.color = '#f44336'; // Red
                            }
                        } else {
                            dailyComparisonSpan.textContent = 'No suggested calorie target found for your profile. Please set your profile (Weight Goal, Dietary Type).';
                            dailyComparisonSpan.style.color = '#666';
                        }


                    } else {
                        // No meals logged for this date
                        loggedMealsContainer.innerHTML = '<p>No meals logged for this date.</p>';
                        dailyTotalCaloriesSpan.textContent = 'Daily Total Logged Calories: 0 kcal';

                        if (data.suggested_daily_calorie_target) {
                            dailyComparisonSpan.innerHTML = `**Target:** ${data.suggested_daily_calorie_target} kcal. You have **${data.suggested_daily_calorie_target.toFixed(2)} kcal** remaining.`;
                            dailyComparisonSpan.style.color = '#367c39';
                        } else {
                            dailyComparisonSpan.textContent = 'No suggested calorie target found for your profile. Please set your profile (Weight Goal, Dietary Type).';
                            dailyComparisonSpan.style.color = '#666';
                        }
                    }
                } else {
                    loggedMealsContainer.innerHTML = `<p>${data.message || 'Error loading daily log.'}</p>`;
                    dailyTotalCaloriesSpan.textContent = '';
                    dailyComparisonSpan.textContent = '';
                    showMessage('dailyLogMessage', data.message || 'Failed to load daily log.', true);
                }
            } catch (error) {
                console.error('Error fetching daily log:', error);
                loggedMealsContainer.innerHTML = '<p>An error occurred while loading daily log.</p>';
                dailyTotalCaloriesSpan.textContent = '';
                dailyComparisonSpan.textContent = '';
                showMessage('dailyLogMessage', 'An error occurred while fetching daily log.', true);
            }
        }

        // Load daily log for today by default when dashboard loads
        loadDailyLog(viewLogDateInput.value);

        // Event listener for viewing log by date
        viewLogButton.addEventListener('click', () => {
            loadDailyLog(viewLogDateInput.value);
        });

        // --- Get Diet Plan Button Handling (unchanged from previous update) ---
        const getDietPlanButton = document.getElementById('getDietPlanButton');
        if (getDietPlanButton) {
            getDietPlanButton.addEventListener('click', async () => {
                try {
                    const response = await fetch('api/diet_plan.php');
                    const data = await response.json();

                    const planName = document.getElementById('planName');
                    const planTotalCalories = document.getElementById('planTotalCalories');
                    const planAllergiesNote = document.getElementById('planAllergiesNote');
                    const mealsContainer = document.getElementById('mealsContainer');
                    const dietPlanMessage = document.getElementById('dietPlanMessage');

                    // Clear previous plan display
                    mealsContainer.innerHTML = '';
                    planName.textContent = '';
                    planTotalCalories.textContent = '';
                    planAllergiesNote.textContent = '';
                    dietPlanMessage.style.display = 'none';

                    if (response.ok) {
                        planName.textContent = `Plan: ${data.plan_name}`;
                        let calorieText = `Estimated Daily Calories: ${data.total_calories} kcal`;
                        if (data.target_calories) { // Check if target_calories exists
                            calorieText += ` (Target: ${data.target_calories} kcal)`;
                        }
                        planTotalCalories.textContent = calorieText;

                        planAllergiesNote.textContent = `Note: Consider your allergies: ${data.allergies_to_consider || 'None specified'}.`;

                        data.meals.forEach(meal => {
                            const mealDiv = document.createElement('div');
                            mealDiv.classList.add('meal-section');
                            mealDiv.innerHTML = `
                                <h4>${meal.meal_type} (${meal.meal_calories} kcal)</h4>
                                <ul>
                                    ${meal.items.map(item => `
                                        <li>${item.name} - ${item.quantity} ${item.unit} (${item.calories} kcal)</li>
                                    `).join('')}
                                </ul>
                            `;
                            mealsContainer.appendChild(mealDiv);
                        });
                    } else {
                        showMessage('dietPlanMessage', data.message, true);
                    }
                } catch (error) {
                    console.error('Error getting diet plan:', error);
                    showMessage('dietPlanMessage', 'An error occurred while fetching diet plan.', true);
                }
            });
        }

        // --- Logout Button Handling ---
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const response = await fetch('api/logout.php', { method: 'POST' });
                    const data = await response.json();
                    if (response.ok) {
                        localStorage.removeItem('user_id');
                        localStorage.removeItem('username');
                        alert('You have been logged out.');
                        window.location.href = 'login.html';
                    } else {
                        alert('Logout failed: ' + (data.message || 'Unknown error.'));
                    }
                } catch (error) {
                    console.error('Error during logout:', error);
                    alert('An error occurred during logout.');
                }
            });
        }
    }
});