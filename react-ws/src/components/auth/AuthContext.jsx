import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";

const AuthContext = createContext(null);

export const Authprovider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define fetchUser outside useEffect so it can be called on demand
  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/users/current-user");
      console.log("✅ current user fetched:", res.data);
      setUser(res.data.data);
    } catch (err) {
      console.warn("❌ Failed to fetch user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for auth-event changes in localStorage to sync across tabs
    const handleStorageChange = (event) => {
      if (event.key === "auth-event") {
        fetchUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const logout = async () => {
    try {
      await axiosInstance.post("/user/logout"); // clears cookie server-side
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setUser(null);
    // Notify other tabs about logout
    localStorage.setItem("auth-event", Date.now());
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
