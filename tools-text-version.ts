import { tool as createTool } from "ai";
import { z } from "zod";
import {
  determineFlightType,
  constructApiUrl,
  transformFlightData,
} from "./aiUtils";
import {
  constructHotelApiUrl,
  determineCityType,
  normalizeHotelData,
} from "./aiUtils/hotelHelpers";

export const FlightTool = createTool({
  description: "Display a grid of flight cards",
  parameters: z.object({
    departureCity: z.string(),
    destinationCity: z.string(),
    date: z.string(),
    cabinType: z
      .object({
        id: z.number(),
        name: z.string(),
        value: z.string(),
      })
      .optional(),
    passengers: z
      .object({
        adult: z.number(),
        child: z.number(),
        infant: z.number(),
      })
      .optional(),
  }),
  execute: async function ({
    departureCity,
    destinationCity,
    date,
    cabinType,
    passengers,
  }) {
    if (!date) {
      return {
        message: "لطفاً تاریخ پرواز رو به من بگین.",
        flights: [],
      };
    }

    if (!passengers) {
      return {
        message: "لطفاً تعداد مسافران رو بهم بگین.",
        showPassengerCounter: true,
      };
    }

    const { isDomestic } = await determineFlightType(
      departureCity,
      destinationCity
    );
    if (!isDomestic && !cabinType) {
      return {
        message: "لطفا نوع پروازتان را انتخاب کنید",
        showCabinTypeSelector: true,
        flights: [],
      };
    }

    try {
      // Determine flight type and get city IDs
      const { departureId, destinationId } = await determineFlightType(
        departureCity,
        destinationCity
      );

      // Construct the API URL
      const apiUrl = constructApiUrl(
        isDomestic,
        departureId,
        destinationId,
        date,
        passengers
      );

      // Fetch flight data
      const flightResponse = await fetch(apiUrl, {
        method: isDomestic ? "GET" : "POST",
        headers: isDomestic
          ? {}
          : {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Cache-Control": "no-cache",
          },
        cache: "no-store",
        credentials: "include",
      });

      if (!flightResponse.ok) {
        throw new Error(
          `Failed to fetch flight data: ${flightResponse.statusText}`
        );
      }

      const flightData = await flightResponse.json();

      // Transform flight data into a consistent format
      const flights = transformFlightData(
        flightData,
        isDomestic,
        passengers,
        cabinType
      );

      return {
        flights,
        departureCityData: { isDomestic },
        destinationCityData: { isDomestic },
        cabinType,
      };
    } catch (error) {
      console.error("Error fetching flight data:", error);
      return {
        message:
          "متاسفم، در حال حاضر نمی‌توانیم اطلاعات پرواز را به شما بدهیم. لطفاً بعداً دوباره امتحان کنید.",
        flights: [],
      };
    }
  },
});


// Define a Zod schema for NationalityData (matching your desired structure)
const nationalitySchema = z.object({
  id: z.number(),
  name: z.string(),
  english_name: z.string(),
  iata: z.string().nullable(),
  parto_iata: z.string().nullable(),
  description: z.string().nullable(),
  nationality: z.string(), // e.g., "IRN"
  continental: z.string(),
}).nullable();

export const HotelTool = createTool({
  description: "Display a grid of hotel cards",
  parameters: z.object({
    location: z.string(),
    checkIn: z.string(),
    checkOut: z.string(),
    adultsCount: z.number().default(1),
    childCount: z.number().default(0),
    childAges: z.array(z.number()).default([]),
    nationality: nationalitySchema.optional(),
  }),

  execute: async function ({
    location,
    checkIn,
    checkOut,
    adultsCount,
    childCount,
    childAges,
    nationality
  }) {
    if (!checkIn || !checkOut) {
      return {
        message: `لطفاً تاریخ ورود و خروج خود را مشخص کنید.`,
        hotels: [],
      };
    }

    try {
      // Determine city type and get city ID
      const cityData = await determineCityType(location);
      console.log("City Data returned from determineCityType:", cityData); // Optional: Add logging to verify cityData

      // --- Ensure parto_id exists before proceeding ---
      if (typeof cityData?.parto_id === 'undefined' || cityData.parto_id === null) {
        console.error("Error: parto_id is missing in cityData returned by determineCityType.", cityData);
        throw new Error("Failed to retrieve the city identifier (parto_id).");
      }
      // --- End check ---

      // Construct the API URL
      const apiUrl = constructHotelApiUrl(
        cityData.isDomestic,
        // --- Use cityData.parto_id instead of cityData.cityId ---
        cityData.parto_id.toString(),
        {
          location,
          checkIn,
          checkOut,
          adultsCount,
          childCount,
          childAges,
        }
      );
      console.log("apiUrl:", apiUrl); // Verify the generated URL

      // Fetch hotel data
      const hotelResponse = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          // "Cache-Control": "no-cache", // Removed this line to fix CORS issue
          "X-Requested-With": "XMLHttpRequest",
        },
        cache: "no-store", // Keep this if you still want to suggest no caching
      });
      console.log("apiUrl in tools", apiUrl);

      if (!hotelResponse.ok) {
        throw new Error(
          `Failed to fetch hotel data: ${hotelResponse.statusText}`
        );
      }

      const hotelData = await hotelResponse.json();

      // Transform hotel data into a consistent format
      const hotels = normalizeHotelData(
        hotelData,
        cityData.isDomestic,
        location,
        checkIn,
        checkOut,
      );
      return {
        hotels: hotels,
        message:
          hotels.length > 0
            ? `${hotels.length} هتل در ${location} پیدا شد.`
            : `متاسفانه هتلی در ${location} پیدا نشد.`,
        // cityData: { ...cityData, isDomestic: cityData.isDomestic },
        cityData: cityData,
        gregorianCheckIn: checkIn, // Assuming 'checkIn' is the Gregorian date
        gregorianCheckOut: checkOut, // Assuming 'checkOut' is the Gregorian date
        searchParams: {
          // Construct the searchParams object expected by the frontend
          rooms: [ // Assuming a single room structure for now, adjust if needed
            {
              adult: adultsCount,
              child: childCount,
              childAges: childAges,
            },
          ],
          nationality: nationality || null,
        },

      };
    } catch (error) {
      console.error("Error fetching hotel data:", error);
      return {
        message:
          "متاسفم، در حال حاضر نمی‌توانیم اطلاعات هتل را به شما بدهیم. لطفاً بعداً دوباره امتحان کنید.",
        hotels: [],
        cityData: null, // Indicate missing data
        gregorianCheckIn: checkIn, // Still return original query params if available
        gregorianCheckOut: checkOut,
        searchParams: {
           rooms: [
             {
               adult: adultsCount,
               child: childCount,
               childAges: childAges,
             },
           ],
           // nationality: null // Indicate missing nationality
        }
      };
    }
  },
});
export const tools = {
  displayFlightCard: FlightTool,
  displayHotelCard: HotelTool,
};
