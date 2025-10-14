// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Diretório do banco de dados JSON
const DATA_DIR = __dirname;
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: 'https://chatbotdplay.netlify.app', // libera apenas o frontend
  credentials: true
}));

// Função para ler o DB
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], admins: [] }, null, 2));
  }
  const data = fs.readFileSync(DB_FILE);
  return JSON.parse(data);
}

// Função para salvar o DB
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ------------------------- ROTAS -------------------------

// Login usuário normal
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

  const token = jwt.sign({ email: user.email }, 'SECRET_KEY', { expiresIn: '1d' });
  res.json({ success: true, token, user });
});

// Login admin
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const admin = db.admins.find(a => a.email === email && a.password === password);

  if (!admin) return res.status(401).json({ error: 'Admin ou senha inválidos' });

  const token = jwt.sign({ email: admin.email, admin: true }, 'SECRET_KEY', { expiresIn: '1d' });
  res.json({ success: true, token, admin });
});

// Dados do usuário logado
app.get('/api/account', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// --------------------- START ---------------------
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
