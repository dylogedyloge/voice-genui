import { API_ENDPOINTS } from "@/endpoints/endpoints";

// Helper function to fetch city data from the API
export const fetchCityData = async (cityName: string, apiEndpoint: string, isDomestic: boolean) => {
    // console.log(`Checking ${apiEndpoint}?search=${cityName}`);
    const response = await fetch(`${apiEndpoint}?search=${cityName}`);
    
    if (response.ok) {
      const data = await response.json();
      if (isDomestic) {
        // Domestic API response structure
        if (Array.isArray(data.data.results) && data.data.results.length > 0) {
          const cityData = data.data.results[0];
        
          return {
            id: cityData.id,
            name: cityData.name,
            english_name: cityData.english_name,
            iata: cityData.iata,
            latitude: cityData.latitude,
            longitude: cityData.longitude,
            description: cityData.description,
            is_province_capital: cityData.is_province_capital,
            is_country_capital: cityData.is_country_capital,
            usage_flight: cityData.usage_flight,
            usage_accommodation: cityData.usage_accommodation,
            country: cityData.country,
            province: cityData.province,
            flight: cityData.flight,
            accommodation: cityData.accommodation,
            has_plan: cityData.has_plan,
            parto_id: cityData.parto_id,
            isDomestic: true
          };
        }
      } else {
        // International API response structure
        // if (Array.isArray(data.data) && data.data.length > 0) {
        //   return data.data[0]; // Return the first match
        // }
        if (Array.isArray(data.data.results) && data.data.results.length > 0) {
          return data.data.results[0]; // Return the first match
        }
      }
    } else {
      console.error(`Failed to fetch city data for ${cityName}`);
    }
    return null;
  };

 