import { useState, useEffect } from 'react';
import { FaPencilAlt, FaCheck, FaTimes, FaLightbulb } from 'react-icons/fa';
import { motion } from 'framer-motion';

const BioAnalyzer = ({ profileData }) => {
  const [bioAnalysis, setBioAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [bioSuggestion, setBioSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    if (!profileData) return;
    
    // Se já temos análise da bio da API, usá-la diretamente
    if (profileData.bioAnalysis) {
      console.log('Usando análise de bio da API:', profileData.bioAnalysis);
      
      // Converter weaknesses para issues para compatibilidade
      const apiAnalysis = {
        score: profileData.bioAnalysis.score,
        issues: profileData.bioAnalysis.weaknesses || [],
        strengths: profileData.bioAnalysis.strengths || [],
        suggestion: profileData.bioAnalysis.explanation || "Considere as melhorias sugeridas para otimizar sua bio."
      };
      
      setBioAnalysis(apiAnalysis);
      setBioSuggestion(profileData.bioAnalysis.improved_bio || generateSampleBio(profileData.username));
      return;
    }
    
    // Caso contrário, realizar análise local
    analyzeBio(profileData.bio || '');
  }, [profileData]);

  const analyzeBio = (bio) => {
    if (!bio || bio.includes("não encontrada")) {
      // Bio vazia ou não encontrada
      setBioAnalysis({
        score: 2,
        issues: [
          "Bio não encontrada ou vazia",
          "Falta informação sobre seu nicho/área",
          "Ausência de call-to-action (CTA)",
          "Sem emojis para atrair atenção visual"
        ],
        strengths: [],
        suggestion: "Crie uma bio que inclua: quem você é, o que faz, para quem você faz, um diferencial e um call-to-action claro."
      });
      
      setBioSuggestion(generateSampleBio(profileData.username));
      return;
    }
    
    // Analisar a bio existente
    setLoadingAnalysis(true);
    
    // Análise local sem necessidade de API
    const analysis = {
      score: 0,
      issues: [],
      strengths: [],
      suggestion: ""
    };
    
    // Verificar comprimento (max 150 caracteres no Instagram)
    if (bio.length > 150) {
      analysis.issues.push("Bio muito longa (limite de 150 caracteres)");
    } else if (bio.length < 30) {
      analysis.issues.push("Bio muito curta (recomendado 30-150 caracteres)");
    } else {
      analysis.strengths.push("Comprimento adequado");
      analysis.score += 1;
    }
    
    // Verificar presença de emojis
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(bio)) {
      analysis.strengths.push("Uso de emojis para destaque visual");
      analysis.score += 1;
    } else {
      analysis.issues.push("Falta de emojis para destaque visual");
    }
    
    // Verificar quebras de linha
    if (bio.includes("\n")) {
      analysis.strengths.push("Uso de quebras de linha para melhor legibilidade");
      analysis.score += 1;
    } else {
      analysis.issues.push("Falta de estrutura com quebras de linha");
    }
    
    // Verificar call-to-action
    const ctaWords = ["siga", "clique", "confira", "acesse", "veja", "compre", "conheça", "descubra", "contate", "entre"];
    const hasCTA = ctaWords.some(word => bio.toLowerCase().includes(word));
    if (hasCTA) {
      analysis.strengths.push("Presença de call-to-action (CTA)");
      analysis.score += 1;
    } else {
      analysis.issues.push("Ausência de call-to-action (CTA)");
    }
    
    // Verificar menção à profissão/nicho
    const profWords = ["especialista", "profissional", "fotógrafo", "designer", "coach", "consultor", "advogado", "médico", "nutricionista", "vendas"];
    const hasProfession = profWords.some(word => bio.toLowerCase().includes(word));
    if (hasProfession) {
      analysis.strengths.push("Menção clara à sua profissão/nicho");
      analysis.score += 1;
    } else {
      analysis.issues.push("Falta de clareza sobre sua profissão/nicho");
    }
    
    // Calcular pontuação final (0-5)
    analysis.score = Math.min(5, analysis.score);
    
    // Criar sugestão personalizada
    if (analysis.score <= 2) {
      analysis.suggestion = "Sua bio precisa de melhorias significativas. Considere reestruturá-la completamente.";
      setBioSuggestion(generateSampleBio(profileData.username));
    } else if (analysis.score <= 4) {
      analysis.suggestion = "Sua bio está razoável, mas poderia ser otimizada para melhor conversão.";
      setBioSuggestion(improveBio(bio));
    } else {
      analysis.suggestion = "Parabéns! Sua bio está muito bem estruturada.";
      setBioSuggestion(bio); // Já está boa, apenas pequenos ajustes
    }
    
    setBioAnalysis(analysis);
    setLoadingAnalysis(false);
  };
  
  // Função para gerar uma bio exemplo com base no nome de usuário
  const generateSampleBio = (username) => {
    // Extrair possível nome real do username
    const possibleName = username
      .replace(/[0-9_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .filter(word => word.length > 2)
      .join(' ');
    
    const sampleBios = [
      `✨ ${possibleName} | Especialista em Marketing Digital\n📱 Ajudo pessoas e marcas a crescerem no Instagram\n🔍 Estratégias que geram resultados reais\n👇 Agende sua consultoria gratuita no link abaixo`,
      
      `📸 Fotógrafo(a) Profissional | ${possibleName}\n🏙️ São Paulo, SP\n✨ Especialista em ensaios criativos e eventos\n💌 Orçamentos: contato@${username}.com\n👇 Confira meu portfólio completo!`,
      
      `⚡ ${possibleName} | Criador(a) de Conteúdo\n✨ Lifestyle • Moda • Viagem\n🤝 Parcerias: ${username}@gmail.com\n📍 Brasil\n👇 Conheça meu novo projeto`
    ];
    
    // Selecionar uma bio aleatória
    return sampleBios[Math.floor(Math.random() * sampleBios.length)];
  };
  
  // Função para melhorar uma bio existente
  const improveBio = (currentBio) => {
    // Adicionar emojis se não tiver
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    let improvedBio = currentBio;
    
    if (!emojiRegex.test(currentBio)) {
      // Adicionar emojis no início das frases
      const commonEmojis = ["✨", "📱", "🔍", "📸", "⚡", "🏆", "💼", "🌟"];
      improvedBio = currentBio
        .split("\n")
        .map((line, index) => {
          if (line.trim()) {
            return `${commonEmojis[index % commonEmojis.length]} ${line.trim()}`;
          }
          return line;
        })
        .join("\n");
    }
    
    // Adicionar quebra de linha se não tiver
    if (!improvedBio.includes("\n")) {
      improvedBio = improvedBio.replace(/\. /g, ".\n");
      // Se ainda não tiver quebras, adicionar manualmente
      if (!improvedBio.includes("\n")) {
        const words = improvedBio.split(" ");
        const midPoint = Math.floor(words.length / 2);
        improvedBio = [...words.slice(0, midPoint), "\n", ...words.slice(midPoint)].join(" ");
      }
    }
    
    // Adicionar CTA se não tiver
    const ctaWords = ["siga", "clique", "confira", "acesse", "veja", "compre", "conheça", "descubra", "contate", "entre"];
    const hasCTA = ctaWords.some(word => improvedBio.toLowerCase().includes(word));
    
    if (!hasCTA) {
      improvedBio += "\n👇 Confira mais informações no link abaixo";
    }
    
    return improvedBio;
  };
  
  // Função para copiar a bio sugerida
  const copyBioToClipboard = () => {
    navigator.clipboard.writeText(bioSuggestion)
      .then(() => {
        alert("Bio copiada para a área de transferência!");
      })
      .catch(err => {
        console.error("Erro ao copiar bio:", err);
      });
  };

  if (!profileData || !profileData.bio) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 mt-8"
    >
      <div className="flex items-center mb-4">
        <FaPencilAlt className="text-instagram-purple mr-2" size={20} />
        <h2 className="text-xl font-bold">Análise de Bio</h2>
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Bio Atual:</h3>
        <p className="whitespace-pre-line text-gray-700">
          {profileData.bio.includes("não encontrada") 
            ? "Bio não encontrada ou não configurada" 
            : profileData.bio}
        </p>
      </div>
      
      {loadingAnalysis ? (
        <div className="text-center py-4">
          <p>Analisando bio...</p>
        </div>
      ) : bioAnalysis ? (
        <>
          <div className="flex items-center mb-4">
            <div className="mr-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                <span className={`text-lg font-bold ${
                  bioAnalysis.score <= 2 ? 'text-red-500' : 
                  bioAnalysis.score <= 4 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {bioAnalysis.score}/5
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Pontuação da Bio</h3>
              <p className="text-sm text-gray-600">
                {bioAnalysis.score <= 2 ? 'Precisa de melhorias' : 
                 bioAnalysis.score <= 4 ? 'Razoável' : 'Excelente'}
              </p>
            </div>
          </div>
          
          {bioAnalysis.strengths.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Pontos fortes:</h3>
              <ul className="space-y-1">
                {bioAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {bioAnalysis.issues.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Oportunidades de melhoria:</h3>
              <ul className="space-y-1">
                {bioAnalysis.issues.map((issue, index) => (
                  <li key={index} className="flex items-start">
                    <FaTimes className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mb-4">
            <p className="text-gray-700">{bioAnalysis.suggestion}</p>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => setShowSuggestion(!showSuggestion)}
              className="flex items-center text-instagram-purple font-medium hover:text-instagram-darkPurple transition-colors"
            >
              <FaLightbulb className="mr-2" />
              {showSuggestion ? "Ocultar sugestão" : "Ver sugestão de bio otimizada"}
            </button>
            
            {showSuggestion && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <h3 className="font-medium mb-2 text-blue-800">Bio Sugerida:</h3>
                <p className="whitespace-pre-line text-gray-700 mb-4">{bioSuggestion}</p>
                
                <div className="flex justify-end">
                  <button
                    onClick={copyBioToClipboard}
                    className="bg-instagram-gradient text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                    </svg>
                    Copiar Bio
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </>
      ) : null}
    </motion.div>
  );
};

export default BioAnalyzer; 