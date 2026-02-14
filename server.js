const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());

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
        asks: [[69550.00, 1.23], [69580.00, 0.85], [69610.00, 2.14], [69640.00, 1.56], [69670.00, 3.28]],
        bids: [[69480.00, 1.87], [69450.00, 2.54], [69420.00, 1.23], [69390.00, 4.56], [69360.00, 2.89]]
    },
    trades: []
};

// Conectar Binance WebSocket
function connectBinance() {
    try {
        const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
        
        ws.on('message', (data) => {
            const ticker = JSON.parse(data);
            btcData.price = parseFloat(ticker.c);
            btcData.change24h = parseFloat(ticker.P);
            btcData.high24h = parseFloat(ticker.h);
            btcData.low24h = parseFloat(ticker.l);
            btcData.volume = parseFloat(ticker.v);
            broadcast();
        });
        
        ws.on('error', () => setTimeout(connectBinance, 5000));
        ws.on('close', () => setTimeout(connectBinance, 5000));
        
    } catch(e) {
        simulateData();
    }
}

function connectOrderBook() {
    try {
        const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth5@100ms');
        ws.on('message', (data) => {
            const depth = JSON.parse(data);
            if(depth.asks) btcData.orderBook.asks = depth.asks.slice(0, 5);
            if(depth.bids) btcData.orderBook.bids = depth.bids.slice(0, 5);
        });
    } catch(e) {}
}

function simulateData() {
    setInterval(() => {
        btcData.price += (Math.random() - 0.5) * 50;
        btcData.rsi = 36.78 + (Math.random() - 0.5);
        btcData.sopr = 0.9965 + (Math.random() - 0.5) * 0.001;
        btcData.liquidations = 2.45 + (Math.random() - 0.5);
        
        btcData.trades.unshift({
            price: btcData.price,
            quantity: Math.random() * 0.5,
            isBuyer: Math.random() > 0.5,
            time: new Date().toLocaleTimeString('pt-BR', {hour12: false})
        });
        if(btcData.trades.length > 20) btcData.trades.pop();
        
        broadcast();
    }, 200);
}

function broadcast() {
    const msg = JSON.stringify(btcData);
    wss.clients.forEach(client => {
        if(client.readyState === WebSocket.OPEN) client.send(msg);
    });
}

wss.on('connection', (ws) => {
    ws.send(JSON.stringify(btcData));
});

connectBinance();
connectOrderBook();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
