const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const db = require('./db');
const puppeteer = require('puppeteer');

// Define o diretório das sessões. Em produção, usará o Disco Persistente do Render em /data
const SESSIONS_DIR = process.env.NODE_ENV === 'production' ? '/data/wwebjs_auth' : path.join(__dirname, '.wwebjs_auth');

class BotInstance {
    constructor(instanceConfig, io) {
        this.instanceId = instanceConfig.id;
        this.ownerId = instanceConfig.ownerId;
        this.instanceName = instanceConfig.name;
        this.client = null;
        this.io = io; // Canal de comunicação em tempo real com o frontend
    }

    // Função para enviar eventos para o frontend via Socket.IO
    emitSocket(event, data) {
        if (this.io) {
            // Garante que a mensagem seja enviada apenas para o dono da instância
            this.io.to(this.ownerId).emit(event, { instanceId: this.instanceId, ...data });
        }
    }

    async initialize() {
        console.log(`[BotInstance] Inicializando instância ${this.instanceName} (${this.instanceId})...`);

        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();

        this.client = new Client({
            authStrategy: new LocalAuth({ clientId: `instance-${this.instanceId}`, dataPath: SESSIONS_DIR }),
            puppeteer: {
                headless: true,
                executablePath: executablePath,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
            }
        });

        // Evento: Gerou um QR Code
        this.client.on('qr', async (qr) => {
            console.log(`[BotInstance] QR Code gerado para ${this.instanceName}`);
            await db.updateInstance(this.instanceId, { status: 'pending_qr', qrCode: qr });
            this.emitSocket('qr_code', { qr });
        });

        // Evento: Cliente conectado e pronto
        this.client.on('ready', async () => {
            console.log(`[BotInstance] Cliente ${this.instanceName} está pronto!`);
            const botNumber = this.client.info.wid.user;
            await db.updateInstance(this.instanceId, { status: 'online', qrCode: null, whatsappNumber: botNumber });
            this.emitSocket('status_change', { status: 'online', whatsappNumber: botNumber });
        });
        
        // Evento: Cliente foi desconectado
        this.client.on('disconnected', async (reason) => {
            console.log(`[BotInstance] Cliente ${this.instanceName} foi desconectado. Razão:`, reason);
            await db.updateInstance(this.instanceId, { status: 'offline', qrCode: null });
            this.emitSocket('status_change', { status: 'offline' });
        });
        
        // Evento: Recebeu uma mensagem
        this.client.on('message', message => {
            // AQUI ENTRARÁ TODA A LÓGICA DE RESPOSTA DO SEU BOT
            console.log(`[BotInstance] Mensagem recebida de ${message.from}: ${message.body}`);
            if (message.body === '!ping') {
                message.reply('pong');
            }
        });

        await this.client.initialize();
    }

    // Função para parar o bot e fazer logout
    async stop() {
        if (this.client) {
            await this.client.destroy(); // Usa destroy() para garantir o encerramento
            this.client = null;
            console.log(`[BotInstance] Instância ${this.instanceName} parada.`);
        }
    }
}

module.exports = BotInstance;
