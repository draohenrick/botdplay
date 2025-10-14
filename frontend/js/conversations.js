const BACKEND_URL = 'https://botdplay.onrender.com';

const conversationsContainer = document.getElementById('conversations-container');
const logoutLinks = document.querySelectorAll('[onclick="logout()"]');

// Função para proteger página
function protectPage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Faça login para continuar.');
        window.location.href = '/login.html';
    }
}

// Função para carregar as conversas
async function loadConversationsPage() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/conversations`, {
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

        const conversations = await response.json();

        if (conversationsContainer) {
            if (conversations.length === 0) {
                conversationsContainer.textContent = 'Nenhuma conversa encontrada.';
                return;
            }

            // Cria tabela de conversas
            const table = document.createElement('table');
            table.className = 'table table-striped';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>Mensagem</th>
                        <th>Data/Hora</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${conversations.map(conv => `
                        <tr>
                            <td>${conv.user}</td>
                            <td>${conv.message}</td>
                            <td>${new Date(conv.timestamp).toLocaleString()}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewConversation('${conv.id}')">Visualizar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            conversationsContainer.innerHTML = '';
            conversationsContainer.appendChild(table);
        }

    } catch (error) {
        console.error('Erro ao carregar conversas:', error);
        if (conversationsContainer) conversationsContainer.textContent = 'Erro ao carregar conversas.';
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

// Placeholder para visualizar conversa
function viewConversation(id) {
    alert(`Visualizar conversa ID: ${id} (função ainda não implementada)`);
}

// Executa proteção e carregamento ao abrir a página
protectPage();
loadConversationsPage();
