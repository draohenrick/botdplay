// A URL do seu backend no Render
const BACKEND_URL = 'https://botdplay.onrender.com';

// --- Elementos do Formulário ---
const registerForm = document.getElementById('register-form');
const nameInput = document.getElementById('name-input');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const message = document.getElementById('message'); // Um <p> para mostrar mensagens

// --- Lógica do Registro ---
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    message.className = 'mt-3 text-center'; // Reseta o estilo da mensagem

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
            // Se o backend retornou um erro (ex: email já existe)
            message.classList.add('text-danger');
            message.textContent = data.error || 'Falha no registro.';
            return;
        }

        // Se o registro foi bem-sucedido
        message.classList.add('text-success');
        message.textContent = 'Registro realizado com sucesso! Redirecionando para o login...';
        
        // Espera 2 segundos e redireciona para a página de login
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);

    } catch (error) {
        message.classList.add('text-danger');
        message.textContent = 'Erro de conexão. Verifique sua internet ou tente mais tarde.';
    }
});
