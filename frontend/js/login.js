// =======================================
// LOGIN.JS - Dplay Bot SaaS (Corrigido)
// =======================================

const BACKEND_URL = 'https://botdplay.onrender.com';

// Seleciona elementos do DOM corretamente
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const errorMessage = document.getElementById('error-message');

// Função principal de login
async function handleLogin(event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const senha = passwordInput.value.trim();

  if (!email || !senha) {
    showError('Por favor, preencha todos os campos.');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const err = JSON.parse(text);
        showError(err.message || 'Falha ao fazer login.');
      } catch {
        showError('Erro de comunicação com o servidor.');
      }
      return;
    }

    const data = await response.json();

    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', email);

      if (data.role && data.role === 'admin') {
        window.location.href = '/admin-dashboard.html';
      } else {
        window.location.href = '/index.html';
      }
    } else {
      showError('Token não recebido. Tente novamente.');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    showError('Não foi possível conectar ao servidor.');
  }
}

// Exibe mensagem de erro
function showError(msg) {
  if (errorMessage) {
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
  } else {
    alert(msg);
  }
}

// Impede acesso à página de login se já estiver logado
function checkExistingSession() {
  const token = localStorage.getItem('authToken');
  if (token) {
    window.location.href = '/index.html';
  }
}

// Adiciona listener
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

// Executa ao carregar
checkExistingSession();
