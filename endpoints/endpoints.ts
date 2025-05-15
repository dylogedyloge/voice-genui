export const API_ENDPOINTS = {
  DOMESTIC: {
    CITIES: "https://api.atripa.ir/api/v2/basic/cities",
    FLIGHTS: "https://api.atripa.ir/api/v2/reserve/flight/list",
    HOTELS: "https://api.atripa.ir/reserve/accommodation/list",
  },
  INTERNATIONAL: {
    CITIES: "https://api.atripa.ir/api/v2/basic/intl/cities",
    FLIGHTS: "https://api.atripa.ir/api/v2/reserve/foreign/flight/list",
    BAGGAGE: "https://api.atripa.ir/api/v2/reserve/foreign/flight/baggage",
    RULES: "https://api.atripa.ir/api/v2/reserve/foreign/flight/rules",
    HOTELS: "https://api.atripa.ir/api/v2/reserve/foreign/accommodation/list",
    HOTEL_CITIES: "https://api.atripa.ir/api/v2/basic/cities/?all=false&foreign=true&flight=false&accommodation=true&search="
  },
};
