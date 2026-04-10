import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, MatchStats, UserData, Question } from './types';
import { QUESTIONS } from './questions';
import Pitch from './components/Pitch';
import QuizCard from './components/QuizCard';
import LeadForm from './components/LeadForm';
import GameOver from './components/GameOver';
import AdminPanel from './components/AdminPanel';
import { Crown, Target, Zap, Volume2, VolumeX, Gamepad2, Activity, Settings } from 'lucide-react';
import { soundService } from './services/soundService';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [isMuted, setIsMuted] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [gameQuestions, setGameQuestions] = useState<Question[]>(QUESTIONS);

  useEffect(() => {
    const saved = localStorage.getItem('futea_custom_questions');
    if (saved) {
      setGameQuestions(JSON.parse(saved));
    }
  }, [showAdmin]);

  useEffect(() => {
    if (isMuted) {
      soundService.stopAmbience();
    } else if (gameState === 'PLAYING' || gameState === 'GOAL_CELEBRATION') {
      soundService.startAmbience();
    }
  }, [isMuted, gameState]);
  const [stats, setStats] = useState<MatchStats>({
    userGoals: 0,
    rivalGoals: 0,
    consecutiveCorrect: 0,
    totalQuestions: 0,
    isLegendMode: false
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]);
  const [ballPosition, setBallPosition] = useState(0); // -100 to 100
  const [matchProgress, setMatchProgress] = useState(0); // 0 to 100
  const [commentary, setCommentary] = useState('¡Bienvenidos al estadio! El partido está por comenzar.');

  // Game Constants
  const QUESTIONS_PER_LEVEL = 7;
  const TOTAL_MATCH_QUESTIONS = QUESTIONS_PER_LEVEL * 3;
  const TIME_PER_QUESTION = 6;

  const logEvent = (name: string, data: any) => {
    console.log(`[Analytics] ${name}:`, data);
    const events = JSON.parse(localStorage.getItem('futea_events') || '[]');
    events.push({ name, data, timestamp: new Date().toISOString() });
    localStorage.setItem('futea_events', JSON.stringify(events));
  };

  const pickNextQuestion = useCallback((difficulty: 1 | 2 | 3, currentUsedIds: number[]) => {
    const pool = gameQuestions.filter(q => q.difficulty === difficulty && !currentUsedIds.includes(q.id));
    
    if (pool.length === 0) {
      // Fallback if we run out of questions in a level
      const anyPool = gameQuestions.filter(q => !currentUsedIds.includes(q.id));
      if (anyPool.length === 0) return null;
      const random = anyPool[Math.floor(Math.random() * anyPool.length)];
      return random;
    }

    const random = pool[Math.floor(Math.random() * pool.length)];
    return random;
  }, []);

  const startNewMatch = (data: UserData) => {
    setUserData(data);
    setStats({
      userGoals: 0,
      rivalGoals: 0,
      consecutiveCorrect: 0,
      totalQuestions: 0,
      isLegendMode: false
    });
    setBallPosition(0);
    setMatchProgress(0);
    setUsedQuestionIds([]);
    
    const firstQuestion = pickNextQuestion(1, []);
    if (firstQuestion) {
      setCurrentQuestion(firstQuestion);
      setUsedQuestionIds([firstQuestion.id]);
      setGameState('PLAYING');
      if (!isMuted) {
        soundService.startAmbience();
        soundService.playWhistle();
      }
      logEvent('game_started', { user: data.name });
    }
  };

  const handleAnswer = useCallback((correct: boolean) => {
    setStats(prev => {
      const newTotalQuestions = prev.totalQuestions + 1;
      const newConsecutive = correct ? prev.consecutiveCorrect + 1 : 0;
      const isLegend = newConsecutive >= 5 || prev.isLegendMode;
      const newUserGoals = correct ? prev.userGoals + 1 : prev.userGoals;
      const newRivalGoals = !correct ? prev.rivalGoals + 1 : prev.rivalGoals;

      // Play combo sound if streak reaches a milestone
      if (correct && newConsecutive > 0 && newConsecutive % 3 === 0 && !isMuted) {
        soundService.playCombo();
      }

      return {
        userGoals: newUserGoals,
        rivalGoals: newRivalGoals,
        consecutiveCorrect: newConsecutive,
        totalQuestions: newTotalQuestions,
        isLegendMode: isLegend
      };
    });

    setBallPosition(correct ? 100 : -100);
    setGameState('GOAL_CELEBRATION');
    
    if (correct) {
      const positiveCommentary = [
        "¡GOLAZO! ¡Eres una leyenda en la cancha!",
        "¡GOOOOL! ¡Qué clase tienes para definir!",
        "¡A LA RED! ¡Una definición impecable!",
        "¡GOL! ¡El marcador se mueve a tu favor!",
        "¡ANOTACIÓN! ¡Estás dominando el partido!"
      ];
      setCommentary(positiveCommentary[Math.floor(Math.random() * positiveCommentary.length)]);
    } else {
      const negativeCommentary = [
        "¡GOL DEL RIVAL! Hay que recuperar la pelota.",
        "¡ANOTACIÓN CONTRARIA! ¡Concentración, equipo!",
        "¡GOL EN CONTRA! ¡A remontar este partido!",
        "¡EL RIVAL MARCA! ¡No bajemos los brazos!",
        "¡GOL DEL ADVERSARIO! ¡Necesitamos más presión!"
      ];
      setCommentary(negativeCommentary[Math.floor(Math.random() * negativeCommentary.length)]);
    }

    if (!isMuted) {
      if (correct) soundService.playGoal();
      else soundService.playFail();
    }
    logEvent('question_answered', { correct, questionId: currentQuestion?.id });

    if (correct) {
      logEvent('goal_scored', { user: userData?.name });
    }

    setTimeout(() => {
      setStats(currentStats => {
        const nextProgress = (currentStats.totalQuestions / TOTAL_MATCH_QUESTIONS) * 100;
        setMatchProgress(nextProgress);

        if (currentStats.totalQuestions >= TOTAL_MATCH_QUESTIONS) {
          setGameState('GAME_OVER');
          soundService.stopAmbience();
          if (!isMuted) soundService.playWhistle();
          logEvent('game_finished', { 
            userGoals: currentStats.userGoals, 
            rivalGoals: currentStats.rivalGoals 
          });
        } else {
          setGameState('PLAYING');
          setBallPosition(0);
          
          // Difficulty Logic: 7 questions per level
          // 0-6: Level 1
          // 7-13: Level 2
          // 14-20: Level 3
          let nextDifficulty: 1 | 2 | 3 = 1;
          if (currentStats.totalQuestions >= QUESTIONS_PER_LEVEL * 2) nextDifficulty = 3;
          else if (currentStats.totalQuestions >= QUESTIONS_PER_LEVEL) nextDifficulty = 2;
          
          const nextQ = pickNextQuestion(nextDifficulty, usedQuestionIds);
          if (nextQ) {
            setCurrentQuestion(nextQ);
            setUsedQuestionIds(prev => [...prev, nextQ.id]);
          }
        }
        return currentStats;
      });
    }, 2000);
  }, [currentQuestion, userData, isMuted, pickNextQuestion, usedQuestionIds]);

  return (
    <div className="min-h-screen bg-stadium font-sans text-white selection:bg-brand/30">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-dark rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-2xl min-h-screen flex flex-col items-center justify-center">
        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
          <button 
            onClick={() => setShowAdmin(true)}
            className="p-3 bg-white/5 backdrop-blur border border-white/10 rounded-full text-gray-400 hover:text-brand transition-colors"
            title="Panel de Control"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-white/5 backdrop-blur border border-white/10 rounded-full text-gray-400 hover:text-brand transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'LOBBY' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full relative"
            >
              <LeadForm onStart={startNewMatch} />
            </motion.div>
          )}

          {(gameState === 'PLAYING' || gameState === 'GOAL_CELEBRATION') && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-6"
            >
              {/* Scoreboard */}
              <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-2xl flex items-center justify-between border-b-4 border-green-600">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tú</span>
                  <span className="text-4xl font-black italic">{stats.userGoals}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-brand/20 border border-brand/30 px-4 py-1 rounded-full flex items-center gap-2">
                    <Zap size={14} className="text-brand animate-pulse" />
                    <span className="text-xs font-bold font-mono uppercase text-brand">
                      {stats.consecutiveCorrect >= 3 ? '🔥 ¡EN RACHA!' : 'FUTEAPLAY LIVE'}
                    </span>
                  </div>
                  {stats.consecutiveCorrect >= 3 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1.2 }}
                      className="text-[10px] font-black text-orange-500 uppercase tracking-widest"
                    >
                      COMBO x{stats.consecutiveCorrect}
                    </motion.span>
                  )}
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden relative">
                    <motion.div 
                      className={`h-full ${stats.consecutiveCorrect >= 3 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'bg-green-500'}`}
                      animate={{ width: `${matchProgress}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Rival</span>
                  <span className="text-4xl font-black italic">{stats.rivalGoals}</span>
                </div>
              </div>

              {/* Pitch */}
              <Pitch ballPosition={ballPosition} gameState={gameState} />

              {/* Quiz Section */}
              <div className={gameState === 'GOAL_CELEBRATION' ? 'pointer-events-none opacity-50 grayscale transition-all' : ''}>
                {currentQuestion && (
                  <div key={currentQuestion.id}>
                    <QuizCard
                      question={currentQuestion}
                      onAnswer={handleAnswer}
                      timeLimit={TIME_PER_QUESTION}
                      isLegendMode={stats.isLegendMode}
                      commentary={commentary}
                      ballPosition={ballPosition}
                    />
                  </div>
                )}
              </div>

              {/* Stats Footer */}
              <div className="flex justify-center gap-6 text-gray-500">
                <div className="flex items-center gap-2">
                  <Crown size={16} className={stats.consecutiveCorrect > 0 ? 'text-brand' : ''} />
                  <span className="text-xs font-bold uppercase tracking-wider">Racha: {stats.consecutiveCorrect}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Nivel: {currentQuestion?.difficulty}</span>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'GAME_OVER' && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <GameOver 
                stats={stats} 
                userData={userData!} 
                onRestart={() => setGameState('LOBBY')} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 py-8 text-center space-y-4">
        <div className="max-w-xs mx-auto p-3 bg-white/5 backdrop-blur rounded-xl border border-white/10 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Patrocinado por</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-black text-white italic">FUTEA<span className="text-brand">PLAY</span></span>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-sm font-black text-brand italic">QUIZ LEAGUE</span>
          </div>
        </div>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
          © 2026 FuteaPlay • Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}
