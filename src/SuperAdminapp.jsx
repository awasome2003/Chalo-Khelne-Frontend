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
import DashboardLayout from "./SuperAdmin/DashboardLayout";
import { ThreadList, ThreadDetail, CreateThreadPage } from "./features/forum";

const SuperAdminapp = () => {
  return (
    <>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/approved" element={<Approved />} />
          <Route path="/inquiries" element={<Inquiries />} />
          <Route path="/sports" element={<SportsManagement />} />
          <Route path="/rule-books" element={<SportRuleBooks />} />
          <Route path="/news" element={<NewsManagement />} />
          <Route path="/rbac" element={<RbacManagement />} />
          <Route path="/vendor-marketplace" element={<VendorMarketplace />} />
          <Route path="/forum" element={<ThreadList />} />
          <Route path="/forum/new" element={<CreateThreadPage />} />
          <Route path="/forum/thread/:threadId" element={<ThreadDetail />} />
        </Route>
      </Routes>
    </>
  );
};

export default SuperAdminapp;
