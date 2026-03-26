import { Users, Swords, Trophy, Grid3X3, Activity, Target } from "lucide-react";

export default function TournamentStats({ players, groups, allMatches, live, completed, upcoming, progress }) {
  const stats = [
    { label: "Players", value: players.length, icon: Users, color: "blue", bg: "bg-blue-50" },
    { label: "Groups", value: groups.length, icon: Grid3X3, color: "indigo", bg: "bg-indigo-50" },
    { label: "Total Matches", value: allMatches.length, icon: Swords, color: "gray", bg: "bg-gray-50" },
    { label: "Live Now", value: live.length, icon: Activity, color: "red", bg: "bg-red-50" },
    { label: "Completed", value: completed.length, icon: Trophy, color: "green", bg: "bg-green-50" },
    { label: "Upcoming", value: upcoming.length, icon: Target, color: "orange", bg: "bg-orange-50" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${s.color}-600`} />
                </div>
              </div>
              <div className={`text-2xl font-black text-${s.color}-600`}>{s.value}</div>
              <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-700">Tournament Progress</span>
          <span className="text-sm font-black text-[#004E93]">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress === 100 ? "bg-green-500" : progress > 50 ? "bg-blue-500" : "bg-orange-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>{completed.length} completed</span>
          <span>{upcoming.length} remaining</span>
        </div>
      </div>
    </div>
  );
}
