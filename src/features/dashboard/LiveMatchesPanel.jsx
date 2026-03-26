import { Radio } from "lucide-react";
import MatchCard from "./MatchCard";

export default function LiveMatchesPanel({ matches, onMatchClick }) {
  if (matches.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-white rounded-full animate-ping" />
          <Radio className="w-3.5 h-3.5" />
          LIVE NOW
        </div>
        <span className="text-sm text-red-600 font-bold">{matches.length} match{matches.length !== 1 ? "es" : ""}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {matches.map((m) => (
          <MatchCard key={m._id} match={m} onClick={() => onMatchClick(m)} />
        ))}
      </div>
    </div>
  );
}
