import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./shared/layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Manager pages
import MDashboard from "./Manager/MDashboard";
import MTournamentManagement from "./Manager/MTournamentManagement";
import MSlot_Booking from "./Manager/MSlot_Booking";
import MSocial from "./Manager/MSocialV2";
import MRefree from "./Manager/MRefree";
import MTrainers from "./Manager/MTrainers";
import MSettings from "./Manager/MSettings";
import AddTurf from "./Manager/MAddturf";
import MTurfDetails from "./Manager/MTurfDetails";
import MPayments from "./Manager/MPayments";
import MNews from "./Manager/MNews";
import MCoupons from "./Manager/MCoupons";
import InviteEmployees from "./Manager/InviteEmployees";
import NotificationPage from "./Manager/Notification";

// Tournament — legacy (still works, kept for backward compat)
import TeamKnockouts from "./Manager/TeamKnockouts";
import TeamKnockoutMatches from "./Manager/TeamKnockoutMatches";
import TeamKnockoutsScoreboard from "./Manager/TeamKnockoutsScoreboard";
import MGroupStageScoreBoard from "./Manager/MGroupStageScoreBoard";
import MGroupStageManagement from "./Manager/MGroupStageManagement";
import MDirectKnockout from "./Manager/MDirectKnockout";
import MPointsTableScreen from "./Manager/MPointsTableScreen";
import MatchScoringPage from "./Manager/GroupTabs/MatchScoringPage";

// Tournament — V2 route-based pages
import TournamentOverviewPage from "./Manager/Tournament/TournamentOverviewPage";
import PlayersPage from "./Manager/Tournament/PlayersPage";
import GroupListPage from "./Manager/Tournament/GroupListPage";
import GroupDetailPage from "./Manager/Tournament/GroupDetailPage";
import KnockoutPage from "./Manager/Tournament/KnockoutPage";
import StaffApplicationsPage from "./Manager/Tournament/StaffApplicationsPage";
import AllStaffApplicationsPage from "./Manager/AllStaffApplicationsPage";
import TournamentLeaderboard from "./Manager/TournamentLeaderboard";

// Feature modules
import { LiveMatchPage } from "./features/live";
import { TournamentDashboardPage } from "./features/dashboard";
import { ChatList as GroupChatListPage, ChatPage as GroupChatDetailPage } from "./features/groupChat";
import { ChatList as GroupChatList, ChatPage as GroupChatPage } from "./features/groupChat";

const ManagerApp = () => {
  return (
    <Routes>
      {/* ═══════════════════════════════════════════════════
          FULL-SCREEN PAGES (no sidebar/topbar)
          Used for scoreboards, live scoring, immersive views
          ═══════════════════════════════════════════════════ */}
      <Route path="/tournament-management/team-knockouts/:id/scoreboard" element={<TeamKnockoutsScoreboard />} />
      <Route path="/tournament-management/group-stage/:id/scoreboard" element={<MGroupStageScoreBoard />} />
      <Route path="/tournament-management/match/:tournamentId/:matchId/score" element={<MatchScoringPage />} />
      <Route path="/live/:matchId" element={<LiveMatchPage />} />
      <Route path="/tournaments/:tournamentId/live/:matchId" element={<LiveMatchPage />} />

      {/* ═══════════════════════════════════════════════════
          APP LAYOUT (dark sidebar + topbar)
          All standard manager pages render inside this
          ═══════════════════════════════════════════════════ */}
      <Route element={<AppLayout role="manager" />}>
        <Route element={<ProtectedRoute />}>

          {/* Dashboard */}
          <Route path="/mdashboard" element={<MDashboard />} />

          {/* Tournament Management */}
          <Route path="/mtournament-management" element={<MTournamentManagement />} />
          <Route path="/staff-applications" element={<AllStaffApplicationsPage />} />
          <Route path="/invite-employees" element={<InviteEmployees />} />

          {/* Facility */}
          <Route path="/mslot-Bookingt" element={<MSlot_Booking />} />
          <Route path="/turf-details/:id" element={<MTurfDetails />} />

          {/* Management */}
          <Route path="/msocial" element={<MSocial />} />
          <Route path="/mrefree" element={<MRefree />} />
          <Route path="/mtrainers" element={<MTrainers />} />
          <Route path="/mnews" element={<MNews />} />

          {/* Finance */}
          <Route path="/payments" element={<MPayments />} />
          <Route path="/mcoupons" element={<MCoupons />} />

          {/* Group Chat */}
          <Route path="/group-chat" element={<GroupChatListPage />} />
          <Route path="/group-chat/:chatId" element={<GroupChatDetailPage />} />

          {/* Notifications & Settings */}
          <Route path="/notification" element={<NotificationPage />} />
          <Route path="/msettings" element={<MSettings />} />

          {/* Team Knockout */}
          <Route path="/tournament-management/team-knockouts" element={<TeamKnockouts />} />
          <Route path="/tournament-management/team-knockouts/:id/matches" element={<TeamKnockoutMatches />} />

          {/* Direct Knockout (Standalone) */}
          <Route path="/tournament-management/direct-knockout" element={<MDirectKnockout />} />

          {/* V2 Tournament Pages */}
          <Route path="/tournaments/:tournamentId" element={<TournamentOverviewPage />} />
          <Route path="/tournaments/:tournamentId/dashboard" element={<TournamentDashboardPage />} />
          <Route path="/tournaments/:tournamentId/players" element={<PlayersPage />} />
          <Route path="/tournaments/:tournamentId/groups" element={<GroupListPage />} />
          <Route path="/tournaments/:tournamentId/groups/:groupId" element={<GroupDetailPage />} />
          <Route path="/tournaments/:tournamentId/knockout" element={<KnockoutPage />} />
          <Route path="/tournaments/:tournamentId/staff" element={<StaffApplicationsPage />} />

          {/* Legacy Group Stage (backward compat) */}
          <Route path="/tournament-management/group-stage" element={<MGroupStageManagement />} />
          <Route path="/tournament-management/group-stage/:tournamentId/:groupId/scoreboard" element={<MGroupStageScoreBoard />} />
          <Route path="/tournament-management/group-stage/:tournamentId/:groupId/points-table" element={<MPointsTableScreen />} />
          <Route path="/tournament-management/group-stage/:tournamentId/leaderboard" element={<TournamentLeaderboard />} />
          <Route path="/tournament-management/group-stage/:tournamentId/final-knockout" element={
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Final Knockout Phase</h2>
              <p className="text-gray-500">Individual player knockout — coming soon</p>
            </div>
          } />

        </Route>
      </Route>
    </Routes>
  );
};

export default ManagerApp;
