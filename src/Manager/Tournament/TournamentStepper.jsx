import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Users, Grid3X3, Swords, ClipboardList, Check } from "lucide-react";

const SIG = "#5E6AD2";

const STEPS = [
  { key: "overview", label: "Overview", icon: ClipboardList, path: "" },
  { key: "players", label: "Players", icon: Users, path: "/players" },
  { key: "groups", label: "Groups", icon: Grid3X3, path: "/groups" },
  { key: "knockout", label: "Knockout", icon: Swords, path: "/knockout" },
];

const STAGE_ORDER = [
  "registration",
  "group_stage",
  "qualifier_knockout",
  "knockout",
  "completed",
];

export default function TournamentStepper({ currentStage }) {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const location = useLocation();

  const basePath = `/tournaments/${tournamentId}`;
  const activePath = location.pathname.replace(basePath, "") || "";
  const stageIndex = STAGE_ORDER.indexOf(currentStage || "registration");

  const getStatus = (step, idx) => {
    const isActive =
      activePath === step.path || activePath.startsWith(step.path + "/");
    if (isActive) return "active";
    if (idx <= stageIndex) return "completed";
    return "pending";
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-2 mb-6">
      <div className="flex items-center">
        {STEPS.map((step, idx) => {
          const status = getStatus(step, idx);
          const Icon = step.icon;
          const isLast = idx === STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <button
                onClick={() => navigate(`${basePath}${step.path}`)}
                className={`flex items-center gap-2 px-3 h-9 rounded-lg text-[12px] font-medium transition ${
                  status === "active"
                    ? "text-white"
                    : status === "completed"
                    ? "text-neutral-900 hover:bg-neutral-50"
                    : "text-neutral-400 hover:bg-neutral-50"
                }`}
                style={status === "active" ? { backgroundColor: SIG } : undefined}
              >
                <span
                  className={`w-5 h-5 rounded-md inline-flex items-center justify-center flex-shrink-0 ${
                    status === "active"
                      ? "bg-white/20"
                      : status === "completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {status === "completed" ? (
                    <Check className="w-3 h-3" strokeWidth={2.5} />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                </span>
                <span className="hidden md:inline">{step.label}</span>
              </button>

              {!isLast && (
                <div
                  className={`flex-1 h-px mx-2 ${
                    idx < stageIndex ? "bg-emerald-300" : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
