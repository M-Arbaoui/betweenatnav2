export interface PlayerScores {
  Drama: number;
  Creativity: number;
  Romance: number;
  Mischief: number;
  SharedBrain: number;
  Verdict: string;
}

export interface RoundResult {
  question: string;
  player1Answer: string;
  player2Answer: string;
  player1Scores: PlayerScores;
  player2Scores: PlayerScores;
  coupleVerdict: string;
  compatibilityScore: number;
}

export interface FinalResult {
  finalScore: number;
  title: string;
  summary: string;
  awards: { name: string; winner: string; emoji: string }[];
  advice: string;
}

export type GamePhase = "welcome" | "create-room" | "join-room" | "question" | "player1-answer" | "player2-answer" | "analyzing" | "round-result" | "final";
