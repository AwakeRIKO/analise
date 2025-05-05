import React, { useState } from 'react';
import { FaWhatsapp, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';

const QuoteModal = ({ service, username, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [option, setOption] = useState(service?.options?.[0]?.id || '');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Formatar número de telefone
  const formatPhone = (value) => {
    if (!value) return value;
    
    // Remove todos os caracteres não numéricos
    const phoneNumber = value.replace(/[^\d]/g, '');
    
    // Aplicar a formatação
    if (phoneNumber.length <= 2) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    } else if (phoneNumber.length <= 10) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
    } else {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !phone) {
      setError('Por favor, preencha os campos obrigatórios (nome e telefone).');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Em vez de um verdadeiro submit para API, vamos apenas simular para este exemplo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Considerar enviado com sucesso
      setIsSuccess(true);
      
      // Resetar após 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError('Ocorreu um erro ao enviar a solicitação. Tente novamente ou entre em contato direto pelo WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = () => {
    const selectedOption = service?.options?.find(opt => opt.id === option);
    let optionDesc = '';
    
    if (selectedOption) {
      const { quantity, type, price } = selectedOption;
      optionDesc = `${type ? type + ' ' : ''}${quantity || ''} (R$ ${price.toFixed(2)})`;
    }
    
    const text = `Olá, gostaria de um orçamento para o serviço de ${service.title} ${optionDesc ? '- ' + optionDesc : ''} para o perfil @${username}.${message ? ' Observações: ' + message : ''}`;
    
    return `https://api.whatsapp.com/send?phone=5516996382502&text=${encodeURIComponent(text)}`;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative">
        {/* Botão Fechar */}
        <button 
        onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Fechar"
        >
          <FaTimes />
            </button>
        
        {/* Cabeçalho */}
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">Solicitar Orçamento</h3>
          <p className="text-gray-600 mt-1">
            Serviço: <span className="font-medium">{service.title}</span> para @{username}
          </p>
        </div>
        
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6">
          {!isSuccess ? (
            <>
              {/* Mensagem de erro */}
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
                  {error}
                </div>
              )}
              
              {/* Campos do formulário */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Seu nome completo"
                  required
                />
          </div>
          
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Telefone *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="(00) 00000-0000"
                  required
                />
            </div>
            
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="seu@email.com"
                />
            </div>
            
              {service.options && service.options.length > 0 && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">Opção de Serviço</label>
                  <select
                    value={option}
                    onChange={(e) => setOption(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white"
                  >
                    {service.options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.type ? `${opt.type} ` : ''}
                        {opt.quantity ? `${opt.quantity} ` : 'Plano Completo '}
                        - R$ {opt.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
              </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Orçamento Desejado</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value="">Selecione...</option>
                  <option value="ate-100">Até R$ 100</option>
                  <option value="100-500">R$ 100 a R$ 500</option>
                  <option value="500-1000">R$ 500 a R$ 1.000</option>
                  <option value="acima-1000">Acima de R$ 1.000</option>
                </select>
            </div>
            
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-1">Mensagem</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 border rounded-md h-24"
                  placeholder="Detalhes adicionais sobre o que você precisa..."
                ></textarea>
              </div>
              
              {/* Botões de ação */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Enviando...
                    </>
                  ) : (
                    <>Solicitar Orçamento</>
                  )}
                </button>
                
                <a 
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                >
                  <FaWhatsapp className="mr-2" /> Contato via WhatsApp
                </a>
                
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 text-2xl">
                  <FaCheck />
                </div>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Solicitação Enviada!</h4>
              <p className="text-gray-600">
                Entraremos em contato em breve pelo número informado.
              </p>
            </div>
          )}
        </form>
            </div>
          </div>
  );
};

export default QuoteModal; 