import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../types';
import { Zap, Crown } from 'lucide-react';
import { soundService } from '../services/soundService';

interface QuizCardProps {
  question: Question;
  onAnswer: (correct: boolean) => void;
  timeLimit: number;
  isLegendMode: boolean;
  commentary?: string;
  ballPosition?: number;
}

export default function QuizCard({ 
  question, 
  onAnswer, 
  timeLimit, 
  isLegendMode,
  commentary,
  ballPosition = 0
}: QuizCardProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  useEffect(() => {
    // Shuffle options whenever the question changes
    setShuffledOptions([...question.options].sort(() => Math.random() - 0.5));
    setTimeLeft(timeLimit);
    setSelectedOption(null);
  }, [question, timeLimit]);

  useEffect(() => {
    if (selectedOption || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 0.1;
        if (next <= 0) {
          clearInterval(timer);
          soundService.playWhistle();
          onAnswer(false);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [selectedOption, onAnswer]);

  const handleOptionClick = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    setTimeout(() => {
      onAnswer(option === question.correctAnswer);
    }, 500);
  };

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        boxShadow: isLegendMode ? '0 0 40px rgba(0, 242, 255, 0.2)' : '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
      }}
      className={`w-full max-w-md mx-auto bg-stadium rounded-2xl overflow-hidden border ${isLegendMode ? 'border-brand' : 'border-white/10'}`}
    >
      {/* Match Commentary Bar */}
      <div className="bg-brand/10 border-b border-white/5 px-4 py-2 flex items-center gap-3 overflow-hidden">
        <div className="flex-shrink-0 w-2 h-2 bg-brand rounded-full animate-pulse" />
        <motion.p 
          key={commentary}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-[10px] font-bold text-brand uppercase tracking-wider truncate"
        >
          {commentary}
        </motion.p>
      </div>

      {/* Mini Pitch Tracker */}
      <div className="h-1 bg-white/5 relative overflow-hidden">
        <div className="absolute inset-0 flex justify-between px-1 opacity-20">
          <div className="w-1 h-full bg-white/20" />
          <div className="w-px h-full bg-white/20" />
          <div className="w-1 h-full bg-white/20" />
        </div>
        <motion.div 
          className="absolute top-0 w-2 h-2 bg-brand rounded-full -mt-0.5 shadow-[0_0_8px_#00f2ff]"
          animate={{ left: `${50 + (ballPosition / 2)}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
        />
      </div>

      {/* Header with Timer */}
      <div className="bg-white/5 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isLegendMode ? 'bg-brand' : 'bg-white/10'}`}>
            <Crown size={20} className={isLegendMode ? 'text-stadium' : 'text-brand'} />
          </div>
          <span className="font-bold uppercase tracking-wider text-sm">
            {isLegendMode ? 'Modo Leyenda' : `Nivel ${question.difficulty}`}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
          <Zap size={16} className={timeLeft < 2 ? 'text-red-400 animate-pulse' : 'text-brand'} />
          <span className={`font-mono font-bold ${timeLeft < 2 ? 'text-red-400' : 'text-white'}`}>
            {Math.max(0, timeLeft).toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-white/5">
        <motion.div
          className={`h-full ${timeLeft < 2 ? 'bg-red-500' : 'bg-brand'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / timeLimit) * 100}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>

      {/* Question Content */}
      <div className="p-6">
        {question.image && (
          <div className="mb-4 rounded-xl overflow-hidden border border-white/10 shadow-sm">
            <img 
              src={question.image} 
              alt="Pregunta visual" 
              className="w-full h-40 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <h3 className="text-xl font-bold text-white mb-6 leading-tight">
          {question.text}
        </h3>

        <div className="grid gap-3">
          {shuffledOptions.map((option, index) => {
            const isCorrect = option === question.correctAnswer;
            const isSelected = selectedOption === option;
            const showResult = selectedOption !== null;

            let bgColor = 'bg-white/5 hover:bg-white/10 border-white/10';
            let textColor = 'text-gray-300';

            if (showResult) {
              if (isCorrect) {
                bgColor = 'bg-brand/20 border-brand';
                textColor = 'text-brand';
              } else if (isSelected) {
                bgColor = 'bg-red-500/20 border-red-500';
                textColor = 'text-red-400';
              } else {
                bgColor = 'bg-white/5 border-white/5 opacity-30';
              }
            }

            return (
              <motion.button
                key={option}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleOptionClick(option)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 font-medium ${bgColor} ${textColor} flex items-center justify-between group`}
              >
                <span>{option}</span>
                {isSelected && !isCorrect && <span className="text-red-500 text-sm font-bold">Incorrecto</span>}
                {showResult && isCorrect && <span className="text-green-500 text-sm font-bold">¡Correcto!</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
