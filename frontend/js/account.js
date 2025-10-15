const accountName = document.getElementById('accountName');
const accountEmail = document.getElementById('accountEmail');

async function loadAccount() {
    const token = localStorage.getItem('token');
    if(!token) return window.location.href='index.html';

    try {
        const res = await fetch(`${BACKEND_URL}/api/account`,{
            headers: {'Authorization': `Bearer ${token}`}
        });
        const data = await res.json();
        if(data.success){
            accountName.value = data.user.name;
            accountEmail.value = data.user.email;
        } else {
            logout();
        }
    } catch(err){
        console.error(err);
        alert('Erro ao carregar dados da conta');
    }
}

document.getElementById('updateProfileBtn')?.addEventListener('click', async()=>{
    const token = localStorage.getItem('token');
    const name = accountName.value;

    try{
        const res = await fetch(`${BACKEND_URL}/api/account`,{
            method:'PUT',
            headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
            body:JSON.stringify({name})
        });
        const data = await res.json();
        if(data.success) alert('Perfil atualizado');
    }catch(err){console.error(err);}
});

document.getElementById('changePasswordBtn')?.addEventListener('click', async()=>{
    const token = localStorage.getItem('token');
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try{
        const res = await fetch(`${BACKEND_URL}/api/account/password`,{
            method:'PUT',
            headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
            body:JSON.stringify({currentPassword,newPassword})
        });
        const data = await res.json();
        if(data.success) alert('Senha alterada com sucesso');
        else alert(data.message);
    }catch(err){console.error(err);}
});

document.addEventListener('DOMContentLoaded', loadAccount);
