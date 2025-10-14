const BACKEND_URL = 'https://botdplay.onrender.com';

const servicesContainer = document.getElementById('services-container');
const logoutLinks = document.querySelectorAll('[onclick="logout()"]');

// Função para proteger página
function protectPage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Faça login para continuar.');
        window.location.href = '/login.html';
    }
}

// Função para carregar serviços do bot
async function loadServicesPage() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/services`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            alert('Sua sessão expirou. Faça login novamente.');
            window.location.href = '/login.html';
            return;
        }

        const services = await response.json();

        if (servicesContainer) {
            if (services.length === 0) {
                servicesContainer.textContent = 'Nenhum serviço encontrado.';
                return;
            }

            // Cria tabela de serviços
            const table = document.createElement('table');
            table.className = 'table table-striped';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Nome do Serviço</th>
                        <th>Descrição</th>
                        <th>Ativo</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${services.map(service => `
                        <tr>
                            <td>${service.name}</td>
                            <td>${service.description || '-'}</td>
                            <td>${service.active ? 'Sim' : 'Não'}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editService('${service.id}')">Editar</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteService('${service.id}')">Excluir</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            servicesContainer.innerHTML = '';
            servicesContainer.appendChild(table);
        }

    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        if (servicesContainer) servicesContainer.textContent = 'Erro ao carregar serviços.';
    }
}

// Função de logout
function logout() {
    localStorage.removeItem('authToken');
    alert('Você saiu com sucesso.');
    window.location.href = '/login.html';
}

// Associa logout a todos os links
logoutLinks.forEach(link => link.addEventListener('click', logout));

// Placeholder para editar serviço
function editService(id) {
    alert(`Editar serviço ID: ${id} (função ainda não implementada)`);
}

// Placeholder para excluir serviço
function deleteService(id) {
    const confirmDelete = confirm(`Deseja realmente excluir o serviço ID: ${id}?`);
    if(confirmDelete) {
        alert(`Serviço ID: ${id} excluído (função ainda não implementada)`);
    }
}

// Executa proteção e carregamento ao abrir a página
protectPage();
loadServicesPage();
