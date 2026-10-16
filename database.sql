-- ==========================================================
-- PERSONAL FITNESS TRACKER - MySQL Database Schema
-- Database: fitness_tracker_db
-- ==========================================================

DROP DATABASE IF EXISTS fitness_tracker_db;
CREATE DATABASE fitness_tracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fitness_tracker_db;

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20),
    dob DATE,
    gender ENUM('Male', 'Female', 'Other', 'Not Specified') DEFAULT 'Not Specified',
    height DECIMAL(5,2) NOT NULL DEFAULT 175.00 COMMENT 'Height in centimeters',
    weight DECIMAL(5,2) NOT NULL DEFAULT 70.00 COMMENT 'Weight in kilograms',
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    fitness_goal ENUM('Weight Gain', 'Weight Loss', 'Muscle Building', 'Fat Loss', 'Strength', 'General Fitness') DEFAULT 'General Fitness',
    experience_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    available_days TINYINT DEFAULT 4,
    equipment ENUM('No Equipment', 'Home Equipment', 'Gym') DEFAULT 'Gym',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. User Profiles & Daily Targets Table
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    daily_water_goal INT DEFAULT 3000 COMMENT 'Target in milliliters',
    daily_step_goal INT DEFAULT 10000,
    daily_calorie_goal INT DEFAULT 2200,
    daily_protein_goal INT DEFAULT 120 COMMENT 'Target in grams',
    daily_carbs_goal INT DEFAULT 250 COMMENT 'Target in grams',
    daily_fat_goal INT DEFAULT 65 COMMENT 'Target in grams',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Exercises Library Table
CREATE TABLE exercises (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    muscle_group ENUM('Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio') NOT NULL,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    equipment VARCHAR(100) DEFAULT 'Bodyweight',
    instructions TEXT,
    benefits TEXT,
    common_mistakes TEXT,
    recommended_sets VARCHAR(30) DEFAULT '3 sets',
    recommended_reps VARCHAR(30) DEFAULT '10 - 12 reps',
    rest_time VARCHAR(30) DEFAULT '60 sec',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_exercise_muscle (muscle_group)
) ENGINE=InnoDB;

-- 4. Exercise Videos & Demos Table
CREATE TABLE exercise_videos (
    id VARCHAR(64) PRIMARY KEY,
    exercise_id VARCHAR(64) NOT NULL,
    title VARCHAR(150) NOT NULL,
    video_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    duration VARCHAR(20) DEFAULT '3:00 mins',
    muscle_group VARCHAR(50),
    difficulty VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_video_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. User Workouts Log Table
CREATE TABLE workouts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    exercise VARCHAR(120) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    sets INT NOT NULL DEFAULT 1,
    reps INT NOT NULL DEFAULT 1,
    weight DECIMAL(6,2) DEFAULT 0.00 COMMENT 'Weight in kg',
    duration INT NOT NULL DEFAULT 15 COMMENT 'Duration in minutes',
    calories_burned INT DEFAULT 100,
    workout_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_workout_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workout_date (workout_date),
    INDEX idx_workout_user_date (user_id, workout_date)
) ENGINE=InnoDB;

-- 6. Weekly Workout Plans & Day Schedules
CREATE TABLE daily_workout_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    day_name ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    plan_title VARCHAR(100),
    focus_muscles VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_day (user_id, day_name)
) ENGINE=InnoDB;

-- 7. Workout Plan Exercises
CREATE TABLE workout_exercises (
    id VARCHAR(64) PRIMARY KEY,
    plan_id INT NOT NULL,
    exercise_name VARCHAR(120) NOT NULL,
    muscle_group VARCHAR(50),
    sets INT DEFAULT 3,
    reps VARCHAR(30) DEFAULT '10-12',
    rest_time VARCHAR(30) DEFAULT '60s',
    sort_order INT DEFAULT 0,
    CONSTRAINT fk_plan_exercise FOREIGN KEY (plan_id) REFERENCES daily_workout_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Workout Completions (Day-Wise Tracking)
CREATE TABLE workout_completions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    completion_date DATE NOT NULL,
    day_name VARCHAR(20) NOT NULL,
    exercise_name VARCHAR(120) NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_completion_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_date_exercise (user_id, completion_date, day_name, exercise_name)
) ENGINE=InnoDB;

-- 9. Food Database (Indian & Global Items)
CREATE TABLE food_database (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category ENUM('Breakfast', 'Lunch', 'Snacks', 'Dinner') NOT NULL,
    serving_size VARCHAR(80) NOT NULL,
    calories INT NOT NULL,
    protein DECIMAL(5,2) DEFAULT 0.00,
    carbs DECIMAL(5,2) DEFAULT 0.00,
    fat DECIMAL(5,2) DEFAULT 0.00,
    is_indian BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 10. Daily Nutrition Logs Table
CREATE TABLE daily_nutrition (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    food_name VARCHAR(150) NOT NULL,
    calories INT NOT NULL,
    protein DECIMAL(5,2) DEFAULT 0.00,
    carbohydrates DECIMAL(5,2) DEFAULT 0.00,
    fat DECIMAL(5,2) DEFAULT 0.00,
    quantity VARCHAR(80) DEFAULT '1 serving',
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snacks') NOT NULL,
    log_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nutrition_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_nutrition_date (log_date),
    INDEX idx_nutrition_user_date (user_id, log_date)
) ENGINE=InnoDB;

-- 11. Daily Water Intake Table
CREATE TABLE daily_water (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    amount_ml INT NOT NULL,
    log_date DATE NOT NULL,
    logged_at_time VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_water_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_water_user_date (user_id, log_date)
) ENGINE=InnoDB;

-- 12. Daily Step Tracker Table
CREATE TABLE daily_steps (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    steps_count INT NOT NULL,
    log_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_steps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_step_date (user_id, log_date)
) ENGINE=InnoDB;

-- 13. Fitness Goals Table
CREATE TABLE goals (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(150) NOT NULL,
    goal_type ENUM('Weight Gain', 'Weight Loss', 'Muscle Building', 'Fat Loss', 'Strength', 'General Fitness') NOT NULL,
    current_value DECIMAL(8,2) NOT NULL,
    target_value DECIMAL(8,2) NOT NULL,
    unit VARCHAR(30) DEFAULT 'kg',
    target_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_goal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Body Measurements Table
CREATE TABLE body_measurements (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    chest DECIMAL(5,2) DEFAULT 0.00 COMMENT 'In cm',
    waist DECIMAL(5,2) DEFAULT 0.00 COMMENT 'In cm',
    arms DECIMAL(5,2) DEFAULT 0.00 COMMENT 'In cm',
    thighs DECIMAL(5,2) DEFAULT 0.00 COMMENT 'In cm',
    shoulders DECIMAL(5,2) DEFAULT 0.00 COMMENT 'In cm',
    weight DECIMAL(5,2) NOT NULL,
    measurement_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_measurement_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_measurement_user_date (user_id, measurement_date)
) ENGINE=InnoDB;

-- 15. BMI History Table
CREATE TABLE bmi_history (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    bmi DECIMAL(4,1) NOT NULL,
    category ENUM('Underweight', 'Normal', 'Overweight', 'Obesity') NOT NULL,
    record_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bmi_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bmi_user_date (user_id, record_date)
) ENGINE=InnoDB;

-- 16. Notifications & Reminders Table
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('workout', 'water', 'meal', 'steps', 'goal') DEFAULT 'workout',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- SAMPLE SEED DATA & ADMIN ACCOUNT
-- ==========================================================

-- Admin Account: admin@fitness.com / Password: admin123
INSERT INTO users (id, name, email, phone, dob, gender, height, weight, password_hash, role, fitness_goal, experience_level, available_days, equipment)
VALUES (
    'usr_admin_001',
    'Admin Coach',
    'admin@fitness.com',
    '+1 555-0199',
    '1988-04-12',
    'Male',
    182.00,
    80.00,
    'hashed_3bf12_YWRtaW4xMjM=',
    'ADMIN',
    'Strength',
    'Advanced',
    6,
    'Gym'
);

-- Demo User: alex@fitness.com / Password: user123
INSERT INTO users (id, name, email, phone, dob, gender, height, weight, password_hash, role, fitness_goal, experience_level, available_days, equipment)
VALUES (
    'usr_alex_002',
    'Alex Rivera',
    'alex@fitness.com',
    '+1 555-0144',
    '1996-08-23',
    'Male',
    178.00,
    74.00,
    'hashed_2ac90_dXNlcjEyMw==',
    'USER',
    'Muscle Building',
    'Intermediate',
    5,
    'Gym'
);

-- Profiles
INSERT INTO user_profiles (user_id, daily_water_goal, daily_step_goal, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal)
VALUES 
('usr_admin_001', 3500, 12000, 2700, 160, 280, 70),
('usr_alex_002', 3000, 10000, 2400, 140, 260, 65);

-- Sample Exercises
INSERT INTO exercises (id, name, muscle_group, difficulty, equipment, instructions, benefits, common_mistakes, recommended_sets, recommended_reps, rest_time)
VALUES
('ex_bench_press', 'Bench Press', 'Chest', 'Intermediate', 'Barbell, Bench', 'Lie flat on bench, lower bar to mid chest, press up explosively.', 'Builds upper body pushing power and chest thickness.', 'Bouncing bar off sternum; flaring elbows 90 degrees.', '4 sets', '8 - 10 reps', '90 - 120 sec'),
('ex_push_ups', 'Push Ups', 'Chest', 'Beginner', 'Bodyweight', 'Plank posture, lower chest until 2 inches off ground, push back up.', 'Develops pectoral endurance, shoulder stability, and core tension.', 'Sagging hips; partial range of motion.', '3 sets', '15 - 20 reps', '60 sec'),
('ex_pull_ups', 'Pull Ups', 'Back', 'Intermediate', 'Pull-up Bar', 'Overhand grip, pull elbows to ribs until chin clears bar, lower under control.', 'Widest lats, bicep grip, and vertical pulling strength.', 'Kipping legs; not clearing chin above bar.', '4 sets', '6 - 10 reps', '90 sec'),
('ex_deadlift', 'Deadlift', 'Back', 'Advanced', 'Barbell, Plates', 'Hinge at hips, brace core, drive through floor extending hips to lockout.', 'Ultimate posterior chain builder: erector spinae, glutes, hamstrings.', 'Rounding lower back; bar drifting forward.', '4 sets', '5 - 6 reps', '120 - 180 sec'),
('ex_squats', 'Barbell Back Squat', 'Legs', 'Intermediate', 'Barbell, Squat Rack', 'Bar across traps, push hips back, descend below parallel, drive up.', 'King of leg builders: quadriceps, glutes, core stability.', 'Knees caving inwards; heel lifting off floor.', '4 sets', '8 - 10 reps', '120 sec'),
('ex_shoulder_press', 'Overhead Shoulder Press', 'Shoulders', 'Intermediate', 'Barbell/Dumbbells', 'Hold at ear height, press vertically until elbows extend, lower with control.', 'Builds broad deltoids and overhead shoulder stability.', 'Arching lumbar spine; not locking out overhead.', '4 sets', '8 - 10 reps', '90 sec'),
('ex_bicep_curl', 'Dumbbell Bicep Curl', 'Biceps', 'Beginner', 'Dumbbells', 'Curl weights up with palms supinated, squeeze at top, lower slowly.', 'Isolates biceps peak and forearm strength.', 'Swinging torso for momentum; moving elbows forward.', '3 - 4 sets', '10 - 12 reps', '60 sec'),
('ex_tricep_pushdown', 'Tricep Pushdown', 'Triceps', 'Beginner', 'Cable Machine', 'Pin elbows to ribs, press rope down and spread at bottom.', 'Targets lateral and medial tricep heads.', 'Elbows drifting forward; leaning over bar.', '4 sets', '12 - 15 reps', '60 sec'),
('ex_plank', 'Forearm Plank', 'Abs', 'Beginner', 'Mat', 'Forearms under shoulders, maintain rigid straight line from head to heels.', 'Anti-extension core stability and abdominal endurance.', 'Dropping hips; arching lower back.', '3 sets', '45 - 60 sec', '60 sec'),
('ex_running', 'Treadmill / Outdoor Running', 'Cardio', 'Beginner', 'Running Shoes', 'Upright posture, midfoot strike, arms swinging in cadence.', 'Cardiovascular aerobic endurance and high calorie burn.', 'Overstriding onto heel; slumping posture.', '1 session', '20 - 30 mins', 'Active');

-- Sample Indian Food Library
INSERT INTO food_database (id, name, category, serving_size, calories, protein, carbs, fat, is_indian)
VALUES
('f_poha', 'Poha with vegetables & peanuts', 'Breakfast', '1 medium bowl (150g)', 250, 5.00, 42.00, 7.00, 1),
('f_idli', 'Steamed Idli with Sambar', 'Breakfast', '2 idlis + sambar', 180, 7.00, 32.00, 3.00, 1),
('f_roti', 'Whole Wheat Roti (2 pcs)', 'Lunch', '2 rotis (60g)', 160, 6.00, 32.00, 1.50, 1),
('f_dal', 'Moong/Toor Dal Tadka', 'Lunch', '1 katori (150ml)', 150, 9.00, 22.00, 3.00, 1),
('f_rajma', 'Rajma Masala (Kidney Beans)', 'Lunch', '1 cup (180g)', 240, 13.00, 38.00, 4.00, 1),
('f_paneer', 'Low-Fat Paneer Curry', 'Lunch', '150g', 280, 18.00, 8.00, 18.00, 1),
('f_sprouts', 'Sprouted Moong Chaat', 'Snacks', '1 cup (120g)', 130, 9.00, 22.00, 0.80, 1),
('f_chana', 'Bhuna Chana (Roasted Gram)', 'Snacks', '1 small bowl (40g)', 150, 8.00, 24.00, 2.00, 1),
('f_khichdi', 'Dal Khichdi with Ghee', 'Dinner', '1 plate (200g)', 260, 8.00, 46.00, 5.00, 1),
('f_palak_paneer', 'Palak Paneer', 'Dinner', '1 cup (180g)', 240, 14.00, 9.00, 16.00, 1);
