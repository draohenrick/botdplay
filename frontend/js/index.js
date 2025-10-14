// A URL do seu backend no Render
const BACKEND_URL = 'https://botdplay.onrender.com';

// --- Elementos da Página ---
const welcomeMessage = document.getElementById('welcome-message');
const dataContainer = document.getElementById('data-container');
const logoutButton = document.getElementById('logout-button');

// --- Lógica de Proteção e Carregamento de Dados ---
async function loadIndexPage() {
    // 1. Pega o token salvo no localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Se NÃO houver token, o usuário não está logado.
        alert('Acesso negado. Por favor, faça login para continuar.');
        window.location.href = '/login.html'; // Redireciona para o login
        return;
    }

    // Se houver token, busca os dados protegidos no backend
    try {
        const response = await fetch(`${BACKEND_URL}/api/dashboard-data`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Envia o token para provar que estamos autenticados
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            // Se o token for inválido ou expirado, o backend retornará um erro
            localStorage.removeItem('authToken'); // Limpa o token ruim
            alert('Sua sessão expirou. Por favor, faça login novamente.');
            window.location.href = '/login.html';
            return;
        }

        const data = await response.json();

        // Mostra os dados na tela
        if (welcomeMessage) welcomeMessage.textContent = data.message;
        if (dataContainer) dataContainer.textContent = JSON.stringify(data.bots, null, 2);

    } catch (error) {
        if (dataContainer) dataContainer.textContent = 'Erro ao carregar os dados do servidor.';
    }
}

// --- Lógica do Botão de Logout ---
logoutButton.addEventListener('click', () => {
    // Limpa o token e redireciona para o login
    localStorage.removeItem('authToken');
    alert('Você saiu com sucesso.');
    window.location.href = '/login.html';
});


// Roda a função principal assim que a página carrega
loadIndexPage();
