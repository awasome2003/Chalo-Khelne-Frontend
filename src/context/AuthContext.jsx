import { createContext, useState, useEffect, useCallback } from "react";
import { registerLogout } from "../services/authInterceptor";

export const AuthContext = createContext(null);

/**
 * Decode JWT to check expiry.
 */
function isTokenExpired(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp) return false;
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    // Validate token on init
    if (storedToken && isTokenExpired(storedToken)) {
      // Token expired — clear everything
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("loginTime");
      return null;
    }

    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    return !!token && !isTokenExpired(token);
  });

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTime");
    setAuth(null);
    setIsAuthenticated(false);
  }, []);

  // Register logout with axios interceptor
  useEffect(() => {
    registerLogout(logout);
  }, [logout]);

  // Auto-logout timer based on JWT expiry
  useEffect(() => {
    if (!auth) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const parts = token.split(".");
      if (parts.length !== 3) return;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (!payload.exp) return;

      const expiresAt = payload.exp * 1000;
      const remaining = expiresAt - Date.now();

      if (remaining <= 0) {
        logout();
        return;
      }

      // Set timer to auto-logout when token expires
      const timeoutId = setTimeout(() => {
        logout();
        // Don't redirect here — interceptor handles it on next API call
      }, remaining);

      return () => clearTimeout(timeoutId);
    } catch {}
  }, [auth, logout]);

  // Login function
  const login = (data) => {
    const user = data?.user || {};

    const userData = {
      _id: user?.id || user?._id || "",
      email: user?.email || "",
      name: user?.name?.trim() || "Unknown",
      role: user?.role || "User",
      mobile: user?.mobile || "N/A",
      image: user?.profileImage || "https://via.placeholder.com/120",
      dob: user?.dateOfBirth || "N/A",
      gender: user?.sex || "N/A",
      sports:
        Array.isArray(user?.sports) && user.sports.length > 0
          ? user.sports.join(", ")
          : "No Sports Info",
      win: user?.win || 0,
      lose: user?.lose || 0,
      draw: user?.draw || 0,
      isCorporate: user?.isCorporate || false,
    };

    localStorage.setItem("token", data?.token || "");
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("loginTime", Date.now().toString());
    setAuth(userData);
    setIsAuthenticated(true);
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
