async function updateAccount(e) {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const submitBtn = accountForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    try {
        const response = await fetch(`${BACKEND_URL}/api/account`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome: nameField.value })
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            alert('Sua sessão expirou. Faça login novamente.');
            window.location.href = '/login.html';
            return;
        }

        const result = await response.json();
        alert(result.message || 'Dados atualizados com sucesso.');

    } catch (error) {
        console.error('Erro ao atualizar conta:', error);
        alert('Erro ao atualizar seus dados. Tente novamente.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Salvar Alterações';
    }
}
