import { NextResponse } from "next/server";
import fs from "fs";
import path from "path"; // Use path to join file paths correctly
import ollama from "ollama"; // Ensure ollama is installed

export async function POST(req: Request) {
  const data = await req.formData();
  if (!data) {
    return NextResponse.json(
      { error: "Input cannot be empty!" },
      { status: 400 }
    );
  }

  // Get the file from form data
  const image = data.get("file") as File;
  let filePath = "";
  const prompt = data.get("inputData") as string;
  if (!image && !prompt) {
    return NextResponse.json({ error: "No input provided!" }, { status: 400 });
  }

  if (image) {
    // Read the image chunks
    const reader = image.stream().getReader();
    let chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Construct file path safely
    const currentDir = process.cwd();
    const directory = path.join(currentDir, "uploads");
    console.log("currentDir", currentDir);

    // Ensure the uploads directory exists
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Create the full file path
    filePath = path.join(directory, image.name);

    // Write the raw Buffer data to file (not base64 encoded)
    fs.writeFileSync(filePath, Buffer.concat(chunks));
  }

  // Invoke ollama with the image path
  const response = await ollama.generate({
    model: "llava",
    prompt,
    images: filePath ? [filePath] : [],
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
