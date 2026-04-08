import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Dumbbell, Mail, Globe, Calendar, Search, User } from "lucide-react";

const MTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchTrainers = useCallback(async () => {
    try {
      const response = await axios.get("/api/trainer/trainers");
      setTrainers(response.data);
    } catch (err) {
      setError("Failed to load trainers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrainers(); }, [fetchTrainers]);

  const filtered = trainers.filter((t) => {
    const name = t.userId?.name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={fetchTrainers} className="mt-3 text-sm font-semibold text-orange-500 hover:text-orange-600 w-auto">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{trainers.length} trainers available</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trainers..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Dumbbell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No trainers found</h3>
          <p className="text-sm text-gray-400 mt-1">{search ? "Try a different search" : "No trainers registered yet"}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((trainer) => {
            const name = trainer.userId?.name || "Unknown";
            const email = trainer.userId?.email || "";
            const sports = trainer.sports || [];
            const languages = trainer.languages || [];
            const profileImage = trainer.profileImage ? `/uploads/${trainer.profileImage}` : null;

            return (
              <div key={trainer._id} className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all overflow-hidden group">
                {/* Avatar Section */}
                <div className="h-36 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt={name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center">
                      <User className="w-10 h-10 text-orange-300" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-base font-bold text-gray-900 text-center group-hover:text-orange-600 transition-colors">{name}</h3>
                  {email && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-1">
                      <Mail className="w-3 h-3" /> {email}
                    </div>
                  )}

                  {/* Sports tags */}
                  {sports.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                      {sports.map((s, i) => (
                        <span key={i} className="text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-2.5 py-0.5">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Details */}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    {languages.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <span>{languages.join(", ")}</span>
                      </div>
                    )}
                    {trainer.dob && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(trainer.dob).toLocaleDateString("en-IN")}</span>
                        {trainer.gender && <span className="text-gray-300">|</span>}
                        {trainer.gender && <span>{trainer.gender}</span>}
                      </div>
                    )}
                    {trainer.bio && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-2">{trainer.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MTrainers;
