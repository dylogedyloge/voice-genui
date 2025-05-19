"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface CustomCarouselProps {
  images: Array<{
    image: string;
    alt: string;
    caption: string | null;
  }>;
  hotelName: string;
}

const CustomCarousel = ({ images, hotelName }: CustomCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full w-full group">
      <div className="relative h-full w-full overflow-hidden rounded-t-lg">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute h-full w-full transform transition-all duration-500 ease-in-out ${index === currentIndex
                ? "translate-x-0 opacity-100"
                : index < currentIndex
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
              }`}
          >
            <div className="relative h-full w-full">
              <Image
                src={img.image.startsWith("http") ? img.image : `https://api.atripa.ir${img.image}`}
                alt={img.alt || hotelName}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110 group-hover:contrast-110 group-hover:saturate-110 filter brightness-95"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1 w-4 rounded-full transition-all ${index === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomCarousel;
