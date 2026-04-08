import { useParams } from "react-router-dom";
import useTournament from "./useTournament";
import Breadcrumbs from "./Breadcrumbs";
import StaffApplications from "../StaffApplications";

export default function StaffApplicationsPage() {
  const { tournamentId } = useParams();
  const { title, loading } = useTournament(tournamentId);

  // Get managerId from localStorage auth
  const auth = JSON.parse(localStorage.getItem("user") || "{}");
  const managerId = auth?.id || auth?._id || "";

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumbs tournamentName={title} current="Staff Applications" />
      <StaffApplications tournamentId={tournamentId} managerId={managerId} />
    </div>
  );
}
