import { useParams } from "react-router-dom";
import useTournament from "./useTournament";
import Breadcrumbs from "./Breadcrumbs";
import StaffApplications from "../StaffApplications";

export default function StaffApplicationsPage() {
  const { tournamentId } = useParams();
  const { title, loading } = useTournament(tournamentId);

  const auth = JSON.parse(localStorage.getItem("user") || "{}");
  const managerId = auth?.id || auth?._id || "";

  if (loading) {
    return (
      <div className="p-6 max-w-[1320px] mx-auto">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-40 bg-neutral-200 rounded" />
          <div className="h-44 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      <Breadcrumbs tournamentName={title} current="Staff Applications" />
      <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1.5">
            Staff applications
          </p>
          <h1 className="text-[22px] leading-tight font-semibold tracking-tight text-neutral-950">
            Review applicants
          </h1>
        </div>
      </div>
      <StaffApplications tournamentId={tournamentId} managerId={managerId} />
    </div>
  );
}
