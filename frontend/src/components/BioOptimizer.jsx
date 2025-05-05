import React, { useState } from 'react';
import { FaPen, FaCheck, FaTimes, FaLightbulb, FaClipboard, FaClipboardCheck, FaCopy, FaSpinner } from 'react-icons/fa';

const BioOptimizer = ({ data, currentBio }) => {
  const [showExample, setShowExample] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  
  if (!data) return null;

  const copyToClipboard = (text) => {
    setLoading(true);
    
    // Tentativa de uso da API clipboard moderna
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        })
        .catch((error) => {
          console.error("Erro ao copiar: ", error);
          // Fallback para o método antigo
          fallbackCopyToClipboard(text);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Fallback para navegadores que não suportam a API clipboard
      fallbackCopyToClipboard(text);
      setLoading(false);
    }
  };

  // Método alternativo de cópia para browsers sem suporte
  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Tornar o elemento invisível
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.error('Falha ao copiar texto: ', err);
    }
    
    document.body.removeChild(textArea);
  };

  // Alternando entre bio original e otimizada
  const toggleBioView = () => {
    setShowOriginal(!showOriginal);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <FaPen className="mr-2 text-blue-500" />
        Otimização de Bio
      </h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {/* Análise Geral */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-700 mb-2">Análise da Bio Atual</h3>
          <p className="text-gray-600 text-sm">{data.análise}</p>
        </div>
        
        {/* Pontos Fortes e Fracos */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-100">
          {/* Pontos Fortes */}
          <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100">
            <h3 className="font-medium text-gray-700 mb-2 flex items-center">
              <FaCheck className="mr-2 text-green-500" /> Pontos Fortes
            </h3>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              {data.pontos_fortes.map((ponto, index) => (
                <li key={index}>{ponto}</li>
              ))}
            </ul>
          </div>
          
          {/* Pontos Fracos */}
          <div className="p-4">
            <h3 className="font-medium text-gray-700 mb-2 flex items-center">
              <FaTimes className="mr-2 text-red-500" /> Pontos a Melhorar
            </h3>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              {data.pontos_fracos.map((ponto, index) => (
                <li key={index}>{ponto}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Sugestões */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-700 mb-2 flex items-center">
            <FaLightbulb className="mr-2 text-yellow-500" /> Sugestões de Melhoria
          </h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            {data.sugestões.map((sugestao, index) => (
              <li key={index}>{sugestao}</li>
            ))}
          </ul>
        </div>
        
        {/* Exemplo de Bio Otimizada */}
        <div className="p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700 flex items-center">
              <FaPen className="mr-2 text-blue-500" /> Exemplo de Bio Otimizada
            </h3>
            <button 
              onClick={() => copyToClipboard(data.exemplo_bio)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded flex items-center"
            >
              {copied ? (
                <>
                  <FaClipboardCheck className="mr-1 text-green-500" /> Copiado
                </>
              ) : (
                <>
                  <FaClipboard className="mr-1" /> Copiar
                </>
              )}
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded p-3 text-sm text-gray-700 whitespace-pre-line">
            {data.exemplo_bio}
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-right">
            Esta bio é apenas uma sugestão. Personalize-a conforme sua identidade e objetivos.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioOptimizer; 