// app/api/questions/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { QuestionGenerator } from "@/lib/questionGenerator";
import { SUBJECT_TOPICS } from "@/config/curriculum";

const requestSchema = z.object({
  subject: z.enum(["mathematics", "english"]),
  grade: z.number().min(1).max(5),
  topic: z.string(),
  level: z.enum(["very_easy", "easy", "medium", "challenging", "hard"]),
});

const questionGenerator = new QuestionGenerator();

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

    const subjectTopics =
      SUBJECT_TOPICS[normalizedSubject as keyof typeof SUBJECT_TOPICS];
    if (!subjectTopics) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    if (!(normalizedTopic in subjectTopics)) {
      return NextResponse.json(
        { error: `Invalid topic for ${subject}` },
        { status: 400 }
      );
    }

    const subtopics = subjectTopics[
      normalizedTopic as keyof typeof subjectTopics
    ] as string[];

    const question = await questionGenerator.generateQuestion(
      normalizedSubject,
      grade,
      normalizedTopic,
      level,
      subtopics
    );

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
