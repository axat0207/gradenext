import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Question } from "@/types";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Define subject topics with grade-specific content
const SUBJECT_TOPICS = {
  mathematics: {
    // Grade 1
    numbers: ["counting", "basic addition", "basic subtraction"],
    basic_shapes: ["recognition", "properties"],
    // Grade 2
    addition_subtraction: ["addition", "subtraction", "word problems"],
    basic_geometry: ["2D shapes", "3D shapes"],
    patterns: ["number patterns", "shape patterns"],
    // Grade 3
    multiplication: ["times tables", "word problems"],
    division: ["basic division", "word problems"],
    fractions: ["basic fractions", "comparing fractions"],
    measurement: ["length", "weight", "time"],
    // Grade 4
    decimals: ["decimal operations", "place value"],
    geometry: ["angles", "perimeter", "area"],
    data: ["graphs", "charts", "statistics"],
    // Grade 5
    algebra: ["expressions", "equations"],
    statistics: ["data analysis", "probability"],
    problem_solving: ["multi-step problems", "logic"],
  },
  english: {
    // Grade 1
    phonics: ["letter sounds", "blending"],
    sight_words: ["common words", "recognition"],
    basic_reading: ["simple texts", "comprehension"],
    // Grade 2-5
    grammar: ["parts of speech", "sentence structure", "punctuation"],
    vocabulary: ["word meaning", "context clues", "synonyms", "antonyms"],
    reading: ["comprehension", "main idea", "details"],
    writing: ["sentences", "paragraphs", "essays"],
    literature: ["story elements", "analysis"],
  },
};

// Validation schema for request
const requestSchema = z.object({
  subject: z.enum(["mathematics", "english"]),
  grade: z.number().min(1).max(5),
  topic: z.string(),
  level: z.enum(["very_easy", "easy", "medium", "challenging", "hard"]),
});

// Interface for cached questions
interface CachedQuestion {
  questionText: string;
  options: string[];
  timestamp: number;
  hash: string;
}

// Cache management
const sessionQuestions = new Map<string, CachedQuestion[]>();
const usedHashes = new Set<string>();

// Generate hash for question content
function generateQuestionHash(question: string, options: string[]): string {
  const content = `${question.toLowerCase()}${options.join("").toLowerCase()}`;
  return Array.from(content)
    .reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0)
    .toString(36);
}

// Clean up old cache entries every 30 minutes
setInterval(() => {
  const currentTime = Date.now();
  sessionQuestions.forEach((questions, key) => {
    const filteredQuestions = questions.filter(
      (q) => currentTime - q.timestamp < 12 * 60 * 60 * 1000
    );
    if (filteredQuestions.length === 0) {
      sessionQuestions.delete(key);
    } else {
      sessionQuestions.set(key, filteredQuestions);
    }
  });

  // Clear used hashes older than 12 hours
  usedHashes.clear();
}, 30 * 60 * 1000);

// Format mathematical content
function formatMathContent(text: string): string {
  return text
    .replace(/\\$$|\\$$/g, "") // Remove LaTeX delimiters
    .replace(/\*/g, "×") // Replace * with ×
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

// Normalize question content for comparison
function normalizeQuestionContent(content: string): string {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s×]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Check if questions are similar
function isQuestionSimilar(
  newQuestion: string,
  newOptions: string[],
  existingQuestions: CachedQuestion[]
): boolean {
  const normalizedNew = normalizeQuestionContent(newQuestion);
  const newHash = generateQuestionHash(newQuestion, newOptions);

  if (usedHashes.has(newHash)) {
    return true;
  }

  return existingQuestions.some((q) => {
    // Check exact question text match only
    if (normalizeQuestionContent(q.questionText) === normalizedNew) return true;

    // Check for significant option overlap
    const normalizedNewOptions = newOptions.map(normalizeQuestionContent);
    const existingNormalizedOptions = q.options.map(normalizeQuestionContent);

    const commonOptions = normalizedNewOptions.filter((newOpt) =>
      existingNormalizedOptions.some(
        (existingOpt) =>
          // Check if options are exactly the same or very similar
          existingOpt === newOpt ||
          (existingOpt.length > 5 &&
            newOpt.length > 5 &&
            (existingOpt.includes(newOpt) || newOpt.includes(existingOpt)))
      )
    );

    // Return true only if there's significant overlap (more than 2 similar options)
    return commonOptions.length > 2;
  });
}

// Validate question structure
function validateQuestion(question: any): question is Question {
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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error },
        { status: 400 }
      );
    }

    const { subject, grade, topic, level } = validationResult.data;
    const normalizedSubject = subject.toLowerCase();
    const normalizedTopic = topic.toLowerCase();

    // Validate subject and topic
    const subjectTopics =
      SUBJECT_TOPICS[normalizedSubject as keyof typeof SUBJECT_TOPICS];
    if (!subjectTopics) {
      return NextResponse.json({ error: `Invalid subject` }, { status: 400 });
    }

    if (!(normalizedTopic in subjectTopics)) {
      return NextResponse.json(
        { error: `Invalid topic for ${subject}` },
        { status: 400 }
      );
    }

    // Create cache key
    const cacheKey = `${normalizedSubject}-${grade}-${normalizedTopic}-${level}`;

    // Initialize session cache if needed
    if (!sessionQuestions.has(cacheKey)) {
      sessionQuestions.set(cacheKey, []);
    }

    let questionData: Question | null = null;
    let retryCount = 0;
    const maxRetries = 5;

    while (!questionData && retryCount < maxRetries) {
      try {
        // Generate dynamic prompt with context
        const subtopics = subjectTopics[
          normalizedTopic as keyof typeof subjectTopics
        ] as string[];
        const prompt = `Create a ${level.replace(
          "_",
          " "
        )} difficulty ${normalizedSubject} question for grade ${grade} students.
        Topic: ${normalizedTopic}
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
          "topic": "${normalizedTopic}",
          "grade": ${grade}
        }`;

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
            { role: "user", content: prompt },
          ],
          temperature: 1.0,
          presence_penalty: 0.6,
          frequency_penalty: 0.6,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) {
          console.log(
            `Attempt ${retryCount + 1}: No content received from OpenAI`
          );
          retryCount++;
          continue;
        }

        const parsedData = JSON.parse(content);
        const uniqueId = crypto.randomUUID();

        // Check for similarity with existing questions
        const existingQuestions = sessionQuestions.get(cacheKey) || [];
        if (
          isQuestionSimilar(
            parsedData.questionText,
            parsedData.options,
            existingQuestions
          )
        ) {
          console.log(
            `Attempt ${retryCount + 1}: Similar question detected, retrying...`
          );
          retryCount++;
          continue;
        }

        // Format the question content
        parsedData.id = uniqueId;
        parsedData.questionText = formatMathContent(parsedData.questionText);
        parsedData.options = parsedData.options.map(formatMathContent);
        parsedData.correctAnswer = formatMathContent(parsedData.correctAnswer);
        parsedData.hint = formatMathContent(parsedData.hint);
        parsedData.explanation = formatMathContent(parsedData.explanation);

        // Validate the question
        if (validateQuestion(parsedData)) {
          // Generate and store hash
          const questionHash = generateQuestionHash(
            parsedData.questionText,
            parsedData.options
          );
          usedHashes.add(questionHash);

          // Store in session cache
          sessionQuestions.get(cacheKey)?.push({
            questionText: parsedData.questionText,
            options: parsedData.options,
            timestamp: Date.now(),
            hash: questionHash,
          });

          questionData = parsedData;
          console.log(
            `Successfully generated unique question for ${normalizedTopic} (Grade ${grade}, Level: ${level})`
          );
          break;
        } else {
          console.log(`Attempt ${retryCount + 1}: Question validation failed`);
          retryCount++;
        }
      } catch (err) {
        console.error(
          `Attempt ${retryCount + 1}: Error generating question:`,
          err
        );
        retryCount++;
      }
    }

    if (!questionData) {
      console.error("Failed to generate valid question after all retries");
      return NextResponse.json(
        { error: "Failed to generate unique question after multiple attempts" },
        { status: 500 }
      );
    }

    return NextResponse.json(questionData);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
