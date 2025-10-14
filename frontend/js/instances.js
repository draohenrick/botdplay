const BACKEND_URL = 'https://botdplay.onrender.com';

const logoutButton = document.getElementById('logout-button'); // Assumindo que você tem um botão de logout em todas as páginas

// --- Lógica de Proteção e Carregamento de Dados ---
async function loadInstancesPage() {
    // 1. Pega o token salvo no localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Se NÃO houver token, redireciona para o login
        alert('Acesso negado. Por favor, faça login para continuar.');
        window.location.href = '/login.html';
        return;
    }

    // 2. Se houver token, busca os dados das instâncias
    try {
        // ROTA ESPECÍFICA DESTA PÁGINA
        const response = await fetch(`${BACKEND_URL}/api/instances`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Envia o token
            }
        });

        if (response.status === 401 || response.status === 403) {
            // Se o token for inválido/expirado
            localStorage.removeItem('authToken');
            alert('Sua sessão expirou. Por favor, faça login novamente.');
            window.location.href = '/login.html';
            return;
        }

        const data = await response.json();

        // 3. FAÇA ALGO COM OS DADOS
        // Exemplo: exiba as instâncias na tela
        console.log('Instâncias recebidas:', data);
        const dataContainer = document.getElementById('instances-container'); // Crie um elemento com este ID no seu HTML
        if(dataContainer) dataContainer.textContent = JSON.stringify(data, null, 2);


    } catch (error) {
        console.error('Erro ao carregar os dados da página de instâncias:', error);
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
loadInstancesPage();
