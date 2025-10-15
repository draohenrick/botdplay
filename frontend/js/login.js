// URL do backend hospedado no Render
const BACKEND_URL = 'https://botdplay.onrender.com';

// --- Elementos do Formulário ---
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const errorMessage = document.getElementById('error-message');
const submitButton = loginForm.querySelector('button[type="submit"]');

// --- Lógica do Login ---
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    errorMessage.textContent = 'Preencha todos os campos.';
    errorMessage.style.display = 'block';
    return;
  }

  // Desativa o botão para evitar múltiplos envios
  submitButton.disabled = true;
  submitButton.textContent = 'Entrando...';

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Resposta inválida do servidor.');
    }

    if (!response.ok) {
      errorMessage.textContent = data.error || 'Falha no login. Verifique suas credenciais.';
      errorMessage.style.display = 'block';
      return;
    }

    // --- Sucesso ---
    if (data.token) {
      // Armazena token e usuário
      localStorage.setItem('authToken', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

      // Redireciona para o dashboard
      window.location.href = '/index.html';
    } else {
      throw new Error('Token de autenticação não recebido.');
    }

  } catch (err) {
    console.error('Erro de login:', err);
    errorMessage.textContent = 'Erro de conexão com o servidor.';
    errorMessage.style.display = 'block';
  } finally {
    // Reativa o botão
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
});
