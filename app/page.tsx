"use client"
import React, { useRef, useEffect } from "react";
import Transcriber from "@/components/transcriber"; // Ensure correct path
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import Siri from "@/components/siri"; // Import the Siri component
import { tools } from "@/lib/tools";

function Home() {
  // Destructure currentVolume as well
  const { handleStartStopClick, isSessionActive, conversation, currentVolume,registerFunction } = useWebRTCAudioSession('ash', tools);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [flightLoading, setFlightLoading] = React.useState(false);
  const [hotelLoading, setHotelLoading] = React.useState(false); // <-- Add this line

  useEffect(() => {
    registerFunction("displayFlightCard", async (params: any) => {
      setFlightLoading(true);
      try {
        const tool = tools.find(t => t.name === "displayFlightCard");
        if (!tool || typeof tool.execute !== "function") {
          throw new Error("Flight tool not found");
        }
        // Add isVoiceSession flag to help the tool know this is a voice context
        const result = await tool.execute({...params, isVoiceSession: true});
        setFlightLoading(false);
        return result;
      } catch (e) {
        setFlightLoading(false);
        return {
          message: "خطا در دریافت اطلاعات پرواز",
          flights: [],
        };
      }
    });

    // Register hotel tool
    registerFunction("displayHotelCard", async (params: any) => {
      setHotelLoading(true);
      try {
        const tool = tools.find(t => t.name === "displayHotelCard");
        if (!tool || typeof tool.execute !== "function") {
          throw new Error("Hotel tool not found");
        }
        // Add isVoiceSession flag
        const result = await tool.execute({...params, isVoiceSession: true});
        setHotelLoading(false);
        return result;
      } catch (e) {
        setHotelLoading(false);
        return {
          message: "خطا در دریافت اطلاعات هتل",
          hotels: [],
        };
      }
    });
  }, [registerFunction]);

  // Automatically scroll to bottom when conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [conversation]);

  return (
    <section className="flex flex-col w-screen h-[95vh] p-6 gap-4 overflow-x-hidden">
      {/* Chat area grows and scrolls if needed */}
      <div
        ref={chatContainerRef}
        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
      >
        <Transcriber
          conversation={conversation}
          flightLoading={flightLoading}
          hotelLoading={hotelLoading} 
        />
      </div>
      {/* Replace Button with Siri component */}
      <div className="w-full flex justify-center items-center" >
        <Siri
          theme="ios9"
          currentVolume={currentVolume}
          isSessionActive={isSessionActive}
          handleStartStopClick={handleStartStopClick}
        />
      </div>
    </section>
  );
}

export default Home;