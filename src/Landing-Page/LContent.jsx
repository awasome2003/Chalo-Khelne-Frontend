import React, { useState } from "react";
import Carousel from "./LCarousel.jsx";
import TournamentCard from "./LTournamentscards.jsx";

const Content = () => {
  const [TopactiveTab, setTopActiveTab] = useState("event");
  const [activeTab, setActiveTab] = useState("Live");

  const Toptabs = ["event", "score"];
  const tabs = [
    { name: "Live", active: true },
    { name: "Upcoming", active: false },
    { name: "My Registration", active: false },
    { name: "History", active: false },
  ];
  return (
    <div className="bg-[#F5F7FA] content-box">
      <div className="div">
        <Carousel />
      </div>
      <div className="px-[120px] mt-[60px]">
        <ul className="flex text-gray-700 font-medium">
          {Toptabs.map((tab) => (
            <li key={tab}>
              <button
                onClick={() => setTopActiveTab(tab)}
                className={`text-[#333] border-0 font-roboto p-[10px] w-[65px] bg-transparent hover:bg-transparent cursor-pointer text-[16px] font-normal leading-normal 
        ${
          TopactiveTab === tab
            ? "content-tabbing border-b-2 border-orange-500 text-orange-500"
            : ""
        }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          ))}
        </ul>
        <p className="text-[#333] font-roboto text-2xl font-normal leading-normal mt-[20px] mb-[20px]">
          Events nearby you
        </p>
        <div className="w-[542px] flex gap-[24px] bg-transparent rounded-[50px] mb-[20px]">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`px-[24px] py-[8px] cursor-pointer rounded-full font-medium transition-all duration-200 
            ${
              activeTab === tab.name
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-600"
            }`}
              onClick={() => setActiveTab(tab.name)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <TournamentCard />
      </div>
    </div>
  );
};

export default Content;
