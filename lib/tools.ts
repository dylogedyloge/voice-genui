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

const toolDefinitions = {
    // getCurrentWeather: {
    //     description: 'Gets the current weather',
    //     parameters: {
    //         city: {
    //             type: 'string',
    //             description: 'The city to get the weather for'
    //         }
    //     }
    // },
    // changeBackgroundColor: {
    //     description: 'Changes the background color of the page',
    //     parameters: {
    //         color: {
    //             type: 'string',
    //             description: 'Color value (hex, rgb, or color name)'
    //         }
    //     }
    // },
    // partyMode: {
    //     description: 'Triggers a confetti animation on the page',
    //     parameters: {}
    // },
    // launchWebsite: {
    //     description: 'Launches a website in the user\'s browser',
    //     parameters: {
    //         url: {
    //             type: 'string',
    //             description: 'The URL to launch'
    //         }
    //     }
    // },
    // copyToClipboard: {
    //     description: 'Copies text to the user\'s clipboard',
    //     parameters: {
    //         text: {
    //             type: 'string',
    //             description: 'The text to copy'
    //         }
    //     }
    // },
    // takeScreenshot: {
    //     description: 'Takes a screenshot of the current page',
    //     parameters: {}
    // },
    // scrapeWebsite: {
    //     description: 'Scrapes a URL and returns content in markdown and HTML formats',
    //     parameters: {
    //         url: {
    //             type: 'string',
    //             description: 'The URL to scrape'
    //         }
    //     }
    // },
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
    // partyMode: {
    //     description: 'Triggers a confetti animation on the page',
    //     parameters: {}
    // },
    // launchWebsite: {
    //     description: 'Launches a website in the user\'s browser',
    //     parameters: {
    //     url: {
    //         type: 'string',
    //         description: 'The URL to launch'
    //     }
    //     }
    // },
    // copyToClipboard: {
    //     description: 'Copies text to the user\'s clipboard',
    //     parameters: {
    //     text: {
    //         type: 'string',
    //         description: 'The text to copy'
    //     }
    //     }
    // },
    // takeScreenshot: {
    //     description: 'Takes a screenshot of the current page',
    //     parameters: {}
    // },
    // scrapeWebsite: {
    //     description: 'Scrapes a URL and returns content in markdown and HTML formats',
    //     parameters: {
    //         url: {
    //             type: 'string',
    //             description: 'The URL to scrape'
    //         }
    //     }
    // }
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


export type { Tool };
export { tools };