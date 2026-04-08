import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./shared/layout";
import CorporateDashboard from "./CorporateAdmin/CorporateDashboard";
import CorporateStaff from "./CorporateAdmin/CorporateStaff";
import CorporateProfile from "./CorporateAdmin/CorporateProfile";
import CorporateTournaments from "./CorporateAdmin/CorporateTournaments";
import ProtectedRoute from "./components/ProtectedRoute";
import { ChatList as GroupChatList, ChatPage as GroupChatPage } from "./features/groupChat";

const CorporateApp = () => {
    return (
        <Routes>
            <Route element={<AppLayout role="corporate_admin" />}>
                <Route element={<ProtectedRoute role="corporate_admin" />}>
                    <Route path="/corporate-dashboard" element={<CorporateDashboard />} />
                    <Route path="/corporate-tournaments" element={<CorporateTournaments />} />
                    <Route path="/corporate-staff" element={<CorporateStaff />} />
                    <Route path="/corporate-profile" element={<CorporateProfile />} />
                    <Route path="/group-chat" element={<GroupChatList />} />
                    <Route path="/group-chat/:chatId" element={<GroupChatPage />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default CorporateApp;
