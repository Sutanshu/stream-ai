import { NextResponse } from "next/server";
import ollama from "ollama"; // Ensure ollama is installed

export async function POST(req: Request) {
  const { inputData } = await req.json();
  if (!inputData)
    return NextResponse.json(
      { error: "Input cannot be empty!" },
      { status: 400 }
    );

  const response = await ollama.generate({
    model: "llama3.2",
    prompt: inputData,
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        controller.enqueue(encoder.encode(chunk.response)); // Stream word by word
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain" },
  });
}
