const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/botdplay';

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Conexão MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro MongoDB:', err));

// Model básico de usuário
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  admin: Boolean
});
const User = mongoose.model('User', UserSchema);

// Rotas básicas
app.get('/api/account', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
});

// Exemplo Puppeteer
app.get('/api/screenshot', async (req, res) => {
  try {
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.goto('https://example.com');
    const screenshot = await page.screenshot({ encoding: 'base64' });
    await browser.close();
    res.json({ success: true, screenshot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erro Puppeteer' });
  }
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
