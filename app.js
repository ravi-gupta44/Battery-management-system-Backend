const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(morgan('dev'));
require('dotenv').config(); 
// sql connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});


// Root Route
app.get('/', (req, res) => {
  res.send('Battery Management API is running on MySQL!');
});


app.post('/api/battery/data', (req, res) => {
  const { battery_id, current, voltage, temperature, time } = req.body;

  // Convert ISO string to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
  const formattedTime = new Date(time).toISOString().slice(0, 19).replace('T', ' ');

  const sql = `
    INSERT INTO battery_data (battery_id, current, voltage, temperature, time)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [battery_id, current, voltage, temperature, formattedTime], (err) => {
    if (err) {
     
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(201).json({ message: 'Data stored successfully' });
  });
});

// GET /api/battery/:id
app.get('/api/battery/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM battery_data WHERE battery_id = ? ORDER BY time', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// GET /api/battery/:id/:field
app.get('/api/battery/:id/:field', (req, res) => {
  const { id, field } = req.params;
  const { start, end } = req.query;
  const allowedFields = ['current', 'voltage', 'temperature'];

  if (!allowedFields.includes(field)) return res.status(400).json({ error: 'Invalid field' });

  let query = `SELECT time, ?? FROM battery_data WHERE battery_id = ?`;
  const params = [field, id];

  if (start && end) {
    query += ` AND time BETWEEN ? AND ? ORDER BY time`;
    params.push(start, end);
  } else {
    query += ` ORDER BY time`;
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
