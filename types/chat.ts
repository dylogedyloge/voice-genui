export interface ChatInterfaceProps {}

// Define the structure of the Flight, or Hotel
export interface Flight {
  id: number; // Unique identifier
  airline: string; // Airline name (e.g. "Mahan Air")
  airline_persian: string; // Persian airline name (e.g. "هواپیمایی ماهان")
  flightNumber: string; // Flight number (e.g. "W5-1080")
  departure: string; // Departure city name
  destination: string; // Destination city name
  departureTime: string; // Combined Departure date and time (e.g., "YYYY-MM-DDTHH:mm:ss")
  arrivalTime: string; // Combined Arrival date and time (e.g., "YYYY-MM-DDTHH:mm:ss")
  departure_date: string; // Departure date (e.g., "YYYY-MM-DD")
  arrival_date: string; // Arrival date (e.g., "YYYY-MM-DD")
  departure_time: string; // Departure time (e.g., "HH:mm:ss")
  destination_time: string; // Arrival time (e.g., "HH:mm:ss")
  price: number; // Price in Rials (usually adult price)
  airlineLogo: string; // URL to airline logo image
  type: string; // Flight type (e.g. "charter")
  capacity: number; // Available seats
  sellingType: string; // Selling type (e.g. "All")
  aircraft: string; // Aircraft type
  baggage: string; // Baggage allowance
  flightClass: string; // Flight class
  cobin: string; // Cabin class (e.g. "Economy")
  cobin_persian: string; // Persian cabin class
  persian_type: string; // Persian flight type
  refundable: boolean | null; // Whether flight is refundable
  child_price: number; // Child ticket price
  infant_price: number; // Infant ticket price
  departure_terminal: string; // Departure terminal
  destination_terminal: string; // Arrival terminal
  refund_rules: any[]; // Refund policy rules
  flight_duration: string; // Duration of flight
  with_tour: boolean | null; // Whether flight includes tour
  tag: string; // Additional tag info
  fare_source_code: string; // Fare source code
  isClosed?: boolean; // Optional: If applicable for international flights
  visaRequirements?: any; // Optional: If applicable for international flights
  fares?: any; // Optional: Detailed fare breakdown if available
  segments?: any[]; // Optional: For international flights with segments
  returnSegments?: any[]; // Optional: For international flights with segments
  status?: "On Time" | "Delayed" | "Cancelled"; // Flight status
  departureCityData: CityData; // Ensure CityData type is correctly imported/defined
  destinationCityData: CityData; // Ensure CityData type is correctly imported/defined
  onFlightCardClick?: (flight: Flight) => void; // Callback prop
  passengers?: {
    adult: number;
    child: number;
    infant: number;
  };
}

export interface CityData {
  id: number;
  name: string;
  english_name: string;
  iata: string | null;
  latitude: string;
  longitude: string;
  description: string | null;
  is_province_capital: boolean;
  is_country_capital: boolean;
  usage_flight: number;
  usage_accommodation: number;
  country: { // Define country structure
    id: number;
    name: string;
    english_name: string;
    iata: string | null;
    parto_iata: string | null;
    description: string | null;
    nationality: string;
    continental: string;
  };
  province: { // Define province structure
    name: string;
    english_name: string;
    description: string | null; // Allow null
  };
  flight: boolean; // Add specific type if available
  accommodation: boolean; // Add specific type if available
  has_plan: boolean;
  parto_id: number;
  isDomestic: boolean;
}

export interface NationalityData {
  id: number;
  name: string;
  english_name: string;
  iata: string | null;
  parto_iata: string | null;
  description: string | null;
  nationality: string;
  continental: string;
}

export interface Hotel {
  id: string;
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  price: number;
  rating: number;
  images: Array<{
    image: string;
    alt: string;
    caption: string | null;
  }>;
  address: string;
  star: number;
  type: string;
  rooms: Array<{
    room_type_name: string;
    room_type_capacity: number;
    rate_plans: Array<{
      name: string;
      cancelable: number;
      meal_type_included: string;
      prices: {
        total_price: number;
        inventory: number;
        has_off: boolean;
      };
    }>;
  }>;
  amenities?: string[];
  isDomestic: boolean;
  fare?:any;
  fare_source_code?: string;
  hotel_id?: string; 
  star_rating?: number; 
  offer?: any;
  promotion?: any;
  non_refundable?: boolean;
  policy?: any;
  extra_charge?: any;
  payment_deadline?: string;
  available_rooms?: number;
  cancellation_policy_text?: string;
  cancellation_policies?: any[];
  surcharges?: any; 
  remarks?: any;
  is_reserve_offline?: boolean;
  is_blockout?: boolean;
  min_stay_night:number;
  is_min_stay_night?: boolean;
  is_max_stay_night?: boolean;
  max_stay_night?: number;
  is_fix_stay_night?: boolean;
  fix_stay_night?: number;
  is_board_price?: boolean;
  refund_type?: string;
  transfers?: any;
  metadata?: any;
}

// Tool Invocation for displaying flight, or hotel details
export interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  state: "calling" | "result";
  result?: Flight[] | Hotel[];
}

// Message structure
export interface Message {
  role: string;
  content?: string;
  text?: string;
  timestamp: Date | string | number;
  toolInvocations?: ToolInvocation[];
  flightDetails?: Flight;
}

// Visibility control for showing more/less items
export interface VisibilityControl {
  map: Record<number, Record<number, number>>;
  showMore: (messageIndex: number, invocationIndex: number) => void;
  showLess: (messageIndex: number, invocationIndex: number) => void;
}
// Structure for room request in search params
export interface RoomRequest {
  adult: number;
  child: number;
  childAges: number[];
}
// Structure for nationality data in search params (based on sample)
export interface NationalityData {
  id: number;
  name: string;
  english_name: string;
  iata: string |null;
  parto_iata: string |null;
  description: string | null;
  nationality: string; // e.g., "IRN"
  continental: string;
}
// Structure for hotel search parameters prop
export interface HotelSearchParams {
  rooms: Array<{
      adult: number;
      child: number;
      childAges: number[];
  }>;
  nationality: NationalityData | null; // Use the defined type
}

export interface HotelResult {
  hotels: Hotel[];
  message: string;
  cityData: CityData | null; // Allow null for error cases
  gregorianCheckIn: string;
  gregorianCheckOut: string;
  searchParams: HotelSearchParams | null; // Allow null for error cases
}
