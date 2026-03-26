import { RefereeList } from "../features/referee";

// ClubAdmin — full management: create requests, accept/reject, detail view
export default function CRefreeV2() {
  return <RefereeList canManage={true} className="bg-gray-50" />;
}
