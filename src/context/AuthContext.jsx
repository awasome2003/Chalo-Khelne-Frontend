import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    // Initialize auth state from localStorage
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });

  useEffect(() => {
    const checkAutoLogout = () => {
      const storedLoginTime = localStorage.getItem("loginTime");
      if (!storedLoginTime) return;

      // Calculate remaining session time
      const loginTime = parseInt(storedLoginTime, 10);
      const currentTime = Date.now();
      const sessionDuration = 3600000; // 1 hour (adjust as needed)
      const elapsed = currentTime - loginTime;
      const remaining = sessionDuration - elapsed;

      if (remaining <= 0) {
        logout(); // Auto-logout if session expired
      } else {
        // Set new timeout for remaining time
        const timeoutId = setTimeout(logout, remaining);
        return timeoutId;
      }
    };

    let timeoutId;
    if (auth) {
      // Only set timeout if user is authenticated
      timeoutId = checkAutoLogout();
    }

    // Cleanup timeout on unmount or auth change
    return () => timeoutId && clearTimeout(timeoutId);
  }, [auth]); // Re-run when auth state changes

  const login = (data) => {

    const user = data?.user || {}; // Prevent undefined errors

    const userData = {
      _id: user?.id || "",
      email: user?.email || "",
      name: user?.name?.trim() || "Unknown",
      role: user?.role || "User",
      mobile: user?.mobile || "N/A", // Mobile is missing in API response
      image: user?.profileImage || "https://via.placeholder.com/120", // Default image
      dob: user?.dateOfBirth || "N/A", // Check if provided in future
      gender: user?.sex || "N/A", // Ensure gender is handled
      sports:
        Array.isArray(user?.sports) && user.sports.length > 0
          ? user.sports.join(", ")
          : "No Sports Info", // Check if sports exists

      win: user?.win || 0,
      lose: user?.lose || 0,
      draw: user?.draw || 0,
      isCorporate: user?.isCorporate || false,
    };

    console.log("Formatted User Data:", userData); // Debugging: Verify before saving

    localStorage.setItem("token", data?.token || "");
    localStorage.setItem("user", JSON.stringify(userData));
    setAuth(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Clear all auth-related storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTime");
    setAuth(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ auth, user: auth, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
