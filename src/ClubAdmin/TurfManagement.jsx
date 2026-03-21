import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TurfManagement = () => {
  const { auth } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("add");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sportsList, setSportsList] = useState([]);
  const [sportName, setSportName] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [searchSport, setSearchSport] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [facilityInput, setFacilityInput] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [slotDay, setSlotDay] = useState("");
  const [slotStartTime, setSlotStartTime] = useState("");
  const [slotEndTime, setSlotEndTime] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [images, setImages] = useState([null, null, null]);
  const [imageFiles, setImageFiles] = useState([null, null, null]);
  const [imageErrors, setImageErrors] = useState([false, false, false]);
  const [turfs, setTurfs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Refs for file inputs
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "manage") {
      setActiveTab("manage");
    }
  }, []);

  // Fetch user's turfs
  // Fetch user's turfs
  useEffect(() => {
    const fetchTurfs = async () => {
      if (activeTab === "manage" && auth && auth._id) {
        setIsLoading(true);
        console.log("Fetching turfs for owner:", auth._id);
        try {
          const token = localStorage.getItem("token");
          const url = `/api/turfs?ownerId=${
            auth._id
          }`;
          console.log("Request URL:", url);

          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("Fetched turfs response:", response.data);

          // ✅ Your backend returns an object { turfs: [...], pagination: { ... } }
          setTurfs(
            Array.isArray(response.data.turfs) ? response.data.turfs : []
          );
        } catch (error) {
          console.error("Error fetching turfs:", error);
          toast.error("Failed to load turfs");
          setTurfs([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTurfs();
  }, [activeTab, auth]);

  // Handle image change
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = true;
        return newErrors;
      });
      toast.error("Image size cannot exceed 5MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setImageErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = true;
        return newErrors;
      });
      toast.error(
        "Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP)"
      );
      return;
    }

    // Reset error state
    setImageErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = false;
      return newErrors;
    });

    // Set image preview
    const reader = new FileReader();
    reader.onload = () => {
      const newImages = [...images];
      newImages[index] = reader.result;
      setImages(newImages);

      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);
    };
    reader.readAsDataURL(file);
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);

    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);

    const newErrors = [...imageErrors];
    newErrors[index] = false;
    setImageErrors(newErrors);

    // Reset file input
    if (fileInputRefs[index].current) {
      fileInputRefs[index].current.value = "";
    }
  };

  // Handle adding a sport
  const handleAddSport = () => {
    const sportToAdd = selectedSport || sportName;

    if (!sportToAdd) {
      toast.error("Please enter or select a sport");
      return;
    }

    // Check if sport already exists
    if (
      sportsList.some(
        (sport) => sport.name.toLowerCase() === sportToAdd.toLowerCase()
      )
    ) {
      toast.error("This sport is already added");
      return;
    }

    // Add sport to list
    setSportsList((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: sportToAdd,
      },
    ]);

    // Reset inputs
    setSportName("");
    setSelectedSport("");
  };

  // Handle deleting a sport
  const handleDeleteSport = (id) => {
    setSportsList(sportsList.filter((sport) => sport.id !== id));
  };

  // Handle editing a sport
  const handleEditSport = (id) => {
    const sport = sportsList.find((sport) => sport.id === id);
    if (sport) {
      setSportName(sport.name);
      handleDeleteSport(id);
    }
  };

  // Handle turf deletion
  const handleDeleteTurf = async (id) => {
    if (window.confirm("Are you sure you want to delete this turf?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `/api/turfs/${id}?userId=${auth._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Remove from state
        setTurfs(turfs.filter((turf) => turf._id !== id));
        toast.success("Turf deleted successfully");
      } catch (error) {
        console.error("Error deleting turf:", error);
        toast.error("Failed to delete turf");
      }
    }
  };

  // Filter sports based on search
  const filteredSports = [
    "Football",
    "Cricket",
    "Basketball",
    "Tennis",
    "Badminton",
    "Volleyball",
    "Hockey",
    "Table Tennis",
    "Swimming",
  ].filter((sport) =>
    searchSport ? sport.toLowerCase().includes(searchSport.toLowerCase()) : true
  );

  // Filter turfs based on search
  const filteredTurfs = turfs.filter(
    (turf) =>
      turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (turf.location?.address &&
        turf.location.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name) {
      toast.error("Turf name is required");
      return;
    }

    if (!longitude || !latitude || !locationAddress) {
      toast.error("Location information is required");
      return;
    }

    if (sportsList.length === 0) {
      toast.error("Please add at least one sport");
      return;
    }

    if (!imageFiles.some((file) => file !== null)) {
      toast.error("Please upload at least one turf image");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("ownerId", auth._id);
      formData.append("longitude", longitude);
      formData.append("latitude", latitude);
      formData.append("address", locationAddress);

      // Add sports data as JSON
      formData.append(
        "sports",
        JSON.stringify(sportsList.map((sport) => ({ name: sport.name })))
      );

      // Add facilities as JSON array
      formData.append("facilities", JSON.stringify(facilities));

      // Add available time slots as JSON array
      formData.append("availableTimeSlots", JSON.stringify(availableTimeSlots));

      // Add images
      imageFiles.forEach((file) => {
        if (file) {
          formData.append("turfImages", file);
        }
      });

      // Send request to API
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/turfs`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Turf added successfully!");

      // Reset form
      setName("");
      setDescription("");
      setSportsList([]);
      setFacilities([]);
      setAvailableTimeSlots([]);
      setLongitude("");
      setLatitude("");
      setLocationAddress("");
      setImages([null, null, null]);
      setImageFiles([null, null, null]);
      setImageErrors([false, false, false]);

      // Switch to manage tab to see the new turf
      setTimeout(() => {
        setActiveTab("manage");
      }, 1000);
    } catch (error) {
      console.error("Error adding turf:", error);
      toast.error(
        error.response?.data?.message || "Failed to add turf. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggling active status
  const handleToggleActive = async (id, isActive) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/turfs/${id}/toggle-status?userId=${auth._id}`,
        { isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update in state
      setTurfs(
        turfs.map((turf) => (turf._id === id ? { ...turf, isActive } : turf))
      );

      toast.success(
        `Turf ${isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error updating turf status:", error);
      toast.error("Failed to update turf status");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Turf Management</h1>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 w-auto rounded-md font-medium text-sm ${
                activeTab === "add"
                  ? "bg-orange-500 hover:bg-orange-700 text-white"
                  : "bg-white hover:bg-orange-200 border border-gray-300 text-gray-700"
              }`}
              onClick={() => setActiveTab("add")}
            >
              Add New Turf
            </button>
            <button
              className={`px-4 py-2 w-auto rounded-md font-medium text-sm ${
                activeTab === "manage"
                  ? "bg-orange-500 hover:bg-orange-700 text-white"
                  : "bg-white border hover:bg-orange-200 border-gray-300 text-gray-700"
              }`}
              onClick={() => setActiveTab("manage")}
            >
              Manage Turfs
            </button>
          </div>
        </div>

        {activeTab === "add" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Turf Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="border border-dashed border-gray-300 rounded-lg p-4 relative"
                    >
                      {images[index] ? (
                        <>
                          <button
                            type="button"
                            className="absolute top-2 right-2 text-gray-500 bg-transparent hover:bg-transparent hover:text-gray-700 z-10"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <FiX size={16} />
                          </button>
                          <div className="relative h-32 w-full">
                            <img
                              src={images[index]}
                              alt={`Turf image ${index + 1}`}
                              className="h-32 w-full object-cover rounded"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32">
                          <div className="mb-2 text-gray-400">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                x="4"
                                y="4"
                                width="16"
                                height="16"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M8 12H16M12 8V16"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-500 text-center mb-2">
                            Drag & drop image here
                          </p>
                          <input
                            type="file"
                            ref={fileInputRefs[index]}
                            onChange={(e) => handleImageChange(e, index)}
                            className="hidden"
                            accept="image/*"
                          />
                          <button
                            type="button"
                            className="px-3 py-1 text-sm w-auto text-gray-600 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
                            onClick={() =>
                              fileInputRefs[index].current?.click()
                            }
                          >
                            Choose file
                          </button>
                          {imageErrors[index] && (
                            <p className="text-xs text-red-500 mt-1">
                              Invalid file
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter longitude"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter latitude"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location Address
                    </label>
                    <input
                      type="text"
                      placeholder="Location address"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter description"
                    rows={6}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Sport
                  </label>
                  <div className="flex space-x-2">
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-[42px] md:h-[42px]"
                      value={selectedSport}
                      onChange={(e) => setSelectedSport(e.target.value)}
                    >
                      <option value="">--Select--</option>
                      {filteredSports.map((sport) => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="px-3 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none w-auto"
                      onClick={handleAddSport}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {sportsList.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Added Sports
                    </label>
                    {sportsList.map((sport) => (
                      <div
                        key={sport.id}
                        className="border border-gray-200 rounded-lg p-4 mb-3 flex justify-between items-center"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {sport.name}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="p-1 bg-transparent hover:bg-transparent text-orange-500 hover:text-orange-600 rounded"
                            onClick={() => handleEditSport(sport.id)}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="p-1 bg-transparent hover:bg-transparent text-red-500 hover:text-red-600 rounded"
                            onClick={() => handleDeleteSport(sport.id)}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Turf Facilities
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter a facility name"
                      value={facilityInput}
                      onChange={(e) => setFacilityInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={() => {
                        if (
                          facilityInput.trim() &&
                          !facilities.includes(facilityInput.trim())
                        ) {
                          setFacilities([...facilities, facilityInput.trim()]);
                          setFacilityInput("");
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((facility, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-100 px-3 py-1 rounded"
                      >
                        <span className="text-sm text-gray-800 mr-2">
                          {facility}
                        </span>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() =>
                            setFacilities(
                              facilities.filter((f) => f !== facility)
                            )
                          }
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Day (e.g. Monday)"
                      className="p-2 border border-gray-300 rounded"
                      value={slotDay}
                      onChange={(e) => setSlotDay(e.target.value)}
                    />
                    <input
                      type="time"
                      placeholder="Start Time"
                      className="p-2 border border-gray-300 rounded"
                      value={slotStartTime}
                      onChange={(e) => setSlotStartTime(e.target.value)}
                    />
                    <input
                      type="time"
                      placeholder="End Time"
                      className="p-2 border border-gray-300 rounded"
                      value={slotEndTime}
                      onChange={(e) => setSlotEndTime(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="px-2 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    onClick={() => {
                      if (slotDay && slotStartTime && slotEndTime) {
                        setAvailableTimeSlots([
                          ...availableTimeSlots,
                          {
                            day: slotDay,
                            startTime: slotStartTime,
                            endTime: slotEndTime,
                          },
                        ]);
                        setSlotDay("");
                        setSlotStartTime("");
                        setSlotEndTime("");
                      }
                    }}
                  >
                    Add Slot
                  </button>
                  {availableTimeSlots.length > 0 && (
                    <ul className="mt-3 list-disc pl-5">
                      {availableTimeSlots.map((slot, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          {slot.day}: {slot.startTime} - {slot.endTime}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg w-[10%]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <FiPlus className="mr-2 w-auto" />
                        Add Turf
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "manage" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Your Turfs
                </h2>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search turfs..."
                    className="pl-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : filteredTurfs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No turfs found. Start by adding your first turf.
                  </p>
                  <button
                    className="inline-flex items-center px-4 py-2 w-auto border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    onClick={() => setActiveTab("add")}
                  >
                    <FiPlus className="mr-2" />
                    Add Turf
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Turf Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Location
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Sports
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTurfs.map((turf) => (
                        <tr key={turf._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {turf.images && turf.images.length > 0 ? (
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={`/uploads/${turf.images[0]}`}
                                    alt={turf.name}
                                  />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                  <span className="text-orange-600 font-medium text-sm">
                                    {turf.name.substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {turf.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {turf.location?.address}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {turf.sports?.slice(0, 3).map((sport, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                                >
                                  {sport.name}
                                </span>
                              ))}
                              {turf.sports?.length > 3 && (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                  +{turf.sports.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                turf.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {turf.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-between">
                              <Link
                                to={`/turf/${turf._id}`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View
                              </Link>

                              <Link
                                to={`/turf/edit/${turf._id}`}
                                className="text-green-600 hover:text-green-900"
                              >
                                <FiEdit2 size={18} />
                              </Link>

                           <div className="inline-flex items-center gap-2">
  <button
    onClick={() => handleToggleActive(turf._id, !turf.isActive)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
      turf.isActive ? "bg-green-500" : "bg-gray-300"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
        turf.isActive ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
  <span className="text-sm font-medium w-16 text-center">
    {turf.isActive ? "Active" : "Inactive"}
  </span>
</div>



                              <button
                                className="text-red-600 hover:text-red-900 w-auto bg-transparent hover:bg-transparent"
                                onClick={() => handleDeleteTurf(turf._id)}
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default TurfManagement;
