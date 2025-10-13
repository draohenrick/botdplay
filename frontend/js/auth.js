// ATENÇÃO: Verifique se esta URL está correta para seu ambiente (local ou online)
const BASE_URL = 'https://botdplay.onrender.com'; 
const DPLAY_TOKEN_KEY = 'dplay_auth_token';

/**
 * Remove o token e redireciona para a página de login.
 */
function logout() {
    localStorage.removeItem(DPLAY_TOKEN_KEY);
    window.location.href = 'login.html';
}

/**
 * Pega o token do armazenamento local.
 * @returns {string|null} O token ou null se não existir.
 */
function getToken() {
    return localStorage.getItem(DPLAY_TOKEN_KEY);
}

/**
 * Protege uma página. Se o usuário não tiver um token válido, redireciona para o login.
 */
function protectPage() {
    const token = getToken();
    if (!token || token === 'undefined' || token === 'null') {
        window.location.href = 'login.html';
    }
}

/**
 * Redireciona para o dashboard se o usuário JÁ ESTIVER logado.
 */
function redirectIfLoggedIn() {
    const token = getToken();
    if (token && token !== 'undefined' && token !== 'null') {
        window.location.href = 'index.html';
    }
}

// Intercepta todas as chamadas `fetch` para adicionar o token de autorização.
const originalFetch = window.fetch;
window.fetch = function (url, options) {
    const token = getToken();
    const newOptions = { ...options };

    if (!newOptions.headers) newOptions.headers = {};
    
    if (url.startsWith(BASE_URL)) {
        // NÃO define o Content-Type se estamos enviando FormData (upload de arquivo)
        // O navegador fará isso automaticamente e corretamente.
        if (!(newOptions.body instanceof FormData)) {
            if (!newOptions.headers['Content-Type']) {
                newOptions.headers['Content-Type'] = 'application/json';
            }
        }

        if (token) {
            newOptions.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return originalFetch(url, newOptions);
};

// Função de alerta global
function showAlert(message, type = 'danger', placeholderId = 'alertPlaceholder') {
    const alertPlaceholder = document.getElementById(placeholderId);
    if (!alertPlaceholder) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button></div>`;
    alertPlaceholder.innerHTML = '';
    alertPlaceholder.append(wrapper);
    setTimeout(() => {
        const alertNode = wrapper.querySelector('.alert');
        if (alertNode) {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alertNode);
            if (bsAlert) bsAlert.close();
        }
    }, 5000);
}

async function loadUserData() {
    const token = getToken();
    if (!token) return;

    try {
        const res = await fetch(`${BASE_URL}/api/account/me`);
        if (!res.ok) { 
            if (res.status === 401 || res.status === 403) logout();
            return; 
        }
        
        const user = await res.json();
        const logoElement = document.getElementById('user-logo');
        const logoTextElement = document.getElementById('user-logo-text');

        if (logoElement && user.logoUrl) {
            logoElement.src = user.logoUrl.startsWith('http') ? user.logoUrl : `${BASE_URL}${user.logoUrl}`;
            logoElement.style.display = 'block';
            if (logoTextElement) logoTextElement.style.display = 'none';
        } else if (logoTextElement) {
            logoTextElement.style.display = 'block';
            if (logoElement) logoElement.style.display = 'none';
        }
    } catch (error) {
        console.error('Falha ao carregar dados do usuário:', error);
    }
}
