import sqlite3 from 'sqlite3';

// Create in-memory database
const db = new sqlite3.Database(':memory:');

// Initialize database schema
export const initDatabase = () => {
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    // Insert initial data
    const initialUsers = [
      { name: 'John Smith', email: 'john@example.com' },
      { name: 'Jane Doe', email: 'jane@example.com' }
    ];

    const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    
    initialUsers.forEach((user) => {
      stmt.run(user.name, user.email);
    });

    stmt.finalize();
    
    console.log('✅ Database initialized with users table');
  });
};

export default db;
