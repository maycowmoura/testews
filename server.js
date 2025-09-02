import http from 'http';
import https from 'https';
import aedes from 'aedes';
import WebSocket from 'ws';
import websocketStream from 'websocket-stream';

// cria o broker MQTT
const broker = aedes();

// servidor HTTP (healthcheck)
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(new Date().toISOString() + ' - Servidor ativo\n');
});

// WebSocketServer ligado ao HTTP
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  // transforma o WS em stream compatível com Aedes
  const stream = websocketStream(ws);
  stream.pipe(broker).pipe(stream);

  ws.on('close', () => console.log('Cliente desconectado'));
});

// porta e host
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;

server.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor WebSocket/MQTT em http://${HOST}:${PORT}`);
});

// ping periódico pra manter Render acordado
function doFetch() {
  const url = `https://testews.onrender.com/?${Math.random()}`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(`Fetch realizado: ${url} ====>>> ${data}`));
  }).on('error', err => console.error('Erro no fetch:', err));

  setTimeout(doFetch, Math.floor(Math.random() * (840000 - 480000 + 1)) + 480000);
}

doFetch();
