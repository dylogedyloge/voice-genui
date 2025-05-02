"use client";
 
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { Conversation } from "@/lib/conversations";
 
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


  return (
      <div className="space-y-4 mb-4">
        {conversation.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-start" : "justify-end"
            }`}
          >
            {message.role === 'assistant' && (
              <Avatar className="w-8 h-8 shrink-0" />
            )}
            <div
              className={`
                px-4 py-1 rounded-lg break-words
                max-w-[70vw] md:max-w-[40vw]
                ${message.role === 'user'
                  ? 'bg-primary text-background'
                  : 'bg-secondary dark:text-foreground'}
              `}
            >
              <p>{message.text ? message.text : 'User is speaking...'}</p>
              <div className="text-xs text-muted-foreground">
                {new Date(message.timestamp).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </div>
            </div>
            {message.role === 'user' && (
              <Avatar className="w-8 h-8 shrink-0" />
            )}
          </div>
        ))}
      </div>
  );
}
 
export default Transcriber;
export { Avatar, AvatarImage, AvatarFallback };