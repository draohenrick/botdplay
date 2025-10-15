const usersContainer = document.getElementById('users-container');
const addUserBtn = document.getElementById('addUserBtn');

async function loadUsers(){
    const token = localStorage.getItem('token');
    if(!token) return window.location.href='index.html';

    try{
        const res = await fetch(`${BACKEND_URL}/api/users`,{
            headers:{'Authorization':`Bearer ${token}`}
        });
        const data = await res.json();
        if(data.success){
            renderUsers(data.users);
        }
    }catch(err){console.error(err);}
}

function renderUsers(users){
    usersContainer.innerHTML = '';
    if(!users.length){
        usersContainer.innerHTML = `<tr><td colspan="4" class="text-center">Nenhum usuário cadastrado</td></tr>`;
        return;
    }

    users.forEach(user=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role || 'Usuário'}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editUser('${user._id}')">✏️ Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user._id}')">🗑️ Excluir</button>
            </td>
        `;
        usersContainer.appendChild(tr);
    });
}

addUserBtn?.addEventListener('click', async()=>{
    const name = prompt('Nome do usuário:');
    if(!name) return;
    const email = prompt('Email:');
    if(!email) return;
    const password = prompt('Senha:');
    if(!password) return;

    const token = localStorage.getItem('token');
    try{
        const res = await fetch(`${BACKEND_URL}/api/users`,{
            method:'POST',
            headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
            body: JSON.stringify({name,email,password})
        });
        const data = await res.json();
        if(data.success) loadUsers();
        else alert(data.message);
    }catch(err){console.error(err);}
});

async function deleteUser(id){
    if(!confirm('Deseja realmente excluir este usuário?')) return;
    const token = localStorage.getItem('token');
    try{
        const res = await fetch(`${BACKEND_URL}/api/users/${id}`,{
            method:'DELETE',
            headers:{'Authorization':`Bearer ${token}`}
        });
        const data = await res.json();
        if(data.success) loadUsers();
        else alert(data.message);
    }catch(err){console.error(err);}
}

async function editUser(id){
    const name = prompt('Novo nome:');
    if(!name) return;
    const role = prompt('Função (admin ou user):');
    if(!role) return;

    const token = localStorage.getItem('token');
    try{
        const res = await fetch(`${BACKEND_URL}/api/users/${id}`,{
            method:'PUT',
            headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
            body: JSON.stringify({name,role})
        });
        const data = await res.json();
        if(data.success) loadUsers();
        else alert(data.message);
    }catch(err){console.error(err);}
}

document.addEventListener('DOMContentLoaded', loadUsers);
