const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
let db;

const connectToDatabase = async () => {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
};

const getInstancesByOwner = async (ownerId) => {
    return await db.collection('instances').find({ ownerId }).toArray();
};

// ...outras funções do banco de dados...

module.exports = {
    connectToDatabase,
    getInstancesByOwner,
    // ...outras funções exportadas...
};
