// URL do backend
const BACKEND_URL = 'https://botdplay.onrender.com';

// Elementos da página
const summaryContainer = document.getElementById('summary');
const logoutLinks = document.querySelectorAll('[onclick="logout()"]'); // todos links de logout

// Função para proteger página
function protectPage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Faça login para continuar.');
        window.location.href = '/login.html';
    }
}

// Função para carregar os dados do dashboard
async function loadDashboard() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/dashboard-data`, {
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

        // Exibe os dados no container
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <strong>Bem-vindo, ${data.userName || 'usuário'}!</strong><br>
                Total de Bots: ${data.totalBots || 0}<br>
                Conexões Ativas: ${data.activeConnections || 0}<br>
                Leads Capturados: ${data.leadsCount || 0}
            `;
        }

    } catch (error) {
        if (summaryContainer) summaryContainer.textContent = 'Erro ao carregar os dados do servidor.';
        console.error('Erro ao buscar dados do dashboard:', error);
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

// Executa proteção e carregamento de dados ao abrir a página
protectPage();
loadDashboard();
