import { RefereeList } from "../features/referee";

// Manager — read-only referee directory
export default function MRefreeV2() {
  return <RefereeList canManage={false} />;
}
