"use client"
import React, { useRef, useEffect } from "react";
import Transcriber from "@/components/transcriber"; // Ensure correct path
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import Siri from "@/components/siri"; // Import the Siri component
import { tools } from "@/lib/tools";
import { Skeleton } from "@/components/ui/skeleton";

function Home() {
  // Destructure currentVolume as well
  const { handleStartStopClick, isSessionActive, conversation, currentVolume,registerFunction } = useWebRTCAudioSession('alloy', tools);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [weatherLoading, setWeatherLoading] = React.useState(false);
  const [flightLoading, setFlightLoading] = React.useState(false);

  // useEffect(() => {
  //   registerFunction("getCurrentWeather", async ({ city }: { city: string }) => {
  //     setWeatherLoading(true);
  //     try {
  //       // 1. Geocode city name to lat/lon using Nominatim
  //       const geoRes = await fetch(
  //         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
  //       );
  //       const geoData = await geoRes.json();
  //       if (!geoData || geoData.length === 0) {
  //         setWeatherLoading(false);
  //         return {
  //           city,
  //           description: "شهر پیدا نشد",
  //           temperature: "نامشخص",
  //           windspeed: "نامشخص",
  //           winddirection: "نامشخص",
  //         };
  //       }
  //       const lat = geoData[0].lat;
  //       const lon = geoData[0].lon;

  //       // 2. Fetch weather from Open-Meteo
  //       const weatherRes = await fetch(
  //         `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  //       );
  //       const weatherData = await weatherRes.json();
  //       const weather = weatherData.current_weather;
  //       setWeatherLoading(false);
  //       return {
  //         city,
  //         description: "آب و هوا اکنون",
  //         temperature: weather ? weather.temperature : "نامشخص",
  //         windspeed: weather && weather.windspeed !== undefined ? weather.windspeed : "نامشخص",
  //         winddirection: weather && weather.winddirection !== undefined ? weather.winddirection : "نامشخص",
  //       };
  //     } catch (e) {
  //       setWeatherLoading(false);
  //       return {
  //         city,
  //         description: "خطا در دریافت اطلاعات آب و هوا",
  //         temperature: "نامشخص",
  //         windspeed: "نامشخص",
  //         winddirection: "نامشخص",
  //       };
  //     }
  //   });
  // }, [registerFunction]);

  useEffect(() => {
    registerFunction("displayFlightCard", async (params: any) => {
      setFlightLoading(true);
      try {
        // Find the tool in your tools array
        const tool = tools.find(t => t.name === "displayFlightCard");
        if (!tool || typeof tool.execute !== "function") {
          throw new Error("Flight tool not found");
        }
        const result = await tool.execute(params);
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
  }, [registerFunction]);

  // Automatically scroll to bottom when conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <section className="flex flex-col w-screen h-[95vh] p-6 gap-4 overflow-x-hidden">
      {/* Chat area grows and scrolls if needed */}
      <div
        ref={chatContainerRef}
        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
      >
        <Transcriber conversation={conversation} flightLoading={flightLoading} />
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