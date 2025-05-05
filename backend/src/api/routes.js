import express from 'express';
import axios from 'axios';
import { analyzeInstagramProfile, fetchProfileData } from '../services/instagram.js';
import { formatProfileData } from './profile.js';

const router = express.Router();

// Rota para obter dados do perfil
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const profileData = await fetchProfileData(username);
    
    if (!profileData) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }
    
    // Formatar os dados para o frontend
    const formattedData = formatProfileData(profileData);
    
    res.json(formattedData);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do perfil' });
  }
});

// Rota para analisar perfil
router.get('/analyze/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const profileData = await fetchProfileData(username);
    
    if (!profileData) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }
    
    // Formatar os dados antes de analisar
    const formattedData = formatProfileData(profileData);
    const analysis = await analyzeInstagramProfile(formattedData);
    
    res.json({ 
      success: true,
      analysis 
    });
  } catch (error) {
    console.error('Erro ao analisar perfil:', error);
    res.status(500).json({ error: 'Erro ao analisar dados do perfil' });
  }
});

// Rota de Proxy de Imagem para evitar CORS
router.get('/image-proxy', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).send('URL da imagem é obrigatória');
  }
  
  try {
    const decodedUrl = decodeURIComponent(url);
    console.log(`Proxy para imagem: ${decodedUrl}`);
    
    const response = await axios({
      method: 'get',
      url: decodedUrl,
      responseType: 'stream' // Importante para lidar com o stream de dados da imagem
    });
    
    // Define o tipo de conteúdo da resposta original
    res.setHeader('Content-Type', response.headers['content-type']);
    
    // Envia o stream da imagem para o cliente
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Erro no proxy de imagem:', error.message);
    if (error.response) {
      // Se o erro foi na requisição da imagem externa
      res.status(error.response.status).send('Erro ao buscar imagem externa');
    } else {
      // Outro erro interno
      res.status(500).send('Erro interno no proxy de imagem');
    }
  }
});

export default router; 