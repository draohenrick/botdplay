const express = require('express');
const db = require('../db');
const router = express.Router();

// ROTA PARA LISTAR TODOS OS SERVIÇOS DO USUÁRIO LOGADO
// GET /api/services
router.get('/', async (req, res) => {
    try {
        const services = await db.getServicesByOwner(req.user.id);
        res.json(services);
    } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// ROTA PARA CRIAR UM NOVO SERVIÇO
// POST /api/services
router.post('/', async (req, res) => {
    try {
        const serviceData = req.body;
        // Adiciona o ID do dono do serviço, que vem do token de autenticação
        serviceData.ownerId = req.user.id; 

        const newService = await db.addService(serviceData);
        res.status(201).json(newService);
    } catch (error) {
        console.error("Erro ao criar serviço:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// ROTA PARA ATUALIZAR UM SERVIÇO
// PUT /api/services/:id
router.put('/:id', async (req, res) => {
    try {
        const serviceId = req.params.id;
        const updates = req.body;
        
        // Garante que o usuário só possa editar seus próprios serviços
        const existingService = await db.getServiceById(serviceId);
        if (!existingService || existingService.ownerId !== req.user.id) {
            return res.status(404).json({ error: "Serviço não encontrado ou não pertence a você." });
        }
        
        const updatedService = await db.updateService(serviceId, updates);
        res.json(updatedService);
    } catch (error) {
        console.error("Erro ao atualizar serviço:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// ROTA PARA DELETAR UM SERVIÇO
// DELETE /api/services/:id
router.delete('/:id', async (req, res) => {
    try {
        const serviceId = req.params.id;

        // Garante que o usuário só possa deletar seus próprios serviços
        const existingService = await db.getServiceById(serviceId);
        if (!existingService || existingService.ownerId !== req.user.id) {
            return res.status(404).json({ error: "Serviço não encontrado ou não pertence a você." });
        }

        await db.deleteService(serviceId);
        res.status(200).json({ message: 'Serviço deletado com sucesso.' });
    } catch (error) {
        console.error("Erro ao deletar serviço:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

module.exports = router;
