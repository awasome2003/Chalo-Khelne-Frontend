import { Routes, Route } from "react-router-dom";
import Home from "./SuperAdmin/Home";
import Pending from "./SuperAdmin/Pending";
import Approved from "./SuperAdmin/Approved";
import Inquiries from "./SuperAdmin/Inquiries";
import SportsManagement from "./SuperAdmin/SportsManagement";
import SportRuleBooks from "./SuperAdmin/SportRuleBooks";
import NewsManagement from "./SuperAdmin/NewsManagement";
import RbacManagement from "./SuperAdmin/RbacManagement";
import VendorMarketplace from "./SuperAdmin/VendorMarketplace";
import CreateClubAdmin from "./SuperAdmin/CreateClubAdmin";
import ManageClubs from "./SuperAdmin/ManageClubs";
import { AppLayout } from "./shared/layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ChatList as GroupChatList, ChatPage as GroupChatPage } from "./features/groupChat";

const SuperAdminapp = () => {
  return (
    <Routes>
      <Route element={<AppLayout role="superadmin" />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/approved" element={<Approved />} />
          <Route path="/inquiries" element={<Inquiries />} />
          <Route path="/create-club-admin" element={<CreateClubAdmin />} />
          <Route path="/manage-clubs" element={<ManageClubs />} />
          <Route path="/sports" element={<SportsManagement />} />
          <Route path="/rule-books" element={<SportRuleBooks />} />
          <Route path="/news" element={<NewsManagement />} />
          <Route path="/rbac" element={<RbacManagement />} />
          <Route path="/vendor-marketplace" element={<VendorMarketplace />} />
          <Route path="/group-chat" element={<GroupChatList />} />
          <Route path="/group-chat/:chatId" element={<GroupChatPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default SuperAdminapp;
