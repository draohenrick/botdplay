// --- Proteção de páginas ---
function protectPage() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  // Opcional: validar token com backend
}

// --- Logout ---
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}
