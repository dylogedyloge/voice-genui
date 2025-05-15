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
  // Find the index of the first assistant message in the original array
  const firstAssistantIndex = conversation.findIndex(msg => msg.role === 'assistant');

  return (
    <div className="space-y-4 mb-4">
      {/* Remove the skeleton from here */}
      {/* {weatherLoading && <WeatherCardSkeleton />} */}
      {conversation.map((message, index) => {
        let flightData = null;
        let isFlightToolCall = false;
        if (message.role === "assistant") {
          try {
            // Log the raw message text
            console.log("Raw assistant message.text:", message.text);

            const parsed = JSON.parse(message.text);

            // Log the parsed object
            console.log("Parsed assistant message:", parsed);

            if (
              typeof parsed === "object" &&
              parsed !== null &&
              "flights" in parsed
            ) {
              flightData = parsed;
              isFlightToolCall = true;

              // Log the flights array
              console.log("Flights array:", flightData.flights);
            }
          } catch (err) {
            console.log("Error parsing assistant message.text:", err, message.text);
          }
        }

        // If this is the last message and loading, show the skeleton here
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
                  <FlightCardSkeleton />
                ) : flightData ? (
                  <FlightCard
                    flights={flightData.flights || []}
                    message={flightData.message}
                    showPassengerCounter={flightData.showPassengerCounter}
                    showCabinTypeSelector={flightData.showCabinTypeSelector}
                    departureCityData={flightData.departureCityData}
                    destinationCityData={flightData.destinationCityData}
                    cabinType={flightData.cabinType}
                  />
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