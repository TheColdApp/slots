const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./leaderboard.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      username TEXT PRIMARY KEY,
      coins INTEGER
    )
  `);
});

app.post('/submit', (req, res) => {
  const { username, coins } = req.body;
  db.run(
    `INSERT INTO leaderboard (username, coins) VALUES (?, ?)
     ON CONFLICT(username) DO UPDATE SET coins=excluded.coins WHERE excluded.coins > leaderboard.coins`,
    [username, coins],
    err => {
      if (err) return res.status(500).send("DB error");
      res.send("Score submitted");
    }
  );
});

app.get('/leaderboard', (req, res) => {
  db.all(`SELECT username, coins FROM leaderboard ORDER BY coins DESC LIMIT 5`, [], (err, rows) => {
    if (err) return res.status(500).send("DB error");
    res.json(rows);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
