import { Skeleton } from "@/components/ui/skeleton";
import { FaPlane } from "react-icons/fa";
import { motion } from "framer-motion";

const FlightCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-w-60 sm:w-96 shadow-md  dark:bg-black bg-white dark:bg-grid-small-white/[0.1] bg-grid-small-black/[0.1] rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            {/* Airline and Flight Number */}
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-12 h-4" />
          </div>
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="text-left flex flex-col items-start">
              {/* Departure City and Time */}
              <Skeleton className="w-24 h-6 mb-2" />
              <Skeleton className="w-16 h-4" />
            </div>
            <div className="flex flex-col items-center px-4">
              {/* Plane Icon */}
              <FaPlane className="text-card-foreground w-6 h-6 rotate-180" />
            </div>
            <div className="text-right flex flex-col items-end">
              {/* Arrival City and Time */}
              <Skeleton className="w-24 h-6 mb-2" />
              <Skeleton className="w-16 h-4" />
            </div>
          </motion.div>
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div>
              {/* Price */}
              <Skeleton className="w-16 h-6" />
            </div>
            <Skeleton className="w-24 h-8" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
export default FlightCardSkeleton;
