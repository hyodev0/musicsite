const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();

// CORS
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

// 🔥 ROTA REAL COM ytdl-core
app.post('/extract-audio', async (req, res) => {
    try {
        const { url } = req.body;
        
        console.log('📥 Recebendo URL:', url);
        
        if (!url) {
            return res.status(400).json({ error: 'URL é obrigatória' });
        }

        // Validar URL do YouTube
        if (!ytdl.validateURL(url) && !url.includes('youtu.be')) {
            return res.status(400).json({ error: 'URL do YouTube inválida' });
        }

        console.log('🔍 Obtendo informações do vídeo...');
        
        // Extrair informações do YouTube
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;
        
        console.log('📹 Vídeo:', title);
        
        // Encontrar melhor formato de áudio
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        
        if (audioFormats.length === 0) {
            return res.status(400).json({ error: 'Nenhum formato de áudio encontrado' });
        }

        const bestAudio = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
        
        console.log('✅ Áudio encontrado:', bestAudio.url);
        
        res.json({
            success: true,
            title: title,
            audioUrl: bestAudio.url,
            duration: info.videoDetails.lengthSeconds
        });

    } catch (error) {
        console.error('❌ Erro na extração:', error);
        res.status(500).json({ 
            error: 'Erro ao extrair áudio: ' + error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Disponível em: https://musicsite-api.onrender.com`);
});
