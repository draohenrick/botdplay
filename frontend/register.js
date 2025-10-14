const BACKEND_URL = 'https://botdplay.onrender.com';

const registerForm = document.getElementById('register-form');
const nameInput = document.getElementById('name-input');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const message = document.getElementById('message');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    message.className = 'mt-3 text-center';

    const nome = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            message.classList.add('text-danger');
            message.textContent = data.error || 'Falha no registro.';
            return;
        }

        message.classList.add('text-success');
        message.textContent = 'Registro bem-sucedido! Redirecionando para o login...';
        
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);

    } catch (error) {
        message.classList.add('text-danger');
        message.textContent = 'Erro de conexão com o servidor.';
    }
});
