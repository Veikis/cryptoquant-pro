const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());

// Entrega o HTML para o navegador
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Dados simulados completos para o HTML funcionar 100%
let btcData = { 
    price: 69512.39, 
    change24h: -3.93, 
    high24h: 72145.00, 
    low24h: 68923.50, 
    funding: -0.0061,
    rsi: 36.78, 
    sopr: 0.99651234,
    openInterest: 22.09,
    liquidations: 2.45,
    orderBook: { 
        asks: [[69550, 1.2], [69560, 0.5], [69570, 0.8]], 
        bids: [[69480, 0.8], [69470, 2.1], [69460, 1.5]] 
    }, 
    trades: [] 
};

function broadcast() {
    const msg = JSON.stringify(btcData);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

// Simulação de preço e métricas em tempo real
setInterval(() => {
    const change = (Math.random() - 0.5) * 20;
    btcData.price += change;
    btcData.rsi = 30 + Math.random() * 40;
    
    // Adiciona novo trade na lista
    btcData.trades.unshift({
        price: btcData.price,
        quantity: Math.random() * 0.5,
        isBuyer: Math.random() > 0.5,
        time: new Date().toLocaleTimeString('pt-BR', {hour12: false})
    });
    if (btcData.trades.length > 10) btcData.trades.pop();

    broadcast();
}, 500);

// Porta obrigatória para o Railway
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor online na porta ${PORT}`);
});
