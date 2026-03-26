import { SocialFeed } from "../features/social";

// Manager Social — authenticated, can create posts
export default function MSocialV2() {
  return <SocialFeed canCreate={true} />;
}
