const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { pool, initDatabase } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// Initialise databas
initDatabase();

app.get("/api/todos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/todos", async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *",
      [title, description || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description } = req.body;

  try {
    const result = await pool.query(
      "UPDATE todos SET title = COALESCE($1, title), description = COALESCE($2, description), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [title, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/test", (req, res) => {
  res.json({ message: "Backend is working!", port: PORT });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

if (process.env.NODE_ENV !== "check") {
  app.listen(PORT, () => {
    console.log(`Todo API Server running on port ${PORT}`);
  });
}

module.exports = app;
