const express = require('express');
const cors = require('cors');

const app = express();

// 🔥 CORS CONFIGURADO CORRETAMENTE
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

app.use(express.json());

// Rota de saúde
app.get('/', (req, res) => {
    res.json({ 
        status: 'online',
        message: '🎵 API Audio funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota de teste simples (SEM ytdl-core por enquanto)
app.post('/extract-audio', async (req, res) => {
    try {
        const { url } = req.body;
        
        console.log('📥 Recebida URL:', url);
        
        if (!url) {
            return res.status(400).json({ error: 'URL é obrigatória' });
        }

        // 🔥 RESPOSTA DE TESTE - REMOVA DEPOIS
        res.json({
            success: true,
            message: '✅ API conectada com sucesso!',
            test: 'Funcionando - agora adicione ytdl-core',
            receivedUrl: url,
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        });

    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ 
            error: 'Erro: ' + error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Disponível em: https://musicsite-api.onrender.com`);
});
