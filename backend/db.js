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
const addInstance = async (instanceData) => await db.collection('instances').insertOne(instanceData);
const updateInstance = async (instanceId, updates) => {
    if (!ObjectId.isValid(instanceId)) return null;
    return await db.collection('instances').updateOne({ _id: new ObjectId(instanceId) }, { $set: updates });
};
const getInstanceById = async (instanceId) => {
    if (!ObjectId.isValid(instanceId)) return null;
    return await db.collection('instances').findOne({ _id: new ObjectId(instanceId) });
};
const getInstancesByOwner = async (ownerId) => await db.collection('instances').find({ ownerId: ownerId }).toArray();

// --- Funções de Serviços (Fluxos de Conversa) ---
const getServicesByOwner = async (ownerId) => await db.collection('services').find({ ownerId: ownerId }).toArray();
const getServiceById = async (serviceId) => {
    if (!ObjectId.isValid(serviceId)) return null;
    return await db.collection('services').findOne({ _id: new ObjectId(serviceId) });
};
const addService = async (serviceData) => await db.collection('services').insertOne(serviceData);
const updateService = async (serviceId, updates) => {
    if (!ObjectId.isValid(serviceId)) return null;
    delete updates._id;
    return await db.collection('services').updateOne({ _id: new ObjectId(serviceId) }, { $set: updates });
};
const deleteService = async (serviceId) => {
    if (!ObjectId.isValid(serviceId)) return null;
    return await db.collection('services').deleteOne({ _id: new ObjectId(serviceId) });
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
    getServiceById,
    addService,
    updateService,
    deleteService,
};

