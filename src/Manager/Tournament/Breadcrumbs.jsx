import { Link, useParams, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS = {
  tournaments: "Tournaments",
  players: "Registered Players",
  groups: "Groups",
  knockout: "Knockout",
  match: "Match Scoring",
};

export default function Breadcrumbs({ tournamentName, groupName }) {
  const location = useLocation();
  const { tournamentId, groupId, matchId } = useParams();

  const segments = location.pathname.split("/").filter(Boolean);
  const crumbs = [];

  // Always start with tournaments list
  crumbs.push({ label: "Tournaments", path: "/mtournament-management" });

  // Build crumbs from path
  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    currentPath += `/${seg}`;

    // Skip IDs — they get merged with their parent label
    if (seg === tournamentId) {
      crumbs.push({
        label: tournamentName || `Tournament`,
        path: `/tournaments/${tournamentId}`,
      });
      continue;
    }
    if (seg === groupId) {
      crumbs.push({
        label: groupName || `Group`,
        path: `/tournaments/${tournamentId}/groups/${groupId}`,
      });
      continue;
    }
    if (seg === matchId) continue;

    // Named segments
    if (ROUTE_LABELS[seg]) {
      crumbs.push({ label: ROUTE_LABELS[seg], path: currentPath });
    }
  }

  // Deduplicate
  const unique = crumbs.filter((c, i, arr) => i === 0 || c.path !== arr[i - 1].path);

  return (
    <nav className="flex items-center gap-1 text-sm mb-4 overflow-x-auto pb-1">
      {unique.map((crumb, i) => {
        const isLast = i === unique.length - 1;
        return (
          <div key={crumb.path} className="flex items-center gap-1 whitespace-nowrap">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
            {isLast ? (
              <span className="text-gray-800 font-semibold">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-orange-500 hover:text-orange-700 hover:underline transition"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
