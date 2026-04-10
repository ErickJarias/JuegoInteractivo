import { motion } from 'motion/react';
import { GameState } from '../types';

interface PitchProps {
  ballPosition: number; // -100 (user goal) to 100 (rival goal)
  gameState: GameState;
}

export default function Pitch({ ballPosition, gameState }: PitchProps) {
  // Map ballPosition (-100 to 100) to SVG coordinates (10% to 90%)
  const ballX = 50 + (ballPosition * 0.45);

  return (
    <div className="relative w-full aspect-[3/2] bg-green-900 rounded-lg overflow-hidden border-4 border-white/20 shadow-2xl group">
      {/* Stadium Crowd Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 grid grid-cols-12 gap-1 p-2">
          {Array.from({ length: 48 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: gameState === 'GOAL_CELEBRATION' ? [1, 1.5, 1] : [1, 1.2, 1],
                opacity: gameState === 'GOAL_CELEBRATION' ? [0.6, 1, 0.6] : [0.3, 0.6, 0.3],
                y: gameState === 'GOAL_CELEBRATION' ? [0, -4, 0] : 0
              }}
              transition={{ 
                duration: gameState === 'GOAL_CELEBRATION' ? 0.3 : 2 + Math.random() * 2, 
                repeat: gameState === 'GOAL_CELEBRATION' ? 5 : Infinity,
                delay: Math.random() * 2
              }}
              className="w-2 h-2 bg-white rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Pitch Markings */}
      <svg viewBox="0 0 100 66.6" className="w-full h-full relative z-10">
        <defs>
          <pattern id="grass" x="0" y="0" width="10" height="66.6" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="5" height="66.6" fill="#2d5a27" />
            <rect x="5" y="0" width="5" height="66.6" fill="#356a2e" />
          </pattern>
          <radialGradient id="lightGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        <rect width="100" height="66.6" fill="url(#grass)" />

        {/* Stadium Lights Glow */}
        <motion.circle 
          cx="0" cy="0" r="30" fill="url(#lightGlow)" 
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.circle 
          cx="100" cy="0" r="30" fill="url(#lightGlow)" 
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        />
        <motion.circle 
          cx="0" cy="66.6" r="30" fill="url(#lightGlow)" 
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
        <motion.circle 
          cx="100" cy="66.6" r="30" fill="url(#lightGlow)" 
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        />

        {/* Lines */}
        <rect x="2" y="2" width="96" height="62.6" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.8" />
        <line x1="50" y1="2" x2="50" y2="64.6" stroke="white" strokeWidth="0.5" strokeOpacity="0.8" />
        <circle cx="50" cy="33.3" r="9.15" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.8" />
        <circle cx="50" cy="33.3" r="0.5" fill="white" />

        {/* Penalty Areas */}
        <rect x="2" y="16.3" width="16.5" height="34" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.8" />
        <rect x="81.5" y="16.3" width="16.5" height="34" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.8" />
        
        {/* Goal Nets */}
        <path d="M 2 26.3 L 0 26.3 L 0 40.3 L 2 40.3" fill="none" stroke="white" strokeWidth="0.3" strokeDasharray="0.5,0.5" />
        <path d="M 98 26.3 L 100 26.3 L 100 40.3 L 98 40.3" fill="none" stroke="white" strokeWidth="0.3" strokeDasharray="0.5,0.5" />

        {/* Players (Simplified) */}
        {/* User Team */}
        <circle cx="15" cy="33.3" r="1.2" fill="#3b82f6" stroke="white" strokeWidth="0.2" />
        <circle cx="30" cy="15" r="1.2" fill="#3b82f6" stroke="white" strokeWidth="0.2" />
        <circle cx="30" cy="51.6" r="1.2" fill="#3b82f6" stroke="white" strokeWidth="0.2" />
        
        {/* Rival Team */}
        <circle cx="85" cy="33.3" r="1.2" fill="#ef4444" stroke="white" strokeWidth="0.2" />
        <circle cx="70" cy="15" r="1.2" fill="#ef4444" stroke="white" strokeWidth="0.2" />
        <circle cx="70" cy="51.6" r="1.2" fill="#ef4444" stroke="white" strokeWidth="0.2" />

        {/* Ball Shadow */}
        <motion.ellipse
          cx={ballX}
          cy={35}
          rx="1.2"
          ry="0.6"
          fill="rgba(0,0,0,0.3)"
          animate={{ cx: ballX }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        />

        {/* Ball */}
        <motion.circle
          cx={ballX}
          cy={33.3}
          r="1.5"
          fill="white"
          stroke="black"
          strokeWidth="0.2"
          animate={{
            cx: ballX,
            scale: gameState === 'GOAL_CELEBRATION' ? [1, 2.5, 1.8] : 1,
            rotate: ballPosition * 20,
            y: gameState === 'GOAL_CELEBRATION' ? [0, -8, 0] : 0
          }}
          transition={{ 
            cx: { type: 'spring', stiffness: 100, damping: 15 },
            scale: { duration: 0.5 },
            y: { duration: 0.5, times: [0, 0.5, 1] }
          }}
        />
      </svg>

      {/* Goal Celebration Overlay */}
      {gameState === 'GOAL_CELEBRATION' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [-2, 2, -2]
            }}
            transition={{ duration: 0.2, repeat: Infinity }}
          >
            <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
              ¡GOOOOOOL!
            </h2>
          </motion.div>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-yellow-400 font-black text-2xl uppercase tracking-widest mt-2 drop-shadow-md"
          >
            ¡EL ESTADIO EXPLOTA! 🏟️
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}
