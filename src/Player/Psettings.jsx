import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // 👈 Import navigation

function Psettings() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); 
  };

  return (
    <div>
      <h2>Profile Settings</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Psettings;
