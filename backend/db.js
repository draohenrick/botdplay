const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : __dirname;
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (process.env.NODE_ENV === 'production' && !fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const readDB = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            const initialData = { users: [], instances: [], leads: [], chatStates: {}, services: [] };
            fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
            return initialData;
        }
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (error) {
        console.error("ERRO CRÍTICO AO LER DB:", error);
        return { users: [], instances: [], leads: [], chatStates: {}, services: [] };
    }
};

const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("ERRO CRÍTICO AO ESCREVER NO DB:", error);
    }
};

const getUsers = () => readDB().users;
const saveUsers = (users) => {
    const db = readDB();
    db.users = users;
    writeDB(db);
};
const addUser = (userData) => {
    const db = readDB();
    const newUser = {
        id: (db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) : 0) + 1,
        ...userData
    };
    db.users.push(newUser);
    writeDB(db);
    return newUser;
};
const updateUser = (id, updates) => {
    const db = readDB();
    const index = db.users.findIndex(u => u.id === id);
    if (index !== -1) {
        db.users[index] = { ...db.users[index], ...updates };
        writeDB(db);
        return db.users[index];
    }
    return null;
};
const deleteUser = (id) => {
    const db = readDB();
    const initialLength = db.users.length;
    db.users = db.users.filter(u => u.id !== id);
    if (db.users.length < initialLength) {
        writeDB(db);
        return true;
    }
    return false;
};

const getInstances = () => readDB().instances;
const getInstanceById = (id) => readDB().instances.find(inst => inst.id === id);
const saveInstances = (instances) => {
    const db = readDB();
    db.instances = instances;
    writeDB(db);
};
const updateInstance = (id, updates) => {
    const db = readDB();
    const index = db.instances.findIndex(inst => inst.id === id);
    if (index !== -1) {
        db.instances[index] = { ...db.instances[index], ...updates };
        writeDB(db);
        return db.instances[index];
    }
    return null;
};

const getLeads = () => readDB().leads;
const createLead = (leadData) => {
    const db = readDB();
    const newLead = { 
        id: (db.leads.length > 0 ? Math.max(...db.leads.map(l => l.id)) : 0) + 1,
        ...leadData,
        timestamp: new Date().toISOString()
    };
    db.leads.push(newLead);
    writeDB(db);
    return newLead;
};

const getServices = () => readDB().services;
const saveServices = (services) => {
    const db = readDB();
    db.services = services;
    writeDB(db);
};
const addService = (serviceData) => {
    const db = readDB();
    const newService = {
        id: (db.services.length > 0 ? Math.max(...db.services.map(s => s.id)) : 0) + 1,
        ...serviceData
    };
    db.services.push(newService);
    writeDB(db);
    return newService;
};
const updateService = (id, serviceData) => {
    const db = readDB();
    const index = db.services.findIndex(s => s.id === id);
    if (index !== -1) {
        db.services[index] = { ...db.services[index], ...serviceData };
        writeDB(db);
        return db.services[index];
    }
    return null;
};
const deleteService = (id) => {
    let services = readDB().services;
    const newServices = services.filter(s => s.id !== id);
    if (services.length === newServices.length) return false;
    saveServices(newServices);
    return true;
};

const getChatState = (chatId, instanceId) => {
    const db = readDB();
    const key = `${instanceId}_${chatId}`;
    return db.chatStates[key] || { saudado: false, mode: 'initial', data: {}, etapa: 0 };
};
const saveChatState = (chatId, instanceId, state) => {
    const db = readDB();
    const key = `${instanceId}_${chatId}`;
    db.chatStates[key] = state;
    writeDB(db);
};
const resetChatState = (chatId, instanceId, keepSaudado = false) => {
    const db = readDB();
    const key = `${instanceId}_${chatId}`;
    const oldState = db.chatStates[key] || {};
    db.chatStates[key] = { 
        saudado: keepSaudado ? oldState.saudado : false,
        mode: 'initial', data: {}, etapa: 0 
    };
    writeDB(db);
};

module.exports = {
    getUsers, 
    saveUsers,
    addUser,
    updateUser,
    deleteUser,
    getInstances, 
    getInstanceById, 
    saveInstances, 
    updateInstance,
    getLeads, 
    createLead,
    getServices, 
    saveServices,
    addService,
    updateService,
    deleteService,
    getChatState, 
    saveChatState, 
    resetChatState
};
