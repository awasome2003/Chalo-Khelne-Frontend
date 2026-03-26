import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Slot_Booking = () => {
  const navigate = useNavigate();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Material Icons component
  const Icon = ({ name, className = "" }) => (
    <i className={`material-icons ${className}`}>{name}</i>
  );

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        // Get manager ID from auth context or localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const managerId = user?._id;

        if (!managerId) {
          throw new Error("Manager ID not found");
        }

        const response = await fetch(
          `/api/turfs/assigned/${managerId}`
        );

        console.log(response)
        if (!response.ok) {
          throw new Error("Failed to fetch assigned turfs");
        }

        const data = await response.json();
        // API returns plain array, not { turfs: [...] }
        setTurfs(Array.isArray(data) ? data : data.turfs || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTurfs();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-20">
          <div className="text-gray-600">Loading turfs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <Icon name="error" className="mr-2" />
            <span>Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Assigned Turfs</h2>
        <p className="text-gray-600">{turfs.length} turfs assigned to you</p>
      </div>

      {/* Turfs Grid */}
      {turfs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <Icon name="stadium" className="text-6xl text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No turfs available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turfs.map((turf) => (
            <div
              key={turf._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              {/* Turf Image */}
              {turf.images?.length > 0 ? (
                <img
                  src={`/uploads/${turf.images[0]}`}
                  alt={turf.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}

              <div className="w-full h-48 bg-gray-100 rounded-t-lg items-center justify-center hidden">
                <Icon name="image" className="text-4xl text-gray-400" />
              </div>

              {/* Turf Details */}
              <div className="p-4">
                {/* Name and Status */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {turf.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      turf.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {turf.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Location */}
                <div className="mb-3">
                  <p className="text-gray-600 text-sm flex items-center">
                    <Icon name="location_on" className="mr-1" />
                    {turf.address?.area}, {turf.address?.city}
                  </p>
                </div>

                {/* Sports */}
                {turf.sports?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">Sports:</p>
                    <div className="flex flex-wrap gap-1">
                      {turf.sports.map((sport, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                        >
                          {sport.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Owner */}
                {turf.owner?.clubName && (
                  <p className="text-blue-600 text-xs mb-2 font-medium">
                    Club: {turf.owner.clubName}
                  </p>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => navigate(`/turf-details/${turf._id}`)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="visibility" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Slot_Booking;
