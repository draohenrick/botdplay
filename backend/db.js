const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('A variável de ambiente MONGODB_URI não está definida.');
}

const client = new MongoClient(MONGODB_URI);
let db;

const connectToDatabase = async () => {
    try {
        await client.connect();
        db = client.db();
        console.log("✅ Conectado ao MongoDB Atlas com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao conectar ao MongoDB Atlas:", error);
        process.exit(1);
    }
};

// --- Funções de Usuários ---
const getUserByEmail = async (email) => await db.collection('users').findOne({ email });
const addUser = async (userData) => await db.collection('users').insertOne(userData);
const getUserById = async (id) => {
    if (!ObjectId.isValid(id)) return null;
    return await db.collection('users').findOne({ _id: new ObjectId(id) });
};

// --- Funções de Instâncias ---
const addInstance = async (instanceData) => {
    return await db.collection('instances').insertOne(instanceData);
};
const updateInstance = async (instanceId, updates) => {
    if (!ObjectId.isValid(instanceId)) return null;
    return await db.collection('instances').updateOne(
        { _id: new ObjectId(instanceId) },
        { $set: updates }
    );
};
const getInstanceById = async (instanceId) => {
    if (!ObjectId.isValid(instanceId)) return null;
    return await db.collection('instances').findOne({ _id: new ObjectId(instanceId) });
};
const getInstancesByOwner = async (ownerId) => {
    return await db.collection('instances').find({ ownerId: ownerId }).toArray();
};

// --- Funções de Serviços (Fluxos de Conversa) ---
const getServicesByOwner = async (ownerId) => {
    return await db.collection('services').find({ ownerId: ownerId }).toArray();
};

// Exporta todas as funções
module.exports = {
    connectToDatabase,
    getUserByEmail,
    addUser,
    getUserById,
    addInstance,
    updateInstance,
    getInstanceById,
    getInstancesByOwner,
    getServicesByOwner,
};

