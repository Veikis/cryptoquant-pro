const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());

// Dados BTC em tempo real (SIMULADO - funciona 100%)
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
        asks: [
            [69550.00, 1.234],
            [69580.00, 0.856],
            [69610.00, 2.145],
            [69640.00, 1.567],
            [69670.00, 3.289]
        ],
        bids: [
            [69480.00, 1.876],
            [69450.00, 2.543],
            [69420.00, 1.234],
            [69390.00, 4.567],
            [69360.00, 2.891]
        ]
    },
    trades: []
};

// SIMULAÇÃO EM TEMPO REAL (100% funcional)
function simulateRealTimeData() {
    setInterval(() => {
        // Atualizar preço com micro-movimentos realistas
        const change = (Math.random() - 0.5) * 50;
        btcData.price += change;
        
        // Atualizar high/low se necessário
        if (btcData.price > btcData.high24h) btcData.high24h = btcData.price;
        if (btcData.price < btcData.low24h) btcData.low24h = btcData.price;
        
        // Atualizar métricas on-chain
        btcData.rsi = 36.78 + (Math.random() - 0.5) * 0.5;
        btcData.sopr = 0.9965 + (Math.random() - 0.5) * 0.001;
        btcData.openInterest = 22.09 + (Math.random() - 0.5) * 0.1;
        btcData.liquidations = 2.45 + (Math.random() - 0.5) * 0.5;
        btcData.funding = -0.0061 + (Math.random() - 0.5) * 0.0001;
        
        // Atualizar order book
        btcData.orderBook.asks = btcData.orderBook.asks.map(([price, size]) => [
            price + (Math.random() - 0.5) * 10,
            size + (Math.random() - 0.5) * 0.1
        ]).sort((a, b) => a[0] - b[0]);
        
        btcData.orderBook.bids = btcData.orderBook.bids.map(([price, size]) => [
            price + (Math.random() - 0.5) * 10,
            size + (Math.random() - 0.5) * 0.1
        ]).sort((a, b) => b[0] - a[0]);
        
        // Adicionar trade
        btcData.trades.unshift({
            price: btcData.price,
            quantity: Math.random() * 0.5,
            isBuyer: Math.random() > 0.5,
            time: new Date().toLocaleTimeString('pt-BR', {hour12: false})
        });
        if (btcData.trades.length > 50) btcData.trades.pop();
        
        // Enviar para todos clientes
        broadcast();
        
    }, 100); // Atualiza a cada 100ms (tempo real)
}

// Enviar dados para todos clientes conectados
function broadcast() {
    const msg = JSON.stringify(btcData);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

// Quando cliente conecta
wss.on('connection', (ws) => {
    console.log('Cliente conectado');
    ws.send(JSON.stringify(btcData));
    
    ws.on('close', () => console.log('Cliente desconectado'));
});

// Rota de teste
app.get('/', (req, res) => {
    res.json({ 
        status: 'Servidor Online', 
        btc: btcData.price,
        type: 'Dados simulados em tempo real'
    });
});

// Iniciar simulação
simulateRealTimeData();

// Use a porta do Railway ou a 8080 (que é a que apareceu nos seus logs)
const PORT = process.env.PORT || 8080;

// Adicionamos o '0.0.0.0' para o Railway conseguir acessar o servidor
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log('Dados em tempo real: ATIVOS');
});
