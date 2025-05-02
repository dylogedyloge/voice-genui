"use client"
import React, { useRef, useEffect } from "react";
import Transcriber from "@/components/transcriber"; // Ensure correct path
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import Siri from "@/components/siri"; // Import the Siri component

function Home() {
  // Destructure currentVolume as well
  const { handleStartStopClick, isSessionActive, conversation, msgs, currentVolume } = useWebRTCAudioSession('alloy');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to bottom when conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <section className="flex flex-col w-screen h-[95vh] max-h-dvh p-6 gap-4 overflow-x-hidden">
      {/* Chat area grows and scrolls if needed */}
      <div
        ref={chatContainerRef}
        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
      >
        {isSessionActive && (
          <Transcriber conversation={conversation} />
        )}
      </div>
      {/* Replace Button with Siri component */}
      <div className="w-full flex justify-center items-center" > {/* Added items-center */}
        <Siri
          theme="ios9" // Or "ios", or make it configurable
          currentVolume={currentVolume}
          isSessionActive={isSessionActive}
          handleStartStopClick={handleStartStopClick}
        />
      </div>
    </section>
  );
}

export default Home;