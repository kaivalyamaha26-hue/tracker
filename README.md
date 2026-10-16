# Personal Fitness Tracker

A comprehensive, fully functional, responsive web application for complete workout logging, exercise videos, Indian & global nutrition tracking, day-wise workout & meal plans, water & step counters, body measurements, BMI & calorie calculators, goal progress, and an admin dashboard.

---

## 1. Quick Start & Execution

### Running the Live Full-Stack Application (Container / Local Node)
The project comes with a pre-configured, production-ready fullstack Express + React/Vite architecture with real REST APIs and relational database persistence (`./data/fitness_db.json`):

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# App runs on: http://localhost:3000
```

### Running with Python Flask + MySQL (Optional Local Python Deployment)
If you wish to deploy the Python Flask backend with MySQL:

1. **MySQL Database Setup**:
   ```bash
   mysql -u root -p < database.sql
   ```
2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure `.env`**:
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DB=fitness_tracker_db
   SECRET_KEY=super_secret_jwt_key
   ```
4. **Run Flask Application**:
   ```bash
   python3 app.py
   ```

---

## 2. Default Accounts & Credentials

The system initializes with two pre-configured accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@fitness.com` | `admin123` | Full access to Admin Panel, User Management, Video & Exercise Management, System Stats |
| **Demo User** | `alex@fitness.com` | `user123` | Full access to Workouts, Nutrition, Day Plans, Water, Steps, BMI, Progress |

*You can also register a brand new account anytime via the Registration page!*

---

## 3. Features & Modules Breakdown

1. **User Authentication & Session Security**:
   - Registration with comprehensive fitness profile (Height, Weight, Age, Fitness Goal, Experience, Available Days, Equipment).
   - Password hashing and session token verification.
   - Protected routes for user dashboard and admin panels.
   - Forgot password & password update workflows.

2. **Fitness Dashboard & "Today's Plan"**:
   - Dynamic real-time statistics aggregated from database: Current Weight, BMI, Calories Consumed vs Target, Protein Intake, Steps, Water Level, Weekly Workout Count.
   - Today's interactive plan checklist with "Mark as Completed" actions.
   - Overall daily score percentage gauge.
   - System reminders & notifications for workouts, hydration, and nutrition.

3. **Workout Tracker (Full CRUD)**:
   - Log workouts with Exercise, Muscle Group (Chest, Back, Shoulders, Biceps, Triceps, Legs, Abs, Cardio), Sets, Reps, Weight (kg), Duration, Calories Burned, Date, and Notes.
   - Filter history by date, muscle group, and exercise name.
   - Edit or delete workout records.

4. **Exercise Library & Demonstration Videos / Animations**:
   - Comprehensive exercise library for all major muscle groups.
   - Step-by-step biomechanical form instructions, benefits, common mistakes, recommended sets & reps, rest times.
   - **Video / Animation Modal**: Embedded demonstration player with biomechanics animation and form guidance.

5. **7-Day Day-Wise Workout Planner**:
   - Personalized weekly schedule customized to user fitness goals (Monday to Sunday).
   - Interactive exercise check-off with celebratory confetti and live database completion recording.

6. **Day-Wise Diet & Meal Plans**:
   - 7-Day meal plan (Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner) with precise macro breakdowns (Calories, Protein, Carbs, Fat).
   - Fitness-goal based meal plans for Weight Gain, Weight Loss, Muscle Building, Fat Loss, Maintenance, and General Fitness.

7. **Nutrition Tracker & Indian Food Database**:
   - Track Breakfast, Lunch, Dinner, and Snacks.
   - Built-in curated Indian food library (Poha, Upma, Idli, Dosa, Roti, Dal Tadka, Rajma, Chole, Paneer, Khichdi, Sprouts, etc.).
   - Quick-add from library or custom entry with automated macronutrient calculation.

8. **Water Intake Tracker**:
   - Log water with quick +250ml, +500ml, +750ml, +1000ml buttons or custom volume.
   - Interactive visual fluid level animation and daily hydration history.

9. **Step Tracker**:
   - Log daily steps with today's target comparison, weekly average, and trend graphs.

10. **BMI Calculator**:
    - Automatic BMI calculation: `BMI = weight(kg) / height(m)^2`.
    - Real-time classification: Underweight, Normal, Overweight, Obesity.
    - Historical BMI tracking with date records and visual progress charts.

11. **Calorie & Macro Calculator**:
    - Mifflin-St Jeor formula calculating Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE).
    - Goal-specific targets for Maintenance, Mild/Aggressive Weight Loss, and Muscle/Weight Gain.
    - Educational safety disclaimers.

12. **Progress Tracker & Body Measurements**:
    - Track body circumferences over time: Chest, Waist, Arms, Thighs, Shoulders, and Weight.
    - Interactive visual charts of progress.

13. **Fitness Goals**:
    - Create goals with Current Value, Target Value, Deadline Date, and live % progress bars.

14. **Weekly & Monthly Reports**:
    - Comprehensive fitness summary with printable layout for records or doctor review.

15. **Admin Panel**:
    - Role-based authorization: USER vs ADMIN.
    - User management (View, Add, Edit, Delete users).
    - Exercise management (Add, Edit, Delete library exercises).
    - Video demonstration management (Add video URL, duration, thumbnail, exercise assignment).
    - System statistics and database health metrics.

---

## 4. REST API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and receive bearer token | No |
| `POST` | `/api/auth/logout` | Invalidate current session | Yes |
| `POST` | `/api/auth/forgot-password` | Reset user password | No |
| `GET` | `/api/auth/me` | Fetch authenticated user & profile | Yes |
| `PUT` | `/api/profile` | Update profile details / password | Yes |
| `GET` | `/api/dashboard/stats` | Aggregated real-time dashboard data | Yes |
| `GET` | `/api/workouts` | Get workouts with optional filters | Yes |
| `POST` | `/api/workouts` | Create new workout log | Yes |
| `PUT` | `/api/workouts/:id` | Update existing workout log | Yes |
| `DELETE` | `/api/workouts/:id` | Delete workout log | Yes |
| `GET` | `/api/exercises` | List exercise library | No |
| `POST` | `/api/exercises` | Add new exercise | Admin |
| `GET` | `/api/videos` | List exercise demonstration videos | No |
| `POST` | `/api/videos` | Add video demonstration | Admin |
| `GET` | `/api/nutrition` | Get nutrition logs and macro totals | Yes |
| `POST` | `/api/nutrition` | Log a meal item | Yes |
| `DELETE` | `/api/nutrition/:id` | Delete a logged meal | Yes |
| `GET` | `/api/foods` | Search Indian & global food items | No |
| `GET` | `/api/water` | Get daily water intake and goal | Yes |
| `POST` | `/api/water` | Add water intake | Yes |
| `GET` | `/api/steps` | Get step logs and averages | Yes |
| `POST` | `/api/steps` | Update daily step count | Yes |
| `GET` | `/api/goals` | List user goals & progress | Yes |
| `POST` | `/api/goals` | Create a new fitness goal | Yes |
| `GET` | `/api/measurements` | Body measurements history | Yes |
| `POST` | `/api/measurements` | Add body measurements | Yes |
| `GET` | `/api/bmi` | Get BMI calculation history | Yes |
| `POST` | `/api/bmi` | Calculate and save new BMI record | Yes |
| `GET` | `/api/plans` | Fetch weekly day-wise workout plan | Yes |
| `POST` | `/api/plans/complete` | Toggle day exercise completion | Yes |
| `GET` | `/api/reports` | Get printable fitness summary | Yes |
| `GET` | `/api/admin/users` | List all users | Admin |
| `GET` | `/api/admin/stats` | Overall system metrics | Admin |

---

## 5. Security & Safety

- Passwords are encrypted with hashing algorithms before storing in database.
- Input validation on all client and server endpoints.
- Role-based authorization ensures users cannot access administrator operations.
- Clear educational health notices on nutrition and workout safety to avoid liability.
