"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { Conversation } from "@/lib/conversations";
import Image from "next/image";
import { Button } from "./ui/button";
import { formatPersianTime } from "@/lib/time-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import WeatherCard from "@/components/weather-card";
import WeatherCardSkeleton from "@/components/weather-card-skeleton";
import FlightCard from "@/components/flight-card";
import FlightCardSkeleton from "@/components/flight-card-skeleton";


interface TranscriberProps {
  conversation: Conversation[];
  flightLoading?: boolean;
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

function Transcriber({ conversation, flightLoading }: TranscriberProps) {
  // State to track how many cards to show for each assistant message
  const [visibleCounts, setVisibleCounts] = React.useState<{ [index: number]: number }>({});

  // Helper to show more cards
  const showMore = (index: number, total: number) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [index]: Math.min((prev[index] || 2) + 2, total),
    }));
  };

  // Helper to show less cards
  const showLess = (index: number) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [index]: Math.max((prev[index] || 2) - 2, 2),
    }));
  };

  return (
    <div className="space-y-4 mb-4">
      {conversation.map((message, index) => {
        let flightData = null;
        let isFlightToolCall = false;
        if (message.role === "assistant") {
          try {
            const parsed = JSON.parse(message.text);
            if (
              typeof parsed === "object" &&
              parsed !== null &&
              "flights" in parsed
            ) {
              flightData = parsed;
              isFlightToolCall = true;
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
                {flightLoading && isLastMessage ? (
                  <div className="mt-2 grid sm:grid-cols-2 grid-cols-1 gap-2 sm:gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <FlightCardSkeleton key={i} />
                    ))}
                  </div>
                ) : flightData ? (
                  (flightData.flights && flightData.flights.length > 0) ? (
                    <div className="mt-2 grid sm:grid-cols-2 grid-cols-1 gap-2 sm:gap-4">
                      {flightData.flights
                        .slice(0, visibleCounts[index] || 2)
                        .map((flight:any, i:number) => (
                          <FlightCard
                            key={flight.fare_source_code ?? i}
                            id={flight.id ?? i}
                            fare_source_code={flight.fare_source_code}
                            isClosed={flight.isClosed ?? false}
                            visaRequirements={flight.visaRequirements ?? []}
                            fares={flight.fares ?? { adult: { price: flight.price ?? 0, count: flight.passengers?.adult ?? 1, total_price: flight.price ?? 0 }, total_price: flight.price ?? 0 }}
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
                        {(visibleCounts[index] || 2) < flightData.flights.length && (
                          <Button
                            variant="outline"
                            onClick={() => showMore(index, flightData.flights.length)}
                          >
                            بیشتر
                          </Button>
                        )}
                        {(visibleCounts[index] || 2) > 2 && (
                          <Button
                            variant="outline"
                            onClick={() => showLess(index)}
                          >
                            کمتر
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="max-w-[80%] p-2 rounded-lg rounded-tr-none text-[#006363] bg-[#006363] bg-opacity-5 font-medium text-right"
                    >
                      <p>{flightData.message}</p>
                      <p className="text-xs text-muted-foreground prose-sm text-left my-1">
                        {formatPersianTime(new Date())}
                      </p>
                    </div>
                  )
                ) : (
                  <div
                    className="max-w-[80%] p-2 rounded-lg rounded-tr-none text-[#006363] bg-[#006363] bg-opacity-5 font-medium text-right"
                  >
                    <p>{message.text}</p>
                    <p className="text-xs text-muted-foreground prose-sm text-left my-1">
                      {formatPersianTime(new Date())}
                    </p>
                  </div>
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