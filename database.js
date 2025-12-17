const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initDatabase = async () => {
  try {
    await pool.query('DROP TABLE IF EXISTS todos');
    await pool.query(`
      CREATE TABLE todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Database table created successfully');
    
    await pool.query(`
      INSERT INTO todos (title, description) VALUES 
      ('Complete project documentation', 'Write comprehensive README and API documentation'),
      ('Setup development environment', 'Install Node.js, PostgreSQL, and configure the database')
    `);
    console.log('✓ Sample data inserted');
  } catch (error) {
    console.error('✗ Database initialization error:', error.message);
  }
};

module.exports = { pool, initDatabase };