import { useState } from "react";
import { Users, Swords, Trophy, ChevronRight, Check } from "lucide-react";
import { getAllTeamKnockoutFormats } from "../config/teamKnockoutFormats";

/**
 * Format selector for Davis Cup / Team Knockout tournaments.
 * Displays predefined formulas as selectable cards.
 *
 * Props:
 * - value: currently selected format ID
 * - onChange: (formatId) => void
 * - className: optional wrapper class
 */
export default function TeamKnockoutFormatSelector({ value, onChange, className = "" }) {
  const [expandedId, setExpandedId] = useState(null);
  const formats = getAllTeamKnockoutFormats();

  const singlesFormats = formats.filter((f) => !f.hasDoubles);
  const doublesFormats = formats.filter((f) => f.hasDoubles);

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-1">Match Formula</label>
      <p className="text-xs text-gray-400 mb-4">Choose how teams will compete in each match</p>

      {/* Singles Section */}
      <div className="mb-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Singles Formats</h4>
        <div className="space-y-2">
          {singlesFormats.map((fmt) => (
            <FormatCard key={fmt.id} format={fmt} selected={value === fmt.id} expanded={expandedId === fmt.id}
              onSelect={() => onChange(fmt.id)}
              onToggle={() => setExpandedId(expandedId === fmt.id ? null : fmt.id)} />
          ))}
        </div>
      </div>

      {/* Doubles Section */}
      <div>
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Mixed Formats (Singles + Doubles)</h4>
        <div className="space-y-2">
          {doublesFormats.map((fmt) => (
            <FormatCard key={fmt.id} format={fmt} selected={value === fmt.id} expanded={expandedId === fmt.id}
              onSelect={() => onChange(fmt.id)}
              onToggle={() => setExpandedId(expandedId === fmt.id ? null : fmt.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FormatCard({ format, selected, expanded, onSelect, onToggle }) {
  const singlesCount = format.sets.filter((s) => s.type === "singles").length;
  const doublesCount = format.sets.filter((s) => s.type === "doubles").length;

  return (
    <div className={`rounded-2xl border-2 transition-all overflow-hidden ${
      selected ? "border-[#004E93] bg-[#004E93]/5 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
    }`}>
      {/* Main Row */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={onSelect}>
        {/* Radio */}
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
          selected ? "border-[#004E93] bg-[#004E93]" : "border-gray-300"
        }`}>
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>

        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          selected ? "bg-[#004E93] text-white" : "bg-gray-100 text-gray-500"
        }`}>
          {format.hasDoubles ? <Users className="w-5 h-5" /> : <Swords className="w-5 h-5" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-sm ${selected ? "text-[#004E93]" : "text-gray-800"}`}>{format.name}</h3>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {format.totalSets} sets
            </span>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              First to {format.setsToWin}
            </span>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {singlesCount}S{doublesCount > 0 ? ` + ${doublesCount}D` : ""}
            </span>
          </div>
        </div>

        {/* Expand */}
        <button onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition w-auto flex-shrink-0">
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* Expanded: Set-by-Set Breakdown */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
          <p className="text-xs text-gray-500 mb-3">{format.description}</p>
          <div className="space-y-1.5">
            {format.sets.map((set) => (
              <div key={set.setNumber} className="flex items-center gap-2 text-xs">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                  set.isDecider ? "bg-orange-100 text-orange-600" : set.type === "doubles" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                }`}>
                  {set.setNumber}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  set.type === "doubles" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                }`}>
                  {set.type === "doubles" ? "DBL" : "SGL"}
                </span>
                <span className="text-gray-700 font-medium">{set.label}</span>
                {set.isDecider && (
                  <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full ml-auto">
                    DECIDER
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Visual Match Preview */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Match Preview</div>
            <div className="flex items-center justify-center gap-6 py-2">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm mx-auto mb-1">
                  A
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Home</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-black text-gray-300">VS</span>
                <span className="text-[9px] text-gray-400 mt-0.5">Best of {format.totalSets}</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-700 font-black text-sm mx-auto mb-1">
                  X
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Away</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
