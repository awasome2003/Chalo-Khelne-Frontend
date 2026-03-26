import { Routes, Route } from "react-router-dom";
import LNavbar from "./Landing-Page/LNavbar";
import LHomeV2 from "./Landing-Page/LHomeV2";
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
        <Route path="/" element={<LHomeV2 />} />
        <Route path="home" element={<LHomeV2 />} />
        <Route path="event" element={<LEvent />} />
        <Route path="turf-content" element={<LTurfContent />} />
        <Route path="trainer" element={<LTrainer />} />
        <Route path="social" element={<LSocial />} />
        <Route path="news" element={<LNews />} />
      </Routes>
    </>
  );
};

export default LandingApp;
