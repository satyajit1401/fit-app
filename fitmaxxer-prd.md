# FitMaxxer 9000 - Product Requirements Document

## 1. Introduction & Overview

### 1.1 Product Description
FitMaxxer 9000 is an all-in-one fitness tracking application designed specifically for dedicated lifters (the "gym-degen" community). The app combines workout logging, nutrition tracking, habit monitoring, and social features in a streamlined interface optimized for efficiency and data-driven insights.

### 1.2 Problem Statement
The "gym-degen" community—lifters who treat training with near-obsessive intensity—still juggles multiple disconnected tools for workouts, food logging, habit tracking, and social motivation. Deep, actionable analytics remain locked behind expensive wearables such as Whoop or Apple Watch, while most mobile apps feel clunky: manual entry during sets, shallow insights, inaccurate calorie tracking paywalls, and poor UX. The market lacks an affordable, all-in-one digital coach that streamlines logging, delivers meaningful progression data, and keeps camaraderie high—even when friends can't train together.

### 1.3 Target Users
Dedicated fitness enthusiasts, particularly strength-focused trainees who:
- Train regularly with structured workout plans
- Track nutrition and macros consistently
- Value data-driven insights and progression metrics
- Enjoy social aspects of training, including competition and accountability

## 2. Core User Stories

1. **As a lifter, I want a friction-less workout logger that lets me record sets in seconds,** so I stay focused on lifting, not typing.
2. **As a lifter, I want movement-level progress charts (volume, intensity, PRs),** so I can spot plateaus and adjust programming intelligently.
3. **As a lifter, I want a one-tap way to log each meal or macro source,** so diet tracking feels effortless and sustainable.
4. **As a lifter, I want insights that link my sleep, habits, and mood to training and nutrition data,** so I can see what behaviors actually improve results.
5. **As a lifter, I want to connect with my gym buddies inside the app,** so we can share sessions, trash-talk, and celebrate PRs.
6. **As a lifter, I want asynchronous competitions (e.g., weekly volume leaderboards),** so I feel the push of friendly rivalry even when we train at different times or locations.
7. **As a lifter, I want to track my macros by entering items in terms of bowls and tablespoons and not in grams** but still track it with reasonable accuracy despite it being homemade items.

## 3. User Journeys

### 3.1 New User Onboarding Journey

- Open the app → Sign Up or Log In.
- If user is **new**:
    - Option 1: Enter personal details (optional step):
        - Height (select unit: cm/inches)
        - Current Weight (select unit: kg/lbs)
        - Goal Weight (select unit: kg/lbs)
        - Time Period to Achieve Goal
    - If personal details are entered → Use an LLM (AI Model) to suggest **target daily calorie intake** automatically.
    - Set additional preferences:
        - **Diet Type** (Editable) — e.g., Keto, Balanced, High-Protein.
        - **Calorie Cut-off Time** — the time you plan to finish eating every day (e.g., 10 PM, 11 PM).
        - **Review Frequency** — default is weekly (user can change it).
    - System generates:
        - **Review Day Weight Targets** (Non-editable — shown as milestones based on time period).

### 3.2 Workout Logging Journeys

#### 3.2.1 Create a New Workout

1. Open the workout list and tap **"New Workout."**
2. A small window appears. Type a name for the workout and press **Save.**
3. You are now on the workout-builder screen.
    1. Search for an exercise and pick it.
    2. An exercise card shows up. Enter the weight and reps for the first set.
    3. Tap **"Add Set"** to make another set, then fill in weight and reps. Repeat if you want more sets.
    4. If you press and hold a set, you can delete it, copy it, or move it up or down.
    5. Tap **"Add Exercise"** whenever you want to add a new exercise and follow the same steps.
    6. If you need special options, tap the **settings icon** to set a rest timer, turn the RPE field on or off, or write notes.
4. When everything looks good, tap **Save.** A short message says, "Template saved."

#### 3.2.2 Edit an Existing Workout

1. In the workout list, tap the workout you want to change.
2. You are in the template-detail screen.
    1. Tap **"Add Exercise"** to insert a new exercise and set it up the same way as above.
    2. Drag the handle beside each exercise to change the order.
3. Tap the **three-dot menu** for more actions.
    1. Choose **Rename** to give the workout a new name.
    2. Choose **Delete** to remove the workout (you must confirm).
4. Every change is saved automatically.

#### 3.2.3 Perform an Existing Workout

1. From the workout list, tap the workout you want to do.
2. A preview appears. Tap **Start Workout.**
3. You are on the active-workout screen.
    1. Tap a set to mark it **Done.** A rest timer starts automatically.
    2. Use the **plus** or **minus** buttons to change reps or weight in small steps.
    3. Swipe left on a set to add another set (copied from the last one) or delete it.
    4. Tap **"Add Exercise"** if you need to insert a new exercise during the workout.
    5. The header shows total time and total weight lifted. Swipe down to see your best lifts from earlier sessions.
4. When finished, tap **Finish Workout.**
5. A message asks, "Do you want to update the template?"
    - Tap **Yes** to save the new layout into the template.
    - Tap **No** to keep the template as it was.
6. A summary appears with totals, any new personal records, and a share button. Tap **Done** to leave.

#### 3.2.4 Perform a Quick Workout (No Template)

1. On the home screen, tap **"Quick Start."**
2. You are on the quick-workout screen.
    1. Tap **"Add Exercise,"** search for what you need, and select it.
    2. A set is created right away. Enter weight and reps.
    3. Use **"Add Set"** or **"Add Exercise"** as many times as you need.
3. Tap **Finish Workout** when you are done.
    1. A message asks, "Save this as a template?"
        - Choose **Save** to give it a name and keep it for next time.
        - Choose **Discard** to record today's results only.
4. A summary screen appears. Tap **Done** to exit.

#### 3.2.5 Define a Custom Exercise

1. When you type a name in the exercise search box and nothing matches, an option called **"Create Custom Exercise"** appears. Tap it.
   
   By default, add a custom exercise will be available as the first option in a slightly different UI.
    
2. Fill out the form:
    1. Enter the exercise name.
    2. Pick the main muscle group from a list.
    3. Choose the equipment type, such as body-weight, dumbbell, barbell, or machine.
3. Tap **Save.** A message says, "Custom exercise created."
4. The new exercise is added to your library and is auto-selected in the workout you were building.

### 3.3 Food Tracking Journeys

#### 3.3.1 Existing User Daily Journey

- Log In → Home screen shows **Today's Date** and **Daily Overview**.
- Manage Meals:
    - Add a new meal (give custom name, e.g., Breakfast, Post-Workout Snack).
    - Copy a full meal from any previous day.
- Manage Food Items inside Meals:
    - Add New Item (custom recipe or search library).
    - Copy an Item from previous logs.
- View and Edit:
    - See Macros (carbs, proteins, fats) for each meal and total for the day.
- Water Tracker:
    - Input or Slide to log daily water intake against your set goal.
- Notifications:
    - **1.5 hours before calorie cut-off time**, alert if:
        - Calories are under or over target.
        - Water intake is behind target.

#### 3.3.2 Review Day Journey

- Receive an **automatic notification** when it's time for review (based on chosen frequency).
- On Review:
    - If you achieved the goal weight → tick **Yes**.
    - If you did **not** achieve the goal:
        - Input your current weight.
        - The app will auto-adjust your daily calories and macros using the LLM/AI model for the next period.

#### 3.3.3 Review Feature Journey

1. **Access Review:**
   - Click "Review" button in Nutrition page header
   - Modal opens with current weight, goal weight, and time period inputs

2. **Set Review Parameters:**
   - Enter current weight
   - Enter goal weight
   - Set number of weeks to achieve goal
   - System generates weekly weight targets automatically

3. **Track Progress:**
   - Table shows weekly expected vs actual weights
   - First row shows current weight (non-editable)
   - Future weeks show expected weights
   - Past weeks allow actual weight input
   - System calculates linear progression between current and goal weights

4. **Analytics Integration:**
   - Review data appears in Nutrition Analytics tab
   - Line chart shows expected vs actual weight progression
   - Summary shows how many targets were hit (within 0.2kg of expected)
   - Visual indicators for on-track vs off-track progress

## 4. Technical Architecture

### 4.1 Database Structure

#### 4.1.1 Workout Tracking Tables

| **Table** | **Columns & Types** | **Key Rules / Relationships** |
| --- | --- | --- |
| **profiles** | `id uuid PK` (= `auth.users.id`)<br>`display_name text`<br>`avatar_url text` NULL<br>`created_at timestamptz DEFAULT now()` | One-row-per user. Non-workout preferences can live here too. |
| **muscle_groups** *(lookup)* | `id serial PK`<br>`name text UNIQUE` | Seed once (Chest, Back, Quads …). |
| **equipments** *(lookup)* | `id serial PK`<br>`name text UNIQUE` | Seed (Body-weight, Dumbbell, Machine …). |
| **exercises** | `id uuid PK`<br>`name text UNIQUE`<br>`muscle_group_id int  FK ⇒ muscle_groups.id`<br>`equipment_id   int  FK ⇒ equipments.id`<br>`is_global bool DEFAULT true`<br>`created_by uuid FK ⇒ profiles.id NULL` | Library of movements.<br>`is_global = false` ⇒ user-made custom exercise (`created_by` filled). |
| **workouts** *(template header)* | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`name text`<br>`created_at timestamptz DEFAULT now()`<br>`updated_at timestamptz DEFAULT now()` | A reusable workout template saved by a user. |
| **workout_exercises** | `id uuid PK`<br>`workout_id uuid FK ⇒ workouts.id`<br>`exercise_id uuid FK ⇒ exercises.id`<br>`position int` | Keeps the exercise order within a template. |
| **workout_sets_template** | `id uuid PK`<br>`workout_exercise_id uuid FK ⇒ workout_exercises.id`<br>`position int`<br>`target_reps int` NULL<br>`target_weight numeric` NULL | Stores the planned sets (reps / weight) for each exercise in the template. |
| **workout_sessions** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`workout_id uuid FK ⇒ workouts.id NULL` (if started from a template)<br>`name text` (template name copy or free-form)<br>`started_at timestamptz DEFAULT now()`<br>`finished_at timestamptz NULL` | A real workout log. "Quick workouts" simply have `workout_id = NULL`. |
| **session_exercises** | `id uuid PK`<br>`session_id uuid FK ⇒ workout_sessions.id`<br>`exercise_id uuid FK ⇒ exercises.id`<br>`position int` | Order of exercises actually performed during the session. |
| **session_sets** | `id uuid PK`<br>`session_exercise_id uuid FK ⇒ session_exercises.id`<br>`position int`<br>`reps int`<br>`weight numeric`<br>`rpe numeric NULL`<br>`completed_at timestamptz DEFAULT now()` | Concrete numbers the user completed. |
| **personal_records** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`exercise_id uuid FK ⇒ exercises.id`<br>`best_weight numeric`<br>`best_reps int`<br>`best_volume numeric`<br>`updated_at timestamptz DEFAULT now()` | One row per user × exercise summarising their best lifts (for badge display and quick look-ups). |

#### 4.1.2 Food Tracking Tables

| **Table** | **Columns & Types** | **Key Rules / Relationships** |
| --- | --- | --- |
| **foods** | `id uuid PK`<br>`name text`<br>`calories numeric`<br>`protein numeric`<br>`carbs numeric`<br>`fat numeric`<br>`serving_size numeric`<br>`serving_unit text`<br>`is_global bool DEFAULT true`<br>`created_by uuid FK ⇒ profiles.id NULL`<br>`created_at timestamptz DEFAULT now()` | Library of food items.<br>`is_global = false` ⇒ user-created food item.<br>Nutrition values stored per standard serving. |
| **user_food_favorites** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`food_id uuid FK ⇒ foods.id`<br>`created_at timestamptz DEFAULT now()` | Quick access to frequently used foods by user. |
| **meals** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`name text`<br>`date date`<br>`created_at timestamptz DEFAULT now()`<br>`updated_at timestamptz DEFAULT now()` | A named meal entry (breakfast, lunch, etc). |
| **meal_items** | `id uuid PK`<br>`meal_id uuid FK ⇒ meals.id`<br>`food_id uuid FK ⇒ foods.id`<br>`quantity numeric`<br>`custom_serving_size numeric NULL`<br>`custom_serving_unit text NULL`<br>`custom_calories numeric NULL`<br>`custom_protein numeric NULL`<br>`custom_carbs numeric NULL`<br>`custom_fat numeric NULL`<br>`created_at timestamptz DEFAULT now()` | Food items in a meal with quantities and optional overrides for custom portions. |
| **water_logs** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`date date`<br>`amount numeric`<br>`unit text`<br>`created_at timestamptz DEFAULT now()` | Daily water intake tracking. |
| **nutrition_goals** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`target_calories numeric`<br>`target_protein numeric`<br>`target_carbs numeric`<br>`target_fat numeric`<br>`target_water numeric`<br>`water_unit text`<br>`calorie_cutoff_time time`<br>`diet_type text`<br>`review_frequency int`<br>`created_at timestamptz DEFAULT now()`<br>`updated_at timestamptz DEFAULT now()` | User's nutritional targets and preferences. |
| **weight_logs** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`weight numeric`<br>`unit text`<br>`date date`<br>`notes text NULL`<br>`created_at timestamptz DEFAULT now()` | User's weight entries (for review days). |
| **weight_targets** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`target_weight numeric`<br>`unit text`<br>`target_date date`<br>`created_at timestamptz DEFAULT now()` | Milestone weight targets generated by system. |
| **review_sessions** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`current_weight numeric`<br>`goal_weight numeric`<br>`weeks numeric`<br>`start_date date`<br>`created_at timestamptz DEFAULT now()`<br>`updated_at timestamptz DEFAULT now()` | Stores review session data including current weight, goal weight, and timeframe. |
| **review_rows** | `id uuid PK`<br>`review_session_id uuid FK ⇒ review_sessions.id`<br>`date date`<br>`expected_weight numeric`<br>`actual_weight numeric NULL`<br>`created_at timestamptz DEFAULT now()`<br>`updated_at timestamptz DEFAULT now()` | Individual weight entries for each review session, tracking expected vs actual weights. |
| **user_measurements** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`height numeric NULL`<br>`height_unit text NULL`<br>`current_weight numeric NULL`<br>`goal_weight numeric NULL`<br>`weight_unit text NULL`<br>`goal_period int NULL`<br>`created_at timestamptz DEFAULT now()`<br>`updated_at timestamptz DEFAULT now()` | Stores user's physical measurements and goals. |

#### 4.1.3 Analytics Tables

| **Table** | **Columns & Types** | **Key Rules / Relationships** |
| --- | --- | --- |
| **daily_nutrition_summary** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`date date`<br>`total_calories numeric`<br>`total_protein numeric`<br>`total_carbs numeric`<br>`total_fat numeric`<br>`total_water numeric`<br>`water_unit text`<br>`compliance_score numeric`<br>`is_fully_logged bool`<br>`created_at timestamptz DEFAULT now()`<br>`updated_at timestamptz DEFAULT now()` | Cached daily nutrition totals for performance. |
| **weekly_nutrition_summary** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`start_date date`<br>`end_date date`<br>`avg_calories numeric`<br>`avg_protein numeric`<br>`avg_carbs numeric`<br>`avg_fat numeric`<br>`total_deficit_surplus numeric`<br>`compliance_percentage numeric`<br>`fully_logged_days int`<br>`partially_logged_days int`<br>`water_compliance_percentage numeric`<br>`created_at timestamptz DEFAULT now()`<br>`updated_at timestamptz DEFAULT now()` | Weekly rollup of nutrition metrics. |
| **workout_analytics** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`date date`<br>`total_volume numeric`<br>`total_sets int`<br>`workout_duration interval`<br>`exercise_count int`<br>`session_id uuid FK ⇒ workout_sessions.id NULL`<br>`created_at timestamptz DEFAULT now()` | Daily workout metrics for analytics. |
| **user_habits** | `id uuid PK`<br>`owner uuid FK ⇒ profiles.id`<br>`habit_name text`<br>`habit_type text`<br>`target_value numeric NULL`<br>`target_unit text NULL`<br>`created_at timestamptz DEFAULT now()`<br>`updated_at timestamptz DEFAULT now()` | Custom habits defined by users (sleep, steps, etc). |
| **habit_logs** | `id uuid PK`<br>`habit_id uuid FK ⇒ user_habits.id`<br>`date date`<br>`value numeric`<br>`notes text NULL`<br>`created_at timestamptz DEFAULT now()` | Daily tracking of user-defined habits. |

### 4.2 Simplified Database Explanation

#### 4.2.1 Workout Tracking Tables

| **Table** | **What it represents (in simple words)** |
| --- | --- |
| **profiles** | Stores basic information about each user who signs up. This includes their display name, profile picture (avatar), and personal settings. Every user has exactly one profile linked to their Supabase authentication account. |
| **muscle_groups** & **equipments** | Static lookup lists that never really change. They help classify exercises. For example, exercises can be tagged to "Back" (muscle group) and "Barbell" (equipment). These tags are used for better filtering and searching inside the app. |
| **exercises** | This is the full library of exercises available to users. Some exercises come built-in (like "Push-Up" or "Deadlift" — marked as `is_global = true`). If users create their own custom exercises (like "Paused Bench Press"), they are added here too but are marked `is_global = false` and linked to the user who made them. Exercises can also store a thumbnail image and a demonstration video or GIF. |
| **workouts** | Think of this as a saved workout **template**. It's just a named plan, belonging to a user. It stores the workout's title and ownership details, but not the exercises or sets directly — those live in separate linked tables. |
| **workout_exercises** | Lists the specific exercises that are part of a workout template, and the order in which they should appear. For example, a "Push Day" template might include "Bench Press" first, then "Incline Dumbbell Press" second, and so on. |
| **workout_sets_template** | Details the planned sets for each exercise in the template. For each set, it can store the target number of reps and the target weight. For example: 3 sets of 8 reps at 50 kg. These targets help guide users during their workout. |
| **workout_sessions** | Every time a user actually starts and does a workout (either from a template or starting fresh using Quick Start), a new **session** is recorded here. It captures basic info like the session name, when the user started, when they finished, and some total stats like volume lifted and time spent. |
| **session_exercises** | These are the exercises a user actually did during a specific workout session. It records the order the exercises were performed, which can be different from the template if the user adds or removes exercises during the workout. |
| **session_sets** | This is the most detailed workout data: every single set that the user completes is logged here. It stores exactly how many reps they did, what weight they used, any RPE (effort level) if entered, and the time they finished the set. This data is used to calculate workout summaries and personal records. |
| **personal_records** | This is like a high score board for each user. It stores their best-ever lifts: heaviest weight, most reps, and highest volume for each exercise. Whenever a user beats a previous best during a workout, the app updates their record automatically without needing to scan all old sessions. |

#### 4.2.2 Food Tracking Tables

| **Table** | **What it represents (in simple words)** |
| --- | --- |
| **foods** | The library of all food items available in the app. Similar to exercises, some foods are pre-loaded (global) while others are custom-created by users. Each food stores its nutritional information per standard serving. |
| **user_food_favorites** | Tracks which food items a user frequently uses, creating a personalized "quick access" list for faster meal logging. |
| **meals** | Represents a specific meal (breakfast, lunch, dinner, snack, etc.) that a user logged on a particular date. |
| **meal_items** | The individual food components that make up a meal, along with their quantities. Users can override default nutritional values for custom portions or homemade variations. |
| **water_logs** | Tracks a user's daily water intake, helping them stay hydrated and meet their hydration goals. |
| **nutrition_goals** | Stores a user's personalized nutrition targets (calories, macros, water) and preferences like diet type, calorie cutoff time, and how often they want to review their progress. |
| **weight_logs** | Records a user's weight entries over time, especially important on review days to track progress toward goals. |
| **weight_targets** | Milestone weights that the user aims to achieve by specific dates, generated based on their overall weight goal and timeframe. |
| **review_sessions** | Stores review session data including current weight, goal weight, and timeframe. |
| **review_rows** | Individual weight entries for each review session, tracking expected vs actual weights. |
| **user_measurements** | Stores the user's physical measurements like height and weight, along with their goal weight and the timeframe to achieve it. |

#### 4.2.3 Analytics Tables

| **Table** | **What it represents (in simple words)** |
| --- | --- |
| **daily_nutrition_summary** | A pre-calculated daily rollup of all nutrition data (calories, macros, water) to improve app performance when displaying analytics. Also tracks whether the day was fully logged and overall compliance with goals. |
| **weekly_nutrition_summary** | Weekly aggregated nutrition data showing averages, compliance percentages, and logging consistency. Used for weekly review insights and longer-term trend analysis. |
| **workout_analytics** | Summarizes each day's workout metrics (total volume, sets, duration) for quick access when generating analytics without recalculating from raw data. |
| **user_habits** | Custom habits that users want to track alongside their fitness and nutrition (sleep, step count, mood, etc.) with their respective targets. |
| **habit_logs** | Daily tracking entries for user-defined habits, providing data for correlation analysis with workout and nutrition performance. |

### 4.3 Working Mechanisms

#### 4.3.1 Food Tracking Mechanism

| **Functionality** | **Mechanism** |
| --- | --- |
| New User Initialization | If user enters details → LLM processes data → suggests personalized calorie goal. |
| Daily Tracking | Meals and water logs saved daily; recalculates macros in real-time. |
| Notification System | Background scheduler triggers notifications 1.5 hours before cut-off time. |
| Meal Copy Feature | Load meals/items from previous logs easily; editable after copying. |
| Water Logging | Real-time update to water intake progress bar or number. |
| Review Mechanism | Scheduled check → User updates weight → LLM adjusts calorie/macros if needed. |
| AI Macro Adjustment | LLM considers current progress and time left to reassign new daily calorie/macro targets. |
| End of Day Logic | Auto-save daily log based on user actions or auto-end at defined time. |

## 5. UI/UX Design

### 5.1 Navigation

* Navigation happens via the sidebar
* There are 3 main sections:
   * Food
   * Workouts
   * Analytics

### 5.2 Color Scheme & Typography

| **Element** | **Specification** |
| --- | --- |
| Primary Colors | Dark background `#1A1F22`; Green accent `#2ECB70` |
| Secondary Colors | Dark-gray cards `#252A2D`; Light-gray text `#A0A5A9` |
| Typography — Headers | Sans-serif, **bold**, ALL CAPS, white `#FFFFFF` |
| Typography — Body text | Sans-serif, regular, light-gray `#A0A5A9` |
| Typography — Buttons | Sans-serif, **bold**, ALL CAPS, text in white or accent green |

### 5.3 Global UI Elements

| **UI Element** | **Description** | **Interaction** |
| --- | --- | --- |
| Navigation Header | • Fixed at top with centred title (ALL CAPS)<br>• Back button (←) on left<br>• Optional right-side actions (+ / ⓘ)<br>• Dark background `#1A1F22`, white text | • Back button returns to previous screen<br>• Right-side buttons perform contextual actions |
| Primary Action Button | • Pill-shaped, rounded ends<br>• Accent green `#2ECB70`<br>• ALL CAPS white text<br>• Fixed at bottom, full-width with side margins | • Single-tap triggers primary action (e.g., START WORKOUT)<br>• Provides tactile feedback |
| Secondary Action Button | • Pill-shaped, rounded ends<br>• Dark-gray fill with light border<br>• ALL CAPS white/light-gray text<br>• Visually subordinate to primary button | • Single-tap triggers secondary action |
| List Items | • Rounded-rectangle cards (`#252A2D`)<br>• Left-aligned content, optional thumbnail/icon<br>• White primary text, light-gray secondary text<br>• Info (ⓘ) or more options (⋮) on right<br>• Alphabetical section headers | • Tap item to open detail<br>• Info icon shows popup<br>• ⋮ opens context menu<br>• Long-press may enable re-order |
| Form Fields | • Rounded-rectangle inputs (`#252A2D`)<br>• Light-gray placeholder, white active text<br>• Labels above inputs in light-gray<br>• Dropdowns show chevron (▼) | • Tap to focus / open keyboard<br>• Tap dropdown to choose option<br>• "Done/Return" confirms input |

### 5.4 Food Tracking UI Components

| **Component** | **UX Behavior** | **Design Suggestions** |
| --- | --- | --- |
| Welcome/Login Screen | Quick login/signup; minimal steps. | Clean form, social login options, soft colors. |
| Onboarding Wizard | Progressive, optional user input. | Stepper layout; motivational messages. |
| Diet Type Selection | Easy editing; simple language. | Selectable pill-shaped buttons. |
| Set Calorie Cut-off and Review | Intuitive setup (time and day selection). | Time-picker and dropdown for review period. |
| Daily Dashboard | Immediate view of today's progress (meals + water intake). | Cards showing meals, macros, water bar at bottom. |
| Meal Management | Simple Add/Edit/Copy flows; easy search for foods. | Modal popups; search + filter library. |
| Water Tracking | Interactive input and reminder nudges. | Horizontal slider or circular progress bar. |
| Notifications | Smart, timely alerts (not annoying). | Push notifications + subtle in-app alerts. |
| Review Day Flow | Quick weight input and AI recalibration. | Simple form + motivational message (optional). |
| Progress Tracking (optional) | Weekly charts and insights on progress. | Line graphs, goal badges, friendly feedback. |

### 5.5 Food Tracking UI Elements

| **UI Element** | **Description** |
| --- | --- |
| Text Input Field | For weight, height, goal weight, custom recipes. |
| Unit Selector | Dropdown or toggle (cm/inches, kg/lbs). |
| Stepper Wizard | For onboarding flow. |
| Time Picker | For setting calorie cut-off time. |
| Toggle Buttons | For diet type selection. |
| Progress Bar | For daily water intake. |
| Cards | For meals and daily macros summary. |
| Sliders | For water intake and portion sizes. |
| Modal Dialogs | For adding/editing meals and items. |
| Notification Banners | Subtle in-app alerts (calories/water reminders). |
| Push Notifications | Timely nudges outside the app. |
| Chart Components | For showing weekly progress (weight trend, macros). |
| Review Form | Simple form for review day input. |

### 5.6 Workout UI Components

| **UI Section / Component** | **Description & Guideline** | **Interaction** |
| --- | --- | --- |
| Workout List Screen | • Header title "STRENGTH TRAINER" + info icon<br>• Tabs — "WHOOP WORKOUTS" / "MY WORKOUTS"<br>• List of workout templates with drag handles<br>• Primary button "CREATE NEW WORKOUT" at bottom | • Tap tabs to switch category<br>• Tap template to view/edit<br>• Tap primary button to start creation |
| New Workout Name Dialog | • Modal with dark bg<br>• Title "Name your workout"<br>• Text input with placeholder<br>• Buttons: CANCEL / SAVE | • Type name → tap SAVE to proceed<br>• CANCEL dismisses |
| Workout Builder Screen | • Header shows workout name + back<br>• Empty-state prompt "Add your first exercise"<br>• "ADD EXERCISE" (+) button<br>• Exercise cards appear as added<br>• Settings icon for workout options<br>• Primary SAVE button at bottom | • Tap ADD EXERCISE to open selection<br>• Change options via settings<br>• Tap SAVE to finalise template |
| Exercise Selection Screen | • Header "SELECT EXERCISES" + back<br>• Top search bar (🔍)<br>• "Add Custom Exercise" (+) row<br>• Alphabetical list with thumbnails<br>• Info icon (ⓘ) per exercise<br>• Buttons "SUPERSET" and "ADD" at bottom | • Real-time search filter<br>• Tap exercise to select<br>• Tap ⓘ for details<br>• Tap Add Custom Exercise<br>• Tap ADD to insert selected |
| Exercise Card | • Dark-gray rounded card<br>• Name + thumbnail<br>• Set counter (e.g., "3 Sets")<br>• Rows: set #, reps field, weight field, delete (×)<br>• "ADD SET" (+) button<br>• Drag handle for re-order<br>• Optional help text | • Tap rows to edit reps/weight<br>• Tap ADD SET to append<br>• Tap × to delete set<br>• Long-press & drag to reorder |
| Template Detail Screen | • Header: workout name, back, ⋯ menu<br>• List of exercise cards<br>• Drag handles beside each exercise<br>• "ADD EXERCISE" between cards<br>• Auto-save indicator | • Tap card to expand/collapse<br>• Drag to reorder<br>• Tap ADD EXERCISE to insert<br>• Tap ⋯ for rename/delete |
| Rename Workout Dialog | • Modal "Rename Workout"<br>• Text field pre-filled with name<br>• CANCEL / SAVE buttons | • Edit name → SAVE<br>• CANCEL aborts |
| Delete Confirmation Dialog | • Modal "Delete Workout?"<br>• Warning text, permanent action<br>• CANCEL / DELETE (red) buttons | • DELETE removes workout<br>• CANCEL dismisses |
| Workout Preview Screen | • Header workout name + back<br>• Exercise list preview<br>• Estimated time & difficulty<br>• Primary button "START WORKOUT" | • Review details<br>• Tap START WORKOUT |
| Active Workout Screen | • Header: workout name, timer, total volume<br>• Current exercise card highlighted<br>• Set rows with checkmarks<br>• ± buttons for quick adjust<br>• Rest-timer overlay<br>• "FINISH WORKOUT" at bottom | • Tap set → mark done + start timer<br>• Use ± to change numbers<br>• Swipe left on sets for more options<br>• Tap ADD EXERCISE mid-session<br>• Swipe down to view PRs<br>• Tap FINISH WORKOUT to end |
| Template Update Dialog | • Modal "Update Template?"<br>• Explains what will be saved<br>• Buttons: NO / YES | • YES saves changes<br>• NO keeps template unchanged |
| Workout Summary Screen | • Header "Workout Complete"<br>• Stats: duration, volume, PRs<br>• Exercise breakdown<br>• Share button (icon)<br>• DONE button | • Review metrics<br>• Tap PRs for details<br>• Share exports results<br>• DONE returns to home |
| Quick Workout Screen | • Header "Quick Workout" + timer<br>• Empty-state prompt "Add your first exercise"<br>• Prominent "ADD EXERCISE" button<br>• Exercise cards appear as added<br>• "FINISH WORKOUT" at bottom | • Functions like Active Workout<br>• No predefined template<br>• Tap FINISH WORKOUT when done |
| Save Template Dialog | • Modal "Save as Template?"<br>• Name input<br>• DISCARD / SAVE buttons | • Type name → SAVE to create template<br>• DISCARD logs session only |
| Custom Exercise Screen | • Header "CUSTOM EXERCISE" + back<br>• Form fields: name, description<br>• "Track Muscular Load" section (ⓘ)<br>• "LINK AN EXERCISE" (›)<br>• Equipment dropdown<br>• Muscle group dropdown<br>• Primary "SAVE TO LIBRARY" at bottom | • Fill form<br>• Tap ⓘ for muscular-load info<br>• Tap LINK AN EXERCISE to pick similar move<br>• Set equipment/muscle group<br>• Tap SAVE TO LIBRARY |
| Exercise Linking Screen | • Header "LINK EXERCISE" + back<br>• Search bar<br>• List of exercises with selection ticks<br>• CONFIRM button | • Search & select existing exercise<br>• Tap CONFIRM to link |
| Success Confirmation | • Bottom toast, green accent + icon<br>• Text "Custom exercise created"<br>• Auto-dismiss after ~2 s | • Feedback only; returns to previous screen with new exercise selected |

## 6. Analytics Features

### 6.1 Global Analytics Settings

* **Timeframes supported**: Last 7, 14, 30, 90 days (1 point = 1 day).
* **Default timeframe**: Last 7 days.
* **Selector**: Dropdown menu at the top of each analytics page.

### 6.2 Food Analytics

| **Graph / Metric** | **What it shows** | **Graph Type** |
| --- | --- | --- |
| **Calories Trend** | Total calories consumed per day over time. | Line chart (smooth curve, daily points) |
| **Calorie Surplus / Deficit** | Whether daily intake was above or below target calories. | Bar chart (green = deficit, red = surplus) |
| **Macro Breakdown** | Daily breakdown of protein, carbs, and fats. | Stacked bar chart (P/C/F per day) |
| **Weight Progress** | Expected vs actual weight progression over time. | Dual-line chart (blue = expected, red = actual) |
| **Target Hit Rate** | Percentage of weight targets achieved within 0.2kg margin. | Text summary with percentage |

#### Empty State (Food Analytics)
* If no meals are logged for the selected period:
   * Show friendly illustration (empty plate or food icons).
   * Message: **"No meals tracked yet. Start logging to see your progress!"**
   * CTA Button (optional): **"Log Food"** → leads to food logging screen.
   * Hide graph frame until data is available.

### 6.3 Workout Analytics

| **Graph / Metric** | **What it shows** | **Graph Type** |
| --- | --- | --- |
| **Workout Volume Trend** | Total weight lifted (kg/lb) per day. | Area line chart (volume trend) |
| **Personal Record (PR) Tracker** | Heaviest weight lifted for an exercise over time. | Line chart or sparkline (latest PR highlighted) |
| **Weight vs Reps Trend** | Top set weight vs maximum reps for each workout session. | Dual-axis line chart (weight on left axis, reps on right axis) |

#### Empty State (Workout Analytics)
* If no workouts are completed in the selected period:
   * Show friendly illustration (dumbbell, flexing emoji, etc.).
   * Message: **"No workouts completed yet. Smash a session to see your stats!"**
   * CTA Button (optional): **"Start Workout"** → leads to workout creation/quick-start screen.
   * Hide graph frame until first workout is done.

### 6.4 Key Performance Indicators

1. **Calorie Compliance %**
   * **Visualization**: Donut Chart at the center
   * **Description**: Short text like ➔ "Well done! You stayed within range 6 of 7 days."
   * **Highlight**: % in bold in the middle (e.g., "86% Compliance")

2. **Macro Split**
   * **Visualization**: Pie Chart or Horizontal Stacked Bar
   * **Description**: Short text ➔ "Your Protein intake is slightly low this week."
   * **Details**: Labels for Carbs, Proteins, Fats with %

3. **Weekly Deficit/Excess**
   * **Visualization**: Bar Graph (positive = excess, negative = deficit)
   * **Description**: Short text ➔ "Net Deficit of 2500 kcal this week."
   * **Axes**: X-Axis: Week days | Y-Axis: Calories +/-

4. **Water Intake Compliance**
   * **Visualization**: Circular Water Fill Chart
   * **Description**: Short text ➔ "Aim to drink at least 2.5L every day."
   * **Highlight**: % in bold (e.g., "72% Target Met")

5. **Meal Logging Consistency**
   * **Visualization**: Calendar Heatmap (each day colored based on logging)
   * **Description**: Short text ➔ "5 fully logged days this week."
   * **Color Coding**: Green = fully logged, Light = partial, Grey = missed
