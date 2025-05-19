import { NextResponse } from "next/server";
import DateService from "@/services/date-service";



export async function POST() {
  const { gregorian: tomorrowDateGregorian, jalali: tomorrowDateJalali } =
    DateService.getTomorrow();
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
          instructions: `
            You are a friendly Persian assistant. Follow these strict rules:

            1. Use CASUAL and INFORMAL Persian language (e.g., میتونم instead of می توانم).
            2. When users ask about:
              - Flights → Use 'displayFlightCard' tool
              - Hotels → Use 'displayHotelCard' tool
              - For general greetings or unrelated questions, reply in friendly Persian t
            3. The tommorrow date is ${tomorrowDateGregorian} (Gregorian) and ${tomorrowDateJalali} (Jalali). Use this to interpret relative dates.
            4. Important Rules:
               - NEVER list travel details in text.
               - ALWAYS use the appropriate card display tool.
               - If required parameters (e.g., date, departure, destination, passengers) are missing, ASK the user for clarification in Persian.
               - ALL DATES in responses MUST be in JALALI format (e.g., 1404/07/23).
               - ALL DATES sent to tools MUST be in GREGORIAN format (e.g., 2025-10-15).
               - DO NOT assume default values for departure or destination.
            5. Response structure:
               - Friendly Persian greeting.
               - Brief contextual response.
               - Ask for missing parameters if needed.
               - Display relevant cards.
               - Follow-up question or closing remark.
               - Note that all the prices are in RIALS. ریال

            When you use a tool, reply with the tool result as a JSON object, not as a natural language sentence.
          `,
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
