import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MatchStats, UserData } from '../types';
import { Crown, MessageCircle, ShoppingBag, RefreshCcw, Star, Zap } from 'lucide-react';

interface GameOverProps {
  stats: MatchStats;
  userData: UserData;
  onRestart: () => void;
}

export default function GameOver({ stats, userData, onRestart }: GameOverProps) {
  const isWinner = stats.userGoals > stats.rivalGoals;
  const winMessage = isWinner ? "¡CAMPEÓN!" : "¡SIGUE ENTRENANDO!";
  const subMessage = isWinner 
    ? `Increíble partido, ${userData.name}. Has demostrado ser una leyenda.`
    : `Buen intento, ${userData.name}. El fútbol siempre da revanchas.`;

  const [adContent, setAdContent] = useState({
    text: 'Espacio disponible para patrocinadores',
    image: ''
  });
  const [jerseyImage, setJerseyImage] = useState('');

  useEffect(() => {
    const savedAd = localStorage.getItem('futea_ad_content');
    if (savedAd) {
      setAdContent(JSON.parse(savedAd));
    }

    const savedJersey = localStorage.getItem('futea_jersey_image');
    if (savedJersey) {
      setJerseyImage(savedJersey);
    }
  }, []);

  const whatsappNumber = "573000000000"; // Placeholder
  const claimPrizeUrl = `https://wa.me/${whatsappNumber}?text=Hola,%20gané%20en%20FuteaPlay%20y%20quiero%20reclamar%20mi%20premio.%20Soy%20${encodeURIComponent(userData.name)}`;
  const buyJerseyUrl = `https://wa.me/${whatsappNumber}?text=Hola,%20quiero%20comprar%20una%20camiseta%20de%20FuteaPlay.%20Soy%20${encodeURIComponent(userData.name)}`;

  return (
    <div className="w-full max-w-md mx-auto bg-stadium rounded-3xl shadow-2xl overflow-hidden border border-white/10">
      {/* Hero Section */}
      <div className={`p-8 text-center ${isWinner ? 'bg-brand' : 'bg-white/5'} ${isWinner ? 'text-stadium' : 'text-white'}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="inline-flex p-4 bg-white/20 rounded-full mb-4"
        >
          {isWinner ? <Crown size={60} /> : <Star size={60} />}
        </motion.div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
          {winMessage}
        </h1>
        <p className={`${isWinner ? 'text-stadium/80' : 'text-white/80'} font-medium`}>
          {subMessage}
        </p>
      </div>

      {/* Stats Section */}
      <div className="p-8">
        <div className="flex justify-around items-center mb-8 bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="text-center">
            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Tú</span>
            <span className="text-4xl font-black text-white">{stats.userGoals}</span>
          </div>
          <div className="text-2xl font-black text-white/20">VS</div>
          <div className="text-center">
            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Rival</span>
            <span className="text-4xl font-black text-white">{stats.rivalGoals}</span>
          </div>
        </div>

        <div className="space-y-4">
          {isWinner && (
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={claimPrizeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-brand hover:bg-brand-dark text-stadium font-black py-5 rounded-2xl shadow-lg shadow-brand/20 flex items-center justify-center gap-2 uppercase tracking-wider transition-colors"
            >
              <Crown size={20} />
              Reclamar Premio
            </motion.a>
          )}

          {jerseyImage && (
            <div className="mb-4 flex justify-center">
              <div className="relative group">
                <img 
                  src={jerseyImage} 
                  alt="Jersey" 
                  className="h-32 w-32 object-contain bg-white/5 rounded-2xl border border-white/10 p-2"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>
          )}

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={buyJerseyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-5 rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-colors"
          >
            <ShoppingBag size={20} />
            Comprar Camiseta
          </motion.a>

          <button
            onClick={onRestart}
            className="w-full bg-transparent border-2 border-white/10 hover:border-white/20 text-gray-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCcw size={18} />
            Jugar de nuevo
          </button>
        </div>

        {/* Ad Space */}
        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-dashed border-white/10 text-center overflow-hidden">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Publicidad</span>
          <div className="flex flex-col items-center justify-center gap-3">
            {adContent.image && (
              <img 
                src={adContent.image} 
                alt="Ad" 
                className="max-h-24 rounded-lg object-contain"
                referrerPolicy="no-referrer"
              />
            )}
            <p className="text-xs text-gray-400 font-medium">{adContent.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
