import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp, FaDownload, FaTimes } from 'react-icons/fa'

const QuoteModal = ({ selectedServices, total, username, onClose, whatsappLink }) => {
  useEffect(() => {
    // Bloquear rolagem quando o modal estiver aberto
    document.body.style.overflow = 'hidden'
    
    // Cleanup ao desmontar
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])
  
  const handleExportAsPDF = () => {
    // Esta função seria implementada usando uma biblioteca como jsPDF
    alert('Funcionalidade de exportação como PDF será implementada')
  }
  
  const formatDate = () => {
    const date = new Date()
    return date.toLocaleDateString('pt-BR')
  }
  
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
  
  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { delay: 0.1 } }
  }
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Orçamento</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <FaTimes size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Data</div>
              <div className="text-lg">{formatDate()}</div>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Perfil</div>
              <div className="text-lg font-medium">@{username}</div>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Serviços Selecionados</div>
              <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500">Serviço</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500">Quantidade</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 text-right">Preço</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedServices.map((service, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3">
                          {service.type === 'followers' && 'Seguidores'}
                          {service.type === 'likes' && 'Curtidas'}
                          {service.type === 'comments' && 'Comentários'}
                          {service.type === 'videoViews' && 'Visualizações de Vídeo'}
                          {service.type === 'storyViews' && 'Visualizações de Stories'}
                          {service.type === 'liveViews' && 'Visualizações de Live'}
                          {service.type === 'paidTraffic' && service.service}
                          {service.type === 'socialMedia' && service.service}
                        </td>
                        <td className="px-4 py-3">
                          {service.qty ? service.qty.toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          R$ {service.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-4 py-3 font-bold" colSpan={2}>Total</td>
                      <td className="px-4 py-3 text-right font-bold text-instagram-blue">
                        R$ {total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="text-sm text-gray-500 mb-3">
                Validade: 7 dias a partir da data de emissão.
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp flex items-center justify-center"
                >
                  <FaWhatsapp className="mr-2" /> Enviar via WhatsApp
                </a>
                <button
                  className="btn btn-secondary flex items-center justify-center"
                  onClick={handleExportAsPDF}
                >
                  <FaDownload className="mr-2" /> Exportar como PDF
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default QuoteModal 