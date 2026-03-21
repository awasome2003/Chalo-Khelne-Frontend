import { Routes, Route } from "react-router-dom";
import Layout from "./Manager/MLayout";
import MDashboard from "./Manager/MDashboard";
import MTournamentManagement from "./Manager/MTournamentManagement";
import MSlot_Booking from "./Manager/MSlot_Booking";
import MSocial from "./Manager/MSocial";
import MRefree from "./Manager/MRefree";
import MTrainers from "./Manager/MTrainers";
import MSettings from "./Manager/MSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import AddTurf from "./Manager/MAddturf";
import MTurfDetails from "./Manager/MTurfDetails";
import TeamKnockouts from "./Manager/TeamKnockouts";
import TeamKnockoutMatches from "./Manager/TeamKnockoutMatches";
import TeamKnockoutsScoreboard from "./Manager/TeamKnockoutsScoreboard";
import MGroupStageScoreBoard from "./Manager/MGroupStageScoreBoard";
import MGroupStageManagement from "./Manager/MGroupStageManagement";
import MPointsTableScreen from "./Manager/MPointsTableScreen"
import NotificationPage from "./Manager/Notification";
import MPayments from "./Manager/MPayments";
import MNews from "./Manager/MNews";
import InviteEmployees from "./Manager/InviteEmployees";

const ManagerApp = () => {
  return (
    <Routes>
      {/* Scoreboard route without Layout */}
      <Route
        path="/tournament-management/team-knockouts/:id/scoreboard"
        element={<TeamKnockoutsScoreboard />}
      />
      <Route
        path="/tournament-management/group-stage/:id/scoreboard"
        element={<MGroupStageScoreBoard />}
      />
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/mdashboard" element={<MDashboard />} />
          <Route
            path="/mtournament-management"
            element={<MTournamentManagement />}
          />
          <Route path="/invite-employees" element={<InviteEmployees />} />
          <Route path="/mslot-Bookingt" element={<MSlot_Booking />} />
          <Route path="/msocial" element={<MSocial />} />
          <Route path="/mrefree" element={<MRefree />} />
          <Route path="/mtrainers" element={<MTrainers />} />
          <Route path="/notification" element={<NotificationPage />} />
          <Route path="/payments" element={<MPayments />} />
          <Route path="/mnews" element={<MNews />} />
          <Route path="/mtrainers" element={<MTrainers />} />
          <Route path="/msettings" element={<MSettings />} />
          <Route path="/add-turf" element={<AddTurf />} />
          <Route path="/turf-details/:id" element={<MTurfDetails />} />

          {/* Team Knockout Tournament Routes */}
          <Route
            path="/tournament-management/team-knockouts"
            element={<TeamKnockouts />}
          />
          <Route
            path="/tournament-management/team-knockouts/:id/matches"
            element={<TeamKnockoutMatches />}
          />

          {/* Group Stage Tournament Routes */}
          <Route
            path="/tournament-management/group-stage"
            element={<MGroupStageManagement />}
          />
          <Route
            path="/tournament-management/group-stage/:tournamentId/:groupId/scoreboard"
            element={<MGroupStageScoreBoard />}
          />
          <Route
            path="/tournament-management/group-stage/:tournamentId/:groupId/points-table"
            element={<MPointsTableScreen />}
          />

          {/* Individual Player Final Knockout Route - to be created */}
          <Route
            path="/tournament-management/group-stage/:tournamentId/final-knockout"
            element={<div className="p-4 text-center">
              <h2 className="text-2xl font-bold mb-4">🏆 Final Knockout Phase</h2>
              <p className="text-gray-600 mb-4">Individual player knockout system - to be implemented</p>
            </div>}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default ManagerApp;
