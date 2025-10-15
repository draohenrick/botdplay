const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const db = require('./db');
const puppeteer = require('puppeteer');

const SESSIONS_DIR = process.env.NODE_ENV === 'production' ? '/data/wwebjs_auth' : path.join(__dirname, '.wwebjs_auth');
const INACTIVITY_MS = 300000; // 5 minutos
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
        this.services = {}; // Armazenará os serviços carregados do DB
        this.chatStates = new Map(); // Memória de conversa isolada
    }

    // Função para enviar eventos para o frontend via Socket.IO
    emitSocket(event, data) {
        if (this.io) {
            // Garante que a mensagem seja enviada apenas para o dono da instância
            this.io.to(this.ownerId).emit(event, { instanceId: this.instanceId, ...data });
        }
    }
    
    // Carrega os serviços específicos deste usuário do banco de dados
    async loadServicesFromDB() {
        const servicesFromDB = await db.getServicesByOwner(this.ownerId);
        this.services = servicesFromDB.reduce((acc, service) => {
            acc[service._id.toString()] = service;
            return acc;
        }, {});
        console.log(`[${this.instanceName}] Serviços do usuário carregados: ${Object.keys(this.services).length}`);
    }

    // Lógica principal de tratamento de mensagens (adaptada do seu bot original)
    async messageHandler(msg) {
        const chat = await msg.getChat();
        if (chat.isGroup) return;

        console.log(`[${this.instanceName}] Mensagem recebida de ${msg.from}: ${msg.body}`);
        
        // Exemplo simples de interação:
        if (msg.body.toLowerCase() === 'menu') {
            let menu = 'Olá! Por favor, escolha uma das opções abaixo:\n\n';
            Object.values(this.services).forEach((s, i) => {
                menu += `${i + 1}. ${s.label || s.name}\n`;
            });
            await msg.reply(menu || 'Nenhum serviço configurado. Digite algo para falar com um atendente.');
        } else {
            // Lógica de resposta padrão (pode ser aprimorada depois)
            await msg.reply('Obrigado pela sua mensagem! Digite "menu" para ver as opções.');
        }
    }


    async initialize() {
        console.log(`[BotInstance] Inicializando ${this.instanceName}...`);
        
        // Carrega os fluxos de conversa antes de iniciar o bot
        await this.loadServicesFromDB();

        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();

        this.client = new Client({
            authStrategy: new LocalAuth({ clientId: `instance-${this.instanceId}`, dataPath: SESSIONS_DIR }),
            puppeteer: {
                headless: true,
                executablePath,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
            }
        });

        this.client.on('qr', (qr) => {
            console.log(`[${this.instanceName}] QR Code gerado.`);
            this.emitSocket('qr_code', { qr });
        });

        this.client.on('ready', async () => {
            console.log(`[${this.instanceName}] Cliente pronto!`);
            await db.updateInstance(this.instanceId, { status: 'online' });
            this.emitSocket('status_change', { status: 'online', instanceName: this.instanceName });
        });

        this.client.on('disconnected', async (reason) => {
            console.log(`[${this.instanceName}] Desconectado:`, reason);
            await db.updateInstance(this.instanceId, { status: 'offline' });
            this.emitSocket('status_change', { status: 'offline', instanceName: this.instanceName });
        });

        this.client.on('message', this.messageHandler.bind(this));

        await this.client.initialize();
    }

    async stop() {
        if (this.client) {
            await this.client.destroy();
            this.client = null;
        }
    }
}

module.exports = BotInstance;


class BotInstance {
    constructor(instanceConfig, io) {
        this.instanceId = instanceConfig.id;
        this.ownerId = instanceConfig.ownerId;
        this.instanceName = instanceConfig.name;
        this.humanNumber = instanceConfig.humanNumber; // Número do atendente
        this.client = null;
        this.io = io;
        
        // Memória e configurações isoladas para esta instância
        this.services = {};
        this.chatStates = new Map();
    }

    emitSocket(event, data) {
        if (this.io) {
            this.io.to(this.ownerId).emit(event, { instanceId: this.instanceId, ...data });
        }
    }

    // Carrega os serviços do DB
    async loadServicesFromDB() {
        const servicesFromDB = await db.getServicesByOwner(this.ownerId);
        // Transforma o array em um objeto para fácil acesso, como era no servicos.json
        this.services = servicesFromDB.reduce((acc, service) => {
            acc[service.id || service._id.toString()] = service;
            return acc;
        }, {});
    }

    // --- Início da Lógica do Bot (adaptada do seu index.js) ---

    ensureState(chatId) {
        if (!this.chatStates.has(chatId)) {
            this.chatStates.set(chatId, {
                saudado: false, mode: null, data: {}, etapa: 0, inactivityTimer: null
            });
        }
        return this.chatStates.get(chatId);
    }

    resetState(state, keepSaudado = false) {
        if (state.inactivityTimer) clearTimeout(state.inactivityTimer);
        const wasGreeted = keepSaudado ? state.saudado : false;
        // Limpa o estado
        this.chatStates.set(state.chatId, {
            saudado: wasGreeted, mode: null, data: {}, etapa: 0
        });
    }

    scheduleInactivity(chat, chatId) {
        const state = this.ensureState(chatId);
        if (state.inactivityTimer) clearTimeout(state.inactivityTimer);

        state.inactivityTimer = setTimeout(() => {
            if (state.mode) {
                chat.sendMessage('🔒 Atendimento encerrado por inatividade. Digite *menu* para reiniciar.').catch(() => {});
                this.resetState(state);
            }
        }, INACTIVITY_MS);
    }

    parseMenuSelection(rawBody) {
        const lowerBody = rawBody.toLowerCase();
        for (const key in this.services) {
            const service = this.services[key];
            if (service.label.toLowerCase() === lowerBody) return { key, ...service };
            if (service.keywords?.some(k => lowerBody.includes(k))) return { key, ...service };
        }
        return null;
    }

    async sendMenu(chat) {
        let menuMsg = 'Por favor, escolha uma das opções abaixo:\n\n';
        Object.values(this.services).forEach((service, index) => {
             menuMsg += `${index + 1}️⃣ *${service.label}*\n`;
        });
        menuMsg += '\n_Se o que você procura não está na lista, basta digitar o que precisa._';
        await chat.sendMessage(menuMsg);
    }

    async transferToHuman(chat, state, contactName, reason) {
        // ... (a lógica de transferToHuman do seu index.js viria aqui)
        await chat.sendMessage(`Ok! Um de nossos consultores falará com você em breve sobre *${reason}*.`);
        this.resetState(state, true);
    }

    async messageHandler(msg) {
        const chat = await msg.getChat();
        if (chat.isGroup) return;
        
        const contact = await msg.getContact();
        const contactName = contact.pushname || contact.name;
        const chatId = chat.id._serialized;
        
        const state = this.ensureState(chatId);
        state.chatId = chatId; // Armazena o ID no estado para resetar
        this.scheduleInactivity(chat, chatId);

        const rawBody = (msg.body || '').trim();
        const lowerBody = rawBody.toLowerCase();

        if (lowerBody === 'menu') {
            this.resetState(state, true);
            state.mode = 'menu_principal';
            await this.sendMenu(chat);
            return;
        }

        // Lógica de saudação inicial
        if (!state.saudado) {
            state.saudado = true;
            state.mode = 'menu_principal';
            const saudacao = new Date().getHours() < 12 ? 'Bom dia' : 'Boa tarde';
            await chat.sendMessage(`${saudacao}, ${contactName.split(' ')[0]}! 😊\nComo posso te ajudar?`);
            await this.sendMenu(chat);
            return;
        }

        // Lógica de seleção de menu
        const selection = this.parseMenuSelection(rawBody);
        if (selection) {
            // ... (aqui entraria a lógica de briefing, ações, etc., do seu index.js)
            await chat.sendMessage(`Você selecionou: *${selection.label}*.`);
            await this.transferToHuman(chat, state, contactName, selection.label);
        } else {
            // Se não entende, transfere para humano
            await this.transferToHuman(chat, state, contactName, rawBody);
        }
    }

    // --- Fim da Lógica do Bot ---

    async initialize() {
        console.log(`[BotInstance] Inicializando instância ${this.instanceName}...`);
        
        // Carrega os serviços deste usuário do banco de dados
        await this.loadServicesFromDB();

        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();

        this.client = new Client({
            authStrategy: new LocalAuth({ clientId: `instance-${this.instanceId}`, dataPath: SESSIONS_DIR }),
            puppeteer: {
                headless: true,
                executablePath: executablePath,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        this.client.on('qr', (qr) => {
            this.emitSocket('qr_code', { qr });
        });

        this.client.on('ready', () => {
            this.emitSocket('status_change', { status: 'online' });
        });

        this.client.on('disconnected', () => {
            this.emitSocket('status_change', { status: 'offline' });
        });

        // Conecta o handler de mensagens
        this.client.on('message', this.messageHandler.bind(this));

        await this.client.initialize();
    }

    async stop() {
        if (this.client) {
            await this.client.destroy();
            this.client = null;
        }
    }
}

module.exports = BotInstance;
