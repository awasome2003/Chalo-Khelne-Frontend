import { SocialFeed } from "../features/social";

// ClubAdmin Social — authenticated, can create posts, gray background
export default function CSocialV2() {
  return <SocialFeed canCreate={true} className="bg-gray-50" />;
}
