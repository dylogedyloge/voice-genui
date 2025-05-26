"use client";

import Image from "next/image";
import { Bed, Calendar, MapPin, Star, Coffee, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState } from "react";
import { Building, Hotel, Check } from "lucide-react";
import CustomCarousel from "./ui/custom-carousel";
import type { CityData, HotelSearchParams, Hotel as HotelType } from "@/types/chat";

type HotelProps = HotelType & {
  onHotelCardClick: (hotelInfo: any) => void; // Keep this specific if needed
  // Add the props passed from message-list
  destinationData: CityData | null; // Use imported CityData
  gregorianCheckIn: string;
  gregorianCheckOut: string;
  searchParams: HotelSearchParams | null; // Use imported HotelSearchParams
  // Remove props already defined in HotelType from chat.ts if they are identical
  // e.g., remove id, hotelName, location, etc., if they are in HotelType
  // id: string;
  // hotelName: string;
  // location: string;
  // checkIn: string;
  // checkOut: string;
  // roomType: string;
  // price: number;
  // images: Array<{
  //   image: string;
  //   alt: string;
  //   caption: string | null;
  // }>;
  // rating: number;
  // imageUrl?: string;
  // amenities?: string[];
  // onHotelCardClick: (hotelInfo: any) => void;
  // address: string;
  // star: number;
  // type: string;
  // rooms: Array<{
  //   room_type_name: string;
  //   room_type_capacity: number;
  //   rate_plans: Array<{
  //     name: string;
  //     cancelable: number;
  //     meal_type_included: string;
  //     prices: {
  //       total_price: number;
  //       inventory: number;
  //       has_off: boolean;
  //     };
  //   }>;
  // }>;
  // fare?: { total: number };
  // isDomestic: boolean;
  // fare_source_code?: string;
  // hotel_id?: string; 
  // star_rating?: number;
  // offer?: any;
  // promotion?: any;
  // non_refundable?: boolean;
  // policy?: any;
  // extra_charge?: any;
  // payment_deadline?: string;
  // available_rooms?: number;
  // cancellation_policy_text?: string;
  // cancellation_policies?: any[];
  // surcharges?: any;
  // remarks?: any;
  // is_reserve_offline?: boolean;
  // is_blockout?: boolean;
  // is_min_stay_night?: boolean;
  // is_max_stay_night?: boolean;
  // max_stay_night?: number;
  // is_fix_stay_night?: boolean;
  // fix_stay_night?: number;
  // is_board_price?: boolean;
  // refund_type?: string;
  // transfers?: any;
  // metadata?: any;
  // destinationData: CityData | null; // Detailed data for the searched destination
  // gregorianCheckIn: string; // Original check-in date (YYYY-MM-DD)
  // gregorianCheckOut: string; // Original check-out date (YYYY-MM-DD)
  // searchParams: HotelSearchParams | null;
};

const HotelCard = ({
  hotelName,
  location,
  checkIn,
  checkOut,
  roomType,
  price,
  rating,
  onHotelCardClick,
  address,
  star,
  type,
  rooms = [],
  amenities = [],
  images = [],
  fare,
  isDomestic,
  id,
  fare_source_code,
  hotel_id, // API's original ID
  star_rating, // API's star_rating
  offer,
  promotion,
  non_refundable,
  policy,
  extra_charge,
  payment_deadline,
  available_rooms,
  cancellation_policy_text,
  cancellation_policies,
  surcharges,
  remarks,
  is_reserve_offline,
  is_blockout,
  min_stay_night,
  is_min_stay_night,
  is_max_stay_night,
  max_stay_night,
  is_fix_stay_night,
  fix_stay_night,
  is_board_price,
  refund_type,
  transfers,
  metadata,
  destinationData,
  gregorianCheckIn,
  gregorianCheckOut,
  searchParams,
}: HotelProps) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  // Get the first room and rate plan safely
  const firstRoom = rooms?.[0] || {};
  const firstRatePlan = firstRoom?.rate_plans?.[0] || {};

  const handleOpenDetailsAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };
  const handleDomesticHotelPurchase = () => {
    // console.log("Triggering Domestic Hotel Purchase Logic...");
    const transformedHotelInfo = {
      hotelName,
      type,
      star,
      address,
      images,
      rooms: rooms.map(room => ({
        room_type_name: room.room_type_name,
        room_type_capacity: room.room_type_capacity,
        rate_plans: room.rate_plans.map(plan => ({
          name: plan.name,
          cancelable: plan.cancelable,
          meal_type_included: plan.meal_type_included,
          prices: {
            total_price: plan.prices.total_price,
            inventory: plan.prices.inventory,
            has_off: plan.prices.has_off
          }
        }))
      })),
      checkIn,
      checkOut,
      price,
      amenities
    };
    const generalInformation = {
      isTicket: false,
      isAccommodation: true,
      isItinerary: false,
      isInternational: !isDomestic
    };
    // Send message to parent window
    window.parent.postMessage(
      {
        type: "SELECTED_HOTEL",
        payload: {
          selectedHotel: transformedHotelInfo,
          generalInformation
        }
      },
      "*"
    );
    // console.log("selectedHotel (Domestic)", transformedHotelInfo);
    // console.log("generalInformation (Domestic)", generalInformation);
  };

  // Function for "International" type purchase (placeholder, called from within accordion)
  const handleInternationalHotelPurchase = () => {
    // console.log("Triggering International Hotel Purchase Logic...");
    const transformedHotelInfo = {
      fare_source_code: fare_source_code || "",
      id: id ? parseInt(id.toString()) : Math.floor(Math.random() * 1000000),
      name: hotelName,
      star: star || 0,
      star_rating: star_rating || 0,
      address: address || "",
      images: images || [],
      features: amenities || [],
      city_id: destinationData?.id || 0,
      province_id: (destinationData?.province as any)?.id || 0,
      offer: offer || null,
      promotion: promotion || null,
      non_refundable: non_refundable || false,
      hotel_id: hotel_id ? parseInt(hotel_id.toString()) : 0,
      policy: policy || null,
      extra_charge: extra_charge || null,
      payment_deadline: payment_deadline || null,
      fare: fare || { total: price, unit: "IRR" },
      available_rooms: available_rooms || { "1": null },
      cancellation_policy_text: cancellation_policy_text || null,
      cancellation_policies: cancellation_policies || { "1": [] },
      // Transform rooms from array to object with numbered keys
      rooms: rooms.reduce<{
        [key: string]: {
          id: null;
          unique_id: number;
          name: string;
          travelers: {
            adult_count: { [key: string]: number };
            child_count: { [key: string]: number };
            child_ages: { [key: string]: number[] };
          };
          meal_type: string;
          share_bedding: boolean;
          bed_groups: { [key: string]: string };
          check_in: {
            time: null;
            amount: null;
          };
          check_out: {
            time: null;
            amount: null;
          };
        };
      }>((acc, room, index) => {
        acc[(index + 1).toString()] = {
          id: null,
          unique_id: 235698,
          name: room.room_type_name,
          travelers: {
            adult_count: { "1": room.room_type_capacity || 2 },
            child_count: { "1": 0 },
            child_ages: { "1": [] }
          },
          meal_type: "Room Only",
          share_bedding: false,
          bed_groups: { "1": "Standard" },
          check_in: {
            time: null,
            amount: null
          },
          check_out: {
            time: null,
            amount: null
          }
        };
        return acc;
      }, {}),
      surcharges: surcharges || [],
      remarks: remarks || [],
      amenities: amenities || [],
      is_reserve_offline: is_reserve_offline || false,
      is_blockout: is_blockout || false,
      is_min_stay_night: is_min_stay_night || false,
      min_stay_night: min_stay_night || 0,
      is_max_stay_night: is_max_stay_night || false,
      max_stay_night: max_stay_night || 0,
      is_fix_stay_night: is_fix_stay_night || false,
      fix_stay_night: fix_stay_night || 0,
      is_board_price: is_board_price || false,
      refund_type: refund_type || "Offline",
      transfers: transfers || [],
      metadata: metadata || []
    };
    const generalInformation = {
      isTicket: false,
      isAccommodation: true,
      isItinerary: false,
      isInternational: !isDomestic 
    };

    const destinationDataToSend = { ...destinationData };
    // Remove isDomestic property
    delete destinationDataToSend.isDomestic;
    
    const intHotelInformation = {
      destination: destinationDataToSend,
      checkIn: gregorianCheckIn,      // Changed from check_in
      checkOut: gregorianCheckOut,    // Changed from check_out
      originRoomsCount: searchParams?.rooms || [],
      roomsCount: {                   // Group these under roomsCount
        adult: searchParams?.rooms?.reduce((acc, room) => acc + room.adult, 0).toString() || "0",
        child: searchParams?.rooms?.reduce((acc, room) => acc + room.child, 0).toString() || "0",
        ages: searchParams?.rooms?.reduce((acc, room) => {
          return room.childAges.length > 0 
            ? (acc ? acc + ',' : '') + room.childAges.join(',') 
            : acc;
        }, "") || "0"
      },
      nationality: {
        id: 1,
        name: "ایران",
        english_name: "Iran",
        iata: "IRN",
        parto_iata: "IR",
        description: null,
        nationality: "IRN",
        continental: "آسیا"
      },
    };

    // Handle empty ages string
    if (intHotelInformation.roomsCount.ages === '') {
      if (intHotelInformation.roomsCount.child === '0') {
        intHotelInformation.roomsCount.ages = "0";
      }
    }
    
    // Remove trailing comma from ages if present
    if (intHotelInformation.roomsCount.ages.endsWith(',')) {
      intHotelInformation.roomsCount.ages = intHotelInformation.roomsCount.ages.slice(0, -1);
    }

    // Send message to parent window
    window.parent.postMessage(
      {
        type: "SELECTED_INT_HOTEL",
        payload: {
          selectedHotel: transformedHotelInfo,
          generalInformation,
          intHotelInformation
        }
      },
      "*"
    );
    console.log("selectedHotel ", transformedHotelInfo);
    console.log("generalInformation", generalInformation);
    console.log("intHotelInformation", intHotelInformation);

  };





  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full shadow-md dark:bg-black bg-white dark:bg-grid-small-white/[0.1] bg-grid-small-black/[0.1] rounded-lg overflow-x-hidden">
        <div className="relative h-48 w-98">
          {Array.isArray(images) && images.length > 0 && images[0]?.image ? (
            <CustomCarousel images={images} hotelName={hotelName} />
          ) : (
            <Image
              src="/default-hotel-image.png"
              alt={hotelName}
              fill
              className="object-cover w-full h-full rounded-t-lg"
              priority
            />
          )}
          <div className="absolute top-2 right-2 z-20">
            {star ? (
              <Badge variant="secondary" className="text-xs font-medium">
                {[...Array(star)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 inline text-yellow-600" />
                ))}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-md font-bold text-primary">{hotelName}</h2>
            <Badge variant="outline" className="text-xs">
              {type}
            </Badge>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {firstRoom.room_type_name || roomType || "Standard"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                ظرفیت {firstRoom.room_type_capacity || 1} نفر
              </p>
            </div>
          </div>

          {firstRatePlan.meal_type_included === "breakfast" && (
            <div className="flex items-center gap-2 mb-3">
              <Coffee className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">صبحانه رایگان</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{checkIn}</p>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{checkOut}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">
              {(typeof fare?.total === "number" && fare?.total > 0
                ? fare.total
                : price
              ).toLocaleString()} ریال
              <span className="text-xs text-muted-foreground mr-1">/ شب</span>
            </p>
            {firstRatePlan.cancelable === 1 && (
              <Badge variant="outline" className="text-xs">
                قابل کنسلی
              </Badge>
            )}
          </div>
          <Button
            onClick={handleOpenDetailsAccordion}
            variant="outline"
            className="w-full mt-4 text-foreground"
          >
            {isAccordionOpen ? "بستن جزئیات" : "مشاهده جزئیات"}
          </Button>
        </div>

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
                  <TabsTrigger value="details">جزئیات هتل</TabsTrigger>
                  <TabsTrigger value="rooms">اتاق‌ها</TabsTrigger>
                  <TabsTrigger value="amenities">امکانات</TabsTrigger>
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
                    {[
                      {
                        label: "نام هتل",
                        value: hotelName,
                        icon: <Building className="w-4 h-4 text-muted-foreground" />,
                      },
                      {
                        label: "درجه هتل",
                        value: star ? `${star} ستاره` : null,
                        icon: <Star className="w-4 h-4 text-muted-foreground" />,
                      },
                      {
                        label: "آدرس",
                        value: address,
                        icon: <MapPin className="w-4 h-4 text-muted-foreground" />,
                      },
                      {
                        label: "نوع",
                        value: type,
                        icon: <Hotel className="w-4 h-4 text-muted-foreground" />,
                      },
                      {
                        label: "تاریخ ورود",
                        value: checkIn,
                        icon: <Calendar className="w-4 h-4 text-muted-foreground" />,
                      },
                      {
                        label: "تاریخ خروج",
                        value: checkOut,
                        icon: <Calendar className="w-4 h-4 text-muted-foreground" />,
                      },
                    ]
                      .filter(item => !!item.value)
                      .map((item) => (
                        <motion.div
                          key={item.label}
                          className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 flex-wrap"
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <p className="text-xs font-semibold text-card-foreground">
                              {item.label}:
                            </p>
                          </div>
                          <p className="text-xs text-card-foreground break-words whitespace-normal max-w-[60%] text-left">
                            {item.value}
                          </p>
                        </motion.div>
                      ))}
                  </motion.div>
                  <Button
                    onClick={isDomestic ? handleDomesticHotelPurchase : handleInternationalHotelPurchase}
                    className="w-full mt-4"
                  >
                    خرید
                  </Button>
                </TabsContent>

                <TabsContent value="rooms">
                  <div className="space-y-4">
                    {rooms.map((room, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-200 dark:border-gray-700 pb-4"
                      >
                        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                          {room.room_type_name}
                        </h3>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            ظرفیت: {room.room_type_capacity} نفر
                          </p>
                          {room.rate_plans.map((plan, planIndex) => (
                            <div key={planIndex} className="space-y-1">
                              <p className="text-xs font-medium">{plan.name}</p>
                              <p className="text-xs text-muted-foreground">
                                قیمت: {plan.prices.total_price.toLocaleString()}{" "}
                                ریال
                              </p>
                              {plan.meal_type_included === "breakfast" && (
                                <Badge variant="outline" className="text-xs">
                                  شامل صبحانه
                                </Badge>
                              )}
                              {plan.cancelable === 1 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs mr-2"
                                >
                                  قابل کنسلی
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="amenities">
                  <div className="grid grid-cols-2 gap-4">
                    {amenities?.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs text-card-foreground"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </motion.div>
  );
};

export default HotelCard;
