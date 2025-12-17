const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let todos = [
  { id: 1, task: 'Sample Todo Item', completed: false, createdAt: new Date() }
];
let nextId = 2;

app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }
  
  const todo = {
    id: nextId++,
    task,
    completed: false,
    createdAt: new Date()
  };
  
  todos.push(todo);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { task, completed } = req.body;
  
  const todoIndex = todos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  if (task !== undefined) todos[todoIndex].task = task;
  if (completed !== undefined) todos[todoIndex].completed = completed;
  
  res.json(todos[todoIndex]);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todos.splice(todoIndex, 1);
  res.status(204).send();
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

if (process.env.NODE_ENV !== 'check') {
  app.listen(PORT, () => {
    console.log(`Todo API Server running on port ${PORT}`);
  });
}

module.exports = app;