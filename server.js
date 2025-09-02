import http from 'http';
import aedes from 'aedes';
import { WebSocketServer } from 'ws';

const broker = aedes();

// cria servidor HTTP (healthcheck)
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(new Date().toISOString() + ' - Servidor ativo\n');
});

// cria WebSocketServer ligado ao HTTP
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  // conecta o WebSocket ao broker MQTT
  broker.handle(ws);

  ws.on('close', () => console.log('Cliente desconectado'));
});

// porta do Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor WebSocket/MQTT rodando em http://0.0.0.0:${PORT}`);
});

// ping periódico pra manter Render acordado
import https from 'https';
function doFetch() {
  const url = `https://testews.onrender.com/?${Math.random()}`;
  https.get(url, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(`Fetch realizado: ${url} ====>>> ${data}`));
  }).on('error', err => console.error('Erro no fetch:', err));

  setTimeout(doFetch, Math.floor(Math.random() * (840000 - 480000 + 1)) + 480000);
}
doFetch();
