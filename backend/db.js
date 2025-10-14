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

// --- Funções de busca de dados ---
const getUserByEmail = async (email) => await db.collection('users').findOne({ email });
const getUserById = async (id) => await db.collection('users').findOne({ _id: new ObjectId(id) });
const addUser = async (userData) => {
    const result = await db.collection('users').insertOne(userData);
    return result.insertedId;
};

// NOVAS FUNÇÕES
const getInstances = async (userId) => await db.collection('instances').find({ ownerId: userId }).toArray();
const getLeads = async (userId) => await db.collection('leads').find({ ownerId: userId }).toArray();
const getServices = async (userId) => await db.collection('services').find({ ownerId: userId }).toArray();
const getConversations = async (userId) => await db.collection('conversations').find({ ownerId: userId }).toArray();
const getUsersList = async () => await db.collection('users').find({}, { projection: { password: 0 } }).toArray(); // Retorna usuários sem a senha


module.exports = {
    connectToDatabase,
    getUserByEmail,
    getUserById,
    addUser,
    getInstances,
    getLeads,
    getServices,
    getConversations,
    getUsersList,
};
