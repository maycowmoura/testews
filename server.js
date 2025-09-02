
import http from 'http';
import https from 'https';
import aedes from 'aedes';
import websocket from 'websocket-stream';

// --- BROKER MQTT COM AEDES ---
const broker = aedes();

// --- SERVIDOR HTTP E WEBSOCKET (para rodar no Render) ---
const httpServer = http.createServer((req, res) => {
  // Healthcheck simples
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(new Date().toISOString() + ' - Servidor HTTP e Broker WebSocket ativos\n');
});

// O Render vai fornecer a porta pela variável de ambiente PORT
const port = process.env.PORT || 3000;
websocket.createServer({ server: httpServer }, broker.handle);

httpServer.listen(port, function () {
  console.log(`Servidor HTTP e Broker MQTT (WebSocket) escutando na porta ${port}`);
});

// --- LOGS DO BROKER ---
broker.on('client', function (client) {
  console.log(`[CLIENT_CONNECTED] Cliente conectado: ${client.id}`);
});

broker.on('clientDisconnect', function (client) {
  console.log(`[CLIENT_DISCONNECTED] Cliente desconectado: ${client.id}`);
});

broker.on('subscribe', function (subscriptions, client) {
  console.log(`[SUBSCRIBE] Cliente ${client.id} se inscreveu em: ${subscriptions.map(s => s.topic).join(', ')}`);
});

broker.on('publish', function (packet, client) {
  if (client) {
    console.log(`[PUBLISH] Cliente ${client.id} publicou no tópico ${packet.topic}: ${packet.payload.toString()}`);
  }
});


// --- CÓDIGO ORIGINAL (ping periódico) ---
function doFetch() {
  const url = `https://testews.onrender.com/?${Math.random()}`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(`Fetch realizado: ${url} ====>>> ${data}`));
  }).on('error', err => console.error('Erro no fetch:', err));

  // O timeout original foi mantido
  setTimeout(doFetch, Math.floor(Math.random() * (840000 - 480000 + 1)) + 480000);
}

// Inicia o ping periódico
doFetch();
