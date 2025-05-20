"use client";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar } from "./ui/avatar";
import Image from "next/image";
import moment from "moment-jalaali";
import type { CityData, Flight } from "@/types/chat";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import {
  Plane,
  MapPin,
  CalendarClock,
  Wallet,
  Luggage,
  Clock,
  Hash,
  Loader2,
  Sofa,
  Route,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FaPlane } from "react-icons/fa";

import type React from "react";
import { API_ENDPOINTS } from "@/endpoints/endpoints";
import DOMPurify from "dompurify";

interface FlightSegment {
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  destination_time: string;
  flight_number: string;
  flight_duration: string;
  departure: {
    city: {
      persian: string;
      english?: string;
    };
    terminal: {
      name: string;
      code: string;
    };
    country?: {
      persian: string;
      english: string;
      code: string;
    };
  };
  destination: {
    city: {
      persian: string;
      english?: string;
    };
    terminal: {
      name: string;
      code: string;
    };
    country?: {
      persian: string;
      english: string;
      code: string;
    };
  };
  airline: {
    persian: string;
    image: string;
  };
  aircraft: string;
  baggage: string;
}

interface FlightData {
  id: number;
  fares: {
    adult: {
      price: number;
      count: number;
      total_price: number;
    };
    total_price: number;
  };
  cobin: {
    persian: string;
  };
  segments: FlightSegment[];
}

interface BaggageRule {
  baggage_allowance: string;
  description: string;
}

interface FlightProps {
  id: number;
  fare_source_code: string;
  isClosed: boolean;
  visaRequirements: any;
  fares: {
    adult: {
      price: number;
      count: number;
      total_price: number;
    };
    total_price: number;
  };
  segments: FlightSegment[];
  returnSegments: FlightSegment[];
  airline: string;
  airline_persian:string,
  flightNumber: string;
  departure: string;
  destination: string;
  departure_date: string;
  arrival_date: string;
  departure_time: string;
  destination_time: string;
  arrivalTime: string;
  price: number;
  airlineLogo: string;
  type: string;
  capacity: number;
  sellingType: string;
  aircraft: string;
  baggage: string;
  flightClass: string;
  cobin: string;
  persian_type: string;
  refundable: boolean | null;
  child_price: number;
  infant_price: number;
  departure_terminal: string;
  refund_rules: any[];
  destination_terminal: string;
  flight_duration: string;
  cobin_persian: string;
  with_tour: boolean;
  tag: string;
  departureCityData: CityData | null;
  destinationCityData: CityData | null;
  isDomestic: boolean;
  onFlightCardClick: (flightInfo: Flight) => void;
  passengers?: {
    adult: number;
    child: number;
    infant: number;
  };
}

const convertToJalali = (
  dateString: string | undefined,
  timeString: string | undefined,
  isDomestic: boolean,
  isDeparture: boolean
) => {
  // Return a default value if date is undefined
  if (!dateString) {
    return "Invalid Date";
  }

  try {
    const jalaliDate = moment(dateString, "YYYY-MM-DD").format("jYYYY/jMM/jDD");

    if (isDomestic) {
      const extractedTime =
        timeString && typeof timeString === "string" && timeString.includes("-")
          ? timeString.split("-").pop()?.trim()
          : timeString || "";

      return isDeparture ? `${jalaliDate} - ${extractedTime}` : jalaliDate;
    } else {
      const formattedTime =
        timeString && typeof timeString === "string" && timeString.includes(":")
          ? timeString.split(":").slice(0, 2).join(":")
          : timeString || "";

      return `${jalaliDate} - ${formattedTime}`;
    }
  } catch (error) {
    console.error("Error converting date:", error);
    return "Invalid Date Format";
  }
};

const FlightCard: React.FC<FlightProps> = ({
  id,
  fare_source_code,
  isClosed,
  visaRequirements,
  fares,
  segments,
  returnSegments,
  airline,
  airline_persian,
  flightNumber,
  departure,
  destination,
  departure_date,
  arrival_date,
  departure_time,
  arrivalTime,
  price,
  airlineLogo,
  type,
  capacity,
  sellingType,
  aircraft,
  baggage,
  flightClass,
  cobin,
  persian_type,
  refundable,
  child_price,
  infant_price,
  departure_terminal,
  refund_rules,
  destination_terminal,
  flight_duration,
  cobin_persian,
  with_tour,
  tag,
  departureCityData,
  destinationCityData,
  isDomestic,
  passengers = { adult: 1, child: 0, infant: 0 },

  
}: FlightProps) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  // const [flightInfo, setFlightInfo] = useState<any | null>(null);
  const [baggageRules, setBaggageRules] = useState<
    BaggageRule[] | string | null
  >(null);
  const [refundRules, setRefundRules] = useState<any[] | string | null>(null);
  const [isLoadingBaggage, setIsLoadingBaggage] = useState(false);
  const [isLoadingRefund, setIsLoadingRefund] = useState(false);

  const handleFlightCardClick = () => {

    if (isDomestic) {
      handleDomesticFlightPurchase();
    } else {
      setIsAccordionOpen(!isAccordionOpen);
    }
  };
  // Function to handle card click
  const handleDomesticFlightPurchase = async () => {
   
    // Fetch full city data if not available
    const fetchFullCityData = async (cityName: string) => {
      try {
        const response = await fetch(`${API_ENDPOINTS.DOMESTIC.CITIES}?search=${cityName}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.data.results) && data.data.results.length > 0) {
            return data.data.results[0];
          }
        }
      } catch (error) {
        console.error("Error fetching city data:", error);
      }
      return null;
    };

    
    // Get full city data with fallback
    const fullDepartureCityData = departureCityData?.name 
        ? departureCityData 
        : await fetchFullCityData(departure.trim());
    
    if (!fullDepartureCityData) {
        console.error(`Failed to get data for departure city: ${departure}`);
    }
    const fullDestinationCityData = destinationCityData?.name 
      ? destinationCityData 
      : await fetchFullCityData(destination);

    const transformedFlightInfo = {
      fare_source_code,
      type,
      capacity,
      airline: airline.toLowerCase(),
      sellingType,
      id,
      aircraft,
      class: flightClass,
      cobin,
      persian_type,
      refundable,
      adult_price: price,
      child_price,
      infant_price,
      airline_persian: airline,
      airline_logo: airlineLogo,
      flight_number: flightNumber.toUpperCase(),
      departure: fullDepartureCityData?.iata || departure,
      departure_name: departure,
      departure_date: departure_date,
      departure_time: departure_time.includes("T") 
      ? departure_time.split("T")[1]?.split(':').slice(0, 2).join(':')
      : departure_time?.split(':').slice(0, 2).join(':') || departure_time || '',
      baggage,
      departure_terminal,
      refund_rules,
      destination: fullDestinationCityData?.iata || destination,
      destination_name: destination,
      destination_time: arrivalTime.split("T")[1]?.split(':').slice(0, 2).join(':') || '',
      destination_terminal,
      flight_duration,
      arrival_date: arrival_date,
      cobin_persian,
      with_tour,
      tag,
      fare_type: 2,
      refund_method: "Online",
      english_departure_name: fullDepartureCityData?.english_name || '',
      english_destination_name: fullDestinationCityData?.english_name || '',
      total_price: price,
    };

    const generalInformation = {
      isTicket: true,
      isAccommodation: false,
      isItinerary: false,
      isInternational: false,
    };
    
    const domesticFlightInformation = {
      departure: fullDepartureCityData ? {
        id: fullDepartureCityData.id,
        name: fullDepartureCityData.name,
        english_name: fullDepartureCityData.english_name,
        iata: fullDepartureCityData.iata,
        latitude: fullDepartureCityData.latitude,
        longitude: fullDepartureCityData.longitude,
        description: fullDepartureCityData.description,
        is_province_capital: fullDepartureCityData.is_province_capital,
        is_country_capital: fullDepartureCityData.is_country_capital,
        usage_flight: fullDepartureCityData.usage_flight,
        usage_accommodation: fullDepartureCityData.usage_accommodation,
        country: fullDepartureCityData.country,
        province: fullDepartureCityData.province,
        flight: fullDepartureCityData.flight,
        accommodation: fullDepartureCityData.accommodation,
        has_plan: fullDepartureCityData.has_plan,
        parto_id: fullDepartureCityData.parto_id
      } : null,
      destination: fullDestinationCityData ? {
        id: fullDestinationCityData.id,
        name: fullDestinationCityData.name,
        english_name: fullDestinationCityData.english_name,
        iata: fullDestinationCityData.iata,
        latitude: fullDestinationCityData.latitude,
        longitude: fullDestinationCityData.longitude,
        description: fullDestinationCityData.description,
        is_province_capital: fullDestinationCityData.is_province_capital,
        is_country_capital: fullDestinationCityData.is_country_capital,
        usage_flight: fullDestinationCityData.usage_flight,
        usage_accommodation: fullDestinationCityData.usage_accommodation,
        country: fullDestinationCityData.country,
        province: fullDestinationCityData.province,
        flight: fullDestinationCityData.flight,
        accommodation: fullDestinationCityData.accommodation,
        has_plan: fullDestinationCityData.has_plan,
        parto_id: fullDestinationCityData.parto_id
      } : null,
      departureDate: departure_time.split("T")[0],
      returnDate: null,
      personCounter: {
        adult: passengers.adult,
        child: passengers.child,
        infant: passengers.infant,
        totalPersons: passengers.adult + passengers.child + passengers.infant,
      },
      hasSecondTicket: false,
    };

    window.parent.postMessage(
      {
        type: "SELECTED_FLIGHT",
        payload: {
          selectedDepartureFlight: transformedFlightInfo,
          generalInformation,
          domesticFlightInformation,
        },
      },
      "*"
    );
    console.log("transformedFlightInfo", transformedFlightInfo);
    console.log("generalInformation", generalInformation);
    console.log("domesticFlightInformation", domesticFlightInformation);
  };

  const handleInternationalFlightPurchase = () => {
    const firstSegment = segments[0];

    const generalInformation = {
      isTicket: true,
      isAccommodation: false,
      isItinerary: false,
      isInternational: true,
    };

    const cabinTypeFromProps = cobin ? {
      id: cobin === "economy" ? 1 : cobin === "business" ? 2 : cobin === "first" ? 3 : 1,
      name: cobin_persian || (cobin === "economy" ? "Economy" : cobin === "business" ? "Business" : cobin === "first" ? "First" : "Economy"),
      value: cobin || "economy"
    } : { id: 1, name: "Economy", value: "economy" };

    const intFlightInformation = {
      departure: {
        id: departureCityData?.id,
        subs: [],
        name: firstSegment.departure.terminal?.name?.trim() || "",
        english_name: departureCityData?.english_name || "",
        code: firstSegment.departure.terminal?.code || "",
        city: firstSegment.departure.city?.persian?.trim() || "",
        english_city: firstSegment.departure.city?.english || "",
        country: firstSegment.departure.country?.persian?.trim() || "",
        english_country: firstSegment.departure.country?.english || "",
        country_code: firstSegment.departure.country?.code || "",
      },
      destination: {
        id: destinationCityData?.id,
        subs: [],
        name: firstSegment.destination.terminal?.name?.trim() || "",
        english_name: destinationCityData?.english_name || "",
        code: firstSegment.destination.terminal?.code || "",
        city: firstSegment.destination.city?.persian?.trim() || "",
        english_city: firstSegment.destination.city?.english || "",
        country: firstSegment.destination.country?.persian?.trim() || "",
        english_country: firstSegment.destination.country?.english || "",
        country_code: firstSegment.destination.country?.code || "",
      },
      departureDate: firstSegment.departure_date,
      returnDate: null,
      personCounter: {
        adult: passengers.adult,
        child: passengers.child,
        infant: passengers.infant,
        totalPersons: passengers.adult + passengers.child + passengers.infant,
      },
      cabinType: cabinTypeFromProps,
      isDirect: segments.length === 1,
    };

    const selectedIntFlight = {
      id,
      fare_source_code,
      is_closed: isClosed,
      visa_requirements: visaRequirements,
      total_return_flight_duration: null,
      total_flight_duration: firstSegment.flight_duration,
      fares,
      cabin: {
        english: cabinTypeFromProps.name,
        persian: cobin_persian,
      },
      segments,
      return_segments: returnSegments,
      tag,
    };

    window.parent.postMessage(
      {
        type: "SELECTED_INT_FLIGHT",
        payload: {
          generalInformation,
          intFlightInformation,
          selectedIntFlight,
        },
      },
      "*"
    );
    console.log("generalInformation",generalInformation);
    console.log("intFlightInformation",intFlightInformation);
    console.log("selectedIntFlight",selectedIntFlight);
  };

  // Fetch baggage and refund rules when accordion is opened
  useEffect(() => {
    if (isAccordionOpen && !isDomestic) {
      // Fetch baggage rules
      setIsLoadingBaggage(true);
      fetch(
        `${API_ENDPOINTS.INTERNATIONAL.BAGGAGE}?fare_source_code=${fare_source_code}`
      )
        .then((response) => response.json())
        .then((data) => {
          setBaggageRules(data.data.baggage_info);
          setIsLoadingBaggage(false);
        })
        .catch((error) => {
          console.error("Error fetching baggage rules:", error);
          setIsLoadingBaggage(false);
        });

      // Fetch refund rules
      setIsLoadingRefund(true);
      fetch(
        `${API_ENDPOINTS.INTERNATIONAL.RULES}?fare_source_code=${fare_source_code}`
      )
        .then((response) => response.json())
        .then((data) => {
          setRefundRules(data.data);
          setIsLoadingRefund(false);
        })
        .catch((error) => {
          console.error("Error fetching refund rules:", error);
          setIsLoadingRefund(false);
        });
    }
  }, [isAccordionOpen, isDomestic, fare_source_code]);
  const getFlightSegments = () => {
    // In getFlightSegments function, modify the domestic flight section
    if (isDomestic) {
      return [
        {
          airline: airline,
          flightNumber: flightNumber,
          departureCity: departureCityData?.name || departure,
          destinationCity: destinationCityData?.name || destination,
          departureTime: convertToJalali(
            departure_date,
            departure_time,
            isDomestic,
            true
          ),
          arrivalTime: convertToJalali(
            arrival_date,
            arrivalTime, // This prop exists in the interface
            isDomestic,
            false
          ),
          baggage: baggage,
          flightDuration: flight_duration,
        },
      ];
    }
    else {
      return segments.map((segment) => {
        // Safely format time strings
        const formatTimeString = (timeStr: string | undefined) => {
          if (!timeStr) return "";
          try {
            return timeStr.split(":").slice(0, 2).join(":");
          } catch (error) {
            console.error("Error formatting time:", error);
            return timeStr;
          }
        };

        return {
          airline: segment?.airline?.persian || "",
          flightNumber: segment?.flight_number || "",
          departureCity: segment?.departure?.city?.persian || "",
          destinationCity: segment?.destination?.city?.persian || "",
          departureTime: convertToJalali(
            segment?.departure_date,
            formatTimeString(segment?.departure_time),
            isDomestic,
            true
          ),
          arrivalTime: convertToJalali(
            segment?.arrival_date,
            formatTimeString(segment?.destination_time),
            isDomestic,
            false
          ),
          baggage: segment?.baggage || "",
          flightDuration: segment?.flight_duration || "",
        };
      });
    }
  };

  const flightSegments = getFlightSegments();

  // Function to render Markdown content
  const removeInlineStyles = (html: string | undefined) => {
    return (html || "").replace(/style="[^"]*"/g, ""); // Fallback to empty string if html is undefined
  };
  const renderMarkdown = (content: string | undefined) => {
    const cleanContent = DOMPurify.sanitize(removeInlineStyles(content)); // Ensure content is sanitized and styles are removed
    return <div dangerouslySetInnerHTML={{ __html: cleanContent }} />;
  };

  return (
    <Card className="w-full overflow-hidden transition-shadow duration-300 hover:shadow-lg rounded-lg">
      <div className="shadow-md dark:bg-black bg-white dark:bg-grid-small-white/[0.1] bg-grid-small-black/[0.1] rounded-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Avatar className="w-12 h-12">
                <Image
                  width={64}
                  height={64}
                  src={isDomestic ? airlineLogo : segments[0].airline.image}
                  alt={`${flightSegments[0].airline} logo`}
                  className="rounded-full object-contain bg-white"
                />
              </Avatar>
              <div>
                <CardTitle className="text-sm font-semibold ">
                  {isDomestic ? airline_persian : flightSegments[0].airline}
                </CardTitle>
                <p className="text-sm text-muted-foreground ">
                  {flightSegments[0].flightNumber}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm font-bold bg-[#006363] bg-opacity-5 dark:bg-[#d6ffff] text-[#006363]">
              {(isDomestic ? price : fares.adult.total_price).toLocaleString()}{" "}
              ریال
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {flightSegments.map((segment, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-center justify-between relative">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <p className="text-sm font-semibold">
                      {segment.departureCity}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {segment.departureTime}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <FaPlane
                    size={16}
                    className=" transform rotate-180"
                  />
                </div>
                <div className="space-y-2 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <MapPin size={16} />
                    <p className="text-sm font-semibold">
                      {segment.destinationCity}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {segment.arrivalTime}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center text-sm ">
                <div className="flex items-center gap-1">
                  <Clock  size={16} />
                  <span >مدت پرواز:</span>
                  <span >{segment.flightDuration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Luggage  size={16} />
                  <span > بار مجاز:</span>
                  <span >{segment.baggage}</span>
                </div>
              </div>
              {index < flightSegments.length - 1 && (
                <div className="mt-2 mb-10 text-center text-sm text-muted-foreground">
                  <Badge variant="outline" className="gap-1">
                    <Route className="text-card-foreground" size={12} />
                    <div>
                      {flightSegments[index + 1].departureCity} پیاده می‌شید
                    </div>
                  </Badge>
                </div>
              )}
            </div>
          ))}
          {cobin_persian && (
            <div className="mt-2 flex justify-center items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Sofa size={16} />
                <span className="font-semibold">
                  {isDomestic ? cobin_persian : cobin_persian}
                </span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-4">
          <Button
            onClick={handleFlightCardClick}
            className="w-full"
            variant={isDomestic ? "default" : "outline"}
          >
            <span className="font-bold">
            {isDomestic
              ? "خرید"
              : isAccordionOpen
              ? "بستن جزئیات"
              : "مشاهده جزئیات"}
              </span>
          </Button>
        </CardFooter>

        {!isDomestic && (
          <Accordion
            type="single"
            collapsible
            value={isAccordionOpen ? "details" : ""}
            className="px-4 pb-4"
          >
            <AccordionItem value="details" className="border-none">
              <AccordionContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="details">
                      <Plane className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">جزئیات پرواز</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="baggage-rules"
                      disabled={isLoadingBaggage}
                    >
                      {isLoadingBaggage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Luggage className="w-4 h-4 sm:hidden" />
                          <span className="hidden sm:inline">قوانین بار</span>
                        </>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="refund-rules"
                      disabled={isLoadingRefund}
                    >
                      {isLoadingRefund ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 sm:hidden" />
                          <span className="hidden sm:inline">قوانین استرداد</span>
                        </>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <motion.div
                      className="space-y-4"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: 0.1 },
                        },
                      }}
                    >
                      {flightSegments.map((segment, index) => (
                        <motion.div
                          key={index}
                          className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4"
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                          }}
                        >
                          <h3 className="font-semibold mb-2">
                            پرواز {index + 1}
                          </h3>
                          {[
                            {
                              label: "شرکت هواپیمایی",
                              value: segment.airline,
                              icon: <Plane className="w-4 h-4" />,
                            },
                            {
                              label: "شماره پرواز",
                              value: segment.flightNumber,
                              icon: <Hash className="w-4 h-4" />,
                            },
                            {
                              label: "مبدا",
                              value: segment.departureCity,
                              icon: <MapPin className="w-4 h-4" />,
                            },
                            {
                              label: "مقصد",
                              value: segment.destinationCity,
                              icon: <MapPin className="w-4 h-4" />,
                            },
                            {
                              label: "حرکت",
                              value: segment.departureTime,
                              icon: <CalendarClock className="w-4 h-4" />,
                            },
                            {
                              label: "فرود",
                              value: segment.arrivalTime,
                              icon: <CalendarClock className="w-4 h-4" />,
                            },
                            {
                              label: "بار مجاز",
                              value: segment.baggage,
                              icon: <Luggage className="w-4 h-4" />,
                            },
                            {
                              label: "مدت پرواز",
                              value: segment.flightDuration,
                              icon: <Clock className="w-4 h-4" />,
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="flex justify-between items-center mb-1"
                            >
                              <div className="flex items-center gap-2">
                                {item.icon}
                                <p className="text-xs font-semibold text-card-foreground">
                                  {item.label}:
                                </p>
                              </div>
                              <p className="text-xs text-card-foreground">
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </motion.div>
                      ))}
                      <motion.div
                        className="flex justify-between items-center"
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 },
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          <p className="text-xs font-semibold text-card-foreground">
                            قیمت کل (ریال):
                          </p>
                        </div>
                        <p className="text-xs text-card-foreground">
                          {fares.adult.total_price.toLocaleString()}
                        </p>
                      </motion.div>
                    </motion.div>
                    <Button
                      onClick={handleInternationalFlightPurchase}
                      className="w-full mt-4 font-bold"
                    >
                      خرید
                    </Button>
                  </TabsContent>

                  <TabsContent value="baggage-rules">
                    {/* <p>Baggage Rules Content</p> */}
                    <div className="space-y-4 text-sm" dir="ltr">
                      {" "}
                      {baggageRules ? (
                        Array.isArray(baggageRules) ? (
                          <>
                            <ul className="list-disc list-inside text-sm text-card-foreground">
                              {baggageRules.map((rule: any, index: number) => (
                                <li key={index}>
                                  {rule.departure} به {rule.arrival}:{" "}
                                  {rule.baggage}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          renderMarkdown(baggageRules)
                        )
                      ) : (
                        <p className="text-sm text-card-foreground text-center">
                          داده‌ای یافت نشد
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="refund-rules">
                    {/* <p>Refund Rules Content</p> */}
                    <div
                      className="font-mono  space-y-4 w-full text-sm"
                      dir="ltr"
                    >
                      {refundRules ? (
                        Array.isArray(refundRules) ? (
                          <>
                            {refundRules.map((rule: any, index: number) => (
                              <div key={index}>
                                {rule.rule_details.map(
                                  (detail: any, detailIndex: number) => (
                                    <div key={detailIndex} className="mb-4">
                                      <p className="font-semibold text-card-foreground">
                                        {detail.category}:
                                      </p>
                                      {/* {renderMarkdown(detail.rules_parsed)} */}
                                      <div className="rule-text">
                                        {renderMarkdown(detail.rules_parsed)}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ))}
                          </>
                        ) : (
                          renderMarkdown(refundRules)
                        )
                      ) : (
                        <p className="text-sm text-card-foreground text-center">
                          داده‌ای یافت نشد
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </Card>
  );
};

export default FlightCard;
