export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: 1 | 2 | 3; // 1: Basic, 2: Intermediate, 3: Advanced
  image?: string;
}

export type GameState = 'LOBBY' | 'PLAYING' | 'GOAL_CELEBRATION' | 'GAME_OVER';

export interface UserData {
  name: string;
  whatsapp?: string;
  city?: string;
}

export interface MatchStats {
  userGoals: number;
  rivalGoals: number;
  consecutiveCorrect: number;
  totalQuestions: number;
  isLegendMode: boolean;
}
