const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const app = express();
const axios = require('axios');
const { OpenAI } = require('openai');

// Importar configuração centralizada
const config = require('./config');

// Configurações do Express
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
app.use('/images', express.static(path.join(__dirname, '..', 'frontend', 'dist', 'assets')));

// Substituir a seção de configuração do banco de dados:
// --- Configuração do Banco de Dados ---
// Usar configuração centralizada do arquivo config.js
const dbConfig = config.db;

console.log('Configuração de banco de dados:', { 
  host: dbConfig.host, 
  port: dbConfig.port, 
  user: dbConfig.user, 
  database: dbConfig.database,
  password: dbConfig.password ? '******' : 'NÃO DEFINIDA'
});

// Substituir a inicialização do OpenAI:
// Inicializar OpenAI API apenas se a chave estiver disponível
let openai = null;
if (config.api.openAiApiKey) {
  try {
    openai = new OpenAI({
      apiKey: config.api.openAiApiKey
    });
    console.log('API OpenAI inicializada com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar API OpenAI:', error);
  }
} else {
  console.warn("Chave API OpenAI não encontrada. A análise por IA será desativada.");
}

// O resto do arquivo permanece igual 