import fs from 'fs';
import path from 'path';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'fitness_tracker.sqlite');

let dbInstance: SqlJsDatabase | null = null;
let isInitialized = false;

export async function getSQLiteDB(): Promise<SqlJsDatabase> {
  if (dbInstance && isInitialized) {
    return dbInstance;
  }
  return await initSQLiteDatabase();
}

/**
 * Automatically initializes the SQLite database file and tables
 */
export async function initSQLiteDatabase(): Promise<SqlJsDatabase> {
  if (dbInstance && isInitialized) return dbInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      console.log(`[SQLite] Loaded existing database from ${DB_FILE} (${fileBuffer.length} bytes)`);
    } catch (err) {
      console.error('[SQLite] Error reading existing database file, creating fresh instance:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    console.log(`[SQLite] Creating new database file at ${DB_FILE}`);
    dbInstance = new SQL.Database();
  }

  // 1. Create all Tables automatically
  createTables(dbInstance);

  // 2. Seed initial data if tables are empty
  seedInitialData(dbInstance);

  // 3. Save to disk
  saveDatabaseToDisk(dbInstance);

  isInitialized = true;
  return dbInstance;
}

/**
 * Creates schema and tables automatically
 */
function createTables(db: SqlJsDatabase) {
  db.run(`
    -- Patients Table (for health clinic & patient intake)
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      dob TEXT,
      gender TEXT DEFAULT 'Not Specified',
      height_cm REAL,
      weight_kg REAL,
      blood_group TEXT,
      medical_conditions TEXT,
      allergies TEXT,
      fitness_goal TEXT DEFAULT 'General Fitness',
      experience_level TEXT DEFAULT 'Beginner',
      available_days INTEGER DEFAULT 4,
      equipment_access TEXT DEFAULT 'Gym',
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Connected Patient Vitals Table
    CREATE TABLE IF NOT EXISTS patient_vitals (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      blood_pressure_systolic INTEGER,
      blood_pressure_diastolic INTEGER,
      heart_rate_bpm INTEGER,
      body_temperature_c REAL,
      weight_kg REAL,
      blood_glucose_mg_dl REAL,
      notes TEXT,
      recorded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );

    -- Connected Patient Consultations Table
    CREATE TABLE IF NOT EXISTS patient_consultations (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      consultation_date TEXT DEFAULT (date('now')),
      chief_complaint TEXT,
      diagnosis TEXT,
      prescription TEXT,
      follow_up_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );

    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      dob TEXT,
      gender TEXT DEFAULT 'Not Specified',
      height REAL DEFAULT 175,
      weight REAL DEFAULT 70,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'USER',
      fitness_goal TEXT DEFAULT 'General Fitness',
      experience_level TEXT DEFAULT 'Beginner',
      available_days INTEGER DEFAULT 4,
      equipment TEXT DEFAULT 'Gym',
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- User Profiles & Daily Targets
    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      daily_water_goal INTEGER DEFAULT 3000,
      daily_step_goal INTEGER DEFAULT 10000,
      daily_calorie_goal INTEGER DEFAULT 2200,
      daily_protein_goal INTEGER DEFAULT 120,
      daily_carbs_goal INTEGER DEFAULT 250,
      daily_fat_goal INTEGER DEFAULT 65,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Exercises Library
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      muscle_group TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Beginner',
      equipment TEXT DEFAULT 'Bodyweight',
      instructions TEXT,
      benefits TEXT,
      common_mistakes TEXT,
      recommended_sets TEXT DEFAULT '3 sets',
      recommended_reps TEXT DEFAULT '10 - 12 reps',
      rest_time TEXT DEFAULT '60 sec',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Exercise Videos
    CREATE TABLE IF NOT EXISTS exercise_videos (
      id TEXT PRIMARY KEY,
      exercise_id TEXT,
      exercise_name TEXT,
      title TEXT NOT NULL,
      video_url TEXT,
      thumbnail_url TEXT,
      duration TEXT DEFAULT '3:00 mins',
      muscle_group TEXT,
      difficulty TEXT DEFAULT 'Intermediate',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Workouts Log
    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exercise TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      sets INTEGER NOT NULL DEFAULT 1,
      reps INTEGER NOT NULL DEFAULT 1,
      weight REAL DEFAULT 0,
      duration INTEGER NOT NULL DEFAULT 15,
      calories_burned INTEGER DEFAULT 100,
      workout_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Food Database (Indian & Global items)
    CREATE TABLE IF NOT EXISTS food_database (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      serving_size TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein REAL DEFAULT 0,
      carbs REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      is_indian INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Daily Nutrition Logs
    CREATE TABLE IF NOT EXISTS daily_nutrition (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      food_name TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein REAL DEFAULT 0,
      carbohydrates REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      quantity TEXT DEFAULT '1 serving',
      meal_type TEXT NOT NULL,
      log_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Daily Water Intake
    CREATE TABLE IF NOT EXISTS daily_water (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount_ml INTEGER NOT NULL,
      log_date TEXT NOT NULL,
      logged_at_time TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Daily Steps
    CREATE TABLE IF NOT EXISTS daily_steps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      steps_count INTEGER NOT NULL,
      log_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Fitness Goals
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      goal_type TEXT NOT NULL,
      current_value REAL NOT NULL,
      target_value REAL NOT NULL,
      unit TEXT DEFAULT 'kg',
      target_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Body Measurements
    CREATE TABLE IF NOT EXISTS body_measurements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      chest REAL DEFAULT 0,
      waist REAL DEFAULT 0,
      arms REAL DEFAULT 0,
      thighs REAL DEFAULT 0,
      shoulders REAL DEFAULT 0,
      weight REAL NOT NULL,
      measurement_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- BMI History
    CREATE TABLE IF NOT EXISTS bmi_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      height REAL NOT NULL,
      weight REAL NOT NULL,
      bmi REAL NOT NULL,
      category TEXT NOT NULL,
      record_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'workout',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

/**
 * Seeds sample records if database is empty
 */
function seedInitialData(db: SqlJsDatabase) {
  // Check if patients table is empty
  const patientCountRes = db.exec("SELECT COUNT(*) as count FROM patients");
  const count = patientCountRes[0]?.values[0]?.[0] || 0;

  if (Number(count) === 0) {
    console.log('[SQLite] Seeding initial sample patient records...');
    db.run(`
      INSERT INTO patients (
        id, full_name, email, phone, dob, gender, height_cm, weight_kg,
        blood_group, medical_conditions, allergies, fitness_goal, experience_level,
        available_days, equipment_access, emergency_contact_name, emergency_contact_phone, notes
      ) VALUES (
        'pt_seed_001',
        'Dr. Priya Sharma',
        'priya.sharma@healthclinic.org',
        '+91 98765 43210',
        '1992-05-18',
        'Female',
        165.0,
        59.0,
        'B+',
        'Mild exercise-induced asthma, Vitamin D deficiency',
        'Penicillin, Dust mites',
        'Strength & Mobility',
        'Intermediate',
        4,
        'Gym',
        'Rajesh Sharma (Spouse)',
        '+91 98765 43211',
        'Pre-diabetic screening completed. Recommended 45min cardiovascular and resistance training.'
      ), (
        'pt_seed_002',
        'Marcus Vance',
        'marcus.vance@gmail.com',
        '+1 (555) 234-5678',
        '1987-11-04',
        'Male',
        182.0,
        84.0,
        'O+',
        'Past ACL reconstruction on right knee',
        'None reported',
        'Weight Loss & Muscle Tone',
        'Beginner',
        5,
        'Home Equipment',
        'Elena Vance (Sister)',
        '+1 (555) 234-9988',
        'Advised low impact knee flexion exercises. Focus on glute strength and quad rehabilitation.'
      );

      -- Seed connected vitals
      INSERT INTO patient_vitals (
        id, patient_id, blood_pressure_systolic, blood_pressure_diastolic,
        heart_rate_bpm, body_temperature_c, weight_kg, blood_glucose_mg_dl, notes
      ) VALUES (
        'vit_001',
        'pt_seed_001',
        118,
        78,
        68,
        36.8,
        59.0,
        92.0,
        'Normal baseline checkup vitals'
      ), (
        'vit_002',
        'pt_seed_002',
        124,
        82,
        74,
        37.0,
        84.0,
        105.0,
        'Postural assessment and pre-workout screening'
      );

      -- Seed sample users
      INSERT OR IGNORE INTO users (
        id, name, email, phone, dob, gender, height, weight, password_hash, role, fitness_goal, experience_level, available_days, equipment
      ) VALUES (
        'usr_admin_001',
        'Admin Coach',
        'admin@fitness.com',
        '+1 555-0199',
        '1988-04-12',
        'Male',
        182.0,
        80.0,
        'hashed_3bf12_YWRtaW4xMjM=',
        'ADMIN',
        'Strength',
        'Advanced',
        6,
        'Gym'
      ), (
        'usr_alex_002',
        'Alex Rivera',
        'alex@fitness.com',
        '+1 555-0144',
        '1996-08-23',
        'Male',
        178.0,
        74.0,
        'hashed_2ac90_dXNlcjEyMw==',
        'USER',
        'Muscle Building',
        'Intermediate',
        5,
        'Gym'
      );

      -- Seed food library
      INSERT OR IGNORE INTO food_database (id, name, category, serving_size, calories, protein, carbs, fat, is_indian)
      VALUES 
        ('f_poha', 'Poha with vegetables & peanuts', 'Breakfast', '1 medium bowl (150g)', 250, 5.0, 42.0, 7.0, 1),
        ('f_idli', 'Steamed Idli with Sambar', 'Breakfast', '2 idlis + sambar', 180, 7.0, 32.0, 3.0, 1),
        ('f_roti', 'Whole Wheat Roti (2 pcs)', 'Lunch', '2 rotis (60g)', 160, 6.0, 32.0, 1.5, 1),
        ('f_dal', 'Moong/Toor Dal Tadka', 'Lunch', '1 katori (150ml)', 150, 9.0, 22.0, 3.0, 1),
        ('f_rajma', 'Rajma Masala (Kidney Beans)', 'Lunch', '1 cup (180g)', 240, 13.0, 38.0, 4.0, 1),
        ('f_paneer', 'Low-Fat Paneer Curry', 'Lunch', '150g', 280, 18.0, 8.0, 18.0, 1),
        ('f_sprouts', 'Sprouted Moong Chaat', 'Snacks', '1 cup (120g)', 130, 9.0, 22.0, 0.8, 1),
        ('f_khichdi', 'Dal Khichdi with Ghee', 'Dinner', '1 plate (200g)', 260, 8.0, 46.0, 5.0, 1);
    `);
  }
}

/**
 * Persists the SQLite database instance to the binary file on disk
 */
export function saveDatabaseToDisk(db?: SqlJsDatabase): void {
  const targetDb = db || dbInstance;
  if (!targetDb) return;

  try {
    const data = targetDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('[SQLite] Error saving database to disk:', err);
  }
}

/**
 * Executes a custom SQL statement (SELECT, INSERT, UPDATE, DELETE, PRAGMA)
 */
export async function executeSql(sqlStatement: string): Promise<{
  success: boolean;
  columns?: string[];
  rows?: any[];
  rowsAffected?: number;
  executionTimeMs: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    const db = await getSQLiteDB();
    const cleanSql = sqlStatement.trim();

    if (!cleanSql) {
      return { success: false, executionTimeMs: 0, error: 'Empty SQL statement' };
    }

    const isSelect = /^\s*(SELECT|PRAGMA|EXPLAIN|WITH)/i.test(cleanSql);

    if (isSelect) {
      const results = db.exec(cleanSql);
      const executionTimeMs = Date.now() - startTime;

      if (!results || results.length === 0) {
        return { success: true, columns: [], rows: [], executionTimeMs };
      }

      const columns = results[0].columns;
      const rows = results[0].values.map(valArr => {
        const rowObj: Record<string, any> = {};
        columns.forEach((col, idx) => {
          rowObj[col] = valArr[idx];
        });
        return rowObj;
      });

      return { success: true, columns, rows, executionTimeMs };
    } else {
      db.run(cleanSql);
      saveDatabaseToDisk(db);
      const executionTimeMs = Date.now() - startTime;
      return { success: true, rowsAffected: 1, executionTimeMs };
    }
  } catch (err: any) {
    return {
      success: false,
      executionTimeMs: Date.now() - startTime,
      error: err.message || 'SQLite Execution Error'
    };
  }
}

/**
 * Gets high-level stats and list of all SQLite tables
 */
export async function getSQLiteStats(): Promise<{
  databasePath: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  totalTables: number;
  totalRecords: number;
  tables: Array<{ name: string; rowCount: number; columns: string[] }>;
  sqliteVersion: string;
}> {
  const db = await getSQLiteDB();
  
  let fileSize = 0;
  if (fs.existsSync(DB_FILE)) {
    fileSize = fs.statSync(DB_FILE).size;
  }

  // Get tables
  const tablesRes = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
  const tableNames = tablesRes[0]?.values.map(v => String(v[0])) || [];

  let totalRecords = 0;
  const tables: Array<{ name: string; rowCount: number; columns: string[] }> = [];

  for (const tableName of tableNames) {
    try {
      const countRes = db.exec(`SELECT COUNT(*) FROM "${tableName}";`);
      const rowCount = Number(countRes[0]?.values[0]?.[0] || 0);
      totalRecords += rowCount;

      const infoRes = db.exec(`PRAGMA table_info("${tableName}");`);
      const columns = infoRes[0]?.values.map(v => String(v[1])) || [];

      tables.push({ name: tableName, rowCount, columns });
    } catch (e) {
      tables.push({ name: tableName, rowCount: 0, columns: [] });
    }
  }

  // Version
  const verRes = db.exec("SELECT sqlite_version();");
  const sqliteVersion = String(verRes[0]?.values[0]?.[0] || '3.x');

  const fileSizeFormatted = fileSize > 1024 * 1024 
    ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
    : `${(fileSize / 1024).toFixed(1)} KB`;

  return {
    databasePath: DB_FILE,
    fileSizeBytes: fileSize,
    fileSizeFormatted,
    totalTables: tableNames.length,
    totalRecords,
    tables,
    sqliteVersion
  };
}

/**
 * Fetch patient records from SQLite
 */
export async function getPatientsFromSQLite(): Promise<any[]> {
  const db = await getSQLiteDB();
  const res = db.exec("SELECT * FROM patients ORDER BY created_at DESC;");
  if (!res || res.length === 0) return [];
  const cols = res[0].columns;
  return res[0].values.map(v => {
    const row: any = {};
    cols.forEach((c, idx) => { row[c] = v[idx]; });
    return row;
  });
}

/**
 * Insert or update a patient in SQLite automatically
 */
export async function savePatientToSQLite(patient: any): Promise<any> {
  const db = await getSQLiteDB();
  const id = patient.id || `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const statement = `
    INSERT INTO patients (
      id, full_name, email, phone, dob, gender, height_cm, weight_kg,
      blood_group, medical_conditions, allergies, fitness_goal, experience_level,
      available_days, equipment_access, emergency_contact_name, emergency_contact_phone, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      full_name = excluded.full_name,
      email = excluded.email,
      phone = excluded.phone,
      dob = excluded.dob,
      gender = excluded.gender,
      height_cm = excluded.height_cm,
      weight_kg = excluded.weight_kg,
      blood_group = excluded.blood_group,
      medical_conditions = excluded.medical_conditions,
      allergies = excluded.allergies,
      fitness_goal = excluded.fitness_goal,
      experience_level = excluded.experience_level,
      available_days = excluded.available_days,
      equipment_access = excluded.equipment_access,
      emergency_contact_name = excluded.emergency_contact_name,
      emergency_contact_phone = excluded.emergency_contact_phone,
      notes = excluded.notes,
      updated_at = datetime('now');
  `;

  db.run(statement, [
    id,
    patient.full_name || '',
    patient.email || '',
    patient.phone || null,
    patient.dob || null,
    patient.gender || 'Not Specified',
    patient.height_cm ? Number(patient.height_cm) : null,
    patient.weight_kg ? Number(patient.weight_kg) : null,
    patient.blood_group || null,
    patient.medical_conditions || null,
    patient.allergies || null,
    patient.fitness_goal || 'General Fitness',
    patient.experience_level || 'Beginner',
    patient.available_days ? Number(patient.available_days) : 4,
    patient.equipment_access || 'Gym',
    patient.emergency_contact_name || null,
    patient.emergency_contact_phone || null,
    patient.notes || null
  ]);

  saveDatabaseToDisk(db);
  return { id, ...patient };
}

/**
 * Delete a patient from SQLite
 */
export async function deletePatientFromSQLite(id: string): Promise<boolean> {
  const db = await getSQLiteDB();
  db.run("DELETE FROM patients WHERE id = ?;", [id]);
  saveDatabaseToDisk(db);
  return true;
}

export { DB_FILE };
