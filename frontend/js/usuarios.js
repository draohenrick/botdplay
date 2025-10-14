const BACKEND_URL = 'https://botdplay.onrender.com';

const logoutButton = document.getElementById('logout-button');

async function loadUsuariosPage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Por favor, faça login para continuar.');
        window.location.href = '/login.html';
        return;
    }

    try {
        // ROTA ESPECÍFICA DESTA PÁGINA
        const response = await fetch(`${BACKEND_URL}/api/users`, {
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
        // Exemplo: exiba os usuários em uma tabela de administração
        console.log('Usuários recebidos:', data);
        const dataContainer = document.getElementById('users-container'); // Crie um elemento com este ID
        if(dataContainer) dataContainer.textContent = JSON.stringify(data, null, 2);

    } catch (error) {
        console.error('Erro ao carregar os dados da página de usuários:', error);
    }
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        alert('Você saiu com sucesso.');
        window.location.href = '/login.html';
    });
}

loadUsuariosPage();
