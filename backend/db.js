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

