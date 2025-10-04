const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const util = require('util');
const fetch = require('node-fetch');

const execPromise = util.promisify(exec);
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
        message: '🎵 API Multi-Plataforma',
        platforms: ['YouTube', 'TikTok', 'Spotify', 'Deezer']
    });
});

// 🔥 ROTA PRINCIPAL PARA TODAS AS PLATAFORMAS
app.post('/extract-audio', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL é obrigatória' });
        }

        console.log('🎯 Processando URL:', url);

        // Identificar plataforma
        const platform = identifyPlatform(url);
        console.log('📱 Plataforma identificada:', platform);

        let audioUrl, title;

        switch (platform) {
            case 'youtube':
                ({ audioUrl, title } = await extractYouTube(url));
                break;
                
            case 'tiktok':
                ({ audioUrl, title } = await extractTikTok(url));
                break;
                
            case 'spotify':
                ({ audioUrl, title } = await extractSpotify(url));
                break;
                
            case 'deezer':
                ({ audioUrl, title } = await extractDeezer(url));
                break;
                
            default:
                throw new Error('Plataforma não suportada');
        }

        console.log('✅ Áudio extraído:', title);
        
        res.json({
            success: true,
            audioUrl: audioUrl,
            title: title,
            platform: platform,
            duration: 'Extraído com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ 
            error: 'Erro: ' + error.message 
        });
    }
});

// 🔵 YOUTUBE
async function extractYouTube(url) {
    try {
        const info = await ytdl.getInfo(url);
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        
        if (audioFormats.length === 0) {
            throw new Error('Nenhum áudio encontrado');
        }

        const bestAudio = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
        
        return {
            audioUrl: bestAudio.url,
            title: info.videoDetails.title
        };
    } catch (error) {
        // Fallback para yt-dlp se ytdl-core falhar
        return await extractWithYtDlp(url);
    }
}

// 🎵 TIKTOK
async function extractTikTok(url) {
    // Usar API pública para TikTok
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data.data || !data.data.music) {
        throw new Error('Áudio do TikTok não encontrado');
    }

    return {
        audioUrl: data.data.music,
        title: data.data.title || 'Áudio do TikTok'
    };
}

// 🟢 SPOTIFY
async function extractSpotify(url) {
    // Converter Spotify para YouTube e depois extrair
    const trackId = extractSpotifyId(url);
    
    if (!trackId) {
        throw new Error('ID do Spotify não encontrado');
    }

    // Buscar no YouTube usando o nome da música do Spotify
    const youtubeUrl = await spotifyToYoutube(trackId);
    
    if (!youtubeUrl) {
        throw new Error('Não foi possível encontrar no YouTube');
    }

    // Extrair do YouTube
    return await extractYouTube(youtubeUrl);
}

// 🔵 DEEZER
async function extractDeezer(url) {
    // Usar API do Deezer
    const trackId = extractDeezerId(url);
    
    if (!trackId) {
        throw new Error('ID do Deezer não encontrado');
    }

    const apiUrl = `https://api.deezer.com/track/${trackId}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.error) {
        throw new Error('Música do Deezer não encontrada');
    }

    // Buscar no YouTube
    const searchQuery = `${data.title} ${data.artist.name}`;
    const youtubeUrl = await searchYoutube(searchQuery);
    
    return await extractYouTube(youtubeUrl);
}

// 🛠 FUNÇÕES AUXILIARES
function identifyPlatform(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    } else if (url.includes('tiktok.com')) {
        return 'tiktok';
    } else if (url.includes('spotify.com')) {
        return 'spotify';
    } else if (url.includes('deezer.com')) {
        return 'deezer';
    }
    return 'unknown';
}

function extractSpotifyId(url) {
    const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

function extractDeezerId(url) {
    const match = url.match(/deezer\.com\/.*\/(\d+)/);
    return match ? match[1] : null;
}

async function spotifyToYoutube(trackId) {
    // Simulação - em produção use uma API real
    return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
}

async function searchYoutube(query) {
    // Simulação - em produção use YouTube Data API
    return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
}

async function extractWithYtDlp(url) {
    try {
        const { stdout } = await execPromise(`yt-dlp -f "bestaudio" -g "${url}" --no-warnings`);
        const audioUrl = stdout.trim();
        
        return {
            audioUrl: audioUrl,
            title: 'Áudio Extraído'
        };
    } catch (error) {
        throw new Error('Falha na extração com yt-dlp');
    }
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Multi-Plataforma rodando na porta ${PORT}`);
    console.log('📱 Plataformas: YouTube, TikTok, Spotify, Deezer');
});
