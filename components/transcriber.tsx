"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { Conversation } from "@/lib/conversations";
import Image from "next/image";
import { Button } from "./ui/button";
import { formatPersianTime } from "@/lib/time-helpers";


interface TranscriberProps {
  conversation: Conversation[];
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

function Transcriber({ conversation }: TranscriberProps) {
  // Find the index of the first assistant message in the original array
  const firstAssistantIndex = conversation.findIndex(msg => msg.role === 'assistant');

  return (
    <div className="space-y-4 mb-4">
      {conversation.map((message, index) => (
        <div
          key={index}
          className={`flex items-center ${ // Added items-center for vertical alignment
            message.role === "user"
              ? "justify-start hidden" // Show user messages again
              : "justify-center" // Center assistant messages
            }`}
        // Conditionally hide user messages if needed (removed hidden class for now)
        // style={{ display: message.role === 'user' ? 'none' : 'flex' }} // Alternative way to hide user messages if filter is removed
        >
          {/* Assistant message handling */}
          {message.role === 'assistant' && (
            <>
              {/* Conditionally render logo for the first assistant message */}
              {index === firstAssistantIndex ? (
                <Button variant="default" size="icon" className="rounded-xl p-1 ml-4" disabled>
                  <Image
                  src="/logo1-dark.png"
                  width={200}
                  height={200}// Path relative to public folder
                  alt="atribot"
                  className="w-full h-full object-contain" // Make image fill the button area
                />
                </Button>

              ) : (
                null
              )}
              <div
                className="max-w-[80%] p-2 rounded-lg rounded-tr-none text-[#006363] bg-[#006363] bg-opacity-5 font-medium text-right" // Assistant styling, right-aligned text
              >
                <p>{message.text}</p>
                  <p className="text-xs text-muted-foreground prose-sm text-left my-1">
                    {formatPersianTime(new Date())}
                  </p>
                
              </div>
            </>
          )}

          {/* User message handling (restored) */}
          {message.role === 'user' && (
            <>
              <div
                className="max-w-[80%] p-2 rounded-lg rounded-tr-none bg-secondary text-secondary-foreground" // User styling
              >
                <p>{message.text ? message.text : 'User is speaking...'}</p>
                <div className="text-xs text-muted-foreground text-right"> {/* Align timestamp right */}
                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </div>
              </div>
              <Avatar className="w-8 h-8 shrink-0 ml-2" /> {/* User avatar on the right, added margin */}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default Transcriber;
export { Avatar, AvatarImage, AvatarFallback };