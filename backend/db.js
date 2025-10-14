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
const addUser = async (userData) => { /* ...código existente... */ };

// --- Funções de Instâncias ---
const addInstance = async (instanceData) => { /* ...código existente... */ };
// ...etc

// --- NOVAS FUNÇÕES DE SERVIÇOS ---
const getServicesByOwner = async (ownerId) => {
    return await db.collection('services').find({ ownerId: ownerId }).toArray();
};
const getServiceById = async (serviceId) => {
    if (!ObjectId.isValid(serviceId)) return null;
    return await db.collection('services').findOne({ _id: new ObjectId(serviceId) });
};
const addService = async (serviceData) => {
    const result = await db.collection('services').insertOne(serviceData);
    return result;
};
const updateService = async (serviceId, updates) => {
    if (!ObjectId.isValid(serviceId)) return null;
    delete updates._id; // Garante que o _id não seja modificado
    const result = await db.collection('services').updateOne(
        { _id: new ObjectId(serviceId) },
        { $set: updates }
    );
    return result;
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
    // ...outras funções de instância e usuário
    getServicesByOwner,
    getServiceById,
    addService,
    updateService,
    deleteService,
};
