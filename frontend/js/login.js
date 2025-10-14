const BACKEND_URL = 'https://botdplay.onrender.com';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const errorMessage = document.getElementById('error-message');

async function handleLogin(event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const senha = passwordInput.value.trim();

  if (!email || !senha) {
    showError('Por favor, preencha todos os campos.');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/login`, { // Ajuste de rota
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }), // Ajuste para o back-end
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Resposta inesperada do servidor:', text);
      showError('Erro de comunicação com o servidor.');
      return;
    }

    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', email);

      if (data.role && data.role === 'admin') {
        window.location.href = '/admin-dashboard.html';
      } else {
        window.location.href = '/index.html';
      }
    } else {
      showError(data.error || '❌ Usuário ou senha inválidos.');
      console.error('Erro retornado pelo backend:', data);
    }

  } catch (error) {
    console.error('Erro no login:', error);
    showError('Não foi possível conectar ao servidor.');
  }
}

function showError(msg) {
  if (errorMessage) {
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
  } else {
    alert(msg);
  }
}

function checkExistingSession() {
  const token = localStorage.getItem('authToken');
  if (token) {
    window.location.href = '/index.html';
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

checkExistingSession();
