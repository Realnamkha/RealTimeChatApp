import React from "react";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Layout = () => {
  return (
    <div className="bg-gray-300">
      <Outlet />
    </div>
  );
};

export default Layout;
