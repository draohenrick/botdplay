const BACKEND_URL = 'https://botdplay.onrender.com';

const welcomeMessage = document.getElementById('welcome-message');
const dataContainer = document.getElementById('data-container');
const logoutButton = document.getElementById('logout-button');

async function loadDashboard() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = '/login.html';
        return;
    }

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
            alert('Sua sessão expirou. Por favor, faça login novamente.');
            window.location.href = '/login.html';
            return;
        }

        const data = await response.json();

        welcomeMessage.textContent = data.message;
        dataContainer.textContent = JSON.stringify(data.bots, null, 2);

    } catch (error) {
        dataContainer.textContent = 'Erro ao carregar os dados do servidor.';
    }
}

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    alert('Você saiu com sucesso.');
    window.location.href = '/login.html';
});

loadDashboard();
