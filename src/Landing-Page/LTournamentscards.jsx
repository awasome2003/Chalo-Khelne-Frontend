import React, { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { motion } from "framer-motion";

const TournamentsCard = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(`/api/tournaments`);
        if (!response.ok) {
          throw new Error("Failed to fetch tournaments");
        }
        const data = await response.json();

        setTournaments(data.tournaments || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateBefore = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1); // Subtract one day
    return date.toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error loading tournaments: {error}
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tournaments available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {tournaments.map((tournament) => (
        <motion.div
          key={tournament._id}
          whileHover={{
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="rounded-[24px] overflow-hidden bg-white cursor-pointer"
        >
          {/* Image Section */}
          <div className="relative h-[250px] overflow-hidden">
            <motion.img
              variants={{
                hover: { scale: 1.05 },
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              src={
                tournament.tournamentLogo
                  ? `/uploads/tournaments/${tournament.tournamentLogo
                      .split("\\")
                      .pop()}`
                  : "/src/assets/card-img.png"
              }
              alt={tournament.title}
              className="w-full h-full object-cover rounded-[24px]"
            />
            <button className="absolute top-3 right-3 bg-white/30 p-2 w-9 rounded-full shadow-md backdrop-blur-[20px]">
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content Section */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-[20px]">
              <h2 className="text-[#333] font-roboto text-[16px] font-semibold leading-normal">
                {tournament.title}
              </h2>
              <span className="text-[#333] font-roboto text-[14px] font-semibold leading-normal">
                ({tournament.type})
              </span>
            </div>
            <div className="div">
              <p className="text-[#333] font-roboto text-[16px] font-semibold leading-normal mb-[6px]">
                {tournament.organizerName}
              </p>
              <p className="text-[#333] font-roboto text-[14px] font-semibold leading-normal">
                {tournament.eventLocation}
              </p>
            </div>
            <div className="mt-3 flex justify-between items-end">
              <div className="div">
                <p className="text-[#333] font-roboto text-[16px] font-semibold leading-normal mb-[6px]">
                  {formatDate(tournament.selectedDate)}
                </p>
                <p className="text-[#333] font-roboto text-[14px] font-semibold leading-normal">
                  {tournament.selectedDate && (
                    <>
                      Booking closes on:{" "}
                      {formatDateBefore(tournament.selectedDate)}
                    </>
                  )}
                </p>
              </div>
              {/* Price Section */}
              <p className="text-[#333] font-roboto text-[14px] font-semibold leading-normal">
                ₹{" "}
                <span className="text-[#333] font-roboto text-[16px] font-semibold leading-normal">
                  {tournament.tournamentFee}/-
                </span>{" "}
                onward
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TournamentsCard;
