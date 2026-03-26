import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const MTurfDetails = () => {
  const { id } = useParams(); // Get turf ID from URL
  const [turf, setTurf] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        const response = await fetch(`/api/turfs/${id}`);
        const data = await response.json();
        console.log(data)
        setTurf(data);
      } catch (error) {
        console.error("Error fetching turf details:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await fetch(`/api/players/turf-bookings/turf/${id}`);
        const data = await response.json();
        setBookings(data.bookings);
        console.log('turf bookings details', data)
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchTurfDetails();
    fetchBookings(); // Fetch bookings

  }, [id]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`/api/players/turf-bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setBookings(bookings.map(booking =>
          booking._id === bookingId ? { ...booking, status: newStatus } : booking
        ));
      } else {
        console.error("Error updating status");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 text-lg">Loading...</p>;
  }

  if (!turf) {
    return <p className="text-center text-red-500 text-lg">Turf not found</p>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-2">{turf.name}</h2>
        <p className="text-gray-600 text-lg">{turf.description || "No description provided"}</p>

        {/* Display Images */}
        {turf.photos?.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            {turf.photos.map((photo, index) => (
              <img
                key={index}
                src={`/uploads/${photo.replace(/\\/g, "/").split("/").pop()}`}
                alt={`Turf ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
              />
            ))}
          </div>
        )}

        <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-2 gap-4 text-gray-700">

            <p><strong>📍 Location: </strong>
              {turf.address?.fullAddress
                ? `${turf.address.fullAddress}, ${turf.address.city || ""} - ${turf.address.pincode || ""}`
                : "Not provided"}
            </p>

            <p><strong>💰 Price: </strong>
              {turf.sports?.[0]?.pricePerHour > 0 ? `₹${turf.sports[0].pricePerHour}/hour` : turf.hourlyPrice > 0 ? `₹${turf.hourlyPrice}/hour` : "Not specified"}
            </p>

            <p><strong>🏆 Sports: </strong>
              {Array.isArray(turf.sports)
                ? turf.sports.map((s, i) => <span key={i}>{s.name}{i < turf.sports.length - 1 ? ", " : ""}</span>)
                : "Not specified"}
            </p>

            <p><strong>⭐ Ratings: </strong>
              {turf.ratings ? `${turf.ratings.average} / 5 (${turf.ratings.count} reviews)` : "No ratings yet"}
            </p>

            <p><strong>👤 Owner: </strong>
              {turf.owner ? `${turf.owner.name} (${turf.owner.email})` : "Not available"}
            </p>

            <p><strong>🕘 Open Time: </strong> {turf.openTime || "Not specified"}</p>
            <p><strong>🕙 Close Time: </strong> {turf.closeTime || "Not specified"}</p>

            <p><strong>📞 Contact: </strong>
              {turf.owner?.mobile || "Not available"}
            </p>

            <p><strong>⭐ Reviews: </strong>
              {Array.isArray(turf.reviews) && turf.reviews.length > 0
                ? turf.reviews.map((r, i) => (
                  <span key={i}>{JSON.stringify(r)} </span>
                ))
                : "No reviews yet"}
            </p>

          </div>
        </div>


        {/* Bookings Table */}
        <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-4">📅 Bookings</h3>
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 text-center">
                    <th className="border border-gray-300 p-2">Name</th>
                    <th className="border border-gray-300 p-2">Sport</th>
                    <th className="border border-gray-300 p-2">Date</th>
                    <th className="border border-gray-300 p-2">Time</th>
                    <th className="border border-gray-300 p-2">Status</th>
                    <th className="border border-gray-300 p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="text-center">
                      {/* User name */}
                      <td className="border border-gray-300 p-2">{booking.userName}</td>

                      {/* Sport (from object) */}
                      <td className="border border-gray-300 p-2">
                        {booking.sport?.name || "N/A"}
                      </td>

                      {/* Date (format it nicely) */}
                      <td className="border border-gray-300 p-2">
                        {new Date(booking.date).toLocaleDateString()}
                      </td>

                      {/* Time slot */}
                      <td className="border border-gray-300 p-2">{booking.timeSlot}</td>

                      {/* Status */}
                      <td className="border border-gray-300 p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                          booking.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          booking.status === "cancelled" ? "bg-red-100 text-red-700" :
                          booking.status === "completed" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="border border-gray-300 p-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, "confirmed")}
                              className="bg-green-500 text-white px-3 py-1 rounded mr-2 text-sm"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, "completed")}
                              className="bg-blue-500 text-white px-3 py-1 rounded mr-2 text-sm"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {(booking.status === "cancelled" || booking.status === "completed") && (
                          <span className="text-gray-400 text-sm">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          ) : <p>No bookings yet.</p>}
        </div>

      </div>
    </div>
  );
};

export default MTurfDetails;
