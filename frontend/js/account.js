const BACKEND_URL = 'https://botdplay.onrender.com';

const logoutButton = document.getElementById('logout-button');

// --- Lógica de Proteção e Carregamento de Dados ---
async function loadAccountPage() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('Acesso negado. Por favor, faça login para continuar.');
        window.location.href = '/login.html';
        return;
    }

    try {
        // ROTA ESPECÍFICA DESTA PÁGINA: Busca dados do usuário logado
        const response = await fetch(`${BACKEND_URL}/api/account`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            alert('Sua sessão expirou. Por favor, faça login novamente.');
            window.location.href = '/login.html';
            return;
        }

        const data = await response.json();

        // FAÇA ALGO COM OS DADOS
        // Exemplo: preencha os campos de um formulário com os dados do usuário
        console.log('Dados da conta recebidos:', data);
        const nameField = document.getElementById('account-name'); // Crie um elemento com este ID
        const emailField = document.getElementById('account-email'); // Crie um elemento com este ID
        if(nameField) nameField.value = data.nome;
        if(emailField) emailField.value = data.email;

    } catch (error) {
        console.error('Erro ao carregar os dados da página de conta:', error);
    }
}

// --- Lógica do Botão de Logout ---
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        alert('Você saiu com sucesso.');
        window.location.href = '/login.html';
    });
}

// Roda a função principal assim que a página carrega
loadAccountPage();
