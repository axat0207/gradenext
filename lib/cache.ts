// lib/cache.ts
// import { CachedQuestion } from "@/types";
interface CachedQuestion {
  id: string; // Example property
  questionText: string; // Example property
  options: string[]; // Example property
  correctAnswer: string; // Example property
  timestamp: number; // Example property
  hash: string; // Example property
}
export class QuestionCache {
  private static instance: QuestionCache;
  private sessionQuestions: Map<string, CachedQuestion[]>;
  private usedHashes: Set<string>;
  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    this.sessionQuestions = new Map();
    this.usedHashes = new Set();
    this.initializeCleanup();
  }

  static getInstance(): QuestionCache {
    if (!QuestionCache.instance) {
      QuestionCache.instance = new QuestionCache();
    }
    return QuestionCache.instance;
  }

  private initializeCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const currentTime = Date.now();
      this.sessionQuestions.forEach((questions, key) => {
        const filteredQuestions = questions.filter(
          (q) => currentTime - q.timestamp < 12 * 60 * 60 * 1000
        );
        if (filteredQuestions.length === 0) {
          this.sessionQuestions.delete(key);
        } else {
          this.sessionQuestions.set(key, filteredQuestions);
        }
      });
      this.usedHashes.clear();
    }, 30 * 60 * 1000);
  }

  addQuestion(key: string, question: CachedQuestion): void {
    if (!this.sessionQuestions.has(key)) {
      this.sessionQuestions.set(key, []);
    }
    this.sessionQuestions.get(key)?.push(question);
    this.usedHashes.add(question.hash);
  }

  getQuestions(key: string): CachedQuestion[] {
    return this.sessionQuestions.get(key) || [];
  }

  hasHash(hash: string): boolean {
    return this.usedHashes.has(hash);
  }

  cleanup(): void {
    clearInterval(this.cleanupInterval);
    this.sessionQuestions.clear();
    this.usedHashes.clear();
  }
}
