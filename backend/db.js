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

const getUserByEmail = async (email) => await db.collection('users').findOne({ email });
const addUser = async (userData) => {
    const result = await db.collection('users').insertOne(userData);
    return result.insertedId;
};

module.exports = {
    connectToDatabase,
    getUserByEmail,
    addUser,
};
