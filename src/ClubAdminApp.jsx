import { Routes, Route } from "react-router-dom";
import ClubAdminLayout from "./ClubAdmin/ClubAdminLayout";
import ClubAdminDashboard from "./ClubAdmin/ClubAdminDashboard";
import TurfManagement from "./ClubAdmin/TurfManagement";
import ViewTurf from "./ClubAdmin/ViewTurf";
import EditTurf from "./ClubAdmin/EditTurf";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentHistory from "./ClubAdmin/PaymentHistory";
import PlayerPaymentHistory from "./ClubAdmin/PlayerPaymentHistory";
import ManagerAdmin from "./ClubAdmin/ManagerAdmin";
import ClubAdminProfile from "./ClubAdmin/ClubAdminProfile";
import CSocial from "./ClubAdmin/CSocial";
import CRefree from "./ClubAdmin/CRefree";
import ClubAdminFinance from "./ClubAdmin/ClubAdminFinance";

const ClubAdminApp = () => {
  return (
    <Routes>
      <Route element={<ClubAdminLayout />}>
        <Route element={<ProtectedRoute role="clubAdmin" />}>
          <Route path="/club-dashboard" element={<ClubAdminDashboard />} />
          <Route path="/turf-management" element={<TurfManagement />} />
          <Route path="/ClubAdminProfile" element={<ClubAdminProfile />} />
          <Route path="/turf/:id" element={<ViewTurf />} />
          <Route path="/turf/edit/:id" element={<EditTurf />} />
          <Route path="/staff-admin" element={<ManagerAdmin />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route
            path="/player/payment-history"
            element={<PlayerPaymentHistory />}
          />
            <Route path="/club-social" element={<CSocial />} />
              <Route path="/club-refree" element={<CRefree />} />
              <Route path="/club-finance" element={<ClubAdminFinance />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default ClubAdminApp;
