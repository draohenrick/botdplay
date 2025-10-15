// Protege a página e define a URL base
protectPage(); 

const token = localStorage.getItem('authToken');
const servicesTableBody = document.getElementById('servicesTableBody');
const newServiceForm = document.getElementById('newServiceForm');
const addServiceModal = new bootstrap.Modal(document.getElementById('addServiceModal'));

/**
 * Carrega os serviços do backend e os exibe na tabela.
 */
async function loadServices() {
    servicesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Carregando fluxos...</td></tr>';
    try {
        const response = await fetch(`${BASE_URL}/api/services`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao carregar os fluxos.');
        const services = await response.json();
        renderServices(services);
    } catch (error) {
        console.error('Erro:', error);
        servicesTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">${error.message}</td></tr>`;
    }
}

/**
 * Renderiza os serviços na tabela.
 */
function renderServices(services) {
    if (services.length === 0) {
        servicesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum fluxo cadastrado. Clique em "+ Novo Fluxo" para começar.</td></tr>';
        return;
    }
    servicesTableBody.innerHTML = '';
    services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${service.label}</strong></td>
            <td>${service.description}</td>
            <td><span class="badge bg-secondary">${(service.keywords || []).join(', ')}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteService('${service._id}')">Excluir</button>
            </td>
        `;
        servicesTableBody.appendChild(row);
    });
}

/**
 * Lida com o envio do formulário para criar um novo serviço.
 */
newServiceForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const serviceData = {
        label: document.getElementById('serviceLabel').value,
        description: document.getElementById('serviceDescription').value,
        keywords: document.getElementById('serviceKeywords').value.split(',').map(kw => kw.trim()).filter(kw => kw),
    };
    
    if (!serviceData.label || !serviceData.description) {
        alert('Nome do Fluxo e Descrição são obrigatórios.');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(serviceData)
        });
        if (!response.ok) throw new Error('Falha ao salvar o novo fluxo.');
        
        newServiceForm.reset();
        addServiceModal.hide();
        loadServices(); // Recarrega a lista para mostrar o novo item
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert(error.message);
    }
});

/**
 * Função para deletar um serviço.
 */
async function deleteService(serviceId) {
    if (!confirm('Tem certeza que deseja excluir este fluxo?')) return;

    try {
        const response = await fetch(`${BASE_URL}/api/services/${serviceId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao excluir o fluxo.');
        loadServices(); // Recarrega a lista
    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert(error.message);
    }
}

// Carrega os serviços quando a página é aberta.
document.addEventListener('DOMContentLoaded', loadServices);
