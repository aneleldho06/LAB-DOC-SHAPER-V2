const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(DB_FILE);

function initDB() {
    db.serialize(() => {
        db.run(`
      CREATE TABLE IF NOT EXISTS admin_profile (
        id INTEGER PRIMARY KEY,
        name TEXT,
        roll_number TEXT,
        password TEXT DEFAULT 'admin123'
      )
    `);

        db.run(`
      CREATE TABLE IF NOT EXISTS labs (
        id INTEGER PRIMARY KEY,
        lab_id TEXT,
        original_date_string TEXT,
        file_path TEXT,
        file_name TEXT
      )
    `);

        // Initialize admin profile if empty
        db.get('SELECT COUNT(*) as count FROM admin_profile', (err, row) => {
            if (row.count === 0) {
                db.run("INSERT INTO admin_profile (name, roll_number) VALUES ('', '')");
            }
        });
    });
}

initDB();

module.exports = db;
