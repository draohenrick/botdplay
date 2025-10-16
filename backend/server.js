import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

// Habilita CORS para o frontend no Netlify
app.use(cors({
  origin: 'https://chatbotdplay.netlify.app'
}));

// Conexão MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error('Erro MongoDB:', err));

// Exemplo de rota
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Porta
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
