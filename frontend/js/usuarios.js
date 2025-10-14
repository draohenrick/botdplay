// URL do backend
const BACKEND_URL = 'https://botdplay.onrender.com';

// Elementos da página
const usersContainer = document.getElementById('users-container');
const logoutLinks = document.querySelectorAll('[onclick="logout()"]'); // todos links de logout

// Função para proteger página
function protectPage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Faça login para continuar.');
        window.location.href = '/login.html';
    }
}

// Função para carregar os usuários
async function loadUsuariosPage() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/users`, {
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

        const users = await response.json();

        if (usersContainer) {
            if (users.length === 0) {
                usersContainer.textContent = 'Nenhum usuário encontrado.';
                return;
            }

            // Cria tabela de usuários
            const table = document.createElement('table');
            table.className = 'table table-striped';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Função</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>
                                <button class="btn btn-sm btn-primary me-2" onclick="editUser('${user.id}')">Editar</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Excluir</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            usersContainer.innerHTML = '';
            usersContainer.appendChild(table);
        }

    } catch (error) {
        if (usersContainer) usersContainer.textContent = 'Erro ao carregar os usuários.';
        console.error('Erro ao carregar usuários:', error);
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

// Funções para editar e excluir usuários
function editUser(id) {
    alert(`Função de editar usuário ID: ${id} ainda não implementada.`);
    // Aqui você pode abrir modal para editar usuário
}

function deleteUser(id) {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    alert(`Função de deletar usuário ID: ${id} ainda não implementada.`);
    // Aqui você pode chamar backend DELETE /api/users/:id
}

// Executa proteção e carregamento ao abrir a página
protectPage();
loadUsuariosPage();
