import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Dashboard from './components/Dashboard';

const API_URL = 'https://botdplay.onrender.com';
const socket = io(API_URL);

function App() {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [logged, setLogged] = useState(false);

  const register = async () => {
    const res = await axios.post(`${API_URL}/users/register`, { name: 'Cliente', email, password });
    setUserId(res.data.userId);
    setLogged(true);
  };

  const login = async () => {
    const res = await axios.post(`${API_URL}/users/login`, { email, password });
    setUserId(res.data.userId);
    setLogged(true);
  };

  if (!logged) return (
    <div>
      <h1>Dplay Bot SaaS</h1>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={register}>Registrar</button>
      <button onClick={login}>Login</button>
    </div>
  );

  return <Dashboard userId={userId} apiUrl={API_URL} socket={socket} />;
}

export default App;
