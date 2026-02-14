const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path'); // Linha importante para encontrar o ficheiro

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());

// ESTA É A PARTE QUE FALTA: Faz o servidor mostrar o seu HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Dados simulados
let btcData = { price: 69512.39, rsi: 36.78, orderBook: { asks: [], bids: [] }, trades: [] };

function broadcast() {
    const msg = JSON.stringify(btcData);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
}

// Simulação de preço
setInterval(() => {
    btcData.price += (Math.random() - 0.5) * 10;
    broadcast();
}, 500);

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
});
