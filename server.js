const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        message: '🎵 Player de Áudio Online'
    });
});

// 🔥 ROTA PRINCIPAL - Apenas busca URL do áudio para tocar no player
app.post('/extract-audio', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL é obrigatória' });
        }

        console.log('🎯 Buscando áudio para:', url);

        const platform = identifyPlatform(url);
        console.log('📱 Plataforma:', platform);

        let audioUrl, title;

        // 🔵 YOUTUBE - Buscar URL direta do áudio
        if (platform === 'youtube') {
            const info = await ytdl.getInfo(url);
            const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
            
            if (audioFormats.length > 0) {
                const bestAudio = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
                audioUrl = bestAudio.url;
                title = info.videoDetails.title;
            }
        }
        // 🎵 TIKTOK - URL do áudio
        else if (platform === 'tiktok') {
            const videoId = extractTikTokId(url);
            audioUrl = `https://www.tiktok.com/api/audio/url/?video_id=${videoId}`;
            title = 'Áudio do TikTok';
        }
        // 🟢 SPOTIFY - Embed para player
        else if (platform === 'spotify') {
            const trackId = extractSpotifyId(url);
            audioUrl = `https://open.spotify.com/embed/track/${trackId}`;
            title = 'Música do Spotify';
        }
        // 🔵 DEEZER - Embed para player  
        else if (platform === 'deezer') {
            const trackId = extractDeezerId(url);
            audioUrl = `https://widget.deezer.com/widget/dark/track/${trackId}`;
            title = 'Música do Deezer';
        }

        if (!audioUrl) {
            throw new Error('Não foi possível obter o áudio');
        }

        console.log('✅ URL do áudio obtida:', audioUrl);
        
        res.json({
            success: true,
            audioUrl: audioUrl, // ⬅️ URL para o player tocar
            title: title,
            platform: platform
        });

    } catch (error) {
        console.error('❌ Erro:', error.message);
        res.status(500).json({ 
            error: 'Erro: ' + error.message 
        });
    }
});

// 🛠 FUNÇÕES AUXILIARES
function identifyPlatform(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('deezer.com')) return 'deezer';
    return 'unknown';
}

function extractTikTokId(url) {
    const match = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
    return match ? match[1] : null;
}

function extractSpotifyId(url) {
    const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

function extractDeezerId(url) {
    const match = url.match(/deezer\.com\/.*\/(\d+)/);
    return match ? match[1] : null;
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Player de Áudio rodando na porta ${PORT}`);
    console.log('🎯 Modo: Reprodução em segundo plano');
});
