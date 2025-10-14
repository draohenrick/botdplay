const token = localStorage.getItem('authToken');
const createInstanceForm = document.getElementById('create-instance-form');
const instanceNameInput = document.getElementById('instance-name-input');
const instancesList = document.getElementById('instances-list');
const qrCodeModal = new bootstrap.Modal(document.getElementById('qrCodeModal'));
const qrCodeImage = document.getElementById('qr-code-image');
const qrSpinner = document.getElementById('qr-spinner');

// --- CONEXÃO SOCKET.IO PARA TEMPO REAL ---
// Conecta ao servidor de socket, enviando o token para autenticação
const socket = io(BASE_URL, {
    auth: { token }
});

socket.on('connect', () => {
    console.log('Conectado ao servidor de socket!', socket.id);
});

// Ouve o evento 'qr_code' enviado pelo backend
socket.on('qr_code', (data) => {
    console.log('QR Code recebido!');
    qrSpinner.style.display = 'none';
    qrCodeImage.src = data.qr;
    qrCodeImage.style.display = 'block';
});

// Ouve o evento 'status_change' enviado pelo backend
socket.on('status_change', (data) => {
    console.log('Status da instância mudou:', data.status);
    if (data.status === 'online') {
        qrCodeModal.hide();
        alert(`Instância "${data.instanceName}" conectada com sucesso!`);
    }
    // Recarrega a lista de instâncias para mostrar o novo status
    loadInstances(); 
});


// --- LÓGICA DA PÁGINA ---

// Função para carregar e exibir as instâncias do usuário
async function loadInstances() {
    try {
        const response = await fetch(`${BASE_URL}/api/instances`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const instances = await response.json();
        
        instancesList.innerHTML = ''; // Limpa a lista
        if (instances.length === 0) {
            instancesList.innerHTML = '<p class="text-muted">Nenhuma conexão encontrada. Crie uma acima!</p>';
            return;
        }

        instances.forEach(instance => {
            const statusClass = instance.status === 'online' ? 'text-success' : 'text-danger';
            const statusText = instance.status === 'online' ? 'Online' : 'Offline';
            
            const card = `
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${instance.name}</h5>
                            <p class="card-text">Status: <strong class="${statusClass}">${statusText}</strong></p>
                            <button class="btn btn-danger btn-sm" onclick="disconnectInstance('${instance._id}')">Desconectar</button>
                        </div>
                    </div>
                </div>
            `;
            instancesList.innerHTML += card;
        });

    } catch (error) {
        console.error('Erro ao carregar instâncias:', error);
        instancesList.innerHTML = '<p class="text-danger">Não foi possível carregar as conexões.</p>';
    }
}

// Evento de submit do formulário para criar uma nova instância
createInstanceForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const instanceName = instanceNameInput.value;

    // Mostra o modal do QR Code em estado de carregamento
    qrCodeImage.style.display = 'none';
    qrSpinner.style.display = 'block';
    qrCodeModal.show();

    try {
        const response = await fetch(`${BASE_URL}/api/instances/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ instanceName })
        });

        if (!response.ok) {
            qrCodeModal.hide();
            const err = await response.json();
            alert(`Erro: ${err.error}`);
        }
        // Se a resposta for OK, apenas aguardamos o evento 'qr_code' do socket
    } catch (error) {
        console.error('Erro ao criar instância:', error);
        qrCodeModal.hide();
        alert('Erro de comunicação ao criar instância.');
    }
});

// Função para desconectar uma instância
async function disconnectInstance(instanceId) {
    if (!confirm('Tem certeza que deseja desconectar esta instância?')) return;
    
    try {
        const response = await fetch(`${BASE_URL}/api/instances/${instanceId}/disconnect`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Falha ao desconectar.');
        
        alert('Instância desconectada com sucesso.');
        loadInstances(); // Recarrega a lista
    } catch (error) {
        console.error('Erro ao desconectar:', error);
        alert('Não foi possível desconectar a instância.');
    }
}


// Carrega as instâncias quando a página é aberta
loadInstances();
