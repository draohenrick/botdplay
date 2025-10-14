/**
 * DPLAY BOT SERVER - API Principal do SaaS
 * Estrutura robusta com autenticação JWT, multiusuário e painel admin.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "dplay_secret_key";

const DATA_DIR = process.env.NODE_ENV === "production" ? "/data" : __dirname;
const DB_FILE = path.join(DATA_DIR, "db.json");

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ======= Funções Utilitárias =======
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], bots: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "7d" });
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token ausente" });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ error: "Token inválido" });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Acesso negado" });
  next();
}

// ======= ROTAS DE AUTENTICAÇÃO =======
app.post("/api/register", (req, res) => {
  const db = loadDB();
  const { name, email, password } = req.body;

  if (db.users.find((u) => u.email === email)) {
    return res.status(400).json({ error: "E-mail já cadastrado" });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    role: "user",
    status: "active",
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDB(db);

  res.json({ message: "Conta criada com sucesso!" });
});

app.post("/api/login", (req, res) => {
  const db = loadDB();
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email === email && u.password === password);

  if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
  if (user.status === "banned") return res.status(403).json({ error: "Conta banida" });

  const token = generateToken(user);
  res.json({ token, role: user.role, name: user.name });
});

app.post("/api/admin/login", (req, res) => {
  const db = loadDB();
  const { email, password } = req.body;
  const admin = db.users.find((u) => u.email === email && u.password === password && u.role === "admin");

  if (!admin) return res.status(401).json({ error: "Credenciais inválidas" });

  const token = generateToken(admin);
  res.json({ token, role: admin.role, name: admin.name });
});

// ======= ROTAS DE USUÁRIO =======
app.get("/api/account", authMiddleware, (req, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json(user);
});

// ======= ROTAS ADMIN =======
app.get("/api/admin/users", authMiddleware, adminMiddleware, (req, res) => {
  const db = loadDB();
  res.json(db.users);
});

app.post("/api/admin/ban/:id", authMiddleware, adminMiddleware, (req, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  user.status = "banned";
  saveDB(db);
  res.json({ message: `${user.name} foi banido.` });
});

app.post("/api/admin/unban/:id", authMiddleware, adminMiddleware, (req, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  user.status = "active";
  saveDB(db);
  res.json({ message: `${user.name} foi reativado.` });
});

// ======= TESTE DE STATUS =======
app.get("/", (req, res) => {
  res.send("✅ DPLAY BOT SERVER rodando com sucesso!");
});

// ======= INICIALIZAÇÃO =======
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
