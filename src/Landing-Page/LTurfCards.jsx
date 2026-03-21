import React from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { FaDirections } from "react-icons/fa";
import Logo from '../assets/turf-card.jpg';

const TurfCards = ({ turf, onTurfClick }) => {
  // Create safe getters for potentially missing data
  const getName = () =>
    turf?.name ||
    "T12 Sports Turf (Football Cricket) , Coaching for different sports.";
  const getDiscount = () => turf?.discount || 20;
  const getRating = () =>
    turf?.ratings?.average ? turf.ratings.average.toFixed(1) : "4.5";

  const getAddress = () => {
    if (!turf?.address) return "Mirchandani Palms, Pimple Saudagar";
    return turf.address.fullAddress || "Address unavailable";
  };

  const getAreaCity = () => {
    if (!turf?.address) return "Pune - 17";

    const area = turf?.address?.area || "";
    const city = turf?.address?.city || "";
    const pincode = turf?.address?.pincode || "";

    let location = "";
    if (area) location += area;
    if (city) {
      if (location) location += ", ";
      location += city;
    }
    if (pincode) {
      if (location) location += " - ";
      location += pincode;
    }

    return location || "Location unavailable";
  };

  const getSports = () => {
    if (!turf?.sports || !Array.isArray(turf.sports)) {
      return [
        { name: "Box Cricket", icon: "/src/assets/sports_cricket.svg" },
        { name: "Football", icon: "/src/assets/sports_soccer.svg" },
        { name: "Badminton", icon: "/src/assets/shuttlecock.svg" },
        { name: "Table Tennis", icon: "/src/assets/ping-pong.svg" },
      ];
    }
    return turf.sports;
  };

  return (
    <motion.div
      className="relative rounded-xl overflow-hidden border border-[#DDD] bg-white cursor-pointer min-h-[300px] h-full"
      onClick={() => onTurfClick && onTurfClick(turf)}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Image with Discount Tag */}
      <div className="relative h-[200px] w-full overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          src={
            turf?.images?.[0]
              ? `/uploads/${turf.images[0]}`
              : Logo
          }
          alt={getName()}
          className="h-full w-full object-cover"
        />
        {getDiscount() && (
          <div className="absolute top-2 right-2 bg-[#FF6A00] text-white text-sm px-2 py-1 rounded-md font-medium">
            {getDiscount()}% off
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 text-black">
        <div className="flex justify-between items-center gap-[16px] mb-[12px]">
          <h3 className="text-base font-semibold text-black leading-tight">
            {getName()}
          </h3>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-4 h-4 fill-yellow-400" />
            <span className="text-sm text-black">{getRating()}/5</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-[10px]">
          <p className="text-sm text-black">
            {getAddress()}
            <br />
            {getAreaCity()}
          </p>
            <FaDirections
            className="h-8 w-8 cursor-pointer"
            style={{ color: "#022E54" }}
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                `https://maps.google.com/?q=${getAddress()},${getAreaCity()}`,
                "_blank"
              );
            }}
          />
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          {getSports().map((sport, index) => (
            <span
              key={sport.name || `sport-${index}`}
              className="text-xs text-[#666] border border-gray-300 rounded-full px-[8px] py-1 flex items-center gap-1 mt-2"
            >
              {sport.icon && (
                <img
                  src={sport.icon}
                  alt={sport.name || "Sport"}
                  className="w-[14px] h-[14px]"
                />
              )}
              {sport.name || "Sport"}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TurfCards;
