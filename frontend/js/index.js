const BACKEND_URL = 'https://botdplay.onrender.com';

const logoutButton = document.getElementById('logout-button');
const activeBotsElem = document.getElementById('active-bots');
const leadsCountElem = document.getElementById('leads-count');
const dataContainer = document.getElementById('data-container');

async function loadDashboard() {
    const token = localStorage.getItem('authToken');
    if(!token) {
        alert('Acesso negado. Faça login.');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/dashboard-data`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if(response.status === 401 || response.status === 403){
            localStorage.removeItem('authToken');
            alert('Sessão expirada.');
            window.location.href = '/login.html';
            return;
        }

        const data = await response.json();

        // Atualiza contadores
        activeBotsElem.textContent = data.activeBots || 0;
        leadsCountElem.textContent = data.totalLeads || 0;
        dataContainer.textContent = JSON.stringify(data.bots, null, 2);

    } catch(err){
        console.error('Erro ao carregar dashboard:', err);
        dataContainer.textContent = 'Erro ao carregar dados.';
    }
}

// Logout
if(logoutButton){
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        alert('Você saiu com sucesso.');
        window.location.href = '/login.html';
    });
}

// Carrega dashboard
loadDashboard();
