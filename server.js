const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());

// Entrega o seu arquivo index.html quando você acessa o link
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Dados simulados (organizados para o seu HTML ler corretamente)
let btcData = { 
    price: 69512.39, 
    change24h: -3.93,
    high24h: 72145.00,
    low24h: 68923.50,
    funding: -0.0061,
    rsi: 36.78452139, 
    sopr: 0.99651234,
    openInterest: 22.09168452,
    liquidations: 2.45,
    orderBook: { 
        asks: [[69515, 0.5], [69520, 1.2]], 
        bids: [[69510, 0.8], [69505, 2.1]] 
    }, 
    trades: [] 
};

function broadcast() {
    const msg = JSON.stringify(btcData);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
}

// Simulação de preço mudando a cada meio segundo
setInterval(() => {
    btcData.price += (Math.random() - 0.5) * 5;
    btcData.rsi += (Math.random() - 0.5) * 0.1;
    broadcast();
}, 500);

[span_1](start_span)// Configuração de porta para o Railway funcionar[span_1](end_span)
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor online na porta ${PORT}`);
});
