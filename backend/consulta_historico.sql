-- Consultas para visualizar dados da tabela profile_search_history
-- Execute essas consultas no HeidiSQL conectado ao banco instagram_automation

-- Listar todas as tabelas no banco de dados
SHOW TABLES;

-- Ver estrutura da tabela profile_search_history
DESCRIBE profile_search_history;

-- Contar quantos registros existem na tabela
SELECT COUNT(*) AS total_registros FROM profile_search_history;

-- Visualizar todos os registros na tabela (do mais recente para o mais antigo)
SELECT 
    id,
    username, 
    full_name, 
    followers, 
    following, 
    posts, 
    CONCAT(ROUND(engagement_rate * 100, 2), '%') AS taxa_engajamento,
    search_timestamp AS data_consulta
FROM 
    profile_search_history 
ORDER BY 
    search_timestamp DESC;

-- Visualizar detalhes completos do usuário paulopaolucci
SELECT * FROM profile_search_history 
WHERE username = 'paulopaolucci' 
ORDER BY search_timestamp DESC 
LIMIT 1; 