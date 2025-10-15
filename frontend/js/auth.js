// Protege páginas que exigem login
function protectPage() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}
