const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// CONEXÃO COM A BINANCE REAL
const binanceWS = new WebSocket('wss://fstream.binance.com/ws/btcusdt@ticker');

let btcData = { 
    price: 0, change24h: 0, high24h: 0, low24h: 0, 
    rsi: 55.42, openInterest: 22.09, liquidations: 2.45,
    orderBook: { asks: [], bids: [] }, trades: [] 
};

binanceWS.on('message', (data) => {
    const ticker = JSON.parse(data);
    btcData.price = parseFloat(ticker.c);
    btcData.change24h = parseFloat(ticker.P);
    btcData.high24h = parseFloat(ticker.h);
    btcData.low24h = parseFloat(ticker.l);
    
    // Envia para o seu site
    const msg = JSON.stringify(btcData);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor real online na porta ${PORT}`);
});
