"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { Conversation } from "@/lib/conversations";
import { Button } from "./ui/button";
import { formatPersianTime } from "@/lib/time-helpers";
import FlightCard from "@/components/flight-card";
import FlightCardSkeleton from "@/components/flight-card-skeleton";
import HotelCard from "@/components/hotel-card";
import HotelCardSkeleton from "@/components/hotel-card-skeleton";


interface TranscriberProps {
  conversation: Conversation[];
  flightLoading?: boolean;
  hotelLoading?: boolean; // <-- Add this line
}

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// --- Tool Renderers ---

// Flight Tool Renderer
function FlightToolRenderer({
  flightData,
  visibleCount,
  onShowMore,
  onShowLess,
  index,
  flightLoading,
  isLastMessage,
}: {
  flightData: any;
  visibleCount: number;
  onShowMore: (index: number, total: number) => void;
  onShowLess: (index: number) => void;
  index: number;
  flightLoading: boolean;
  isLastMessage: boolean;
}) {
  if (flightLoading && isLastMessage) {
    return (
      <div className="mt-2 grid sm:grid-cols-2 grid-cols-1 gap-2 sm:gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (flightData.flights && flightData.flights.length > 0) {
    return (
      <div className="mt-2 grid sm:grid-cols-2 grid-cols-1 gap-2 sm:gap-4">
        {flightData.flights
          .slice(0, visibleCount)
          .map((flight: any, i: number) => (
            <FlightCard
              key={flight.fare_source_code ?? i}
              id={flight.id ?? i}
              fare_source_code={flight.fare_source_code}
              isClosed={flight.isClosed ?? false}
              visaRequirements={flight.visaRequirements ?? []}
              fares={
                flight.fares ?? {
                  adult: {
                    price: flight.price ?? 0,
                    count: flight.passengers?.adult ?? 1,
                    total_price: flight.price ?? 0,
                  },
                  total_price: flight.price ?? 0,
                }
              }
              segments={flight.segments ?? []}
              returnSegments={flight.returnSegments ?? []}
              with_tour={flight.with_tour ?? false}
              departureCityData={flightData.departureCityData}
              destinationCityData={flightData.destinationCityData}
              isDomestic={
                flightData.departureCityData?.isDomestic &&
                flightData.destinationCityData?.isDomestic
              }
              {...flight}
              message={flightData.message}
              showPassengerCounter={flightData.showPassengerCounter}
              showCabinTypeSelector={flightData.showCabinTypeSelector}
              cabinType={flightData.cabinType}
            />
          ))}
        <div className="col-span-full flex justify-center mt-4 gap-2">
          {visibleCount < flightData.flights.length && (
            <Button
              variant="outline"
              onClick={() => onShowMore(index, flightData.flights.length)}
            >
              بیشتر
            </Button>
          )}
          {visibleCount > 2 && (
            <Button
              variant="outline"
              onClick={() => onShowLess(index)}
            >
              کمتر
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Fallback for no flights
  return (
    <div className="max-w-[80%] p-2 rounded-lg rounded-tr-none text-[#006363] bg-[#006363] bg-opacity-5 font-medium text-right">
      <p>{flightData.message}</p>
      <p className="text-xs text-muted-foreground prose-sm text-left my-1">
        {formatPersianTime(new Date())}
      </p>
    </div>
  );
}

// Hotel Tool Renderer
function HotelToolRenderer({
  hotelData,
  visibleCount,
  onShowMore,
  onShowLess,
  index,
  hotelLoading,
  isLastMessage,
}: {
  hotelData: any;
  visibleCount: number;
  onShowMore: (index: number, total: number) => void;
  onShowLess: (index: number) => void;
  index: number;
  hotelLoading: boolean;
  isLastMessage: boolean;
}) {
  if (hotelLoading && isLastMessage) {
    return (
      <div className="mt-2 grid sm:grid-cols-2 grid-cols-1 gap-2 sm:gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <HotelCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (hotelData.hotels && hotelData.hotels.length > 0) {
    return (
      <div className="mt-2 grid sm:grid-cols-2 grid-cols-1 gap-2 sm:gap-4">
        {hotelData.hotels
          .slice(0, visibleCount)
          .map((hotel: any, i: number) => (
            <HotelCard
              key={hotel.id ?? i}
              {...hotel}
              message={hotelData.message}
              cityData={hotelData.cityData}
              gregorianCheckIn={hotelData.gregorianCheckIn}
              gregorianCheckOut={hotelData.gregorianCheckOut}
              searchParams={hotelData.searchParams}
            />
          ))}
        <div className="col-span-full flex justify-center mt-4 gap-2">
          {visibleCount < hotelData.hotels.length && (
            <Button
              variant="outline"
              onClick={() => onShowMore(index, hotelData.hotels.length)}
            >
              بیشتر
            </Button>
          )}
          {visibleCount > 2 && (
            <Button
              variant="outline"
              onClick={() => onShowLess(index)}
            >
              کمتر
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Fallback for no hotels
  return (
    <div className="max-w-[80%] p-2 rounded-lg rounded-tr-none text-[#006363] bg-[#006363] bg-opacity-5 font-medium text-right">
      <p>{hotelData.message}</p>
      <p className="text-xs text-muted-foreground prose-sm text-left my-1">
        {formatPersianTime(new Date())}
      </p>
    </div>
  );
}

// --- Main Transcriber ---

function Transcriber({ conversation, flightLoading, hotelLoading }: TranscriberProps) {
  const [visibleCounts, setVisibleCounts] = React.useState<{ [index: number]: number }>({});

  const showMore = (index: number, total: number) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [index]: Math.min((prev[index] || 2) + 2, total),
    }));
  };

  const showLess = (index: number) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [index]: Math.max((prev[index] || 2) - 2, 2),
    }));
  };

  return (
    <div className="space-y-4 mb-4">
      {conversation.map((message, index) => {
        let toolData: any = null;
        let toolType: string | null = null;

        if (message.role === "assistant") {
          try {
            if (
              typeof message.text === "string" &&
              message.text.trim().startsWith("{")
            ) {
              const parsed = JSON.parse(message.text);
              if (parsed && typeof parsed === "object") {
                if ("flights" in parsed) {
                  toolData = parsed;
                  toolType = "flight";
                } else if ("hotels" in parsed) { // <-- Add this block
                  toolData = parsed;
                  toolType = "hotel";
                }
              }
            }
          } catch (err) {
            console.log("Error parsing assistant message.text:", err, message.text);
          }
        }

        const isLastMessage = index === conversation.length - 1;

        return (
          <div
            key={index}
            className={`flex items-center ${
              message.role === "user"
                ? "justify-end hidden"
                : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <>
                {toolType === "flight" ? (
                  <FlightToolRenderer
                    flightData={toolData}
                    visibleCount={visibleCounts[index] || 2}
                    onShowMore={showMore}
                    onShowLess={showLess}
                    index={index}
                    flightLoading={!!flightLoading}
                    isLastMessage={isLastMessage}
                  />
                ) : toolType === "hotel" ? (
                  <HotelToolRenderer
                    hotelData={toolData}
                    visibleCount={visibleCounts[index] || 2}
                    onShowMore={showMore}
                    onShowLess={showLess}
                    index={index}
                    hotelLoading={!!hotelLoading}
                    isLastMessage={isLastMessage}
                  />
                ) : (
                  !toolData && (
                    <div
                      className="max-w-[80%] p-2 rounded-lg rounded-tr-none text-[#006363] bg-[#006363] bg-opacity-5 font-medium text-right"
                    >
                      <p>{message.text}</p>
                      <p className="text-xs text-muted-foreground prose-sm text-left my-1">
                        {formatPersianTime(new Date())}
                      </p>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Transcriber;
export { Avatar, AvatarImage, AvatarFallback };