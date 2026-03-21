import React, { useEffect } from "react";
import { ChevronRight } from "lucide-react";

const EventDetails = () => {
  const crumbs = [
    { label: "Events", href: "/" },
    { label: "Live", href: "/" },
    { label: "Event Details", href: "#", active: true },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="px-[120px] py-[100px] bg-[#F2F4F6]">
      <nav className="flex items-center space-x-1 text-sm mb-[30px]">
        {crumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            <a
              href={crumb.href}
              className={`${
                crumb.active
                  ? "text-blue-500 font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {crumb.label}
            </a>
            {index < crumbs.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            )}
          </div>
        ))}
      </nav>
      <div>
        <h1 className="font-roboto text-[24px] font-semibold mb-[20px] text-[#333] font-roboto text-2xl">
          Event Details Page
        </h1>
        <div className="h-[425px]">
          <img
            src="/src/assets/event1.png"
            alt="event image"
            className="w-full h-full"
          />
        </div>
      </div>
      <div className="mt-[30px]">
        <div className="bg-[#FFF] p-[16px] rounded-[16px] mb-[24px]">
          <p className="mb-[20px] text-[#333] font-roboto text-2xl font-semibold">
            Tournament Name
          </p>
          <p className="text-[#666] font-roboto text-lg font-normal ">
            Tournament Type
          </p>
        </div>
        <div className="bg-[#FFF] p-[16px] rounded-[16px] mb-[24px]">
          <p className="mb-[20px] text-[#333] font-roboto text-2xl font-semibold">
            Club Name
          </p>
          <p className="text-[#666] font-roboto text-lg font-normal ">
            Rajdhani Sports Club 1st Floor, Victory Complex, Opposite City Park,
            Sector 12, Nigadi, Pune - 411017, India
          </p>
        </div>
        <div className="bg-[#FFF] p-[16px] rounded-[16px] mb-[24px]">
          <p className="mb-[20px] text-[#333] font-roboto text-2xl font-semibold">
            Oct 19th - Oct 20th
          </p>
          <p className="text-[#666] font-roboto text-lg font-normal ">
            Booking closes on: 19th Oct 2024
          </p>
        </div>
        <div className="bg-[#FFF] p-[16px] rounded-[16px] mb-[24px]">
          <p className="mb-[20px] text-[#333] font-roboto text-2xl font-semibold">
            Event Description
          </p>
          <p className="text-[#666] font-roboto text-lg font-normal ">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum
            dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in
            voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </p>
        </div>
        <div className="bg-[#FFF] p-[16px] rounded-[16px] mb-[24px]">
          <p className="mb-[20px] text-[#333] font-roboto text-2xl font-semibold">
            Organized by
          </p>
          <p className="text-[#666] font-roboto text-[20px] font-normal ">
            Organizer Name
          </p>
        </div>
        <div className="bg-[#FFF] p-[16px] rounded-[16px] mb-[24px]">
          <p className="mb-[20px] text-[#333] font-roboto text-2xl font-semibold">
            Amenities
          </p>
          <div className="flex justify-start items-center gap-[10px]">
            <p className="flex justify-start items-center gap-[10px] px-6 py-2 rounded-full bg-[#EDEAEB] text-[#333] text-[20px] font-normal font-roboto leading-none">
              <img src="./src/assets/checkroom.svg" alt="" />
              Changing room
            </p>
            <p className="flex justify-start items-center gap-[10px] px-6 py-2 rounded-full bg-[#EDEAEB] text-[#333] text-[20px] font-normal font-roboto leading-none">
              <img src="./src/assets/local_parking.svg" alt="" />
              Parking
            </p>
          </div>
        </div>
        <div className="bg-[#FFF] p-[16px] rounded-[16px] mb-[24px]">
          <p className="mb-[20px] text-[#333] font-roboto text-2xl font-semibold">
            Selected Categories
          </p>
          <div className="flex justify-start items-center gap-[10px]">
            <button className="gap-2 px-6 py-2 rounded-full bg-[#004E93] text-[#FFF] text-[18px] font-semibold font-roboto leading-none">
              Open Category
            </button>
            <button className="gap-2 px-6 py-2 rounded-full bg-[#EDEAEB] text-[#333] text-[18px] font-normal font-roboto leading-none">
              Under 15 ( U15 )
            </button>
            <button className="gap-2 px-6 py-2 rounded-full bg-[#EDEAEB] text-[#333] text-[18px] font-normal font-roboto leading-none">
              Veterans ( 39+ )
            </button>
            <button className="gap-2 px-6 py-2 rounded-full bg-[#EDEAEB] text-[#333] text-[18px] font-normal font-roboto leading-none">
              Veterans ( 59+ )
            </button>
          </div>
        </div>
        <div className="bg-[#FFF] p-[16px] rounded-[16px] mb-[24px]">
          <p className="mb-[20px] text-[#333] font-roboto text-2xl font-semibold">
            Cancellation Policy
          </p>
          <p className="text-[#666] font-roboto text-lg font-normal ">
            Cancellation Policy
          </p>
        </div>

        <button className="w-full pr-[16px] py-[8px] pl-[24px] rounded-[25px] border border-[#FF6A00] text-[#FF6A00]">
          View Match Details
        </button>
        <p className="w-full text-center">Match Started 20 min ago</p>
      </div>
    </div>
  );
};

export default EventDetails;
