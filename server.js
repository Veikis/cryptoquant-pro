const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());

// --- CONFIGURAÇÃO PARA MOSTRAR O SEU HTML ---
// Isso diz ao servidor para entregar o seu arquivo index.html quando você abrir o site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Dados BTC simulados
let btcData = {
    price: 69512.39,
    change24h: -3.93,
    high24h: 72145.00,
    low24h: 68923.50,
    volume: 45200000000,
    funding: -0.0061,
    rsi: 36.78,
    sopr: 0.9965,
    openInterest: 22.09,
    liquidations: 2.45,
    orderBook: {
        asks: [[69550.00, 1.234], [69580.00, 0.856], [69610.00, 2.145]],
        bids: [[69480.00, 1.876], [69450.00, 2.543], [69420.00, 1.234]]
    },
    trades: []
};

function simulateRealTimeData() {
    setInterval(() => {
        const change = (Math.random() - 0.5) * 50;
        btcData.price += change;
        btcData.rsi = 36.78 + (Math.random() - 0.5);
        
        // Adiciona trade simulado
        btcData.trades.unshift({
            price: btcData.price,
            quantity: Math.random() * 0.5,
            isBuyer: Math.random() > 0.5,
            time: new Date().toLocaleTimeString('pt-BR', {hour12: false})
        });
        if (btcData.trades.length > 20) btcData.trades.pop();
        
        broadcast();
    }, 500);
}

function broadcast() {
    const msg = JSON.stringify(btcData);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

wss.on('connection', (ws) => {
    ws.send(JSON.stringify(btcData));
});

simulateRealTimeData();

// --- CONFIGURAÇÃO DE PORTA PARA O RAILWAY ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
