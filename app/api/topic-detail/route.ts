import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});
console.log({ questionDescriptionApiKey: process.env.OPENAI_API_KEY });

// Input validation schema
const requestSchema = z.object({
  subject: z.string(),
  grade: z.number().min(1).max(5),
  topic: z.string(),
});

// Response validation schema
const topicDetailSchema = z.object({
  title: z.string(),
  description: z.string(),
  keyPoints: z.array(z.string()),
  examples: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const { subject, grade, topic } = requestSchema.parse(body);

    // Construct the prompt
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
    }

    Make sure the content is:
    - Age-appropriate for grade ${grade}
    - Clear and engaging
    - Uses simple language
    - Includes practical examples
    - Builds on prior knowledge
    - Encourages curiosity and understanding
    
    For mathematics, include relevant formulas using proper mathematical notation.
    For English, include relevant grammar rules or literary concepts as appropriate.`;

    // Make the API call
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

    // Parse and validate the response
    const rawResponse = JSON.parse(completion.choices[0].message.content);
    const validatedResponse = topicDetailSchema.parse(rawResponse);

    // Return the formatted response
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

// Example response format:
/*
{
  "title": "Basic Fractions",
  "description": "Fractions are numbers that represent parts of a whole. They help us describe quantities that aren't whole numbers. A fraction has two parts: the numerator (top number) and denominator (bottom number).",
  "keyPoints": [
    "A fraction represents a part of a whole or a group",
    "The denominator shows how many equal parts the whole is divided into",
    "The numerator shows how many parts we're talking about",
    "Fractions can be represented visually using shapes or objects"
  ],
  "examples": [
    "If you cut a pizza into 8 equal slices and eat 3 slices, you've eaten 3/8 of the pizza",
    "In a class of 20 students, if 10 are wearing blue shirts, 10/20 (or 1/2) of the class is wearing blue"
  ]
}
*/
