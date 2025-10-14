const BACKEND_URL = 'https://botdplay.onrender.com';

const welcomeMessage = document.getElementById('welcome-message');
const dataContainer = document.getElementById('data-container');
const logoutButton = document.getElementById('logout-button');

// Função que roda assim que a página carrega
async function loadDashboard() {
    // 1. Pega o token salvo no localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Se não houver token, o usuário não está logado. Redireciona para o login.
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = '/login.html';
        return;
    }

    try {
        // 2. Tenta buscar os dados protegidos no backend, enviando o token
        const response = await fetch(`${BACKEND_URL}/api/data`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Envia o token de autorização
            }
        });

        if (!response.ok) {
            // Se o token for inválido/expirado, o backend retornará um erro
            localStorage.removeItem('authToken'); // Limpa o token inválido
            alert('Sua sessão expirou. Por favor, faça login novamente.');
            window.location.href = '/login.html';
            return;
        }

        const data = await response.json();

        // 3. Mostra os dados na tela
        welcomeMessage.textContent = data.message;
        dataContainer.textContent = JSON.stringify(data.data, null, 2);

    } catch (error) {
        dataContainer.textContent = 'Erro ao carregar os dados do servidor.';
    }
}

// Lógica do botão de logout
logoutButton.addEventListener('click', () => {
    // Limpa o token e redireciona para o login
    localStorage.removeItem('authToken');
    alert('Você saiu com sucesso.');
    window.location.href = '/login.html';
});


// Roda a função principal ao carregar a página
loadDashboard();
