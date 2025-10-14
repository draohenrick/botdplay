const API_URL = "https://botdplay.onrender.com"; // ajuste se a rota for diferente

document.getElementById("register-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const empresa = document.getElementById("empresa").value.trim();
  const segmento = document.getElementById("segmento").value;
  const descricao = document.getElementById("descricao").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const horario = document.getElementById("horario").value.trim();
  const msg = document.getElementById("message");

  msg.textContent = "Enviando informações...";
  msg.style.color = "#fff";

  try {
    const response = await fetch(`${API_URL}/register`, { // Ajuste de rota
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        email,
        telefone,
        senha,
        empresa,
        segmento,
        descricao,
        endereco,
        horario
      })
    });

    // Confere se o response é JSON
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { error: "Resposta inesperada do servidor" };
    }

    if (response.ok) {
      msg.textContent = "✅ Conta criada com sucesso! Redirecionando...";
      msg.style.color = "limegreen";
      setTimeout(() => window.location.href = "/login.html", 2000);
    } else {
      msg.textContent = data.error || "❌ Falha ao registrar. Verifique os campos.";
      msg.style.color = "red";
      console.error("Erro do backend:", data);
    }

  } catch (error) {
    console.error("Erro de conexão:", error);
    msg.textContent = "❌ Erro ao conectar com o servidor.";
    msg.style.color = "red";
  }
});
