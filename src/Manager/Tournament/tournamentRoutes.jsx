import { Route } from "react-router-dom";
import TournamentOverviewPage from "./TournamentOverviewPage";
import PlayersPage from "./PlayersPage";
import GroupListPage from "./GroupListPage";
import GroupDetailPage from "./GroupDetailPage";
import KnockoutPage from "./KnockoutPage";
import MatchScoringPage from "../GroupTabs/MatchScoringPage";

/**
 * ROUTE MAP
 *
 * /tournaments                                  → TournamentListPage (existing MTournamentsList)
 * /tournaments/:tournamentId                    → TournamentOverviewPage (dashboard + stepper)
 * /tournaments/:tournamentId/players            → PlayersPage (registrations, group creation)
 * /tournaments/:tournamentId/groups             → GroupListPage (all groups grid)
 * /tournaments/:tournamentId/groups/:groupId    → GroupDetailPage (matches + standings + scoring)
 * /tournaments/:tournamentId/knockout           → KnockoutPage (bracket + direct knockout)
 * /tournaments/:tournamentId/match/:matchId     → MatchScoringPage (dedicated scoring)
 */

export const tournamentRoutes = (
  <>
    <Route path="/tournaments/:tournamentId" element={<TournamentOverviewPage />} />
    <Route path="/tournaments/:tournamentId/players" element={<PlayersPage />} />
    <Route path="/tournaments/:tournamentId/groups" element={<GroupListPage />} />
    <Route path="/tournaments/:tournamentId/groups/:groupId" element={<GroupDetailPage />} />
    <Route path="/tournaments/:tournamentId/knockout" element={<KnockoutPage />} />
  </>
);

export default tournamentRoutes;
