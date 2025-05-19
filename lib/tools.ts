// Add interface for tools
interface Tool {
    type: 'function';
    name: string;
    description: string;
    parameters?: {
        type: string;
        properties: Record<string, {
            type: string;
            description: string;
        }>;
    };
    execute?:any
}

import { determineFlightType, constructApiUrl, transformFlightData } from "./aiUtils";
import { constructHotelApiUrl, determineCityType, normalizeHotelData } from "./aiUtils/hotelHelpers";

const toolDefinitions = {

    displayFlightCard: {
        description: 'Display a grid of flight cards',
        parameters: {
            departureCity: {
                type: 'string',
                description: 'The city from which the flight departs'
            },
            destinationCity: {
                type: 'string',
                description: 'The city to which the flight arrives'
            },
            date: {
                type: 'string',
                description: 'The date of the flight (YYYY-MM-DD)'
            },
            cabinType: {
                type: 'object',
                description: 'Cabin type for international flights',
                properties: {
                    id: { type: 'number', description: 'Cabin type ID' },
                    name: { type: 'string', description: 'Cabin type name' },
                    value: { type: 'string', description: 'Cabin type value' }
                },
                optional: true
            },
            passengers: {
                type: 'object',
                description: 'Passenger counts',
                properties: {
                    adult: { type: 'number', description: 'Number of adults' },
                    child: { type: 'number', description: 'Number of children' },
                    infant: { type: 'number', description: 'Number of infants' }
                },
                optional: true
            }
        },
        // The actual function implementation
        execute: async function ({
            departureCity,
            destinationCity,
            date,
            cabinType,
            passengers,
        }: {
            departureCity: string;
            destinationCity: string;
            date: string;
            cabinType?: { id: number; name: string; value: string };
            passengers?: { adult: number; child: number; infant: number };
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
                console.log("api url in tools", apiUrl)
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
        }
    },
    displayHotelCard: {
        description: 'Display a grid of hotel cards',
        parameters: {
            location: {
                type: 'string',
                description: 'The city or location for the hotel search'
            },
            checkIn: {
                type: 'string',
                description: 'Check-in date (YYYY-MM-DD)'
            },
            checkOut: {
                type: 'string',
                description: 'Check-out date (YYYY-MM-DD)'
            },
            adultsCount: {
                type: 'number',
                description: 'Number of adults'
            },
            childCount: {
                type: 'number',
                description: 'Number of children'
            },
            childAges: {
                type: 'array',
                description: 'Ages of children',
                items: { type: 'number' } // <-- Add this line
            },
            nationality: {
                type: 'object',
                description: 'Nationality data (optional)',
                optional: true,
                properties: {
                    id: { type: 'number', description: 'Nationality ID' },
                    name: { type: 'string', description: 'Nationality name' },
                    english_name: { type: 'string', description: 'English name' },
                    iata: { type: 'string', description: 'IATA code', optional: true },
                    parto_iata: { type: 'string', description: 'Parto IATA code', optional: true },
                    description: { type: 'string', description: 'Description', optional: true },
                    nationality: { type: 'string', description: 'Nationality code' },
                    continental: { type: 'string', description: 'Continent' }
                }
            }
        },
        execute: async function ({
            location,
            checkIn,
            checkOut,
            adultsCount = 1,
            childCount = 0,
            childAges = [],
            nationality
        }: {
            location: string;
            checkIn: string;
            checkOut: string;
            adultsCount?: number;
            childCount?: number;
            childAges?: number[];
            nationality?: any;
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

                if (typeof cityData?.parto_id === 'undefined' || cityData.parto_id === null) {
                    throw new Error("Failed to retrieve the city identifier (parto_id).");
                }

                // Construct the API URL
                const apiUrl = constructHotelApiUrl(
                    cityData.isDomestic,
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

                // Fetch hotel data
                const hotelResponse = await fetch(apiUrl, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    cache: "no-store",
                });

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
                    cityData: cityData,
                    gregorianCheckIn: checkIn,
                    gregorianCheckOut: checkOut,
                    searchParams: {
                        rooms: [
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
                    cityData: null,
                    gregorianCheckIn: checkIn,
                    gregorianCheckOut: checkOut,
                    searchParams: {
                        rooms: [
                            {
                                adult: adultsCount,
                                child: childCount,
                                childAges: childAges,
                            },
                        ],
                    }
                };
            }
        }
    },

} as const;

const tools: Tool[] = Object.entries(toolDefinitions).map(([name, config]) => ({
    type: "function",
    name,
    description: config.description,
    parameters: {
        type: 'object',
        properties: config.parameters
    },
    execute: config.execute // Pass the execute function if present
}));

console.log("TOOLS ARRAY:", tools);
export type { Tool };
export { tools };