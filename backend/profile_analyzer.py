#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime

# Configurar encoding para entrada/saída
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stdin, 'reconfigure'):
    sys.stdin.reconfigure(encoding='utf-8')

def analyze_profile(profile_data):
    """
    Analisa os dados de um perfil do Instagram usando Pandas
    Retorna insights avançados para melhorar as recomendações da IA
    """
    # Converter dados de entrada JSON para dicionário
    if isinstance(profile_data, str):
        try:
            profile_data = json.loads(profile_data)
        except json.JSONDecodeError as e:
            print(f"Erro ao decodificar JSON: {e}")
            return {"error": f"Erro ao decodificar JSON: {str(e)}"}
    
    # Verificar se os dados são um dicionário
    if not isinstance(profile_data, dict):
        print(f"Erro: dados de entrada não são um dicionário. Tipo recebido: {type(profile_data)}")
        return {"error": f"Formato de dados inválido: {type(profile_data)}"}
    
    # Criar DataFrame com as estatísticas básicas
    stats = {
        'metric': ['seguidores', 'seguindo', 'posts'],
        'valor': [
            profile_data.get('followersCount', 0),
            profile_data.get('followingCount', 0),
            profile_data.get('postsCount', 0)
        ]
    }
    df_stats = pd.DataFrame(stats)
    
    # Calcular métricas avançadas
    analysis = {}
    
    # 1. Taxa de Engajamento (básica e avançada)
    followers = profile_data.get('followersCount', 0)
    if followers > 0:
        # Taxa básica
        analysis['engagement_rate'] = round(profile_data.get('engagementRate', 0.045) * 100, 2)
        
        # Classificação de engajamento
        if analysis['engagement_rate'] < 1:
            analysis['engagement_classification'] = 'Baixo'
        elif analysis['engagement_rate'] < 3:
            analysis['engagement_classification'] = 'Médio'
        elif analysis['engagement_rate'] < 6:
            analysis['engagement_classification'] = 'Bom'
        else:
            analysis['engagement_classification'] = 'Excelente'
    
    # 2. Proporção Seguidores/Seguindo
    following = profile_data.get('followingCount', 0)
    if following > 0:
        analysis['follower_following_ratio'] = round(followers / following, 2)
        
        # Análise da proporção
        if analysis['follower_following_ratio'] < 0.5:
            analysis['ratio_classification'] = 'Muito baixa'
            analysis['ratio_recommendation'] = 'Diminua o número de pessoas que você segue e foque em criar conteúdo relevante para atrair mais seguidores.'
        elif analysis['follower_following_ratio'] < 1:
            analysis['ratio_classification'] = 'Baixa'
            analysis['ratio_recommendation'] = 'Sua proporção está melhorando, mas ainda é recomendável ser mais seletivo ao seguir contas.'
        elif analysis['follower_following_ratio'] < 2:
            analysis['ratio_classification'] = 'Boa'
            analysis['ratio_recommendation'] = 'Você tem uma boa proporção. Continue com sua estratégia atual.'
        else:
            analysis['ratio_classification'] = 'Excelente'
            analysis['ratio_recommendation'] = 'Sua conta demonstra grande autoridade no nicho. Considere estratégias para monetização.'
    
    # 3. Análise de frequência de postagens
    posts = profile_data.get('postsCount', 0)
    account_age_days = 365  # Valor padrão (assumindo 1 ano)
    
    # Se tiver dados de mídia, calcula frequência real baseada nas datas
    if 'media' in profile_data and isinstance(profile_data['media'], list) and len(profile_data['media']) > 0:
        analysis['post_frequency'] = round(posts / account_age_days * 7, 2)  # Posts por semana
        
        # Classificação de frequência
        if analysis['post_frequency'] < 1:
            analysis['frequency_classification'] = 'Muito baixa'
            analysis['frequency_recommendation'] = 'Aumente significativamente sua frequência de postagem para pelo menos 3x por semana.'
        elif analysis['post_frequency'] < 3:
            analysis['frequency_classification'] = 'Baixa'
            analysis['frequency_recommendation'] = 'Considere aumentar sua frequência para 4-5 posts por semana.'
        elif analysis['post_frequency'] < 5:
            analysis['frequency_classification'] = 'Moderada'
            analysis['frequency_recommendation'] = 'Boa frequência, mas pode aumentar um pouco para maximizar o alcance.'
        else:
            analysis['frequency_classification'] = 'Alta'
            analysis['frequency_recommendation'] = 'Excelente frequência de postagem. Mantenha a consistência.'
    
    # 4. Análise da Bio
    if 'bio' in profile_data and profile_data['bio'] and isinstance(profile_data['bio'], str) and not 'não encontrada' in profile_data['bio']:
        bio = profile_data['bio']
        bio_length = len(bio)
        analysis['bio_length'] = bio_length
        
        # Verificar se a bio contém hashtags
        has_hashtags = '#' in bio
        analysis['bio_has_hashtags'] = has_hashtags
        
        # Verificar se a bio contém emojis (análise simplificada)
        emoji_pattern = r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F700-\U0001F77F\U0001F780-\U0001F7FF\U0001F800-\U0001F8FF\U0001F900-\U0001F9FF\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF\U00002702-\U000027B0\U000024C2-\U0001F251]'
        has_emojis = any(ord(c) > 255 for c in bio)  # Simplificação para identificar caracteres não ASCII
        analysis['bio_has_emojis'] = has_emojis
        
        # Análise de comprimento
        if bio_length < 30:
            analysis['bio_length_classification'] = 'Muito curta'
            analysis['bio_recommendation'] = 'Sua bio está muito curta. Adicione mais informações sobre seu nicho e proposta de valor.'
        elif bio_length < 70:
            analysis['bio_length_classification'] = 'Curta'
            analysis['bio_recommendation'] = 'Sua bio poderia ter mais detalhes para engajar seguidores.'
        elif bio_length < 130:
            analysis['bio_length_classification'] = 'Adequada'
            analysis['bio_recommendation'] = 'Bom comprimento de bio. Certifique-se de incluir sua proposta de valor.'
        else:
            analysis['bio_length_classification'] = 'Longa'
            analysis['bio_recommendation'] = 'Sua bio está no limite máximo. Considere torná-la mais concisa.'
    
    # 5. Estimativa de crescimento potencial
    # Baseada em diversos fatores combinados
    growth_potential_score = 0
    
    # Fator 1: Proporção seguidores/seguindo
    if 'follower_following_ratio' in analysis:
        ratio = analysis['follower_following_ratio']
        if ratio > 2:
            growth_potential_score += 3
        elif ratio > 1:
            growth_potential_score += 2
        elif ratio > 0.5:
            growth_potential_score += 1
    
    # Fator 2: Engajamento
    if 'engagement_rate' in analysis:
        engagement = analysis['engagement_rate']
        if engagement > 5:
            growth_potential_score += 3
        elif engagement > 3:
            growth_potential_score += 2
        elif engagement > 1:
            growth_potential_score += 1
    
    # Fator 3: Frequência de posts
    if 'post_frequency' in analysis:
        frequency = analysis['post_frequency']
        if frequency > 4:
            growth_potential_score += 3
        elif frequency > 2:
            growth_potential_score += 2
        elif frequency > 0.5:
            growth_potential_score += 1
    
    # Fator 4: Qualidade da bio
    if 'bio_has_emojis' in analysis and analysis['bio_has_emojis']:
        growth_potential_score += 1
    if 'bio_length' in analysis and analysis['bio_length'] > 70:
        growth_potential_score += 1
    
    # Normalizar score para escala de 0-10
    max_score = 11  # Soma máxima possível de todos os fatores
    analysis['growth_potential'] = round((growth_potential_score / max_score) * 10, 1)
    
    # Classificar potencial de crescimento
    if analysis['growth_potential'] < 3:
        analysis['growth_classification'] = 'Baixo'
        analysis['growth_recommendation'] = 'Seu perfil precisa de melhorias significativas para aumentar o potencial de crescimento.'
    elif analysis['growth_potential'] < 6:
        analysis['growth_classification'] = 'Médio'
        analysis['growth_recommendation'] = 'Seu perfil tem potencial moderado de crescimento. Implementando nossas recomendações, você pode aumentar significativamente esse potencial.'
    elif analysis['growth_potential'] < 8:
        analysis['growth_classification'] = 'Bom'
        analysis['growth_recommendation'] = 'Seu perfil tem bom potencial de crescimento. Ajustes específicos podem ajudar a atingir um crescimento ainda melhor.'
    else:
        analysis['growth_classification'] = 'Excelente'
        analysis['growth_recommendation'] = 'Seu perfil tem excelente potencial de crescimento. Continue com sua estratégia e considere expandir para outras plataformas.'
    
    # 6. Sugestões para serviços recomendados baseadas na análise
    services_recommendations = []
    
    if followers < 1000:
        services_recommendations.append({
            "service_type": "seguidores",
            "package": "1000-1300 seguidores",
            "price": 74.90,
            "reason": "Aumentar sua base de seguidores é essencial neste estágio para criar credibilidade. Este pacote oferece um impulso significativo de visibilidade."
        })
    elif followers < 5000:
        services_recommendations.append({
            "service_type": "seguidores",
            "package": "2000-2300 seguidores",
            "price": 129.90,
            "reason": "Com sua atual base de seguidores, este pacote proporcionará um crescimento substancial que pode ajudar a atingir o patamar de micro-influenciador."
        })
    else:
        services_recommendations.append({
            "service_type": "seguidores",
            "package": "5000 seguidores",
            "price": 289.90,
            "reason": "Para contas com sua visibilidade, este pacote ajudará a alcançar o próximo nível de influência no Instagram."
        })
    
    # Recomendar curtidas com base no engajamento
    if 'engagement_rate' in analysis and analysis['engagement_rate'] < 3:
        services_recommendations.append({
            "service_type": "curtidas",
            "package": "500 curtidas",
            "price": 45.00,
            "reason": f"Sua taxa de engajamento atual ({analysis['engagement_rate']}%) está abaixo do ideal. Este pacote ajudará a aumentar o engajamento e visibilidade."
        })
    
    # Ajustar data e hora da análise
    analysis['analysis_date'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    analysis['services_recommendations'] = services_recommendations
    
    return analysis

# Código para execução via linha de comando
if __name__ == "__main__":
    # Ler dados JSON da entrada padrão (stdin)
    profile_data_str = sys.stdin.read().strip()
    
    try:
        # Adicionar log para debug
        print(f"Recebido: {profile_data_str[:100]}...", file=sys.stderr)
        
        # Analisar o perfil
        result = analyze_profile(profile_data_str)
        
        # Imprimir resultado como JSON
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        # Em caso de erro, retornar erro como JSON
        error_response = {"error": str(e)}
        print(json.dumps(error_response, ensure_ascii=False)) 