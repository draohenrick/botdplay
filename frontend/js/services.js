const servicesTableBody = document.getElementById('servicesTableBody');
const newServiceForm = document.getElementById('newServiceForm');

async function loadServices() {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href='index.html';

    try {
        const res = await fetch(`${BACKEND_URL}/api/services`,{
            headers: {'Authorization': `Bearer ${token}`}
        });
        const data = await res.json();
        if(data.success){
            renderServices(data.services);
        }
    } catch(err){ console.error(err); }
}

function renderServices(services){
    servicesTableBody.innerHTML = '';
    if(!services.length){
        servicesTableBody.innerHTML = `<tr><td colspan="4" class="text-center">Nenhum fluxo cadastrado</td></tr>`;
        return;
    }

    services.forEach(service=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${service.label}</td>
            <td>${service.description}</td>
            <td>${service.keywords.join(', ')}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editService('${service._id}')">✏️ Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteService('${service._id}')">🗑️ Excluir</button>
            </td>
        `;
        servicesTableBody.appendChild(tr);
    });
}

// Criar novo fluxo
newServiceForm?.addEventListener('submit', async(e)=>{
    e.preventDefault();
    const token = localStorage.getItem('token');
    const label = document.getElementById('serviceLabel').value;
    const description = document.getElementById('serviceDescription').value;
    const keywords = document.getElementById('serviceKeywords').value.split(',').map(k=>k.trim());

    try{
        const res = await fetch(`${BACKEND_URL}/api/services`,{
            method:'POST',
            headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
            body: JSON.stringify({label,description,keywords})
        });
        const data = await res.json();
        if(data.success){
            alert('Fluxo criado com sucesso');
            loadServices();
            new bootstrap.Modal(document.getElementById('addServiceModal')).hide();
            newServiceForm.reset();
        } else alert(data.message);
    }catch(err){console.error(err);}
});

async function deleteService(id){
    if(!confirm('Deseja realmente excluir este fluxo?')) return;
    const token = localStorage.getItem('token');
    try{
        const res = await fetch(`${BACKEND_URL}/api/services/${id}`,{
            method:'DELETE',
            headers:{'Authorization':`Bearer ${token}`}
        });
        const data = await res.json();
        if(data.success) loadServices();
        else alert(data.message);
    }catch(err){console.error(err);}
}

async function editService(id){
    const token = localStorage.getItem('token');
    try{
        const res = await fetch(`${BACKEND_URL}/api/services/${id}`,{
            headers:{'Authorization':`Bearer ${token}`}
        });
        const service = await res.json();
        if(!service.success) return alert('Erro ao carregar fluxo');

        const label = prompt('Nome do Fluxo:', service.service.label);
        if(label===null) return;
        const description = prompt('Descrição:', service.service.description);
        if(description===null) return;
        const keywords = prompt('Palavras-chave (vírgula separados):', service.service.keywords.join(','));
        if(keywords===null) return;

        const updateRes = await fetch(`${BACKEND_URL}/api/services/${id}`,{
            method:'PUT',
            headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
            body: JSON.stringify({label,description,keywords:keywords.split(',').map(k=>k.trim())})
        });
        const updated = await updateRes.json();
        if(updated.success) loadServices();
        else alert(updated.message);

    }catch(err){console.error(err);}
}

document.addEventListener('DOMContentLoaded', loadServices);
