const express = require('express');
const session = require('express-session');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const port = 3000; 

// Variáveis para armazenar os tokens de acesso e atualização
let accessToken = null;
let refreshToken = null;

// Configuração da API do Spotify
const spotifyApi = new SpotifyWebApi({
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    redirectUri: 'http://localhost:3000/callback'
});

// Middleware para sessões
app.use(session({
    secret: 'YOUR_SECRET_KEY', // Uma chave secreta para criptografar a sessão
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false // Use `true` para HTTPS 
    }
}));

// Endpoint para a página inicial
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Endpoint de autorização (callback)
app.get('/callback', async (req, res) => {
    const code = req.query.code;

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        accessToken = data.body.access_token;
        refreshToken = data.body.refresh_token;

        // Salva os tokens na sessão do usuário
        req.session.accessToken = accessToken;
        req.session.refreshToken = refreshToken;

        res.redirect('/'); 
    } catch (error) {
        console.error('Erro na autenticação:', error);
        res.send('Erro na autenticação.');
    }
});

// Endpoint para obter o URL de pré-visualização da música
app.get('/get-music', async (req, res) => {
    const trackId = req.query.trackId;

    try {
        const track = await spotifyApi.getTrack(trackId);
        res.json(track.body);
    } catch (error) {
        console.error('Erro ao obter música:', error);
        res.status(500).send('Erro ao obter música.');
    }
});

// Endpoint para iniciar a reprodução (não é usado neste exemplo)
app.get('/play', async (req, res) => {
    const trackId = req.query.trackId;

    try {
        await spotifyApi.play({
            uris: [`spotify:track:${trackId}`],
        });
        res.send('Música reproduzindo!');
    } catch (error) {
        console.error('Erro ao iniciar a reprodução:', error);
        res.status(500).send('Erro ao iniciar a reprodução.');
    }
});

// Endpoint para pausar a reprodução (não é usado neste exemplo)
app.get('/pause', async (req, res) => {
    try {
        await spotifyApi.pause();
        res.send('Música pausada!');
    } catch (error) {
        console.error('Erro ao pausar a reprodução:', error);
        res.status(500).send('Erro ao pausar a reprodução.');
    }
});

// Endpoint para avançar para a próxima música (não é usado neste exemplo)
app.get('/next', async (req, res) => {
    try {
        await spotifyApi.next();
        res.send('Próxima música!');
    } catch (error) {
        console.error('Erro ao avançar para a próxima música:', error);
        res.status(500).send('Erro ao avançar para a próxima música.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});