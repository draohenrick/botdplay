// URL do backend
const BACKEND_URL = 'https://botdplay.onrender.com';

// Elementos da página
const instancesContainer = document.getElementById('instances-container');
const logoutLinks = document.querySelectorAll('[onclick="logout()"]'); // Todos links de logout

// Função para proteger página
function protectPage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Faça login para continuar.');
        window.location.href = '/login.html';
    }
}

// Função para carregar as instâncias
async function loadInstancesPage() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/instances`, {
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

        const instances = await response.json();

        if (instancesContainer) {
            if (instances.length === 0) {
                instancesContainer.textContent = 'Nenhuma conexão encontrada.';
                return;
            }

            // Limpa container
            instancesContainer.innerHTML = '';

            // Cria cards ou listas para cada instância
            instances.forEach(inst => {
                const card = document.createElement('div');
                card.className = 'card mb-2';
                card.innerHTML = `
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${inst.name}</strong><br>
                            Status: ${inst.status}
                        </div>
                        <div>
                            <button class="btn btn-sm btn-primary me-2" onclick="editInstance('${inst.id}')">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteInstance('${inst.id}')">Excluir</button>
                        </div>
                    </div>
                `;
                instancesContainer.appendChild(card);
            });
        }

    } catch (error) {
        if (instancesContainer) instancesContainer.textContent = 'Erro ao carregar as conexões.';
        console.error('Erro ao carregar as instâncias:', error);
    }
}

// Função de logout
function logout() {
    localStorage.removeItem('authToken');
    alert('Você saiu com sucesso.');
    window.location.href = '/login.html';
}

// Associa logout a todos os links com onclick="logout()"
logoutLinks.forEach(link => link.addEventListener('click', logout));

// Funções para editar e excluir instâncias
function editInstance(id) {
    alert(`Função de editar instância ID: ${id} ainda não implementada.`);
    // Aqui você pode abrir modal de edição
}

function deleteInstance(id) {
    if (!confirm('Deseja realmente excluir esta instância?')) return;
    alert(`Função de deletar instância ID: ${id} ainda não implementada.`);
    // Aqui você pode chamar o backend DELETE /api/instances/:id
}

// Executa proteção e carregamento ao abrir a página
protectPage();
loadInstancesPage();
