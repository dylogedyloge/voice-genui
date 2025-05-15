"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const WeatherCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-md p-4 min-w-[220px] max-w-xs mx-auto border border-gray-200">
    <Skeleton className="h-6 w-24 mb-2 rounded" />
    <Skeleton className="h-4 w-32 mb-1 rounded" />
    <div className="flex flex-col gap-1 text-sm">
      <Skeleton className="h-4 w-20 mb-1 rounded" />
      <Skeleton className="h-4 w-24 mb-1 rounded" />
      <Skeleton className="h-4 w-24 mb-1 rounded" />
    </div>
  </div>
);

export default WeatherCardSkeleton;