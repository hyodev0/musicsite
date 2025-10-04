const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rota para extrair áudio
app.post('/extract-audio', async (req, res) => {
    const { url } = req.body;
    
    try {
        // Validar URL do YouTube
        if (!ytdl.validateURL(url) && !url.includes('youtu.be')) {
            return res.status(400).json({ 
                error: 'URL do YouTube inválida' 
            });
        }

        // Obter informações do vídeo
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;
        
        // Gerar URL de áudio direto
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        const bestAudio = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
        
        res.json({
            success: true,
            title: title,
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

// Rota alternativa usando yt-dlp (mais plataformas)
app.post('/extract-audio-ytdlp', (req, res) => {
    const { url } = req.body;
    
    // Comando yt-dlp para extrair áudio
    const command = `yt-dlp -f "bestaudio" -g "${url}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ 
                error: 'Erro ao extrair áudio: ' + error.message 
            });
        }
        
        const audioUrl = stdout.trim();
        res.json({
            success: true,
            audioUrl: audioUrl
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});