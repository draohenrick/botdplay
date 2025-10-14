// Define a URL base do seu backend
const BASE_URL = 'https://botdplay.onrender.com';

// Função para proteger a página
function protectPage() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Se não houver token, o usuário não está logado. Redireciona para o login.
        window.location.href = '/login.html';
    }
}

// Função de Logout
function logout() {
    // Limpa o token e redireciona para o login
    localStorage.removeItem('authToken');
    alert('Você saiu com sucesso.');
    window.location.href = '/login.html';
}
