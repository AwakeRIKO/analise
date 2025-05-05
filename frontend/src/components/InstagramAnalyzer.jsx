import { useState, useEffect } from 'react';
import { FaUser, FaSearch, FaSpinner, FaExclamationTriangle, FaBrain, FaPrint, FaShareAlt, FaDownload, FaArrowLeft, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ServicesRecommendation from './ServicesRecommendation';
import BioAnalyzer from './BioAnalyzer';
import QueueStatus from './QueueStatus';
import StrategicRecommendations from './StrategicRecommendations';
import BioOptimizer from './BioOptimizer';
import ProfileStats from './ProfileStats';
import api from '../services/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const InstagramAnalyzer = ({ initialUsername = '', onReturn, requestId }) => {
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(requestId);
  const [loadingPrint, setLoadingPrint] = useState(false);

  // Função para formatar grandes números (milhões e milhares)
  const formatLargeNumber = (num) => {
    if (!num && num !== 0) return "0";
    
    // Para exibir números exatos quando forem menos que 100 mil
    if (num < 100000) {
      return num.toLocaleString('pt-BR'); // Exibe número exato com separador de milhar
    }
    
    // Para números em milhões (1.000.000 ou mais)
    if (num >= 1000000) {
      const millions = (num / 1000000).toLocaleString('pt-BR', { 
        maximumFractionDigits: 1,
        minimumFractionDigits: 1 
      });
      return `${millions} mi`;
    }
    
    // Para números em milhares (100.000 ou mais)
      const thousands = (num / 1000).toLocaleString('pt-BR', { 
        maximumFractionDigits: 1,
        minimumFractionDigits: 1 
      });
      return `${thousands} mil`;
  };

  // Função para processar URLs de imagens do Instagram
  const processImageUrl = (url) => {
    if (!url) return '/images/profile-placeholder.svg';
    
    // Verificar se é uma URL do Instagram
    if (url.includes('instagram') && url.includes('fbcdn.net')) {
      try {
        // Verifica se está em ambiente de desenvolvimento local
        if (window.location.hostname === 'localhost') {
          // Use proxy local
          return `/api/profile-image/${analysis.username}?url=${encodeURIComponent(url)}`;
        } else {
          // No ambiente de produção, os dois PCs terão acesso à mesma pasta
          // Verificar se a imagem existe na pasta compartilhada
          const profileImagePath = `../../foto/${analysis.username.toLowerCase()}.jpg`;
          
          // Como não podemos verificar diretamente se o arquivo existe, 
          // vamos tentar usar a URL compartilhada primeiro
          // Se falhar, o tratamento de erro da imagem usará a URL original
          return profileImagePath;
        }
      } catch (error) {
        console.error("Erro ao processar URL da imagem:", error);
        return '/images/profile-placeholder.svg';
      }
    }
    
    return url || '/images/profile-placeholder.svg';
  };

  // Função para corrigir problemas de encoding em textos
  const fixEncoding = (text) => {
    if (!text) return '';
    
    const replacements = {
      'Ã¡': 'á',
      'Ã©': 'é',
      'Ã­': 'í',
      'Ã³': 'ó',
      'Ãº': 'ú',
      'Ã£': 'ã',
      'Ãµ': 'õ',
      'Ã§': 'ç',
      'Ãª': 'ê',
      'Ã´': 'ô',
      'Ã¢': 'â',
      'Ã ': 'à',
      'Ã‰': 'É',
      'Ã"': 'Ó',
      'Ãš': 'Ú',
      'Ã•': 'Õ',
      'Ã‡': 'Ç',
      'ÃŠ': 'Ê'
    };
    
    let result = text;
    
    // Aplicar todas as substituições
    Object.keys(replacements).forEach(key => {
      result = result.replace(new RegExp(key, 'g'), replacements[key]);
    });
    
    return result;
  };

  // Função para tratar erros de carregamento de imagem mais detalhadamente
  const handleImageError = (e) => {
    console.error("Erro ao carregar imagem:", e);
    e.target.onerror = null; // Prevenir loop
    e.target.src = '/images/profile-placeholder.svg';
    
    // Adicionar classe para estilização específica
    e.target.classList.add('img-error');
  };

  // Realizar análise automática ao receber nome de usuário
  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
      performAnalysis(initialUsername);
    }
    
    if (requestId && requestId !== currentRequestId) {
      setCurrentRequestId(requestId);
    }
  }, [initialUsername, requestId]);

  // --- Funções de Cálculo para Insights --- 

  const getGrowthPotentialScore = (analysisData) => {
    if (!analysisData?.statsSnapshot) return 60; // Valor padrão
    const { followers = 0, following = 0, posts = 0 } = analysisData.statsSnapshot;
    let score = 60;
    if (posts > 100) score += 10; else if (posts > 50) score += 5; else if (posts < 10) score -= 10;
    if (followers > 10000) score += 15; else if (followers > 5000) score += 10; else if (followers > 1000) score += 5;
    const ratio = following > 0 ? followers / following : 0;
    if (ratio > 2) score += 10; else if (ratio > 1) score += 5; else if (ratio < 0.5) score -= 5;
    return Math.max(0, Math.min(100, score));
  };

  const getGrowthPotentialRating = (analysisData) => {
    const score = getGrowthPotentialScore(analysisData);
    if (score >= 80) return "Excelente";
    if (score >= 65) return "Bom";
    if (score >= 50) return "Regular";
    return "Baixo";
  };

  const calculateFollowRatio = (analysisData) => {
    if (!analysisData?.statsSnapshot) return '0:0';
    const { followers = 0, following = 0 } = analysisData.statsSnapshot;
    if (following === 0) return `${formatLargeNumber(followers)}:0`; // Evita divisão por zero
    const ratio = (followers / following).toFixed(1);
    return `${ratio}:1`;
  };
  
  const getFollowRatioRating = (analysisData) => {
    if (!analysisData?.statsSnapshot) return 'Regular';
    const { followers = 0, following = 0 } = analysisData.statsSnapshot;
    const ratio = following > 0 ? followers / following : followers; // Considera infinito se não segue ninguém
    if (ratio >= 5) return "Excelente";
    if (ratio >= 2) return "Muito Bom";
    if (ratio >= 1) return "Bom";
    if (ratio >= 0.5) return "Regular";
    return "Incomum";
  };

  const getEngagementRating = (engagementRateStr) => {
    const engagement = parseFloat(engagementRateStr) || 0;
    if (engagement >= 4.5) return "Excelente";
    if (engagement >= 3.0) return "Muito Bom";
    if (engagement >= 1.5) return "Bom";
    if (engagement >= 0.8) return "Regular";
    return "Baixo";
  };

  const getEngagementColorClass = (engagementRateStr) => {
    const engagement = parseFloat(engagementRateStr) || 0;
    if (engagement >= 4.5) return "bg-gradient-to-r from-green-400 to-emerald-500";
    if (engagement >= 3.0) return "bg-gradient-to-r from-lime-400 to-green-500";
    if (engagement >= 1.5) return "bg-gradient-to-r from-yellow-400 to-amber-500";
    if (engagement >= 0.8) return "bg-gradient-to-r from-orange-400 to-red-500";
    return "bg-gradient-to-r from-red-500 to-rose-600";
  };

  const getEngagementDescription = (engagementRateStr) => {
    const engagement = parseFloat(engagementRateStr) || 0;
    if (engagement >= 4.5) return "Taxa de engajamento excepcional! Continue assim.";
    if (engagement >= 3.0) return "Engajamento muito bom, acima da média.";
    if (engagement >= 1.5) return "Engajamento na média para o nicho.";
    if (engagement >= 0.8) return "Engajamento abaixo da média. Crie conteúdo mais interativo.";
    return "Engajamento precisa melhorar. Foque em conteúdo relevante.";
  };
  
  const getNichePositionRating = (analysisData) => {
    // Simulação - idealmente viria da API ou análise mais complexa
    const score = analysisData?.detailedAnalysis?.nichePositionScore || 
                  (analysisData?.statsSnapshot?.followers > 5000 ? 80 : 60);
    if (score >= 85) return "Excelente";
    if (score >= 70) return "Muito Bom";
    if (score >= 55) return "Bom";
    return "Regular";
  };

  const getNichePosition = (analysisData) => {
    // Simulação
    const nicheName = analysisData?.detailedAnalysis?.nicheCategory || "Geral";
    return `${getNichePositionRating(analysisData)} em ${nicheName}`;
  };

  const getNichePositionDescription = (analysisData) => {
    const rating = getNichePositionRating(analysisData);
    if (rating === "Excelente") return "Referência no nicho. Ideal para parcerias.";
    if (rating === "Muito Bom") return "Bem posicionado. Fortaleça a autoridade.";
    if (rating === "Bom") return "Posicionamento adequado. Melhore com conteúdo especializado.";
    return "Posicionamento precisa ser mais claro. Defina melhor o nicho.";
  };

  const getEstimatedReach = (analysisData) => {
    if (!analysisData?.statsSnapshot?.followers) return "0 contas";
    const followers = analysisData.statsSnapshot.followers;
    const minReach = Math.round(followers * 0.15);
    const maxReach = Math.round(followers * 0.25);
    return `${formatLargeNumber(minReach)} a ${formatLargeNumber(maxReach)} contas/semana`;
  };

  const getContentQualityScore = (analysisData) => {
    if (!analysisData?.statsSnapshot) return 60;
    const engagement = parseFloat(analysisData.statsSnapshot.engagementRate) || 0;
    const { followers = 0, following = 0, posts = 0 } = analysisData.statsSnapshot;
    const ratio = following > 0 ? followers / following : followers;
    const baseScore = 60;
    const engagementBonus = Math.min(engagement * 8, 20);
    const followRatioBonus = Math.min((ratio - 1) * 5, 15);
    const postsBonus = Math.min(posts / 10, 15);
    return Math.round(Math.min(baseScore + engagementBonus + followRatioBonus + postsBonus, 100));
  };
  
  const getContentQualityRating = (analysisData) => {
    const score = getContentQualityScore(analysisData);
    if (score >= 85) return "Excelente";
    if (score >= 70) return "Muito Bom";
    if (score >= 55) return "Bom";
    return "Regular";
  };

  const getContentQualityDescription = (analysisData) => {
    const rating = getContentQualityRating(analysisData);
    if (rating === "Excelente") return "Conteúdo de alta qualidade e relevância.";
    if (rating === "Muito Bom") return "Conteúdo de qualidade que ressoa com o público.";
    if (rating === "Bom") return "Qualidade boa, mas pode melhorar em relevância/apresentação.";
    return "Conteúdo precisa de melhorias para engajar mais.";
  };

  // --- Fim das Funções de Cálculo ---

  const performAnalysis = async (usernameToAnalyze) => {
    if (!usernameToAnalyze.trim()) {
      setError('Por favor, digite um nome de usuário válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Solicitando análise para:", usernameToAnalyze.trim());
      
      // Usar o serviço de API para análise (com fila)
      const data = await api.getProfile(usernameToAnalyze.trim());
      
      // Verificar se os dados recebidos são válidos
      if (!data || !data.username) {
        console.error("Dados recebidos inválidos:", data);
        throw new Error('Dados incompletos ou inválidos recebidos do servidor');
      }
      
      console.log("Dados recebidos:", data);
      
      // --- LOG ADICIONAL PARA DEBUG ---
      console.log("[DEBUG] Valor bruto de followersCount recebido da API:", data.followersCount);
      console.log("[DEBUG] Valor bruto de profilePicture recebido da API:", data.profilePicture);
      console.log("[DEBUG] Recomendações estratégicas recebidas:", data.strategicRecommendations);
      console.log("[DEBUG] Otimização de bio recebida:", data.bioOptimization);
      // --- FIM DO LOG ADICIONAL ---
      
      // Transformar os dados para o formato esperado pelo componente
      const formattedData = {
        username: data.username,
        fullName: data.fullName || data.username,
        profilePicture: data.profilePicture,
        bio: data.bio || "",
        accountType: data.followersCount > 10000 ? "Influenciador" : "Pessoal",
        contentCategories: ["Geral"],
        postFrequency: data.postsCount > 50 ? "Frequente" : "Ocasional",
        hasBio: Boolean(data.bio && !data.bio.includes("não encontrada")),
        hasLink: Boolean(data.profileUrl),
        hasHighlights: true,
        // Manter os dados originais para uso direto
        stats: data.stats || null,
        // A estrutura de statsSnapshot é usada pelos componentes que exibem os cards
        statsSnapshot: {
          followers: data.stats?.followers || data.followersCount || 0,
          following: data.stats?.following || data.followingCount || 0,
          posts: data.stats?.posts || data.postsCount || 0,
          engagementRate: data.engagementRate ? `${(data.engagementRate * 100).toFixed(1)}%` : "4.5%"
        },
        recommendations: Array.isArray(data.aiAnalysis) ? data.aiAnalysis : [],
        isAiAnalysis: Boolean(data.aiAnalysis),
        analysisDate: new Date().toISOString(),
        pandasAnalysis: data.pandasAnalysis || null,
        servicesSuggestions: data.servicesSuggestions || null,
        bioAnalysis: data.bioAnalysis || null,
        strategicRecommendations: data.strategicRecommendations || null,
        bioOptimization: data.bioOptimization || null
      };
      
      // Log completo para debug
      console.log("------- DADOS FORMATADOS -------");
      console.log("statsSnapshot:", formattedData.statsSnapshot);
      console.log("stats originais:", data.stats);
      
      // Validação adicional para a bio - remover texto que possa ser confundido com estatísticas
      if (formattedData.bio) {
        // Verifica se a bio contém apenas números de publicações 
        if (formattedData.bio.match(/^\d[\d,.]*\s*(publicações|posts|mil|k|m)$/i)) {
          console.log('Bio detectada como estatística de publicações, corrigindo...');
          formattedData.bio = "";
          formattedData.hasBio = false;
        }
        
        // Preservar quebras de linha
        formattedData.bio = formattedData.bio.replace(/\\n/g, '\n');
        
        // Validação adicional da bio: deve ter tamanho mínimo razoável
        if (formattedData.bio.length < 5) {
          formattedData.hasBio = false;
        }
      }
      
      setAnalysis(formattedData);
    } catch (err) {
      console.error("Erro na análise:", err);
      setError(err.message || 'Ocorreu um erro ao analisar o perfil. Tente novamente.');
      // Permitir que o usuário tente novamente sem recarregar a página
      setAnalysis(null);
      
      // Se for o usuário inicial, informar o componente pai para voltar à tela inicial
      if (usernameToAnalyze === initialUsername && typeof onReturn === 'function') {
        setTimeout(() => {
          onReturn();
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Criar um novo ID de requisição para nova busca manual
    const newRequestId = `profile-${Date.now()}`;
    setCurrentRequestId(newRequestId);
    
    performAnalysis(username);
  };
  
  const handleReturn = () => {
    // Se a função onReturn for fornecida, usá-la
    if (typeof onReturn === 'function') {
      onReturn();
    } else {
      // Fallback - apenas limpar o estado local
      setAnalysis(null);
      setError(null);
    }
  };
  
  const handlePrint = () => {
    const reportContent = document.getElementById('report-content');
    if (!reportContent) {
      toast.error("Não foi possível encontrar o conteúdo do relatório!");
      return;
    }

    setLoadingPrint(true);
    
    const loadingToastId = toast.loading("Gerando PDF, por favor aguarde...");
    
    const originalWidth = reportContent.offsetWidth;
    const originalHeight = reportContent.offsetHeight;
    const aspectRatio = originalWidth / originalHeight;
    
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const pdfMargin = 10; // margin in mm
    
    html2canvas(reportContent, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
    }).then(canvas => {
      // Criar um novo documento PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Adicionar logo ao topo do PDF
      const logoPath = '/images/divulga-mais-logo.png'; // Caminho correto para a logo
      try {
        // Verificar se a logo existe antes de tentar adicioná-la
        const logoImg = new Image();
        logoImg.src = logoPath;
        
        logoImg.onload = function() {
          try {
            // Adicionar logo centralizada no topo
            pdf.addImage(logoPath, 'PNG', 80, 10, 50, 20); // Ajuste as dimensões conforme necessário
            
            // Continuar com o restante do código PDF
            finalizePdf();
          } catch (logoError) {
            console.error("Erro ao adicionar a logo no PDF:", logoError);
            finalizePdf();
          }
        };
        
        logoImg.onerror = function() {
          console.warn("Logo não encontrada:", logoPath);
          finalizePdf();
        };
        
        function finalizePdf() {
          // Adicionar título do relatório
          pdf.setFontSize(16);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Relatório de Análise Instagram', pdf.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
          
          // Adicionar perfil analisado
          pdf.setFontSize(12);
          pdf.text(`Perfil: @${analysis.username}`, pdf.internal.pageSize.getWidth() / 2, 48, { align: 'center' });
          
          // Adicionar data da análise
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          const dataAtual = new Date().toLocaleDateString('pt-BR');
          pdf.text(`Gerado em: ${dataAtual}`, pdf.internal.pageSize.getWidth() / 2, 55, { align: 'center' });

          // Ajustar o ponto de início da imagem para deixar espaço para o cabeçalho
          const startY = 60; // mm do topo (depois do cabeçalho)
          
          // Calcular largura e altura do conteúdo para o PDF
          const contentWidth = pdfWidth - (pdfMargin * 2);
          const contentHeight = contentWidth / aspectRatio;
          
          const imgData = canvas.toDataURL('image/png');
          
          // Verificar se o conteúdo cabe em uma única página
          if (contentHeight <= (pdfHeight - startY - pdfMargin)) {
            // Conteúdo cabe em uma página - adicionar imagem
            pdf.addImage(imgData, 'PNG', pdfMargin, startY, contentWidth, contentHeight);
          } else {
            // Conteúdo não cabe em uma página - dividir em múltiplas páginas
            // Calculando a altura disponível na primeira página
            const firstPageAvailableHeight = pdfHeight - startY - pdfMargin;
            const firstPageRatio = firstPageAvailableHeight / contentHeight;
            const firstPageCanvasHeight = canvas.height * firstPageRatio;
            
            // Criar temporariamente um canvas para a primeira página
            const firstPageCanvas = document.createElement('canvas');
            firstPageCanvas.width = canvas.width;
            firstPageCanvas.height = firstPageCanvasHeight;
            const firstPageCtx = firstPageCanvas.getContext('2d');
            firstPageCtx.drawImage(canvas, 0, 0, canvas.width, firstPageCanvasHeight, 0, 0, canvas.width, firstPageCanvasHeight);
            
            // Adicionar a primeira parte ao PDF
            pdf.addImage(
              firstPageCanvas.toDataURL('image/png'),
              'PNG',
              pdfMargin,
              startY,
              contentWidth,
              firstPageAvailableHeight
            );
            
            // Calcular quantas páginas adicionais são necessárias
            const remainingHeight = contentHeight - firstPageAvailableHeight;
            const fullPagesCount = Math.floor(remainingHeight / (pdfHeight - (pdfMargin * 2)));
            const lastPageHeight = remainingHeight % (pdfHeight - (pdfMargin * 2));
            
            let currentCanvas = canvas;
            let currentOffset = firstPageCanvasHeight;
            
            // Adicionar páginas completas
            for (let i = 0; i < fullPagesCount; i++) {
              pdf.addPage();
              
              // Calcular altura para esta página
              const pageCanvasHeight = canvas.height * ((pdfHeight - (pdfMargin * 2)) / contentHeight);
              
              // Criar canvas temporário para esta página
              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = canvas.width;
              pageCanvas.height = pageCanvasHeight;
              const pageCtx = pageCanvas.getContext('2d');
              pageCtx.drawImage(
                currentCanvas,
                0,
                currentOffset,
                canvas.width,
                pageCanvasHeight,
                0,
                0,
                canvas.width,
                pageCanvasHeight
              );
              
              // Adicionar ao PDF
              pdf.addImage(
                pageCanvas.toDataURL('image/png'),
                'PNG',
                pdfMargin,
                pdfMargin,
                contentWidth,
                pdfHeight - (pdfMargin * 2)
              );
              
              currentOffset += pageCanvasHeight;
            }
            
            // Adicionar a última página se necessário
            if (lastPageHeight > 0) {
              pdf.addPage();
              
              // Calcular altura para a última página
              const lastPageCanvasHeight = canvas.height * (lastPageHeight / contentHeight);
              
              // Criar canvas temporário para a última página
              const lastPageCanvas = document.createElement('canvas');
              lastPageCanvas.width = canvas.width;
              lastPageCanvas.height = lastPageCanvasHeight;
              const lastPageCtx = lastPageCanvas.getContext('2d');
              lastPageCtx.drawImage(
                currentCanvas,
                0,
                currentOffset,
                canvas.width,
                lastPageCanvasHeight,
                0,
                0,
                canvas.width,
                lastPageCanvasHeight
              );
              
              // Adicionar ao PDF
              pdf.addImage(
                lastPageCanvas.toDataURL('image/png'),
                'PNG',
                pdfMargin,
                pdfMargin,
                contentWidth,
                lastPageHeight
              );
            }
          }
          
          // Adicionar rodapé em todas as páginas
          const pageCount = pdf.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text('© 2025 Divulga Mais Brasil - Todos os direitos reservados', pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 5, { align: 'center' });
          }
          
          // Salvar o PDF
          const fileName = `analise_instagram_${analysis.username.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
          pdf.save(fileName);
          
          setLoadingPrint(false);
          toast.success("PDF gerado com sucesso!", { id: loadingToastId });
        }
      } catch (error) {
        console.error("Erro ao adicionar a logo:", error);
        // Fallback: adicionar apenas o conteúdo sem logo
        const contentWidth = pdfWidth - (pdfMargin * 2);
        const contentHeight = contentWidth / aspectRatio;
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', pdfMargin, pdfMargin, contentWidth, contentHeight);
        
        // Salvar o PDF
        const fileName = `analise_instagram_${analysis.username.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        setLoadingPrint(false);
        toast.success("PDF gerado com sucesso!", { id: loadingToastId });
      }
    }).catch(error => {
      console.error("Erro ao gerar PDF:", error);
      setLoadingPrint(false);
      toast.error("Erro ao gerar PDF. Tente novamente.", { id: loadingToastId });
    });
  };
  
  const handleDownload = () => {
    // Criar um arquivo JSON para download
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `instagram-analise-${analysis.username}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleShare = () => {
    // Se a API de compartilhamento estiver disponível
    if (navigator.share) {
      navigator.share({
        title: `Análise de Instagram para @${analysis.username}`,
        text: `Confira esta análise de perfil do Instagram para @${analysis.username}`,
        url: window.location.href
      }).catch(err => {
        console.error('Erro ao compartilhar:', err);
      });
    } else {
      // Fallback: copiar URL para clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('URL copiada para a área de transferência!'))
        .catch(err => console.error('Erro ao copiar URL:', err));
    }
  };

  return (
    <div className="card w-full overflow-hidden">
      {/* Exibir status da fila */}
      <QueueStatus requestId={currentRequestId} active={loading || Boolean(currentRequestId)} />
      
      {/* Botão de retorno */}
      <div className="flex items-center mb-4">
        <button 
          onClick={handleReturn}
          className="flex items-center text-sm md:text-base text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft className="mr-1" size={16} /> Voltar
        </button>
      </div>
      
      {/* Formulário de busca */}
      <form onSubmit={handleSubmit} className="mb-4 mobile-stack">
        <div className="flex-1 mr-0 mb-2 md:mr-2 md:mb-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
              placeholder="Nome de usuário do Instagram"
              className="input pl-10"
            disabled={loading}
          />
          </div>
        </div>
          <button
            type="submit"
          className="btn btn-primary flex items-center justify-center w-full md:w-auto"
            disabled={loading}
          >
            {loading ? (
              <span className="mr-2"><FaSpinner className="animate-spin" /></span>
            ) : (
              <span className="mr-2"><FaSearch /></span>
            )}
          Analisar
          </button>
      </form>
      
      {/* Exibir erro, se houver */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-red-700 text-sm flex items-start">
          <FaExclamationTriangle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
          </div>
        )}
      
      {/* Exibir resultados da análise */}
      {analysis && !loading && !error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
          id="report-content"
        >
          {/* Cabeçalho do Perfil */}
          <div className="flex flex-col md:flex-row items-center border-b pb-6 mb-6">
            <img 
              src={processImageUrl(analysis.profilePicture)}
              alt={`Foto de perfil de ${analysis.username}`}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-pink-500 mr-0 md:mr-6 mb-4 md:mb-0"
              onError={handleImageError}
              crossOrigin="anonymous"
              loading="eager"
              referrerPolicy="no-referrer"
            />
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">@{analysis.username}</h2>
              <p className="text-lg text-gray-600">{fixEncoding(analysis.fullName)}</p>
              {/* Exibir número de publicações abaixo do nome */}
              <p className="text-sm text-gray-500 mt-1">{analysis.statsSnapshot.posts} publicações</p>
              {/* Exibir biografia quando disponível */}
              {analysis.bio && analysis.bio.length > 5 && !analysis.bio.match(/^\d[\d,.]*\s*(publicações|posts|followers|seguindo|seguidor|mil|k|m)$/i) && (
                <p className="text-gray-700 mt-2 text-sm md:text-base whitespace-pre-line">{fixEncoding(analysis.bio)}</p>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
            <button id="print-button" onClick={handlePrint} className="btn btn-secondary btn-sm"><FaPrint className="mr-1" /> Imprimir</button>
            <button onClick={handleDownload} className="btn btn-secondary btn-sm"><FaDownload className="mr-1" /> Baixar</button>
            <button onClick={handleShare} className="btn btn-secondary btn-sm"><FaShareAlt className="mr-1" /> Compartilhar</button>
          </div>

          {/* Dados e Estatísticas - Layout atualizado */}
          <div className="mb-8">
            {/* Título da Seção */}
            {/* <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center"><FaChartLine className="mr-2 text-blue-500"/> Dados e Estatísticas</h3> */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card Posts */}
              <div className="bg-white p-4 rounded-lg shadow text-center border border-gray-100">
                <div className="text-2xl font-bold text-gray-800">
                  {analysis.stats ? 
                    formatLargeNumber(analysis.stats.posts || analysis.statsSnapshot.posts || 0) : 
                    formatLargeNumber(analysis.statsSnapshot.posts || 0)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Posts</div>
              </div>
              {/* Card Seguidores */}
              <div className="bg-white p-4 rounded-lg shadow text-center border border-gray-100">
                <div className="text-2xl font-bold text-gray-800">
                  {analysis.stats ? 
                    formatLargeNumber(analysis.stats.followers || analysis.statsSnapshot.followers || 0) : 
                    formatLargeNumber(analysis.statsSnapshot.followers || 0)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Seguidores</div>
              </div>
              {/* Card Seguindo */}
              <div className="bg-white p-4 rounded-lg shadow text-center border border-gray-100">
                <div className="text-2xl font-bold text-gray-800">
                  {analysis.stats ? 
                    formatLargeNumber(analysis.stats.following || analysis.statsSnapshot.following || 0) : 
                    formatLargeNumber(analysis.statsSnapshot.following || 0)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Seguindo</div>
              </div>
              {/* Card Engajamento */}
              <div className="bg-white p-4 rounded-lg shadow text-center border border-gray-100">
                {/* Usar valor numérico para cálculo e exibir formatado */}
                <div className="text-2xl font-bold text-gray-800">{analysis.statsSnapshot.engagementRate}</div>
                <div className="text-sm text-gray-500 mt-1">Engajamento</div>
              </div>
            </div>
          </div>

          {/* Insights Analíticos Avançados */}
          <div className="mb-8">
             <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
               <FaBrain className="mr-2 text-purple-600" /> Insights Analíticos Avançados
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {/* Card: Potencial de Crescimento */}
               <InsightCard 
                 title="Potencial de Crescimento"
                 rating={getGrowthPotentialRating(analysis)}
                 score={getGrowthPotentialScore(analysis)}
                 description="Seu perfil tem bom potencial de crescimento. Ajustes específicos podem ajudar a atingir um crescimento ainda melhor."
                 borderColor="border-red-400"
                 scoreBarColor="bg-gradient-to-r from-red-400 to-orange-400"
                 ratingBgColor="bg-red-100"
                 ratingTextColor="text-red-700"
               />

               {/* Card: Proporção Seguidores/Seguindo */}
               <InsightCard 
                 title="Proporção Seguidores/Seguindo"
                 rating={getFollowRatioRating(analysis)}
                 valueLabel="Proporção:"
                 value={calculateFollowRatio(analysis)}
                 description="Sua conta demonstra grande autoridade no nicho. Considere estratégias para monetização."
                 borderColor="border-yellow-400"
                 ratingBgColor="bg-yellow-100"
                 ratingTextColor="text-yellow-700"
               />

               {/* Card: Taxa de Engajamento */}
               <InsightCard 
                 title="Taxa de Engajamento"
                 rating={getEngagementRating(analysis.statsSnapshot.engagementRate)}
                 value={analysis.statsSnapshot.engagementRate}
                 valueSuffix="%"
                 scoreBarValue={parseFloat(analysis.statsSnapshot.engagementRate) || 0}
                 scoreBarMax={5} // Ex: 5% como referência máxima para a barra
                 description={getEngagementDescription(analysis.statsSnapshot.engagementRate)}
                 borderColor="border-green-400"
                 scoreBarColor={getEngagementColorClass(analysis.statsSnapshot.engagementRate)}
                 ratingBgColor="bg-green-100"
                 ratingTextColor="text-green-700"
               />

               {/* Card: Posicionamento de Nicho */}
               <InsightCard 
                 title="Posicionamento de Nicho"
                 rating={getNichePositionRating(analysis)}
                 value={getNichePosition(analysis)}
                 description={getNichePositionDescription(analysis)}
                 borderColor="border-blue-400"
                 ratingBgColor="bg-blue-100"
                 ratingTextColor="text-blue-700"
               />
               
               {/* Card: Alcance Estimado */}
               <InsightCard 
                 title="Alcance Estimado"
                 rating="Médio" // Ou calcular se tiver dados
                 value={getEstimatedReach(analysis)}
                 description="Este é o número estimado de contas únicas que suas publicações alcançam por semana."
                 borderColor="border-indigo-400"
                 ratingBgColor="bg-indigo-100"
                 ratingTextColor="text-indigo-700"
               />
               
               {/* Card: Qualidade de Conteúdo */}
               <InsightCard 
                 title="Qualidade de Conteúdo"
                 rating={getContentQualityRating(analysis)}
                 score={getContentQualityScore(analysis)}
                 description={getContentQualityDescription(analysis)}
                 borderColor="border-orange-400"
                 scoreBarColor="bg-gradient-to-r from-orange-400 to-red-500"
                 ratingBgColor="bg-orange-100"
                 ratingTextColor="text-orange-700"
               />
             </div>
           </div>

          {/* Análise da Bio */}
          {analysis.bioAnalysis && (
            <BioAnalyzer data={analysis.bioAnalysis} />
          )}
          
          {/* Recomendações da IA */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center"><FaBrain className="mr-2 text-purple-500"/> Recomendações</h3>
              <ul className="space-y-2 list-disc pl-5">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-600">
                    <strong>{fixEncoding(rec.title)} ({rec.priority}):</strong> {fixEncoding(rec.description)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Recomendações de Serviço */}
          {analysis.servicesSuggestions && (
             <ServicesRecommendation data={analysis.servicesSuggestions} username={analysis.username} />
          )}
          
          {/* Recomendações Estratégicas */}
          {analysis.strategicRecommendations && (
            <StrategicRecommendations recommendations={analysis.strategicRecommendations} />
          )}
          
          {/* Otimização de Bio */}
          {analysis.bioOptimization && (
            <BioOptimizer data={analysis.bioOptimization} currentBio={analysis.bio} />
          )}
          
        </motion.div>
      )}
    </div>
  );
};

// Componente Auxiliar para Cards de Insight (pode ser movido para outro arquivo se preferir)
const InsightCard = ({ title, rating, score, value, valueLabel = '', valueSuffix = '', description, borderColor, scoreBarValue, scoreBarMax = 100, scoreBarColor, ratingBgColor = 'bg-gray-100', ratingTextColor = 'text-gray-700' }) => {
  const scorePercentage = scoreBarMax > 0 ? Math.min((scoreBarValue / scoreBarMax) * 100, 100) : (score ? Math.min(score, 100) : 0);
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${borderColor}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-700 text-base leading-tight mr-2">{title}</h4>
        {rating && 
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ratingBgColor} ${ratingTextColor}`}>
            {rating}
          </span>
        }
      </div>
      
      {/* Exibe Valor ou Pontuação/Barra */}
      {value && (
        <div className="text-xl font-bold text-gray-900 mb-3">
          {valueLabel} {value}{valueSuffix}
          </div>
        )}
        
      {(score || scoreBarValue) && (
        <div className="mb-3">
          {score && <div className="text-sm font-bold text-gray-600 text-center mb-1">{score}/100</div>}
          {scoreBarColor && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${scoreBarColor}`} 
                style={{ width: `${scorePercentage}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
      
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default InstagramAnalyzer;