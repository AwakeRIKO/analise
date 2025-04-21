import express from 'express';
import { analyzeInstagramProfile, fetchProfileData } from '../services/instagram.js';

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

export default router; 