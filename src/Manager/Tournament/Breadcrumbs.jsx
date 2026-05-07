import { Link, useParams, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const SIG = "#5E6AD2";

const ROUTE_LABELS = {
  tournaments: "Tournaments",
  players: "Players",
  groups: "Groups",
  knockout: "Knockout",
  courts: "Courts",
  match: "Match",
  staff: "Staff",
};

export default function Breadcrumbs({ tournamentName, groupName }) {
  const location = useLocation();
  const { tournamentId, groupId, matchId } = useParams();

  const segments = location.pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Tournaments", path: "/mtournament-management" }];

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    currentPath += `/${seg}`;

    if (seg === tournamentId) {
      crumbs.push({
        label: tournamentName || "Tournament",
        path: `/tournaments/${tournamentId}`,
      });
      continue;
    }
    if (seg === groupId) {
      crumbs.push({
        label: groupName || "Group",
        path: `/tournaments/${tournamentId}/groups/${groupId}`,
      });
      continue;
    }
    if (seg === matchId) continue;

    if (ROUTE_LABELS[seg]) {
      crumbs.push({ label: ROUTE_LABELS[seg], path: currentPath });
    }
  }

  const unique = crumbs.filter(
    (c, i, arr) => i === 0 || c.path !== arr[i - 1].path
  );

  return (
    <nav className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
      {unique.map((crumb, i) => {
        const isLast = i === unique.length - 1;
        return (
          <div
            key={crumb.path}
            className="flex items-center gap-1.5 whitespace-nowrap"
          >
            {i > 0 && (
              <ChevronRight className="w-3 h-3 text-neutral-300 flex-shrink-0" />
            )}
            {isLast ? (
              <span className="text-[12px] font-semibold text-neutral-900">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-[12px] font-medium text-neutral-500 hover:text-neutral-900 transition"
                style={{ "--hover": SIG }}
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
