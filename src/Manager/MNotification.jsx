import React, { useState, useEffect } from "react";
import {
  FiBell,
  FiPlus,
  FiSearch,
  FiMenu,
  FiX,
  FiTrash2,
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";

const allNotifications = [
  {
    date: "Today",
    items: [
      {
        id: 1,
        name: "Player Name",
        message:
          "Your Table tennis match is scheduled for tomorrow at 5:00 PM.",
        time: "09:00 AM",
        type: "new",
      },
      {
        id: 2,
        name: "Player Name",
        message:
          "Your Table tennis match is scheduled for tomorrow at 5:00 PM.",
        time: "09:00 AM",
        type: "new",
      },
    ],
  },
  {
    date: "Yesterday",
    items: [
      {
        id: 3,
        name: "Player Name",
        message:
          "Your Table tennis match is scheduled for tomorrow at 5:00 PM.",
        time: "09:00 AM",
        type: "old",
      },
      {
        id: 4,
        name: "Player Name",
        message:
          "Your Table tennis match is scheduled for tomorrow at 5:00 PM.",
        time: "09:00 AM",
        type: "old",
      },
    ],
  },
];

const MNotification = () => {
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [filteredNotifications, setFilteredNotifications] =
    useState(allNotifications);
  const [selected, setSelected] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    if (selectedTab === "all") {
      setFilteredNotifications(allNotifications);
    } else {
      const filtered = allNotifications
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => item.type === "request"),
        }))
        .filter((section) => section.items.length > 0);
      setFilteredNotifications(filtered);
    }
  }, [selectedTab]);

  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const deleteSelected = () => {
    setFilteredNotifications((prevNotifications) => {
      const newNotifications = prevNotifications.map((section) => ({
        ...section,
        items: section.items.filter((item) => !selected.includes(item.id)),
      }));
      return newNotifications;
    });
    setSelected([]);
  };

  const allSelected = filteredNotifications.every((section) =>
    section.items.every((item) => selected.includes(item.id))
  );

  const selectAll = () => {
    const allIds = filteredNotifications.flatMap((section) =>
      section.items.map((item) => item.id)
    );
    setSelected(allIds);
  };

  const deselectAll = () => {
    setSelected([]);
  };

  const handleSelectionToggle = () => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    } else {
      if (selected.length === 0) {
        selectAll();
      } else {
        deselectAll();
      }
    }
  };

  const clearAllNotifications = () => {
    setSelected([]);
  };

  return (
    <>
      <div className="relative">
        {/* Bell Icon */}
        <div
          className="bell-icon cursor-pointer"
          onClick={() => setPanelOpen((prev) => !prev)}
        >
          <FiBell className="text-gray-600 text-xl" />
        </div>

        {/* Notification Slide Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-[90vw] md:w-[450px] bg-[#F5F7FA] shadow-lg z-50 transform ${
            isPanelOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          {/* Header Tabs & Controls */}
          <div className="flex justify-between items-center p-4 border-b">
            {/* Tabs */}
            <div className="flex space-x-4">
              <button
                className={`text-sm md:text-base font-medium ${
                  selectedTab === "all"
                    ? "bg-white text-gray-900 requestbtn"
                    : "text-gray-400 bg-transparent hover:bg-white"
                }`}
                onClick={() => setSelectedTab("all")}
              >
                All
              </button>
              <button
                className={`text-sm md:text-base font-medium ${
                  selectedTab === "request"
                    ? "border-b-2 border-black bg-white text-black"
                    : "text-gray-900 bg-transparent hover:bg-white"
                }`}
                onClick={() => setSelectedTab("request")}
              >
                Request
              </button>
            </div>

            {/* Icons & Actions */}
            <div className="flex gap-3 items-center">
              {selected.length > 0 && (
                <FiTrash2
                  className="text-red-500 text-[24px] cursor-pointer"
                  onClick={deleteSelected}
                />
              )}
              <input
                type="checkbox"
                className="checkboxs"
                checked={allSelected}
                onChange={handleSelectionToggle}
              />
              <span className="text-sm text-[#1B89FF] font-medium">
                {!isSelectionMode && "Select"}
              </span>
              <button
                className="text-orange-500 text-sm hover:underline"
                onClick={clearAllNotifications}
              >
                Clear All
              </button>
              <FiX
                size={24}
                className="text-gray-600 cursor-pointer hover:text-black"
                onClick={() => setPanelOpen(false)}
              />
            </div>
          </div>

          {/* Notification List Area */}
          <div className="p-4 overflow-y-auto max-h-full scrollbar-hide">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((section) => (
                <div key={section.date} className="mt-4">
                  <h3 className="text-sm md:text-base font-semibold text-[#000] mb-2">
                    {section.date}
                  </h3>
                  {section.items.map((notification) => (
                    <div
                      key={notification.id}
                      className={`bg-white rounded-lg mb-2 p-2 transition-all ${
                        selected.includes(notification.id)
                          ? "bg-[#EEFBFD]"
                          : notification.type === "new"
                          ? ""
                          : "bg-orange-100"
                      }`}
                    >
                      <div className="flex justify-between items-center gap-3">
                        {/* Avatar */}
                        <div
                          className="cursor-pointer"
                          onClick={() => toggleSelect(notification.id)}
                        >
                          <div
                            className={`w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] flex items-center justify-center rounded-full font-bold text-white text-lg ${
                              selected.includes(notification.id)
                                ? "bg-[#D9E2EB]"
                                : "bg-green-500"
                            }`}
                          >
                            {selected.includes(notification.id) ? (
                              <FiCheck className="text-[#007AFF] text-lg" />
                            ) : (
                              notification.name[0]
                            )}
                          </div>
                        </div>

                        {/* Message */}
                        <div className="flex-1">
                          <p className="text-sm sm:text-base">
                            <span className="font-bold">
                              {notification.name},
                            </span>{" "}
                            {notification.message}
                          </p>
                        </div>

                        {/* Time */}
                        <div>
                          <p className="text-xs text-gray-600">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : selectedTab === "request" ? (
              <>
                <h3 className="text-sm md:text-base text-[#000] font-semibold mb-2">
                  Today
                </h3>
                <div className="mt-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className="relative">
                            <div className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] bg-green-500 text-white flex items-center justify-center rounded-full font-bold text-lg">
                              A
                            </div>
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-semibold">
                              Rushikesh Mishra
                            </p>
                            <p className="text-sm text-gray-500">
                              Sent you a request for a post a video
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button className="bg-orange-500 text-white px-4 py-1 rounded-md text-sm">
                                Confirm
                              </button>
                              <button className="bg-[#E5E7EBDDD] text-gray-900 px-4 py-1 rounded-md text-sm hover:bg-gray-300">
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">09:00 AM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-4 mt-4">
                <p className="text-center text-gray-500">No notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MNotification;
