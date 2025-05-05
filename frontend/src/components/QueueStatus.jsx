import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaHourglassHalf } from 'react-icons/fa';
import requestQueue from '../services/requestQueue';

const QueueStatus = ({ requestId, active = false }) => {
  const [queueStatus, setQueueStatus] = useState({
    position: 0,
    total: 0,
    isProcessing: false,
  });
  
  useEffect(() => {
    if (!active || !requestId) return;
    
    // Assina as atualizações da fila
    const unsubscribe = requestQueue.subscribe((state) => {
      if (requestId) {
        const position = requestQueue.getPositionInQueue(requestId);
        const isProcessing = requestQueue.isProcessing(requestId);
        
        setQueueStatus({
          position,
          total: state.queueLength + state.running,
          isProcessing,
        });
      }
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [requestId, active]);
  
  if (!active || !requestId || (queueStatus.position <= 0 && !queueStatus.isProcessing) || queueStatus.total === 0) {
    return null;
  }
  
  // Mensagens baseadas no status da fila
  let statusMessage = '';
  let estimatedTime = '';
  
  if (queueStatus.isProcessing) {
    statusMessage = 'Sua solicitação está sendo processada';
    estimatedTime = 'Concluindo em breve...';
  } else if (queueStatus.position === 1) {
    statusMessage = 'Você é o próximo na fila';
    estimatedTime = 'Estimativa: menos de 10 segundos';
  } else if (queueStatus.total > 5) {
    statusMessage = `Muitas solicitações no momento`;
    estimatedTime = `Sua posição: ${queueStatus.position} de ${queueStatus.total}`;
  } else {
    statusMessage = `Aguardando na fila`;
    estimatedTime = `Sua posição: ${queueStatus.position} de ${queueStatus.total}`;
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-divulga-light border border-primary rounded-lg p-4 mb-4 shadow-sm"
    >
      <div className="flex items-center">
        <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-3">
          {queueStatus.isProcessing ? (
            <FaHourglassHalf className="text-primary animate-pulse" size={20} />
          ) : (
            <FaUsers className="text-primary" size={20} />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-primary-dark">{statusMessage}</h4>
          <p className="text-sm text-gray-600">{estimatedTime}</p>
        </div>
        
        {/* Indicador de progresso */}
        {!queueStatus.isProcessing && queueStatus.position > 0 && (
          <div className="w-16 h-16 relative">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="stroke-current text-gray-200"
                fill="none"
                strokeWidth="3"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-current text-primary"
                fill="none"
                strokeWidth="3"
                strokeDasharray={`${100 - ((queueStatus.position - 1) / queueStatus.total) * 100}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20" textAnchor="middle" className="text-xs font-semibold fill-current text-primary-dark">
                {queueStatus.position}
              </text>
            </svg>
          </div>
        )}
        
        {queueStatus.isProcessing && (
          <div className="w-16 relative">
            <svg className="w-full h-full animate-spin-slow" viewBox="0 0 36 36">
              <path
                className="stroke-current text-primary"
                fill="none"
                strokeWidth="3"
                strokeDasharray="75, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QueueStatus; 