import { NextResponse } from "next/server";

export async function POST() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(`OPENAI_API_KEY is not set`);
    }
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "alloy",
          modalities: ["audio", "text"],
          instructions: "Speak in Persian language. When you use a tool, reply with the tool result as a JSON object, not as a natural language sentence.",
          tool_choice: "auto",
        }),
      }
    );

    if (!response.ok) {
      // Log the status and attempt to read the error body from OpenAI
      const errorBody = await response.text(); // Read body as text first
      console.error(`OpenAI API Error: Status ${response.status}, Body: ${errorBody}`);
      throw new Error(
        `API request failed with status ${response.status}. Body: ${errorBody}` // Include body in thrown error
      );
    }

    const data = await response.json();

    // Return the JSON response to the client
    return NextResponse.json(data);
  } catch (error) {
    // Log the caught error (could be the one thrown above or another)
    console.error("Error fetching session data:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      // Provide a slightly more informative error message if possible
      { error: `Failed to fetch session data: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
