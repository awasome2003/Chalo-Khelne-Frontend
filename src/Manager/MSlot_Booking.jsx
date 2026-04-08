import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Eye, AlertCircle, Loader2 } from "lucide-react";

const SlotBooking = () => {
  const navigate = useNavigate();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?._id) throw new Error("Manager ID not found");
        const res = await fetch(`/api/turfs/assigned/${user._id}`);
        if (!res.ok) throw new Error("Failed to fetch assigned turfs");
        const data = await res.json();
        setTurfs(Array.isArray(data) ? data : data.turfs || []);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Slot Booking</h1>
        <p className="text-sm text-gray-500 mt-0.5">{turfs.length} turf{turfs.length !== 1 ? "s" : ""} assigned to you</p>
      </div>

      {turfs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7 text-orange-300" />
          </div>
          <h3 className="text-base font-bold text-gray-700">No turfs assigned</h3>
          <p className="text-sm text-gray-400 mt-1">Contact your club admin to get turfs assigned</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {turfs.map((turf) => (
            <div key={turf._id} className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all overflow-hidden group">
              {/* Image */}
              <div className="h-44 bg-gray-100 overflow-hidden">
                {turf.images?.length > 0 ? (
                  <img
                    src={`/uploads/${turf.images[0]}`}
                    alt={turf.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                    <MapPin className="w-10 h-10 text-orange-200" />
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{turf.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${turf.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                    {turf.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {(turf.address?.area || turf.address?.city) && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{[turf.address?.area, turf.address?.city].filter(Boolean).join(", ")}</span>
                  </div>
                )}

                {turf.sports?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {turf.sports.slice(0, 3).map((sport, i) => (
                      <span key={i} className="text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-2.5 py-0.5">
                        {sport.name}
                      </span>
                    ))}
                    {turf.sports.length > 3 && (
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">+{turf.sports.length - 3}</span>
                    )}
                  </div>
                )}

                {turf.owner?.clubName && (
                  <p className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-3">
                    {turf.owner.clubName}
                  </p>
                )}

                <button
                  onClick={() => navigate(`/turf-details/${turf._id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 rounded-xl transition-all active:scale-[0.98]"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SlotBooking;
