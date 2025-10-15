// URL do backend hospedado no Render
const BACKEND_URL = 'https://botdplay.onrender.com';

// --- Elementos do Formulário ---
const registerForm = document.getElementById('register-form');
const nameInput = document.getElementById('name-input');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const message = document.getElementById('message');
const submitButton = registerForm.querySelector('button[type="submit"]');

// --- Lógica do Registro ---
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';
  message.style.display = 'none';
  message.className = 'mt-3 text-center';

  const nome = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Validação básica antes do envio
  if (!nome || !email || !password) {
    message.classList.add('text-danger');
    message.textContent = 'Preencha todos os campos.';
    message.style.display = 'block';
    return;
  }

  // Bloqueia múltiplos cliques
  submitButton.disabled = true;
  submitButton.textContent = 'Registrando...';

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Resposta inválida do servidor.');
    }

    if (!response.ok) {
      message.classList.add('text-danger');
      message.textContent = data.error || 'Falha no registro. Verifique os dados.';
      message.style.display = 'block';
      return;
    }

    // Registro bem-sucedido
    message.classList.add('text-success');
    message.textContent = 'Registro realizado com sucesso! Redirecionando...';
    message.style.display = 'block';

    // Redireciona para o login após 2 segundos
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 2000);
    
  } catch (error) {
    console.error('Erro de conexão:', error);
    message.classList.add('text-danger');
    message.textContent = 'Erro de conexão com o servidor.';
    message.style.display = 'block';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Registrar';
  }
});
