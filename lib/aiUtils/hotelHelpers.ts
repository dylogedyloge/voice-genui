import { fetchCityData } from "./apiUtils";
import { API_ENDPOINTS } from "../../endpoints/endpoints";
import DateService from "@/services/date-service";

// Type definitions
interface HotelSearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  adultsCount: number;
  childCount: number;
  childAges: number[];
}

interface CityData {
  cityId: string;
  isDomestic: boolean;
}

interface NormalizedHotel {
  id: string;
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  price: number;
  rating: number;
  imageUrl?: string;
  amenities?: string[];
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
  isDomestic: boolean; 
  fare?: { total: number };
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

// Helper function to determine city type and get city ID
// export const determineCityType = async (
//   location: string
// ): Promise<CityData> => {
//   try {
//     // First try domestic cities
//     const domesticData = await fetchCityData(
//       location,
//       API_ENDPOINTS.DOMESTIC.CITIES,
//       true
//     );

//     if (domesticData) {
//       return {
//         cityId: domesticData.id,
//         isDomestic: true,
//       };
//     }

//     // If not domestic, try international
//     const internationalData = await fetchCityData(
//       location,
//       API_ENDPOINTS.INTERNATIONAL.CITIES,
//       false
//     );

//     if (!internationalData) {
//       throw new Error(`City "${location}" not found in either database`);
//     }

//     return {
//       cityId: internationalData.id,
//       isDomestic: false,
//     };
//   } catch (error) {
//     console.error("Error determining city type:", error);
//     throw new Error("Failed to determine city type");
//   }
// };
export async function determineCityType(location: string) {
  // console.log("Determining city type for location:", location);
  
  // 1. Try domestic cities
  let response = await fetch(`${API_ENDPOINTS.DOMESTIC.CITIES}?search=${location}`);
  let data = await response.json();
  if (data.data?.results?.length > 0) {
    const cityResult = data.data.results[0];
    // console.log("Found domestic city:", cityResult);
    // console.log("Domestic city ID:", cityResult.id);
    // console.log("Domestic city parto_id:", cityResult.parto_id);
    
    // For domestic hotels, we should use the id instead of parto_id
    const result = { 
      ...cityResult,
      isDomestic: true, 
      city_id_for_api: cityResult.id // Use id for domestic hotels
    };
    
    // console.log("Final domestic city data:", result);
    // console.log("City ID for API:", result.city_id_for_api);
    
    return result;
  }

  // 2. Try international hotel cities (new endpoint) ONLY
  response = await fetch(`${API_ENDPOINTS.INTERNATIONAL.HOTEL_CITIES}${encodeURIComponent(location)}`);
  data = await response.json();
  if (data.data?.results?.length > 0) {
    const cityResult = data.data.results[0];
    // console.log("Found international city:", cityResult);
    // console.log("International city ID:", cityResult.id);
    // console.log("International city parto_id:", cityResult.parto_id);
    
    // For international hotels, we should use parto_id
    const result = { 
      ...cityResult, 
      isDomestic: false,
      city_id_for_api: cityResult.parto_id || cityResult.id // Use parto_id for international hotels
    };
    
    // console.log("Final international city data:", result);
    // console.log("City ID for API:", result.city_id_for_api);
    
    return result;
  }

  // console.log("No city found for location:", location);
  throw new Error("City not found");
}

// Construct API URL based on city type
export const constructHotelApiUrl = (
  isDomestic: boolean,
  cityId: string,
  params: {
    location: string;
    checkIn: string;
    checkOut: string;
    adultsCount: number;
    childCount: number;
    childAges: number[];
  }
) => {
  // console.log("Constructing hotel API URL with params:", { isDomestic, cityId, params });
  // console.log("City ID type:", typeof cityId, "City ID value:", cityId);
  
  // Ensure dates are in the correct format (YYYY-MM-DD)
  const checkIn = params.checkIn;
  const checkOut = params.checkOut;
  
  if (isDomestic) {
    // Domestic hotel API URL - Fix parameter names
    const baseUrl = API_ENDPOINTS.DOMESTIC.HOTELS;
    const queryParams = new URLSearchParams({
      city: cityId, // Changed from city_id to city
      check_in: checkIn,
      check_out: checkOut,
      adults_count: params.adultsCount.toString(), // Changed from adult_count to adults_count
      child_count: params.childCount.toString(),
      child_ages: params.childAges.join(','),
      page: "1" // Added page parameter
    });
    
    const url = `${baseUrl}?${queryParams.toString()}`;
    // console.log("Domestic hotel API URL:", url);
    return url;
  } else {
    // International hotel API URL
    const baseUrl = API_ENDPOINTS.INTERNATIONAL.HOTELS;
    const queryParams = new URLSearchParams({
      city: cityId, // This should be the parto_id from determineCityType
      check_in: checkIn,
      check_out: checkOut,
      adults_count: params.adultsCount.toString(),
      child_count: params.childCount.toString(),
      child_ages: params.childAges.join(','),
      nationality: "IR",
      page: "1"
    });
    
    const url = `${baseUrl}?${queryParams.toString()}`;
    // console.log("International hotel API URL:", url);
    return url;
  }
};

export const normalizeHotelData = (
  rawData: any,
  isDomestic: boolean,
  location: string,
  checkIn: string,
  checkOut: string
): NormalizedHotel[] => {
  // console.log("Normalizing hotel data:", { isDomestic, rawDataStructure: typeof rawData });
  
  if (isDomestic) {
    // Check for domestic data structure
    if (!rawData?.data?.data || !Array.isArray(rawData.data.data)) {
      console.error("Invalid domestic hotel data structure:", rawData);
      return [];
    }

    const validData = rawData.data.data.filter((hotel: any) => hotel !== null);
    // console.log(`Found ${validData.length} valid domestic hotels`);
    
    return validData.map((hotel: any) => ({
      id: hotel.id?.toString() || null,
      hotel_id: hotel.hotel_id?.toString() || null, 
      hotelName: hotel.name || "Unknown Hotel",
      location: location,
      checkIn: DateService.toJalali(checkIn),
      checkOut: DateService.toJalali(checkOut),
      roomType: hotel.rooms?.[0]?.room_type_name || "Standard",
      price: hotel.fare?.total || hotel.price?.total || hotel.min_price || 0,
      rating: hotel.star_rating || 0,
      imageUrl: hotel.image_url || "",
      amenities: hotel.amenities || [],
      images: hotel.images || [],
      address: hotel.address || "",
      star: hotel.star || 0,
      type: hotel.type || "هتل",
      rooms: hotel.rooms || [],
      isDomestic: true,
      // Add all other properties needed for the hotel card
      fare: hotel.fare || { total: hotel.price?.total || hotel.min_price || 0 },
      fare_source_code: hotel.fare_source_code || "",
      star_rating: hotel.star_rating || 0,
      offer: hotel.offer || null,
      promotion: hotel.promotion || null,
      non_refundable: hotel.non_refundable || false,
      policy: hotel.policy || null,
      extra_charge: hotel.extra_charge || null,
      payment_deadline: hotel.payment_deadline || null,
      available_rooms: hotel.available_rooms || null,
      cancellation_policy_text: hotel.cancellation_policy_text || null,
      cancellation_policies: hotel.cancellation_policies || null,
    }));
  } else {
    // International hotels
    if (!rawData?.data?.data || !Array.isArray(rawData.data.data)) {
      console.error("Invalid international hotel data structure:", rawData);
      return [];
    }

    const validData = rawData.data.data.filter((hotel: any) => hotel !== null);
    // console.log(`Found ${validData.length} valid international hotels`);
    
    return validData.map((hotel: any) => ({
      id: hotel.id?.toString() || null,
      hotel_id: hotel.hotel_id?.toString() || null,
      hotelName: hotel.name || "Unknown Hotel",
      location: location,
      checkIn: DateService.toJalali(checkIn),
      checkOut: DateService.toJalali(checkOut),
      roomType: hotel.rooms?.[0]?.room_type_name || "Standard",
      price: hotel.fare?.total || hotel.price?.total || hotel.min_price || 0,
      rating: hotel.star_rating || 0,
      imageUrl: hotel.image_url || "",
      amenities: hotel.amenities || [],
      images: hotel.images || [],
      address: hotel.address || "",
      star: hotel.star || 0,
      type: hotel.type || "هتل",
      rooms: hotel.rooms || [],
      isDomestic: false,
      // Add all other properties needed for the hotel card
      fare: hotel.fare || { total: hotel.price?.total || hotel.min_price || 0 },
      fare_source_code: hotel.fare_source_code || "",
      star_rating: hotel.star_rating || 0,
      offer: hotel.offer || null,
      promotion: hotel.promotion || null,
      non_refundable: hotel.non_refundable || false,
      policy: hotel.policy || null,
      extra_charge: hotel.extra_charge || null,
      payment_deadline: hotel.payment_deadline || null,
      available_rooms: hotel.available_rooms || null,
      cancellation_policy_text: hotel.cancellation_policy_text || null,
      cancellation_policies: hotel.cancellation_policies || null,
    }));
  }
};

// Main hotel search function
export const searchHotels = async (
  params: HotelSearchParams
): Promise<NormalizedHotel[]> => {
  try {
    // Validate dates
    if (DateService.isAfter(params.checkIn, params.checkOut)) {
      throw new Error("Check-in date must be before check-out date");
    }

    // Determine city type and get city ID
    const cityData = await determineCityType(params.location);
    // console.log("City data for hotel search in searchHotels:", cityData);

    // Make sure we have the city_id_for_api property
    if (!cityData.city_id_for_api) {
      console.error("Missing city_id_for_api in cityData:", cityData);
      throw new Error("Missing city ID for API");
    }

    // Construct API URL with the correct city ID
    const apiUrl = constructHotelApiUrl(
      cityData.isDomestic,
      cityData.city_id_for_api.toString(), // Use city_id_for_api instead of parto_id
      params
    );

    // console.log("Hotel search API URL:", apiUrl);

    // Fetch hotel data
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(`API request failed: ${JSON.stringify(errorData)}`);
    }

    const rawData = await response.json();
    // console.log("Hotel API raw response:", rawData);

    // Normalize and return data
    const normalizedData = normalizeHotelData(
      rawData,
      cityData.isDomestic,
      params.location,
      params.checkIn,
      params.checkOut
    );
    
    // console.log("Normalized hotel data count:", normalizedData.length);
    return normalizedData;
  } catch (error) {
    console.error("Hotel search error:", error);
    throw new Error("Failed to search for hotels");
  }
};

// Helper function to validate search parameters
export const validateHotelSearchParams = (
  params: HotelSearchParams
): string[] => {
  const errors: string[] = [];

  if (!params.location) {
    errors.push("Location is required");
  }

  if (!params.checkIn || !params.checkOut) {
    errors.push("Both check-in and check-out dates are required");
  }

  if (params.adultsCount < 1) {
    errors.push("At least one adult is required");
  }

  if (params.childCount > 0 && params.childAges.length !== params.childCount) {
    errors.push("Child ages must be provided for all children");
  }

  return errors;
};
