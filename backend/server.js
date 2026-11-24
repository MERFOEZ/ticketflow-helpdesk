const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = 5080;
const JWT_SECRET = 'my_secret_key_for_helpdesk_123';

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// ---------- Database (SQLite - 2 tables: Users, Tickets) ----------
const db = new DatabaseSync('helpdesk.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    reply TEXT,
    createdAt TEXT NOT NULL,
    userId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id)
  );
`);

// Create default Admin account if not exists
const adminExists = db.prepare('SELECT id FROM Users WHERE role = ?').get('Admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('123456', 10);
  db.prepare('INSERT INTO Users (fullName, email, passwordHash, role) VALUES (?, ?, ?, ?)')
    .run('IT Support', 'admin@test.com', hash, 'Admin');
}

// ---------- JWT Middleware ----------
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function createToken(user) {
  return jwt.sign(
    { id: user.id, name: user.fullName, role: user.role },
    JWT_SECRET,
    { expiresIn: '3h' }
  );
}

// ---------- Auth Routes ----------
app.post('/api/auth/register', (req, res) => {
  const { fullName, email, password } = req.body;

  const existing = db.prepare('SELECT id FROM Users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO Users (fullName, email, passwordHash, role) VALUES (?, ?, ?, ?)'
  ).run(fullName, email, hash, 'User');

  const user = { id: Number(result.lastInsertRowid), fullName, role: 'User' };
  res.json({ token: createToken(user), role: user.role, name: user.fullName });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM Users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Wrong email or password' });
  }

  res.json({ token: createToken(user), role: user.role, name: user.fullName });
});

// ---------- Ticket Routes ----------
// Admin sees all tickets, User sees only his tickets
app.get('/api/tickets', authMiddleware, (req, res) => {
  let tickets;

  if (req.user.role === 'Admin') {
    tickets = db.prepare(`
      SELECT t.id, t.title, t.description, t.priority, t.status, t.reply, t.createdAt, u.fullName AS userName
      FROM Tickets t
      JOIN Users u ON t.userId = u.id
      ORDER BY t.id DESC
    `).all();
  } else {
    tickets = db.prepare(`
      SELECT t.id, t.title, t.description, t.priority, t.status, t.reply, t.createdAt, u.fullName AS userName
      FROM Tickets t
      JOIN Users u ON t.userId = u.id
      WHERE t.userId = ?
      ORDER BY t.id DESC
    `).all(req.user.id);
  }

  res.json(tickets);
});

app.post('/api/tickets', authMiddleware, (req, res) => {
  if (req.user.role !== 'User') {
    return res.status(403).json({ message: 'Only employees can create tickets' });
  }

  const { title, description, priority } = req.body;
  const result = db.prepare(`
    INSERT INTO Tickets (title, description, priority, status, reply, createdAt, userId)
    VALUES (?, ?, ?, 'Open', '', ?, ?)
  `).run(title, description, priority, new Date().toISOString(), req.user.id);

  res.json({ id: Number(result.lastInsertRowid) });
});

app.put('/api/tickets/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  const { status, reply } = req.body;
  const result = db.prepare('UPDATE Tickets SET status = ?, reply = ? WHERE id = ?')
    .run(status, reply || '', req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  res.json({ message: 'Updated' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
