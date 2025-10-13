const { MongoClient, ObjectId } = require('mongodb');

// Esta variável será preenchida pelo Render com o segredo que você configurou
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('A variável de ambiente MONGODB_URI não está definida.');
}

const client = new MongoClient(MONGODB_URI);
let db;

// Função que será chamada pelo server.js para conectar ao banco de dados
const connectToDatabase = async () => {
    try {
        await client.connect();
        db = client.db(); 
        console.log("✅ Conectado ao MongoDB Atlas com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao conectar ao MongoDB Atlas:", error);
        process.exit(1); // Encerra a aplicação se a conexão com o DB falhar
    }
};

// --- Funções que interagem com o banco de dados ---
const getUsers = async () => await db.collection('users').find({}).toArray();
const getUserByEmail = async (email) => await db.collection('users').findOne({ email });
const addUser = async (userData) => {
    const result = await db.collection('users').insertOne(userData);
    return result.insertedId;
};
const getInstances = async () => await db.collection('instances').find({}).toArray();


// --- Exportação dos Módulos ---
// IMPORTANTE: Exportamos a função de conexão junto com as outras
module.exports = {
    connectToDatabase,
    getUsers,
    getUserByEmail,
    addUser,
    getInstances,
};
