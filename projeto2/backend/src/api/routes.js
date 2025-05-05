import express from 'express';
import axios from 'axios';
import { analyzeInstagramProfile, fetchProfileData } from '../services/instagram.js';
import accountManager from '../services/accountManager.js';
import CookieFixer from '../utils/cookieFixer.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Rota para obter dados do perfil
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const profileData = await fetchProfileData(username);
    
    if (!profileData) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }
    
    res.json(profileData);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do perfil' });
  }
});

// Rota para verificar se um perfil existe (verificação rápida sem análise completa)
router.get('/check-profile/:username', async (req, res) => {
  const { username } = req.params;
  
  if (!username || username.trim() === '') {
    return res.status(400).json({ error: 'Nome de usuário inválido' });
  }
  
  // Apenas confirmar que o username foi recebido corretamente
  console.log(`Verificação rápida para o perfil: ${username}`);
  
  // Retornar sucesso sem fazer scraping
  res.status(200).json({ 
    exists: true, 
    username: username.trim(), 
    message: 'Perfil válido para análise'
  });
});

// Rota para analisar perfil
router.get('/analyze/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const profileData = await fetchProfileData(username);
    
    if (!profileData) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }
    
    const analysis = await analyzeInstagramProfile(profileData);
    
    res.json({ 
      success: true,
      analysis 
    });
  } catch (error) {
    console.error('Erro ao analisar perfil:', error);
    res.status(500).json({ error: 'Erro ao analisar dados do perfil' });
  }
});

// Rota para verificar status das contas
router.get('/accounts/status', (req, res) => {
  try {
    const stats = accountManager.getStats();
    
    if (!stats) {
      return res.status(404).json({ error: 'Nenhuma conta carregada' });
    }
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Erro ao obter status das contas:', error);
    res.status(500).json({ error: 'Erro ao obter status das contas' });
  }
});

// Rota para recarregar contas
router.post('/accounts/reload', async (req, res) => {
  try {
    const success = await accountManager.loadAccountsFromFile();
    
    if (success) {
      const stats = accountManager.getStats();
      res.json({
        success: true,
        message: `${stats.total} contas carregadas com sucesso`,
        stats
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Não foi possível carregar as contas'
      });
    }
  } catch (error) {
    console.error('Erro ao recarregar contas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao recarregar contas'
    });
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

// Rota para corrigir o formato do arquivo de cookies
router.post('/cookies/fix', async (req, res) => {
  try {
    // Caminho base do projeto
    const projectRoot = path.resolve(__dirname, '../../..');
    
    // Possíveis localizações do arquivo de cookies
    const possiblePaths = [
      path.join(projectRoot, 'cookie.txt'),
      path.join(projectRoot, 'cookies.txt'),
      path.join(projectRoot, 'frontend', 'public', 'cookie.txt')
    ];
    
    let cookieFilePath = null;
    
    // Encontrar o primeiro arquivo que existe
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        cookieFilePath = p;
        break;
      }
    }
    
    if (!cookieFilePath) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo de cookies não encontrado'
      });
    }
    
    console.log(`Iniciando correção do arquivo: ${cookieFilePath}`);
    const success = await CookieFixer.fixCookieFileAsync(cookieFilePath);
    
    if (success) {
      // Recarregar as contas no AccountManager
      await accountManager.loadAccountsFromFile();
      
      return res.json({
        success: true,
        message: 'Arquivo de cookies corrigido com sucesso',
        stats: accountManager.getStats()
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Não foi possível corrigir o arquivo de cookies'
      });
    }
  } catch (error) {
    console.error('Erro ao corrigir arquivo de cookies:', error);
    res.status(500).json({
      success: false,
      error: `Erro ao corrigir arquivo: ${error.message}`
    });
  }
});

export default router; 