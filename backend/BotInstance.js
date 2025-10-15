const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const db = require('./db');

// Define o diretório das sessões. Em produção, usará o Disco Persistente do Render em /data.
// Na imagem do Puppeteer, o diretório home do usuário é /home/pptruser.
const SESSIONS_DIR = process.env.NODE_ENV === 'production' ? '/data/wwebjs_auth' : path.join(__dirname, '.wwebjs_auth');
const INACTIVITY_MS = 300000; // 5 minutos

class BotInstance {
    constructor(instanceConfig, io) {
        this.instanceId = instanceConfig.id;
        this.ownerId = instanceConfig.ownerId;
        this.instanceName = instanceConfig.name;
        this.humanNumber = instanceConfig.humanNumber; // Número do atendente humano
        this.client = null;
        this.io = io;
        
        // Memória e configurações isoladas para esta instância
        this.services = {};
        this.chatStates = new Map();
    }

    emitSocket(event, data) {
        if (this.io) {
            // Envia o evento apenas para a "sala" do usuário dono da instância
            this.io.to(this.ownerId).emit(event, { instanceId: this.instanceId, ...data });
        }
    }

    async loadServicesFromDB() {
        const servicesFromDB = await db.getServicesByOwner(this.ownerId);
        this.services = servicesFromDB.reduce((acc, service, index) => {
            // Usa o ID do DB como chave, mas também um número sequencial para o menu
            acc[index + 1] = { ...service, db_id: service._id.toString() };
            return acc;
        }, {});
        console.log(`[BotInstance ${this.instanceName}] Serviços carregados do DB:`, Object.keys(this.services).length);
    }

    // --- Início da Lógica de Conversa (adaptada do seu bot original) ---

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
        // Reinicia o estado da conversa para o chatId específico
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
        // Tenta encontrar por número
        const numericMatch = lowerBody.match(/^\d+/);
        if (numericMatch && this.services[numericMatch[0]]) {
            return this.services[numericMatch[0]];
        }
        // Tenta encontrar por palavra-chave
        for (const key in this.services) {
            const service = this.services[key];
            if (service.keywords?.some(k => lowerBody.includes(k))) {
                return service;
            }
        }
        return null;
    }

    async sendMenu(chat) {
        let menuMsg = 'Por favor, escolha uma das opções abaixo digitando o número correspondente:\n\n';
        for (const key in this.services) {
             menuMsg += `${key}️⃣ *${this.services[key].label}*\n`;
        }
        menuMsg += '\n_Se o que você procura não está na lista, basta digitar o que precisa._';
        await chat.sendMessage(menuMsg);
    }

    async transferToHuman(chat, state, contactName, reason) {
        await chat.sendMessage(`Ok! Um de nossos consultores falará com você em breve sobre *${reason}*. Por favor, aguarde.`);
        // Lógica para notificar o atendente humano (ex: enviar mensagem para this.humanNumber)
        this.resetState(state, true);
    }

    async messageHandler(msg) {
        const chat = await msg.getChat();
        if (chat.isGroup) return;
        
        const contact = await msg.getContact();
        const contactName = contact.pushname || contact.name;
        const chatId = chat.id._serialized;
        
        const state = this.ensureState(chatId);
        state.chatId = chatId; // Armazena o ID no estado para facilitar o reset
        this.scheduleInactivity(chat, chatId);

        const rawBody = (msg.body || '').trim();
        const lowerBody = rawBody.toLowerCase();

        if (lowerBody === 'menu') {
            this.resetState(state, true);
            state.mode = 'menu_principal';
            await this.sendMenu(chat);
            return;
        }

        if (!state.saudado) {
            state.saudado = true;
            state.mode = 'menu_principal';
            const saudacao = new Date().getHours() < 12 ? 'Bom dia' : 'Boa tarde';
            await chat.sendMessage(`${saudacao}, ${contactName.split(' ')[0]}! 😊\nSou o assistente virtual. Como posso te ajudar?`);
            await this.sendMenu(chat);
            return;
        }

        const selection = this.parseMenuSelection(rawBody);
        if (selection) {
            // Lógica para lidar com a seleção (briefing, ações, etc.)
            await chat.sendMessage(`Você selecionou: *${selection.label}*.\n${selection.description}`);
            // Por enquanto, transfere para o humano
            await this.transferToHuman(chat, state, contactName, selection.label);
        } else {
            // Se não entende, transfere para humano
            await this.transferToHuman(chat, state, contactName, `"${rawBody}"`);
        }
    }

    // --- Fim da Lógica de Conversa ---

    async initialize() {
        console.log(`[BotInstance] Inicializando instância ${this.instanceName}...`);
        
        // Carrega os serviços deste usuário do banco de dados
        await this.loadServicesFromDB();

        // Com a imagem Docker do Puppeteer, não precisamos mais especificar o 'executablePath'
        this.client = new Client({
            authStrategy: new LocalAuth({ clientId: `instance-${this.instanceId}`, dataPath: SESSIONS_DIR }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        this.client.on('qr', (qr) => {
            console.log(`[BotInstance] QR Code gerado para ${this.instanceName}`);
            this.emitSocket('qr_code', { qr });
        });

        this.client.on('ready', async () => {
            console.log(`[BotInstance] Cliente ${this.instanceName} está pronto!`);
            const botNumber = this.client.info.wid.user;
            await db.updateInstance(this.instanceId, { status: 'online', qrCode: null, whatsappNumber: botNumber });
            this.emitSocket('status_change', { status: 'online', instanceName: this.instanceName });
        });

        this.client.on('disconnected', async (reason) => {
            console.log(`[BotInstance] Cliente ${this.instanceName} foi desconectado.`, reason);
            await db.updateInstance(this.instanceId, { status: 'offline', qrCode: null });
            this.emitSocket('status_change', { status: 'offline', instanceName: this.instanceName });
        });

        // Conecta o handler de mensagens à instância
        this.client.on('message', this.messageHandler.bind(this));

        await this.client.initialize();
    }

    async stop() {
        if (this.client) {
            await this.client.destroy();
            this.client = null;
            console.log(`[BotInstance] Instância ${this.instanceName} parada.`);
        }
    }
}

module.exports = BotInstance;

