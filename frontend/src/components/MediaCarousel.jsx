import { useEffect } from 'react'
import Slider from 'react-slick'
import { motion } from 'framer-motion'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

const MediaCarousel = ({ media }) => {
  // Configurações do carrossel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: media?.length < 3 ? media?.length : 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: media?.length < 2 ? media?.length : 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  }

  if (!media || media.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-500">Não foram encontradas publicações para este perfil.</p>
      </div>
    )
  }

  // Mostrar apenas até 6 imagens conforme requisito
  const displayMedia = media.slice(0, 6)

  return (
    <motion.div 
      className="card p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Slider {...settings}>
        {displayMedia.map((item, index) => (
          <div key={index} className="px-2">
            <div className="relative pb-[100%]">
              <img 
                src={item.url} 
                alt={`Publicação ${index + 1}`}
                className="absolute top-0 left-0 w-full h-full object-cover rounded-lg shadow-sm"
              />
              
              {item.type === 'video' && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Vídeo
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 rounded-b-lg">
                <div className="flex justify-between text-white text-sm">
                  <span>❤️ {item.likes.toLocaleString()}</span>
                  <span>💬 {item.comments.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </motion.div>
  )
}

export default MediaCarousel 