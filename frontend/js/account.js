// URL do backend
const BACKEND_URL = 'https://botdplay.onrender.com';

// Elementos da página
const accountForm = document.getElementById('account-form');
const nameField = document.getElementById('account-name');
const emailField = document.getElementById('account-email');
const logoutLinks = document.querySelectorAll('[onclick="logout()"]'); // Todos links de logout

// Função para proteger página
function protectPage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Faça login para continuar.');
        window.location.href = '/login.html';
    }
}

// Função para carregar os dados do usuário
async function loadAccountPage() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/account`, {
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

        const data = await response.json();

        if (nameField) nameField.value = data.nome || '';
        if (emailField) emailField.value = data.email || '';

    } catch (error) {
        console.error('Erro ao carregar dados da conta:', error);
        alert('Erro ao carregar seus dados. Tente novamente.');
    }
}

// Função para atualizar dados da conta
async function updateAccount(e) {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/account`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome: nameField.value
                // Se quiser adicionar senha: password: passwordField.value
            })
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            alert('Sua sessão expirou. Faça login novamente.');
            window.location.href = '/login.html';
            return;
        }

        const result = await response.json();
        alert(result.message || 'Dados atualizados com sucesso.');

    } catch (error) {
        console.error('Erro ao atualizar conta:', error);
        alert('Erro ao atualizar seus dados. Tente novamente.');
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

// Associa submissão do formulário
if (accountForm) {
    accountForm.addEventListener('submit', updateAccount);
}

// Executa proteção e carregamento ao abrir a página
protectPage();
loadAccountPage();
