// Este código deve ser executado depois que o auth.js for carregado
protectPage(); // Garante que o usuário está logado

const token = localStorage.getItem('authToken');
const servicesTableBody = document.getElementById('servicesTableBody');
const newServiceForm = document.getElementById('newServiceForm');
const addServiceModal = new bootstrap.Modal(document.getElementById('addServiceModal'));

/**
 * Função principal para carregar os serviços do backend e exibi-los na tabela.
 */
async function loadServices() {
    servicesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Carregando serviços...</td></tr>';

    try {
        const response = await fetch(`${BASE_URL}/api/services`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar os serviços do servidor.');
        }

        const services = await response.json();
        renderServices(services);

    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        servicesTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Erro ao carregar serviços.</td></tr>';
    }
}

/**
 * Renderiza a lista de serviços na tabela do HTML.
 * @param {Array} services - A lista de serviços vinda do backend.
 */
function renderServices(services) {
    if (services.length === 0) {
        servicesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum fluxo cadastrado. Clique em "+ Novo Fluxo" para começar.</td></tr>';
        return;
    }

    servicesTableBody.innerHTML = ''; // Limpa a tabela

    services.forEach(service => {
        const row = `
            <tr>
                <td><strong>${service.label || service.name}</strong></td>
                <td>${service.description}</td>
                <td>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" ${service.active ? 'checked' : ''}>
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="editService('${service._id}')">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteService('${service._id}')">Excluir</button>
                </td>
            </tr>
        `;
        servicesTableBody.innerHTML += row;
    });
}

/**
 * Lida com o envio do formulário para criar um novo serviço.
 */
newServiceForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const serviceData = {
        label: document.getElementById('serviceName').value,
        description: document.getElementById('serviceDescription').value,
        // Converte as palavras-chave separadas por vírgula em um array
        keywords: document.getElementById('serviceKeywords').value.split(',').map(kw => kw.trim()),
        response: document.getElementById('serviceResponse').value,
        active: document.getElementById('serviceActive').checked
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

        if (!response.ok) {
            throw new Error('Falha ao salvar o novo serviço.');
        }

        newServiceForm.reset(); // Limpa o formulário
        addServiceModal.hide(); // Esconde o modal
        loadServices(); // Recarrega a lista de serviços para mostrar o novo

    } catch (error) {
        console.error('Erro ao salvar serviço:', error);
        alert('Não foi possível salvar o novo fluxo. Tente novamente.');
    }
});

/**
 * Função para deletar um serviço.
 * @param {string} serviceId - O ID do serviço a ser deletado.
 */
async function deleteService(serviceId) {
    if (!confirm('Tem certeza que deseja excluir este fluxo?')) {
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/services/${serviceId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Falha ao excluir o serviço.');
        }

        loadServices(); // Recarrega a lista de serviços

    } catch (error) {
        console.error('Erro ao deletar serviço:', error);
        alert('Não foi possível excluir o fluxo. Tente novamente.');
    }
}

/**
 * Função de placeholder para editar um serviço (ainda não implementada no backend).
 * @param {string} serviceId 
 */
function editService(serviceId) {
    alert(`Funcionalidade de editar o serviço com ID: ${serviceId} ainda não implementada.`);
    // Aqui você abriria o modal preenchido com os dados do serviço para edição.
}


// --- INICIALIZAÇÃO ---
// Carrega os serviços quando a página é totalmente carregada.
document.addEventListener('DOMContentLoaded', loadServices);
