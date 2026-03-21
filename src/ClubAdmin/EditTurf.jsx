import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiChevronLeft } from "react-icons/fi";

const EditTurf = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [razorpayAccountId, setRazorpayAccountId] = useState("");
  const [description, setDescription] = useState("");

  // Sports state management
  const [sportsList, setSportsList] = useState([]);
  const [sportName, setSportName] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [searchSport, setSearchSport] = useState("");

  // Facilities state
  const [facilities, setFacilities] = useState({
    artificialTurf: false,
    multipleFields: false,
    floodLights: false,
    ledLights: false,
    lockerRooms: false,
    shower: false,
    restrooms: false,
    grandstands: false,
    coveredAreas: false,
    parking: false,
    foodCourt: false,
    coldDrinks: false,
    drinkingWater: false,
    wifi: false,
    loungeArea: false,
    surveillanceCameras: false,
    securityPersonnel: false,
    firstAidKit: false,
  });

  // Images state
  const [images, setImages] = useState([null, null, null]);
  const [imageFiles, setImageFiles] = useState([null, null, null]);
  const [imageErrors, setImageErrors] = useState([false, false, false]);
  const [existingImages, setExistingImages] = useState([]);

  // Refs for file inputs
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)];

  // Pre-defined sports list
  const predefinedSports = [
    "Football",
    "Cricket",
    "Basketball",
    "Tennis",
    "Badminton",
    "Volleyball",
    "Hockey",
    "Table Tennis",
    "Swimming",
  ];

  // Fetch turf details
  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `/api/turfs/${id}?userId=${auth._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const turfData = response.data;

        // Populate form fields
        setName(turfData.name);
        setFullAddress(turfData.address.fullAddress);
        setArea(turfData.address.area);
        setCity(turfData.address.city);
        setPincode(turfData.address.pincode);
        setRazorpayAccountId(turfData.razorpayAccountId);
        setDescription(turfData.description || "");

        // Populate sports
        setSportsList(
          turfData.sports.map((sport) => ({
            id: Date.now() + Math.random(),
            name: sport.name,
          }))
        );

        // Populate facilities
        setFacilities(turfData.facilities);

        // Populate existing images
        setExistingImages(turfData.images || []);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching turf details:", error);
        toast.error("Failed to fetch turf details");
        navigate("/turf/management");
      }
    };

    fetchTurf();
  }, [id, navigate, auth._id]);

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
  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      // Remove from existing images
      const newExistingImages = [...existingImages];
      newExistingImages.splice(index, 1);
      setExistingImages(newExistingImages);
    } else {
      // Remove from new images
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
    }
  };

  // Handle facility checkbox changes
  const handleFacilityChange = (facility) => {
    setFacilities((prev) => ({
      ...prev,
      [facility]: !prev[facility],
    }));
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

  // Filter sports based on search
  const filteredSports = predefinedSports.filter((sport) =>
    searchSport ? sport.toLowerCase().includes(searchSport.toLowerCase()) : true
  );

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name) {
      toast.error("Turf name is required");
      return;
    }

    if (!fullAddress || !area || !city || !pincode) {
      toast.error("Complete address information is required");
      return;
    }

    if (!razorpayAccountId) {
      toast.error("Razorpay Account ID is required");
      return;
    }

    if (sportsList.length === 0) {
      toast.error("Please add at least one sport");
      return;
    }

    // Check if there are no images (existing or new)
    if (
      existingImages.length === 0 &&
      !imageFiles.some((file) => file !== null)
    ) {
      toast.error("Please upload at least one turf image");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("name", name);
      formData.append("fullAddress", fullAddress);
      formData.append("area", area);
      formData.append("city", city);
      formData.append("pincode", pincode);
      formData.append("razorpayAccountId", razorpayAccountId);
      formData.append("description", description);

      // Add owner ID to bypass auth
      formData.append("ownerId", auth._id);

      // Add existing images paths
      formData.append("existingImages", JSON.stringify(existingImages));

      // Add sports data as JSON
      formData.append(
        "sports",
        JSON.stringify(sportsList.map((sport) => ({ name: sport.name })))
      );

      // Add facilities
      Object.entries(facilities).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add new images
      imageFiles.forEach((file) => {
        if (file) {
          formData.append("turfImages", file);
        }
      });

      // Send request to API
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/turfs/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Turf updated successfully!");

      // Navigate back to turf management or view page
      navigate(`/turf/${id}`);
    } catch (error) {
      console.error("Error updating turf:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update turf. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(`/turf/${id}`)}
            className="mr-4 text-gray-600 hover:text-orange-500 bg-transparent hover:bg-transparent"
          >
            <FiChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Edit Turf: {name}</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Image Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Images
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {existingImages.map((imagePath, index) => (
                    <div
                      key={imagePath}
                      className="relative border border-dashed border-gray-300 rounded-lg p-4"
                    >
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10 bg-transparent hover:bg-transparent"
                        onClick={() => handleRemoveImage(index, true)}
                      >
                        <FiX size={16} />
                      </button>
                      <img
                        src={`/uploads/${imagePath}`}
                        alt={`Existing turf image ${index + 1}`}
                        className="h-32 w-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
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
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
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
                          className="px-3 py-1 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
                          onClick={() => fileInputRefs[index].current?.click()}
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

              {/* Sports Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Sport
                  </label>
                  <div className="flex space-x-2">
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none"
                      onClick={handleAddSport}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Sport
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search Sport"
                      className="w-full pl-10 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchSport}
                      onChange={(e) => setSearchSport(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Added Sports List */}
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
                          className="p-1 text-orange-500 hover:text-orange-600 rounded"
                          onClick={() => handleEditSport(sport.id)}
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="p-1 text-red-500 hover:text-red-600 rounded"
                          onClick={() => handleDeleteSport(sport.id)}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Facilities Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Turf Facilities
                </label>
                <div className="grid grid-cols-4 gap-y-3">
                  {Object.keys(facilities).map((facility) => (
                    <div key={facility} className="flex items-center">
                      <input
                        id={facility}
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={facilities[facility]}
                        onChange={() => handleFacilityChange(facility)}
                      />
                      <label
                        htmlFor={facility}
                        className="ml-2 block text-sm text-gray-700"
                      >
                        {facility
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Enter turf description"
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg"
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
                      <FiEdit2 className="mr-2" />
                      Update Turf
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default EditTurf;
