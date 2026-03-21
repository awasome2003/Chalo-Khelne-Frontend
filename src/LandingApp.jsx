import { Routes, Route } from "react-router-dom";
import LNavbar from "./Landing-Page/LNavbar";
import LFooter from "./Landing-Page/LFooter";
import LHome from "./Landing-Page/LHome";
import LEvent from "./Landing-Page/LEvent";
import LTurfContent from "./Landing-Page/LTurfContent";
import LTrainer from "./Landing-Page/LTrainer";
import LSocial from "./Landing-Page/LSocial";
import LNews from "./Landing-Page/LNews";

const LandingApp = () => {
  return (
    <>
      <LNavbar />
      <Routes>
        <Route path="/" element={<LHome />} />
        <Route path="home" element={<LHome />} />
        <Route path="event" element={<LEvent />} />
        <Route path="turf-content" element={<LTurfContent />} />
        <Route path="trainer" element={<LTrainer />} />
        <Route path="social" element={<LSocial />} />
        <Route path="news" element={<LNews />} />
      </Routes>
      <LFooter />
    </>
  );
};

export default LandingApp;
