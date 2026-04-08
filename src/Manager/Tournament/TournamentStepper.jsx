import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Users, Grid3X3, Swords, Trophy, ClipboardList } from "lucide-react";

const STEPS = [
  { key: "overview", label: "Overview", icon: ClipboardList, path: "" },
  { key: "players", label: "Players", icon: Users, path: "/players" },
  { key: "groups", label: "Groups", icon: Grid3X3, path: "/groups" },
  { key: "knockout", label: "Knockout", icon: Swords, path: "/knockout" },
];

export default function TournamentStepper({ currentStage }) {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const location = useLocation();

  const basePath = `/tournaments/${tournamentId}`;
  const activePath = location.pathname.replace(basePath, "") || "";

  // Determine completion based on tournament stage
  const stageOrder = ["registration", "group_stage", "qualifier_knockout", "knockout", "completed"];
  const stageIndex = stageOrder.indexOf(currentStage || "registration");

  const getStepStatus = (step, idx) => {
    const isActive = activePath === step.path || activePath.startsWith(step.path + "/");

    if (isActive) return "active";
    // Simple heuristic: steps before current stage are completed
    if (idx <= stageIndex) return "completed";
    return "pending";
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3 mb-6 shadow-sm">
      {STEPS.map((step, idx) => {
        const status = getStepStatus(step, idx);
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1">
            <button
              onClick={() => navigate(`${basePath}${step.path}`)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all w-auto text-sm font-medium ${
                status === "active"
                  ? "bg-orange-500 text-white shadow-sm"
                  : status === "completed"
                  ? "text-green-700 hover:bg-green-50"
                  : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                status === "active"
                  ? "bg-white/20"
                  : status === "completed"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {status === "completed" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="hidden md:inline">{step.label}</span>
            </button>

            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full ${
                idx < stageIndex ? "bg-green-300" : "bg-gray-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
