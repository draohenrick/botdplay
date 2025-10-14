const BACKEND_URL = 'https://botdplay.onrender.com';

const leadsContainer = document.getElementById('leads-container');
const logoutLinks = document.querySelectorAll('[onclick="logout()"]');

// Função para proteger página
function protectPage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Faça login para continuar.');
        window.location.href = '/login.html';
    }
}

// Função para carregar leads
async function loadLeadsPage() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/leads`, {
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

        const leads = await response.json();

        if (leadsContainer) {
            if (leads.length === 0) {
                leadsContainer.textContent = 'Nenhum lead encontrado.';
                return;
            }

            // Cria tabela de leads
            const table = document.createElement('table');
            table.className = 'table table-striped';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Telefone</th>
                        <th>Data/Hora</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${leads.map(lead => `
                        <tr>
                            <td>${lead.nome}</td>
                            <td>${lead.email}</td>
                            <td>${lead.telefone || '-'}</td>
                            <td>${new Date(lead.createdAt).toLocaleString()}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewLead('${lead.id}')">Visualizar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            leadsContainer.innerHTML = '';
            leadsContainer.appendChild(table);
        }

    } catch (error) {
        console.error('Erro ao carregar leads:', error);
        if (leadsContainer) leadsContainer.textContent = 'Erro ao carregar leads.';
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

// Placeholder para visualizar lead
function viewLead(id) {
    alert(`Visualizar lead ID: ${id} (função ainda não implementada)`);
}

// Executa proteção e carregamento ao abrir a página
protectPage();
loadLeadsPage();
