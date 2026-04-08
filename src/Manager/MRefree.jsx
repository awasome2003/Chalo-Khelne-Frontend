import { useEffect, useState } from "react";
import axios from "axios";
import { Shield, Search, Award, Clock, User } from "lucide-react";

const RefereesPage = () => {
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/referee/referees");
        setReferees(res.data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = referees.filter((r) => {
    const name = `${r.firstName || ""} ${r.lastName || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referees</h1>
          <p className="text-sm text-gray-500 mt-0.5">{referees.length} certified professionals</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search referees..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Shield className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">{search ? "No referees match your search" : "No referees found"}</h3>
          <p className="text-sm text-gray-400 mt-1">Referees will appear here once registered</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((referee) => {
            const fullName = `${referee.firstName || ""} ${referee.lastName || ""}`.trim();
            const user = referee.userId || {};

            return (
              <div key={referee._id} className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all overflow-hidden group">
                {/* Profile header */}
                <div className="p-5 flex items-center gap-4">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={fullName} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold text-lg border-2 border-orange-100">
                      {fullName.charAt(0) || <User className="w-6 h-6" />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                      {fullName || "Unknown"}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="px-5 pb-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Award className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Certification</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{referee.certificationLevel || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Experience</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{referee.experience || 0} yr{referee.experience !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* Sports */}
                {referee.sports?.length > 0 && (
                  <div className="px-5 pb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {referee.sports.map((s, i) => (
                        <span key={i} className="text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-2.5 py-0.5">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RefereesPage;
