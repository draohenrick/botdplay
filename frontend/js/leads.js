const leadsContainer = document.getElementById('leads-container');
const searchInput = document.getElementById('search-lead');
const statusFilter = document.getElementById('status-filter');
const refreshBtn = document.getElementById('refresh-leads');
const exportBtn = document.getElementById('export-csv');

async function loadLeads(){
    const token = localStorage.getItem('token');
    if(!token) return window.location.href='index.html';

    try{
        const res = await fetch(`${BACKEND_URL}/api/leads`,{
            headers:{'Authorization':`Bearer ${token}`}
        });
        const data = await res.json();
        if(data.success){
            renderLeads(data.leads);
        }
    }catch(err){console.error(err);}
}

function renderLeads(leads){
    if(!leads.length){
        leadsContainer.innerHTML = `<div class="text-center py-3 text-muted">Nenhum lead encontrado</div>`;
        return;
    }

    leadsContainer.innerHTML = '';
    leads.forEach(lead=>{
        const el = document.createElement('a');
        el.href = '#';
        el.className = 'list-group-item list-group-item-action bg-dark text-light lead-item';
        el.dataset.name = lead.name;
        el.dataset.email = lead.email;
        el.dataset.phone = lead.phone;
        el.dataset.status = lead.status;
        el.dataset.origin = lead.origin;
        el.dataset.notes = lead.notes;
        el.innerHTML = `${lead.status==='converted'?'✅':'🧩'} <strong>${lead.name}</strong> - ${formatStatus(lead.status)}`;
        el.onclick = ()=>openLead(el);
        leadsContainer.appendChild(el);
    });
}

function openLead(el){
    const modal = new bootstrap.Modal(document.getElementById('leadModal'));
    const details = document.getElementById('lead-details');
    details.innerHTML = `
        <h5>${el.dataset.name}</h5>
        <p><strong>E-mail:</strong> ${el.dataset.email}</p>
        <p><strong>Telefone:</strong> ${el.dataset.phone}</p>
        <p><strong>Status:</strong> ${formatStatus(el.dataset.status)}</p>
        <p><strong>Origem:</strong> ${el.dataset.origin}</p>
        <p><strong>Notas:</strong> ${el.dataset.notes}</p>
    `;
    modal.show();
}

function formatStatus(status){
    switch(status){
        case 'new': return 'Novo';
        case 'in_progress': return 'Em negociação';
        case 'converted': return 'Convertido';
        case 'lost': return 'Perdido';
        default: return 'Desconhecido';
    }
}

function filterLeads(){
    const searchValue = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    document.querySelectorAll('.lead-item').forEach(item=>{
        const matchSearch = [item.dataset.name,item.dataset.email,item.dataset.phone].some(v=>v.toLowerCase().includes(searchValue));
        const matchStatus = statusValue==='all'||item.dataset.status===statusValue;
        item.style.display = matchSearch && matchStatus ? '' : 'none';
    });
}

function exportLeadsToCSV(){
    let csv = "Nome,E-mail,Telefone,Status,Origem,Notas\n";
    document.querySelectorAll('.lead-item').forEach(item=>{
        csv += `"${item.dataset.name}","${item.dataset.email}","${item.dataset.phone}","${formatStatus(item.dataset.status)}","${item.dataset.origin}","${item.dataset.notes}"\n`;
    });
    const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'leads.csv';
    link.click();
}

searchInput?.addEventListener('input', filterLeads);
statusFilter?.addEventListener('change', filterLeads);
refreshBtn?.addEventListener('click', loadLeads);
exportBtn?.addEventListener('click', exportLeadsToCSV);

document.addEventListener('DOMContentLoaded', loadLeads);
