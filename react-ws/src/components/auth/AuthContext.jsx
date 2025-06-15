import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";

const AuthContext = createContext(null);

export const Authprovider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const logout = async () => {
    try {
      await axiosInstance.post("/user/logout"); // clears cookie server-side
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
