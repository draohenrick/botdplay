const BACKEND_URL = 'https://botdplay.onrender.com';

// Função para buscar dados do dashboard
async function fetchDashboardData() {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  try {
    const response = await fetch(`${BACKEND_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Erro ao buscar dados do dashboard.');

    const data = await response.json();
    updateDashboard(data);
  } catch (err) {
    console.error(err);
    alert('Não foi possível carregar os dados do dashboard. Faça login novamente.');
    logout();
  }
}

// Atualiza o dashboard com dados reais
function updateDashboard(data) {
  const user = data.user || {};
  document.getElementById('userName').textContent = user.nome || 'Usuário';
  document.getElementById('userCode').textContent = `Código: ${user.codigo || '-'}`;
  document.getElementById('userLevel').textContent = `Nível: ${user.nivel || '-'}`;
  document.getElementById('userWhatsapp').textContent = `WhatsApp: ${user.whatsapp || '-'}`;

  document.getElementById('leadCount').textContent = data.leads ?? 0;
  document.getElementById('conversationCount').textContent = data.conversations ?? 0;
  document.getElementById('connectionCount').textContent = data.connections ?? 0;

  const botStatus = document.getElementById('botStatus');
  botStatus.textContent = data.botOnline ? 'Online' : 'Offline';
  botStatus.classList.toggle('text-success', data.botOnline);
  botStatus.classList.toggle('text-danger', !data.botOnline);

  const logList = document.getElementById('logList');
  logList.innerHTML = '';
  (data.logs || []).forEach(log => {
    const li = document.createElement('li');
    li.className = 'list-group-item bg-transparent text-light border-secondary';
    li.textContent = log;
    logList.appendChild(li);
  });

  // Gráfico de atividades
  const ctx = document.getElementById('activityChart');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [{
        label: 'Mensagens Processadas',
        data: data.weeklyActivity || [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.1)' } },
        y: { grid: { color: 'rgba(255,255,255,0.1)' }, beginAtZero: true }
      },
      plugins: { legend: { labels: { color: 'white' } } }
    }
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  protectPage();
  fetchDashboardData();
});
