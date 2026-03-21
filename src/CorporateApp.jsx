import { Routes, Route } from "react-router-dom";
import CorporateLayout from "./CorporateAdmin/CorporateLayout";
import CorporateDashboard from "./CorporateAdmin/CorporateDashboard";
import CorporateStaff from "./CorporateAdmin/CorporateStaff";
import CorporateProfile from "./CorporateAdmin/CorporateProfile";
import CorporateTournaments from "./CorporateAdmin/CorporateTournaments";
import ProtectedRoute from "./components/ProtectedRoute";

const CorporateApp = () => {
    return (
        <Routes>
            <Route element={<CorporateLayout />}>
                {/* TODO: Add "corporate_admin" to ProtectedRoute roles */}
                <Route element={<ProtectedRoute role="corporate_admin" />}>
                    <Route path="/corporate-dashboard" element={<CorporateDashboard />} />
                    <Route path="/corporate-tournaments" element={<CorporateTournaments />} />
                    <Route path="/corporate-staff" element={<CorporateStaff />} />
                    <Route path="/corporate-profile" element={<CorporateProfile />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default CorporateApp;
