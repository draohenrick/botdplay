import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard({ userId, apiUrl, socket }) {
  const [qr, setQr] = useState('');
  const [status, setStatus] = useState('');
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit('join', userId);
    socket.on('message', msg => setMessages(prev => [...prev, msg]));
    fetchMessages();
    return () => socket.off('message');
  }, []);

  const fetchMessages = async () => {
    const res = await axios.get(`${apiUrl}/bots/messages/${userId}`);
    setMessages(res.data);
  };

  const connectWhatsApp = async () => {
    const res = await axios.get(`${apiUrl}/bots/connect/${userId}`);
    setQr(res.data.qr);
    setStatus('Escaneie o QR code com seu WhatsApp');
  };

  const sendMessage = async () => {
    await axios.post(`${apiUrl}/bots/send-message/${userId}`, { number, message });
    fetchMessages();
  };

  return (
    <div>
      <h2>Conectar WhatsApp</h2>
      <button onClick={connectWhatsApp}>Gerar QR Code</button>
      {qr && <img src={qr} alt="QR Code" />}
      <p>{status}</p>

      <h2>Enviar Mensagem</h2>
      <input placeholder="Número" value={number} onChange={e => setNumber(e.target.value)} />
      <input placeholder="Mensagem" value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Enviar</button>

      <h2>Mensagens recebidas</h2>
      <ul>
        {messages.map((m, i) => (
          <li key={i}><strong>{m.direction === 'sent' ? 'Para' : 'De'} {m.from || m.to}:</strong> {m.body}</li>
        ))}
      </ul>
    </div>
  );
}
