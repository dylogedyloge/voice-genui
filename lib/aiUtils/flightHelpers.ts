import { fetchCityData } from "./apiUtils";
import { API_ENDPOINTS } from "../../endpoints/endpoints";

// Function to determine if a flight is domestic or international
export const determineFlightType = async (
  departureCity: string,
  destinationCity: string
) => {
  const domesticDepartureData = await fetchCityData(
    departureCity,
    API_ENDPOINTS.DOMESTIC.CITIES,
    true // isDomestic
  );
  const domesticDestinationData = await fetchCityData(
    destinationCity,
    API_ENDPOINTS.DOMESTIC.CITIES,
    true // isDomestic
  );

  if (domesticDepartureData && domesticDestinationData) {
    return {
      isDomestic: true,
      departureId: domesticDepartureData.id,
      destinationId: domesticDestinationData.id,
    };
  }

  const internationalDepartureData = await fetchCityData(
    departureCity,
    API_ENDPOINTS.INTERNATIONAL.CITIES,
    false // isDomestic
  );
  const internationalDestinationData = await fetchCityData(
    destinationCity,
    API_ENDPOINTS.INTERNATIONAL.CITIES,
    false // isDomestic
  );

  if (!internationalDepartureData || !internationalDestinationData) {
    throw new Error(
      `One or both cities not found in the international database: ${departureCity}, ${destinationCity}`
    );
  }

  return {
    isDomestic: false,
    departureId: internationalDepartureData.id,
    destinationId: internationalDestinationData.id,
  };
};
// Function to construct the API URL based on flight type
export const constructApiUrl = (
  isDomestic: boolean,
  departureId: string | number,
  destinationId: string | number,
  date: string,
  passengers: { adult: number; child: number; infant: number } | undefined,
  cabinType?: { id: number; name: string; value: string }
) => {
  const baseUrl = isDomestic
    ? API_ENDPOINTS.DOMESTIC.FLIGHTS
    : `${API_ENDPOINTS.INTERNATIONAL.FLIGHTS}/`;

  const passengerParams = passengers
    ? `&adult=${passengers.adult}&child=${passengers.child}&infant=${passengers.infant}`
    : "";
  const cabinTypeParam =
    !isDomestic && cabinType ? `&cabin=${cabinType.value}` : "";

  return `${baseUrl}?departure=${departureId}&destination=${destinationId}&date=${date}${passengerParams}&round_trip=false`;
};

// Function to transform flight data into a consistent format
export const transformFlightData = (
  flightData: any,
  isDomestic: boolean,
  passengers: { adult: number; child: number; infant: number } | undefined,
  cabinType?: { id: number; name: string; value: string }
) => {
  if (!flightData?.data) {
    console.error("Invalid flight data structure:", flightData);
    return [];
  }

  const actualPassengers = passengers || { adult: 1, child: 0, infant: 0 };
  if (isDomestic) {
    // Handle domestic flights
    const list = flightData.data?.list || [];
    return list.map((flight: any) => ({
      fare_source_code: flight.fare_source_code,
      cobin: flight.cobin,
      cobin_persian: flight.cobin_persian,
      departure_date: flight.departure_date,
      arrival_date: flight.arrival_date,
      departure_time: flight.departure_time,
      destination_time: flight.destination_time,
      id: flight.id,
      airline_persian: flight.airline_persian,
      airline: flight.airline,
      flightNumber: flight.flight_number,
      departureTime: `${flight.departure_date}T${flight.departure_time}`,
      arrivalTime: `${flight.arrival_date}T${flight.destination_time}`,
      price: flight.adult_price,
      departure: flight.departure_name,
      destination: flight.destination_name,
      aircraft: flight.aircraft,
      baggage: flight.baggage,
      airlineLogo: flight.airline_logo,
      type: flight.type,
      capacity: flight.capacity,
      sellingType: flight.sellingType,
      flightClass: flight.class,
      persian_type: flight.persian_type,
      refundable: flight.refundable,
      child_price: flight.child_price,
      infant_price: flight.infant_price,
      departure_terminal: flight.departure_terminal,
      refund_rules: flight.refund_rules,
      destination_terminal: flight.destination_terminal,
      flight_duration: flight.flight_duration,
      with_tour: flight.with_tour,
      tag: flight.tag,
      passengers: actualPassengers,
    }));
  }

  // Handle international flights
  const list = flightData.data?.results?.list || [];
  return list.map((flight: any) => ({
    id: flight.id,
    fare_source_code: flight.fare_source_code,
    isClosed: flight.is_closed,
    visaRequirements: flight.visa_requirements,
    fares: flight.fares,
    cobin: flight.cobin,
    cobin_persian: flight.cobin_persian,
    airline: flight.segments[0]?.airline?.persian || "",
    flightNumber: flight.segments[0]?.flight_number || "",
    departureTime:
      flight.segments[0]?.departure_date +
      "T" +
      flight.segments[0]?.departure_time,
    arrivalTime:
      flight.segments[flight.segments.length - 1]?.arrival_date +
      "T" +
      flight.segments[flight.segments.length - 1]?.destination_time,
    departure: flight.segments[0]?.departure?.city?.persian || "",
    destination:
      flight.segments[flight.segments.length - 1]?.destination?.city?.persian ||
      "",
    aircraft: flight.segments[0]?.aircraft || "",
    baggage: flight.segments[0]?.baggage || "",
    airlineLogo: flight.segments[0]?.airline?.image || "",
    flight_duration: flight.segments[0]?.flight_duration || "",
    segments:
      flight.segments?.map((segment: any) => ({
        departure_date: segment.departure_date,
        departure_time: segment.departure_time,
        arrival_date: segment.arrival_date,
        destination_time: segment.destination_time,
        flight_number: segment.flight_number,
        flight_duration: segment.flight_duration,
        connection_time: segment.connection_time,
        fare_class: segment.fare_class,
        departure: segment.departure,
        destination: segment.destination,
        airline: segment.airline,
        operating_airline: segment.operating_airline,
        aircraft: segment.aircraft,
        baggage: segment.baggage,
        capacity: segment.capacity,
      })) || [],
    returnSegments: flight.return_segments || [],
    passengers: actualPassengers,
    cabinType: cabinType || { id: 1, name: "Economy", value: "economy" },
  }));
};
