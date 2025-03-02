// pages/api/topic-detail.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const requestSchema = z.object({
  subject: z.string(),
  grade: z.number().min(1).max(12),
  topic: z.string(),
});

const topicDetailSchema = z.object({
  title: z.string(),
  description: z.string(),
  keyPoints: z.array(z.string()),
  examples: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, grade, topic } = requestSchema.parse(body);

    const prompt = `Generate a comprehensive introduction for the topic "${topic}" in ${subject} for grade ${grade} students.
    Include:
    1. A clear, age-appropriate description
    2. 3-5 key learning points
    3. 2-3 simple examples
    
    Format the response as a JSON object with the following structure:
    {
      "title": "Topic title",
      "description": "A clear explanation of the topic",
      "keyPoints": ["point1", "point2", "point3"],
      "examples": ["example1", "example2"]
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an experienced educator who excels at introducing new topics to students in a clear, engaging way. Return valid JSON with clean formatting.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const rawResponse = JSON.parse(completion.choices[0].message.content);
    const validatedResponse = topicDetailSchema.parse(rawResponse);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("Error in topic-detail API:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate topic details" },
      { status: 500 }
    );
  }
}
