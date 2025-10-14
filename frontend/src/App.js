import { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://botdplay.onrender.com/users'; // back-end Render

function App() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const register = async () => {
    try {
      const res = await axios.post(`${API_URL}/register`, { name, email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data.error || 'Erro no cadastro');
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data.error || 'Erro no login');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dplay ChatBot SaaS</h1>

      <h2>Registrar</h2>
      <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={register}>Registrar</button>

      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={login}>Login</button>

      <p>{message}</p>
    </div>
  );
}

export default App;
