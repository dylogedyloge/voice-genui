"use client";
import React from "react";

interface WeatherCardProps {
  city: string;
  description: string;
  temperature: string | number;
  windspeed: string | number;
  winddirection: string | number;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  city,
  description,
  temperature,
  windspeed,
  winddirection,
}) => (
  <div className="bg-white rounded-xl shadow-md p-4 min-w-[220px] max-w-xs mx-auto border border-gray-200">
    <div className="font-bold text-lg mb-2">{city}</div>
    <div className="text-sm mb-1">{description}</div>
    <div className="flex flex-col gap-1 text-sm">
      <span>🌡️ دما: {temperature}°C</span>
      <span>💨 سرعت باد: {windspeed} km/h</span>
      <span>🧭 جهت باد: {winddirection}°</span>
    </div>
  </div>
);

export default WeatherCard;