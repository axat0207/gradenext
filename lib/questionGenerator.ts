// lib/questionGenerator.ts
// import { openai } from "./openai";
import { Question } from "@/types";
import { QuestionCache } from "./cache";
import {
  formatMathContent,
  generateQuestionHash,
  normalizeQuestionContent,
} from "@/utils/questionUtils";
// lib/openai.ts
import OpenAI from "openai";
export interface CachedQuestion {
  questionText: string;
  options: string[];
  timestamp: number;
  hash: string;
}
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});
export class QuestionGenerator {
  private cache: QuestionCache;

  constructor() {
    this.cache = QuestionCache.getInstance();
  }

  private generatePrompt(
    subject: string,
    grade: number,
    topic: string,
    level: string,
    subtopics: string[]
  ): string {
    return `Create a ${level.replace(
      "_",
      " "
    )} difficulty ${subject} question for grade ${grade} students.
    Topic: ${topic}
    Subtopics: ${subtopics.join(", ")}
    
    Requirements:
    - Question should be appropriate for grade ${grade}
    - Create a completely unique question different from standard textbook examples
    - Do not use LaTeX delimiters
    - Use × instead of * for multiplication
    - Keep mathematical expressions simple and readable
    - Provide clear, step-by-step explanations
    - For mathematics questions:
      * Use grade-appropriate numbers and concepts
      * Vary the numbers and problem structure
      * Include practical, real-world contexts when possible
    - For english questions:
      * Use grade-appropriate vocabulary and complexity
      * Vary the context and question patterns
      * Ensure cultural neutrality
    
    Return ONLY JSON:
    {
      "id": "unique-uuid",
      "questionText": "question without LaTeX delimiters",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "exact matching option",
      "hint": "helpful clue without direct answer",
      "explanation": "step-by-step solution",
      "level": "${level}",
      "topic": "${topic}",
      "grade": ${grade}
    }`;
  }

  private validateQuestion(question: any): question is Question {
    const requiredFields = [
      "id",
      "questionText",
      "options",
      "correctAnswer",
      "hint",
      "explanation",
      "level",
      "topic",
      "grade",
    ];

    return (
      requiredFields.every((field) => question[field]) &&
      Array.isArray(question.options) &&
      question.options.length === 4 &&
      question.options.includes(question.correctAnswer) &&
      typeof question.grade === "number" &&
      question.questionText.length > 0 &&
      question.hint.length > 0 &&
      question.explanation.length > 0
    );
  }

  private isQuestionSimilar(
    questionText: string,
    options: string[],
    cacheKey: string
  ): boolean {
    const normalizedQuestion = normalizeQuestionContent(questionText);
    const hash = generateQuestionHash(questionText, options);

    if (this.cache.hasHash(hash)) {
      return true;
    }

    const existingQuestions = this.cache.getQuestions(cacheKey);
    return existingQuestions.some((q) => {
      if (normalizeQuestionContent(q.questionText) === normalizedQuestion) {
        return true;
      }

      const normalizedNewOptions = options.map(normalizeQuestionContent);
      const existingNormalizedOptions = q.options.map(normalizeQuestionContent);

      const commonOptions = normalizedNewOptions.filter((newOpt) =>
        existingNormalizedOptions.some(
          (existingOpt) =>
            existingOpt === newOpt ||
            (existingOpt.length > 5 &&
              newOpt.length > 5 &&
              (existingOpt.includes(newOpt) || newOpt.includes(existingOpt)))
        )
      );

      return commonOptions.length > 2;
    });
  }

  async generateQuestion(
    subject: string,
    grade: number,
    topic: string,
    level: string,
    subtopics: string[]
  ): Promise<Question> {
    const cacheKey = `${subject}-${grade}-${topic}-${level}`;
    let retryCount = 0;
    const maxRetries = 5;

    while (retryCount < maxRetries) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert education AI specialized in creating unique, grade-appropriate questions.
                       Focus on generating questions that test understanding rather than memorization.
                       Each question should be distinctly different from typical textbook examples.
                       Ensure high variation in numbers, contexts, and question structures.`,
            },
            {
              role: "user",
              content: this.generatePrompt(
                subject,
                grade,
                topic,
                level,
                subtopics
              ),
            },
          ],
          temperature: 1.0,
          presence_penalty: 0.6,
          frequency_penalty: 0.6,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) {
          throw new Error("No content received from OpenAI");
        }

        const parsedData = JSON.parse(content);
        const uniqueId = crypto.randomUUID();

        if (
          this.isQuestionSimilar(
            parsedData.questionText,
            parsedData.options,
            cacheKey
          )
        ) {
          retryCount++;
          continue;
        }

        parsedData.id = uniqueId;
        parsedData.questionText = formatMathContent(parsedData.questionText);
        parsedData.options = parsedData.options.map(formatMathContent);
        parsedData.correctAnswer = formatMathContent(parsedData.correctAnswer);
        parsedData.hint = formatMathContent(parsedData.hint);
        parsedData.explanation = formatMathContent(parsedData.explanation);

        if (this.validateQuestion(parsedData)) {
          const hash = generateQuestionHash(
            parsedData.questionText,
            parsedData.options
          );
          //@ts-ignore
          this.cache.addQuestion(cacheKey, {
            questionText: parsedData.questionText,
            options: parsedData.options,
            timestamp: Date.now(),
            hash,
          });

          return parsedData;
        }
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
      }
      retryCount++;
    }

    throw new Error(
      "Failed to generate valid question after multiple attempts"
    );
  }
}
