const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();

// 🔥 CORRIJA O CORS - LINHA MAIS IMPORTANTE!
app.use(cors({
    origin: '*', // ⬅️ PERMITE TODOS OS SITES
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Rota de saúde para testar
app.get('/', (req, res) => {
    res.json({ message: 'API Online! 🎵' });
});

app.post('/extract-audio', async (req, res) => {
    const { url } = req.body;
    
    try {
        if (!ytdl.validateURL(url) && !url.includes('youtu.be')) {
            return res.status(400).json({ error: 'URL do YouTube inválida' });
        }

        const info = await ytdl.getInfo(url);
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        const bestAudio = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
        
        res.json({
            success: true,
            title: info.videoDetails.title,
            audioUrl: bestAudio.url,
            duration: info.videoDetails.lengthSeconds
        });

    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ 
            error: 'Erro ao extrair áudio: ' + error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Backend rodando na porta ${PORT}`);
    console.log(`🌐 URL: https://musicsite-production-943a.up.railway.app`);
});
