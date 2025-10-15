const adminKpiCards = document.getElementById('adminKpiCards');
const adminChartsDiv = document.getElementById('adminCharts');
const adminLogsDiv = document.getElementById('adminLogs');
const logoutAdminBtn = document.getElementById('logoutAdminBtn');

async function loadAdminDashboard(){
    const token = localStorage.getItem('adminToken');
    if(!token) return window.location.href='index.html';

    try{
        const res = await fetch(`${BACKEND_URL}/api/admin/dashboard`,{
            headers:{'Authorization':`Bearer ${token}`}
        });
        const data = await res.json();
        if(!data.success) return window.location.href='index.html';

        // KPIs
        adminKpiCards.innerHTML = `
        <div class="col-md-3 mb-3"><div class="card text-white bg-primary"><div class="card-body"><h5>Usuários Ativos</h5><p>${data.kpis.activeUsers}</p></div></div></div>
        <div class="col-md-3 mb-3"><div class="card text-white bg-success"><div class="card-body"><h5>Leads Totais</h5><p>${data.kpis.totalLeads}</p></div></div></div>
        <div class="col-md-3 mb-3"><div class="card text-white bg-warning"><div class="card-body"><h5>Conexões Ativas</h5><p>${data.kpis.activeConnections}</p></div></div></div>
        <div class="col-md-3 mb-3"><div class="card text-white bg-danger"><div class="card-body"><h5>Bot Online</h5><p>${data.kpis.botStatus?'Sim':'Não'}</p></div></div></div>
        `;

        // Charts
        const ctxUsers = document.getElementById('chartUsers').getContext('2d');
        new Chart(ctxUsers,{type:'line',data:{labels:data.charts.users.labels,datasets:[{label:'Usuários',data:data.charts.users.values,backgroundColor:'rgba(0,123,255,0.2)',borderColor:'rgba(0,123,255,1)',borderWidth:2}]}});
        const ctxConnections = document.getElementById('chartConnections').getContext('2d');
        new Chart(ctxConnections,{type:'line',data:{labels:data.charts.connections.labels,datasets:[{label:'Conexões',data:data.charts.connections.values,backgroundColor:'rgba(255,102,0,0.2)',borderColor:'rgba(255,102,0,1)',borderWidth:2}]}});
        
        // Logs
        adminLogsDiv.innerHTML = `<ul class="list-group mt-3">${data.logs.map(log=>`<li class="list-group-item">${log}</li>`).join('')}</ul>`;
    }catch(err){console.error(err);alert('Erro ao carregar dashboard admin');}
}

logoutAdminBtn?.addEventListener('click',()=>{
    localStorage.removeItem('adminToken');
    window.location.href='index.html';
});

document.addEventListener('DOMContentLoaded', loadAdminDashboard);
