import { Trophy, Target, Layers } from "lucide-react";

/**
 * Vertical timeline of match events.
 * Shows game completions, set wins, match result.
 */
export default function MatchTimeline({ timeline, config }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400 font-medium">No events yet</p>
      </div>
    );
  }

  const labels = config.labels;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-sm">Match Timeline</h3>
        <span className="text-xs text-gray-400">{timeline.length} events</span>
      </div>

      <div className="p-5 max-h-[400px] overflow-y-auto">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />

          <div className="space-y-4">
            {timeline.map((event, idx) => (
              <TimelineEvent
                key={idx}
                event={event}
                labels={labels}
                isLatest={idx === timeline.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineEvent({ event, labels, isLatest }) {
  if (event.type === "match") {
    return (
      <div className="relative flex items-start gap-4 pl-1">
        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-yellow-100 shadow-lg">
          <Trophy className="w-4 h-4 text-yellow-900" />
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 flex-1">
          <div className="font-black text-green-800 text-sm">Match Complete!</div>
          <div className="text-xs text-green-600 mt-0.5">
            {event.winner} wins ({event.p1Sets}-{event.p2Sets})
          </div>
        </div>
      </div>
    );
  }

  if (event.type === "set") {
    return (
      <div className="relative flex items-start gap-4 pl-1">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-blue-100">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex-1">
          <div className="font-bold text-blue-800 text-sm">
            {labels.set || "Set"} {event.set} won
          </div>
          <div className="text-xs text-blue-600">{event.winner}</div>
        </div>
      </div>
    );
  }

  // Game event
  return (
    <div className="relative flex items-start gap-4 pl-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ring-2 ${
        isLatest ? "bg-gray-800 text-white ring-gray-300" : "bg-white text-gray-500 ring-gray-200"
      }`}>
        <span className="text-[10px] font-black">{event.p1Score}-{event.p2Score}</span>
      </div>
      <div className={`rounded-xl p-2.5 flex-1 ${isLatest ? "bg-gray-50 border border-gray-200" : ""}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">
            <span className="font-bold">{labels.set || "S"}{event.set}</span>
            <span className="text-gray-400 mx-1">•</span>
            <span className="font-medium">{labels.game || "G"}{event.game}</span>
          </span>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
            {event.winner?.split(" ")[0]}
          </span>
        </div>
      </div>
    </div>
  );
}
