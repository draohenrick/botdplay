const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const accountRoutes = require('./routes/account');
const adminRoutes = require('./routes/admin');
const leadsRoutes = require('./routes/leads');
const servicesRoutes = require('./routes/services');
const usersRoutes = require('./routes/users');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error(err));

app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/users', usersRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
