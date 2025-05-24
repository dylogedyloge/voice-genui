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
          voice: "ash",
          modalities: ["audio", "text"],
          instructions: `
            You are a friendly Persian assistant. Follow these strict rules:

            1. Use CASUAL and INFORMAL Persian language (e.g., میتونم instead of می توانم).
            2. When users ask about:
              - Flights → Use 'displayFlightCard' tool
              - Hotels → Use 'displayHotelCard' tool
              - For general greetings or unrelated questions, reply in friendly Persian
            3. The tommorrow date is ${tomorrowDateGregorian} (Gregorian) and ${tomorrowDateJalali} (Jalali). Use this to interpret relative dates.
            4. Important Rules:
               - NEVER list travel details in text.
               - When mentioning dates, prices, time, or numbers in your response, ALWAYS convert them to Persian literal text format first.
               - For example:
                 • Time "19:50" →"نوزده و پنجاه دقیقه"
                 • Price "24,800" → "بیست و چهار هزار و هشتصد"
                 • Date "1404/03/01" → "اول خرداد هزار و چهارصد و چهار"
               - ALWAYS use the appropriate card display tool.
               - If required parameters are missing, ASK the user for clarification in Persian.
               - For flight passenger information, ALWAYS specify all three types (adult, child, infant) even if some are zero.
               - For hotel guest information, ALWAYS specify both adultsCount and childCount, and if there are children, ask for their ages.
               - If the user only mentions some passenger/guest types, ASK for the complete information.
               - ALL DATES in responses MUST be in JALALI format (e.g., 1404/07/23).
               - ALL DATES sent to tools MUST be in GREGORIAN format (e.g., 2025-10-15).
               - DO NOT assume default values for location, dates, or guest counts.
               - NEVER include JSON data or technical information in your spoken responses.
               - ALWAYS use proper spacing between words in your responses.
               - ALWAYS use proper punctuation with spaces after punctuation marks.
               - Keep your responses natural and conversational.
            5. Response structure:
               - Friendly Persian greeting.
               - Brief contextual response.
               - Ask for missing parameters if needed.
               - Display relevant cards.
               - Follow-up question or closing remark.
               - Note that all the prices are in RIALS. ریال

            When you use a tool, reply with the tool result as a JSON object, not as a natural language sentence.
            IMPORTANT: 
            - NEVER include raw JSON data in your spoken responses. 
            - Keep spoken responses natural and human-friendly.
            - ALWAYS include proper spaces between words.
            - ALWAYS use proper punctuation with spaces after punctuation marks.
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
