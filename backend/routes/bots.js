const express = require('express');
const router = express.Router();
const Bot = require('../models/Bot');
const Message = require('../models/Message');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const clients = new Map();

// Criar bot e gerar QR code
router.get('/connect/:userId', async (req, res) => {
  const { userId } = req.params;

  if (clients.has(userId) && clients.get(userId).status === 'connected') {
    return res.json({ message: 'WhatsApp já conectado' });
  }

  const client = new Client({ puppeteer: { headless: true } });
  clients.set(userId, { client, status: 'connecting' });

  client.on('qr', qr => {
    qrcode.toDataURL(qr).then(url => res.json({ qr: url }));
  });

  client.on('ready', async () => {
    clients.get(userId).status = 'connected';
    let bot = await Bot.findOne({ userId });
    if (!bot) bot = await Bot.create({ userId, status: 'connected' });
    else bot.status = 'connected';
    await bot.save();
    console.log(`WhatsApp do usuário ${userId} conectado!`);
  });

  client.on('message', async msg => {
    const bot = await Bot.findOne({ userId });
    if (!bot) return;
    await Message.create({ botId: bot._id, from: msg.from, to: msg.to, body: msg.body, direction: 'received' });
  });

  client.initialize();
});

// Enviar mensagem
router.post('/send-message/:userId', async (req, res) => {
  const { userId } = req.params;
  const { number, message } = req.body;

  const clientObj = clients.get(userId);
  if (!clientObj || clientObj.status !== 'connected') return res.status(400).json({ error: 'WhatsApp não conectado' });

  const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
  await clientObj.client.sendMessage(chatId, message);

  const bot = await Bot.findOne({ userId });
  if (bot) await Message.create({ botId: bot._id, from: 'bot', to: number, body: message, direction: 'sent' });

  res.json({ message: 'Mensagem enviada com sucesso!' });
});

// Listar mensagens do bot
router.get('/messages/:userId', async (req, res) => {
  const bot = await Bot.findOne({ userId: req.params.userId });
  if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });

  const messages = await Message.find({ botId: bot._id }).sort({ timestamp: 1 });
  res.json(messages);
});

module.exports = router;
