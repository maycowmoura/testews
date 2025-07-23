const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const https = require('https');

const VALID_TOKENS = ['abc123', 'token456'];

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end((new Date()).toISOString() + ' - Servidor ativo\n');
});
const wss = new WebSocket.Server({ noServer: true });

const clients = new Map(); // socket => userId

wss.on('connection', (ws, request, userId) => {
  clients.set(ws, userId);
  console.log(`Usuário ${userId} conectado`);

  ws.on('message', (msg) => {
    console.log(`Mensagem de ${userId}:`, msg.toString());
    clients.forEach((clientId, client) => {
        client.send(`${msg}`);
        console.log(`Enviando para ${clientId}: ${msg}`);
    })
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Usuário ${userId} desconectado`);
  });
});

server.on('upgrade', (req, socket, head) => {
  const { query } = url.parse(req.url, true);
  const token = query.token;

  if (!VALID_TOKENS.includes(token)) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  const userId = 'user-' + token;

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req, userId);
  });
});

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

server.listen(PORT, HOST, () => {
  console.log(`Servidor WebSocket em http://${HOST}:${PORT}`);
});


setInterval(() => {
  https.get('https://testews.onrender.com/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(`Fetch realizado: ${data}`));
  }).on('error', err => console.error('Erro no fetch:', err));
}, 14 * 60 * 1000);
