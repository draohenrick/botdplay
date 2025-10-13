const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const db = require('./db');
const puppeteer = require('puppeteer'); // Importa o puppeteer

const SESSIONS_DIR = process.env.NODE_ENV === 'production' ? '/data/wwebjs_auth' : path.join(__dirname, '.wwebjs_auth');

class BotInstance {
    constructor(instanceConfig, io) {
        this.instanceId = instanceConfig.id;
        this.ownerId = instanceConfig.ownerId;
        this.humanNumber = instanceConfig.humanAttendantNumber;
        this.instanceName = instanceConfig.name;
        this.services = db.getServices().filter(s => s.ownerId === this.ownerId);
        this.client = null;
        this.io = io;
    }

    emitSocket(event, data) {
        if (this.io) this.io.emit(event, { instanceId: this.instanceId, ...data });
    }

    async initialize() {
        // CORREÇÃO: Usa um caminho de executável explícito para robustez no deploy
        const executablePath = process.env.NODE_ENV === 'production' 
            ? process.env.PUPPETEER_EXECUTABLE_PATH 
            : puppeteer.executablePath();

        this.client = new Client({
            authStrategy: new LocalAuth({ clientId: `instance-${this.instanceId}`, dataPath: SESSIONS_DIR }),
            puppeteer: {
                headless: true,
                executablePath: executablePath,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
            }
        });

        this.client.on('qr', (qr) => {
            db.updateInstance(this.instanceId, { status: 'pending_qr', qrCode: qr, whatsappNumber: null });
            this.emitSocket('status_change', { status: 'pending_qr', qrCode: qr });
        });

        this.client.on('ready', () => {
            const botNumber = this.client.info.wid.user;
            db.updateInstance(this.instanceId, { status: 'online', qrCode: null, whatsappNumber: botNumber });
            this.emitSocket('status_change', { status: 'online', whatsappNumber: botNumber });
        });

        // ... (o restante dos eventos e o messageHandler continuam os mesmos)
    }

    // NOVA FUNÇÃO para deslogar remotamente
    async logout() {
        if (this.client) {
            await this.client.logout();
            // A biblioteca automaticamente dispara o evento 'disconnected' que já limpa a sessão
        }
    }
    
    // ... (o resto do arquivo)
}

module.exports = BotInstance;
