const http = require('http');
const url = require('url');
const https = require('https');
const aedes = require("aedes");
const ws = require("websocket-stream");


const broker = aedes();
ws.createServer({ server }, broker.handle);

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end((new Date()).toISOString() + ' - Servidor ativo\n');
});

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;

server.listen(PORT, HOST, () => {
  console.log(`Servidor WebSocket em http://${HOST}:${PORT}`);
});

function doFetch(){
  const url = `https://testews.onrender.com/?${Math.random()}`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(`Fetch realizado: ${url} ====>>> ${data}`));
  }).on('error', err => console.error('Erro no fetch:', err));
  
  setTimeout(doFetch, Math.floor(Math.random() * (840000 - 480000 + 1)) + 480000);
};

doFetch();





