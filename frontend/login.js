// A URL do seu backend no Render
const BACKEND_URL = 'https://botdplay.onrender.com';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.textContent = ''; // Limpa mensagens de erro antigas

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            errorMessage.textContent = data.error || 'Falha no login.';
            return;
        }

        // SUCESSO! Salva o token no localStorage
        localStorage.setItem('authToken', data.token);

        // Redireciona para o dashboard
        window.location.href = '/dashboard.html';

    } catch (error) {
        errorMessage.textContent = 'Erro de conexão com o servidor.';
    }
});
