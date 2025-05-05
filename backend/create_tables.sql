-- Script para criar as tabelas no novo banco de dados
-- Execute este script conectado ao banco de dados no novo servidor
-- Dados de conexão:
-- Host: 18.231.177.3
-- User: ricardo
-- Password: Wakes110490key@
-- Port: 3306

-- Cria o banco de dados se não existir
CREATE DATABASE IF NOT EXISTS instagram_automation;

-- Usa o banco de dados
USE instagram_automation;

-- Tabela para histórico de buscas de perfis
CREATE TABLE IF NOT EXISTS profile_search_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  followers INT,
  following INT,
  posts INT,
  engagement_rate FLOAT,
  search_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bio TEXT,
  profile_picture_url TEXT,
  raw_data LONGTEXT
);

-- Tabela para contas do Instagram usadas para consultas
CREATE TABLE IF NOT EXISTS instagram_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  cookies TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para melhorar o desempenho das consultas
CREATE INDEX idx_username ON profile_search_history(username);
CREATE INDEX idx_search_timestamp ON profile_search_history(search_timestamp);
CREATE INDEX idx_ig_accounts_username ON instagram_accounts(username);
CREATE INDEX idx_ig_accounts_active ON instagram_accounts(is_active);

-- Insira aqui as contas do Instagram que você deseja usar para consultas (opcional)
-- INSERT INTO instagram_accounts (username, password) VALUES ('sua_conta', 'sua_senha');

-- Exemplo de consulta para verificar se as tabelas foram criadas
-- SHOW TABLES; 