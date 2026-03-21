import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Login from "./components/Login";
import ManagerApp from "./ManagerApp";
import PlayerApp from "./PlayerApp";
import LandingApp from "./LandingApp";
import ClubAdminApp from "./ClubAdminApp";
import CorporateApp from "./CorporateApp";
import SuperAdminapp from "./SuperAdminapp";
import TrainerApp from "./TrainerApp";
import LAboutus from './Landing-Page/LAboutus';
import LPrivacyPolicy from './Landing-Page/LPrivacyPolicy';
import LTermsConditions from './Landing-Page/LTermsConditions';
import LFAQs from './Landing-Page/LFAQs';
import LHelpandSupport from './Landing-Page/LHelpandSupport';

import { useContext, useEffect } from "react";

const App = () => {
  const { auth } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  const role = auth?.role?.toLowerCase() || "player";

  useEffect(() => {
    console.log("Auth state:", {
      auth,
      token: !!token,
      isAuthenticated,
      role,
    });
  }, [auth, token, isAuthenticated, role]);

  return (
    <Routes >
      <Route path="/login" element={<Login />} />

      {/* Default route */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            role === "manager" ? (
              <Navigate to="/mdashboard" />
            ) : role === "clubadmin" ? (
              <Navigate to="/club-dashboard" />
            ) : role === "corporate_admin" ? (
              <Navigate to="/corporate-dashboard" />
            ) : role === "trainer" ? (
              <Navigate to="/trainer-dashboard" />
            ) : (
              <Navigate to="/phome" />
            )
          ) : (
            <Navigate to="/l/home" />
          )
        }
      />
      <Route path="/about-us" element={<LAboutus />} />
      <Route path="/privacy-policy" element={<LPrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<LTermsConditions />} />
      <Route path="/faq" element={<LFAQs />} />
      <Route path="/help-support" element={<LHelpandSupport />} />

      {/* Landing App routes */}
      <Route
        path="/l/*"
        element={
          isAuthenticated ? (
            role === "superadmin" ? (
              <Navigate to="/home" />
            ) :
              role === "manager" ? (
                <Navigate to="/mdashboard" />
              ) : role === "clubadmin" ? (
                <Navigate to="/club-dashboard" />
              ) : role === "corporate_admin" ? (
                <Navigate to="/corporate-dashboard" />
              ) : role === "trainer" ? (
                <Navigate to="/trainer-dashboard" />
              ) : (
                <Navigate to="/pdashboard" />
              )
          ) : (
            <LandingApp />
          )
        }
      />

      {/* Authenticated routes */}
      {isAuthenticated && (
        <Route
          path="/*"
          element={
            role === "superadmin" ? (
              <SuperAdminapp />
            ) :
              role === "manager" ? (
                <ManagerApp />
              ) : role === "clubadmin" ? (
                <ClubAdminApp />
              ) : role === "corporate_admin" ? (
                <CorporateApp />
              ) : role === "trainer" ? (
                <TrainerApp />
              ) : (
                <PlayerApp />
              )
          }
        />
      )}

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/l/event" />} />
    </Routes>
  );
};

export default App;
