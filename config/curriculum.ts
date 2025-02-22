// config/curriculum.ts
export const GRADE_SUBJECT_CONFIG = {
  1: {
    mathematics: {
      topics: ["numbers", "basic_shapes"],
      displayNames: {
        numbers: "Numbers & Counting",
        basic_shapes: "Basic Shapes",
      },
    },
    english: {
      topics: ["phonics", "sight_words", "basic_reading"],
      displayNames: {
        phonics: "Phonics",
        sight_words: "Sight Words",
        basic_reading: "Basic Reading",
      },
    },
  },
  2: {
    mathematics: {
      topics: ["addition_subtraction", "basic_geometry", "patterns"],
      displayNames: {
        addition_subtraction: "Addition & Subtraction",
        basic_geometry: "Basic Geometry",
        patterns: "Patterns & Sequences",
      },
    },
    english: {
      topics: ["grammar", "vocabulary", "reading"],
      displayNames: {
        grammar: "Basic Grammar",
        vocabulary: "Vocabulary",
        reading: "Reading Comprehension",
      },
    },
  },
  3: {
    mathematics: {
      topics: ["multiplication", "division", "fractions", "measurement"],
      displayNames: {
        multiplication: "Multiplication",
        division: "Division",
        fractions: "Basic Fractions",
        measurement: "Measurement",
      },
    },
    english: {
      topics: ["grammar", "vocabulary", "reading", "writing"],
      displayNames: {
        grammar: "Grammar",
        vocabulary: "Vocabulary",
        reading: "Reading Comprehension",
        writing: "Writing Skills",
      },
    },
  },
  4: {
    mathematics: {
      topics: ["fractions", "decimals", "geometry", "data"],
      displayNames: {
        fractions: "Fractions & Decimals",
        decimals: "Decimal Operations",
        geometry: "Geometry",
        data: "Data & Graphs",
      },
    },
    english: {
      topics: ["grammar", "vocabulary", "reading", "writing"],
      displayNames: {
        grammar: "Advanced Grammar",
        vocabulary: "Advanced Vocabulary",
        reading: "Critical Reading",
        writing: "Creative Writing",
      },
    },
  },
  5: {
    mathematics: {
      topics: ["algebra", "geometry", "statistics", "problem_solving"],
      displayNames: {
        algebra: "Pre-Algebra",
        geometry: "Advanced Geometry",
        statistics: "Statistics & Probability",
        problem_solving: "Problem Solving",
      },
    },
    english: {
      topics: ["grammar", "vocabulary", "reading", "writing", "literature"],
      displayNames: {
        grammar: "Complex Grammar",
        vocabulary: "Rich Vocabulary",
        reading: "Advanced Reading",
        writing: "Essay Writing",
        literature: "Literature Analysis",
      },
    },
  },
} as const;

export const SUBJECT_TOPICS = {
  mathematics: {
    numbers: ["counting", "basic addition", "basic subtraction"],
    basic_shapes: ["recognition", "properties"],
    addition_subtraction: ["addition", "subtraction", "word problems"],
    basic_geometry: ["2D shapes", "3D shapes"],
    patterns: ["number patterns", "shape patterns"],
    multiplication: ["times tables", "word problems"],
    division: ["basic division", "word problems"],
    fractions: ["basic fractions", "comparing fractions"],
    measurement: ["length", "weight", "time"],
    decimals: ["decimal operations", "place value"],
    geometry: ["angles", "perimeter", "area"],
    data: ["graphs", "charts", "statistics"],
    algebra: ["expressions", "equations"],
    statistics: ["data analysis", "probability"],
    problem_solving: ["multi-step problems", "logic"],
  },
  english: {
    phonics: ["letter sounds", "blending"],
    sight_words: ["common words", "recognition"],
    basic_reading: ["simple texts", "comprehension"],
    grammar: ["parts of speech", "sentence structure", "punctuation"],
    vocabulary: ["word meaning", "context clues", "synonyms", "antonyms"],
    reading: ["comprehension", "main idea", "details"],
    writing: ["sentences", "paragraphs", "essays"],
    literature: ["story elements", "analysis"],
  },
} as const;

export type GradeLevel = keyof typeof GRADE_SUBJECT_CONFIG;
export type SubjectConfig = (typeof GRADE_SUBJECT_CONFIG)[GradeLevel];

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
  level: string;
  topic: string;
  grade: number;
}

export type DifficultyLevel =
  | "very_easy"
  | "easy"
  | "medium"
  | "challenging"
  | "hard";
